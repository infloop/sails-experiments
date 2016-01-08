'use strict';

var hoek = require('hoek');
var _ = require('lodash');
var Spec = require('./spec');

var customDefinitions = {};

const methodMap = {
  post: 'Create Object(s)',
  get: 'Read Object(s)',
  put: 'Update Object(s)',
  patch: 'Update Object(s)',
  delete: 'Destroy Object(s)',
  options: 'Get Resource Options',
  head: 'Get Resource headers'
};

function getBlueprintPrefixes() {
  // Add a "/" to a prefix if it's missing
  function formatPrefix(prefix) {
    return (prefix.indexOf('/') !== 0 ? '/' : '') + prefix
  }

  let prefixes = [];
  // Check if blueprints hook is not removed
  if (sails.config.blueprints) {
    if (sails.config.blueprints.prefix) {
      // Case of blueprints prefix
      prefixes.push(formatPrefix(sails.config.blueprints.prefix));
      if (sails.config.blueprints.rest && sails.config.blueprints.restPrefix) {
        // Case of blueprints prefix + rest prefix
        prefixes.unshift(prefixes[0] + formatPrefix(sails.config.blueprints.restPrefix))
      }
    } else if (sails.config.blueprints.rest && sails.config.blueprints.restPrefix) {
      // Case of rest prefix
      prefixes.push(formatPrefix(sails.config.blueprints.restPrefix))
    }
  }
  return prefixes
}

const Transformer = {

  getSwagger (sails, pkg) {
    return {
      swagger: '2.0',
      info: Transformer.getInfo(pkg),
      host: sails.config.swagger.host,
      tags: Transformer.getTags(sails),
      definitions: Transformer.getDefinitions(sails),
      paths: Transformer.getPaths(sails),
      basePath: sails.config.swagger.basePath
    }
  },

  /**
   * Convert a package.json file into a Swagger Info Object
   * http://swagger.io/specification/#infoObject
   */
  getInfo (pkg) {
    return hoek.transform(pkg, {
      'title': 'name',
      'description': 'description',
      'version': 'version',

      'contact.name': 'author',
      'contact.url': 'homepage',

      'license.name': 'license'
    })
  },

  /**
   * http://swagger.io/specification/#tagObject
   *
   * @param {Sails} sails
  */
  getTags (sails) {
    var controllerTags = _.map(_.pluck(sails.controllers, 'globalId'), tagName => {
      return {
        name: tagName
      }
    });

    var extendedTags = _.chain(_.pluck(sails.controllers, '_swagger'))
      .map(swagger => {
        return (swagger && swagger.api) ? swagger.api.tags : [];
      })
      .flatten()
      .map((tagRaw) => {
        return {
          name: tagRaw.title,
          description: tagRaw.description
        }
      })
      .value();

    return _.merge(controllerTags, extendedTags);
  },

  /**
   * http://swagger.io/specification/#definitionsObject
   */
  getDefinitions (sails) {
    let definitions = _.transform(sails.models, (definitions, model, modelName) => {
      definitions[model.identity] = {
        properties: Transformer.getDefinitionProperties(model.definition, model.hiddenAttributes, [])
      };

      definitions[model.identity+'Editable'] = {
        properties: _.omit(Transformer.getDefinitionProperties(model.definition), [], model.protectedAttributes)
      };
    });

    delete definitions['undefined'];

    return _.merge(definitions, this.getCustomDefinitions());
  },

  /**
   * http://swagger.io/specification/#definitionsObject
   */
  addCustomDefinitions (models) {
    let parsedDefinitions = _.transform(models, (result, properties, modelName) => {
      result[modelName] = {
        properties: _.transform(properties, (result, property, propertyName) => {
          result[propertyName] = this.transformPropertyType(property);
        })
      }
    });

    customDefinitions = _.merge(customDefinitions, parsedDefinitions);
  },

  getCustomDefinitions () {
    return customDefinitions;
  },

  transformPropertyType(property) {
    var transformedProperty = {};
    if(_.isArray(property.type)) {
      transformedProperty.schema = {
        type: 'array',
        items: {$ref: '#/definitions/' + _.first(property.type)}
      }
    } else if(Spec.isEmbeddedType(property.type)) {
      transformedProperty.type = Spec.getPropertyType(property.type).type;
      transformedProperty.format = property.format || Spec.getPropertyType(property.type).format;
    } else if(property.type) {
      transformedProperty.schema = { $ref: '#/definitions/'+property.type };
    }

    return transformedProperty;
  },

  getDefinitionProperties (definition, hiddenAttributes, protectedAttributes, omittedAttributes) {
    var definitions = _.mapValues(definition, (def, attrName) => {
      let property = _.pick(def, [
        'type', 'description', 'format'
      ]);

      return Spec.getPropertyType(property.type)
    });

    return _.omit(definitions, _.merge(hiddenAttributes, protectedAttributes, omittedAttributes));
  },


  /**
   * http://swagger.io/specification/#pathsObject
   * http://swagger.io/specification/#pathItemObject
   *
   * @param sails
   * @returns {*}
     */
  getPaths (sails) {
    let controllers = sails.controllers;

    let paths = _.chain(_.values(controllers))
      .map((controller) => {
        return (controller._routes) ? _.values(controller._routes) : [];
      })
      .flatten()
      .flatten()
      .groupBy('path')
      .mapValues((actions) => {
        return _.chain(actions)
          .groupBy('verb')
          .mapValues((verbActions)=> {
            var verbAction  = _.first(verbActions);
            verbAction.tags = verbAction.tags.valueOf();
            delete verbAction.accepts;
            delete verbAction.returns;
            delete verbAction.path;
            delete verbAction.description;
            delete verbAction.verb;
            return verbAction;
          })
          .value();
      })
      .value();

    return paths;
  },

  getModelFromPath (sails, path) {
    path = path.replace(sails.config.swagger.basePath,'');

    let split = path.split('/');
    let $ = split[0];
    let parentModelName = split[1];
    let parentId = split[2];
    let childAttributeName = split[3];
    let childId = split[4];

    let parentModel = sails.models[parentModelName] || sails.models[parentModelName.slice(0,-1)];
    let childAttribute = _.get(parentModel, [ 'attributes', childAttributeName ]);
    let childModelName = _.get(childAttribute, 'collection') || _.get(childAttribute, 'model');
    let childModel = sails.models[childModelName];

    return childModel || parentModel
  },

  /**
   * http://swagger.io/specification/#definitionsObject
   */
  getDefinitionReference (sails, path) {
    let model = Transformer.getModelFromPath(sails, path);
    if (model) {
      return '#/definitions/' + model.identity
    }
  },

};

module.exports = Transformer;
