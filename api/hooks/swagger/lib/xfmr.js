'use strict';

var hoek = require('hoek');
var _ = require('lodash');
var Spec = require('./spec');

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
   */
  getTags (sails) {
    var tags = _.map(_.pluck(sails.controllers, 'globalId'), tagName => {
      return {
        name: tagName
        //description: `${tagName} Controller`
      }
    });

    // TODO
    var extendedTags = _.map(_.pluck(sails.controllers, '_swagger'), swagger => {
      return (swagger && swagger.tags) ? ({
        name: swagger.tags
      }) : null;
    });

    return tags;
  },

  /**
   * http://swagger.io/specification/#definitionsObject
   */
  getDefinitions (sails) {
    let definitions = _.transform(sails.models, (definitions, model, modelName) => {
      definitions[model.identity] = {
        properties: Transformer.getDefinitionProperties(model.definition)
      }
    });

    delete definitions['undefined'];

    return definitions
  },

  getDefinitionProperties (definition) {
    return _.mapValues(definition, (def, attrName) => {
      let property = _.pick(def, [
        'type', 'description', 'format'
      ]);

      return Spec.getPropertyType(property.type)
    })
  },

  /**
   * Convert the internal Sails route map into a Swagger Paths
   * Object
   * http://swagger.io/specification/#pathsObject
   * http://swagger.io/specification/#pathItemObject
   */
  getPathsOld (sails) {
    let routes = sails.router._privateRouter.routes;
    let pathGroups = _.chain(routes)
      .values()
      .flatten()
      .unique(route => {
        return route.path.replace(sails.config.swagger.basePath,'') + route.method + JSON.stringify(route.keys)
      })
      .reject({ path: '/*' })
      .reject({ path: '/swagger/doc' })
      .reject({ path: '/__getcookie' })
      .reject({ path: '/csrfToken' })
      .reject({ path: '/csrftoken' })
      .groupBy('path')
      .value();

    pathGroups = _.reduce(pathGroups, function(result, routes, path) {
      path = path.replace(sails.config.swagger.basePath,'').replace(/:(\w+)\??/g, '{$1}')
      if (result[path])
        result[path] = _.union(result[path], routes)
      else
        result[path] = routes;
      return result
    }, []);

    var res =  _.mapValues(pathGroups, (pathGroup, key) => {
      return Transformer.getPathItem(sails, pathGroup, key)
    })

    return res;
  },

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

  /**
   * http://swagger.io/specification/#pathItemObject
   */
  getPathItem (sails, pathGroup, pathkey) {
    let methodGroups = _.chain(pathGroup)
      .indexBy('method')
      .pick([
        'get', 'post', 'put', 'head', 'options', 'patch', 'delete'
      ])
      .value();

    return _.mapValues(methodGroups, (methodGroup, method) => {
      return Transformer.getOperation(sails, methodGroup, method)
    })
  },

  /**
   * http://swagger.io/specification/#operationObject
   */
  getOperation (sails, methodGroup, method) {
    return {
      summary: methodMap[method],
      consumes: [ 'application/json' ],
      produces: [ 'application/json' ],
      parameters: Transformer.getParameters(sails, methodGroup),
      responses: Transformer.getResponses(sails, methodGroup),
      tags: Transformer.getPathTags(sails, methodGroup)
    }
  },

  /**
   * A list of tags for API documentation control. Tags can be used for logical
   * grouping of operations by resources or any other qualifier.
   */
  getPathTags (sails, methodGroup) {
    methodGroup.path = methodGroup.path.replace(sails.config.swagger.basePath,'');

    return _.unique(_.compact([
      Transformer.getPathModelTag(sails, methodGroup),
      Transformer.getPathControllerTag(sails, methodGroup),
      Transformer.getControllerFromRoute(sails, methodGroup)
    ]))
  },

  getPathModelTag (sails, methodGroup) {
    let model = Transformer.getModelFromPath(sails, methodGroup.path)
    return model && model.globalId
  },

  getPathControllerTag (sails, methodGroup) {
    // Fist check if we can find a controller tag using prefixed blueprint routes
    for (var prefix of getBlueprintPrefixes()) {
      if (methodGroup.path.indexOf(prefix) === 0) {
        let split = methodGroup.path.replace(prefix, '').split('/');
        let $ = split[0];
        let pathToken  = split[1];
        let tag = _.get(sails.controllers, [ pathToken, 'globalId' ]);
        if (tag) return tag
      }
    }

    let split = methodGroup.path.split('/');
    let $ = split[0];
    let pathToken = split[1];
    return _.get(sails.controllers, [ pathToken, 'globalId' ])
  },

  getControllerFromRoute (sails, methodGroup) {
    let route = sails.config.routes[`${methodGroup.method} ${methodGroup.path}`];
    if (!route) return

    let pattern = /(.+)Controller/;
    let controller = route.controller || (_.isString(route) && route.split('.')[0]);

    if (!controller) return;

    let split = /(.+)Controller/.exec(controller);
    let $ = split[0];
    let name  = split[1];

    return name;
  },

  /**
   * http://swagger.io/specification/#parameterObject
   */
  getParameters (sails, methodGroup) {
    let routeParams = methodGroup.keys;

    if (!routeParams.length) return;

    return _.map(routeParams, param => {
      return {
        name: param.name,
        in: 'path',
        required: true,
        type: 'string'
      }
    })
  },

  /**
   * http://swagger.io/specification/#responsesObject
   */
  getResponses (sails, methodGroup) {
    let $ref = Transformer.getDefinitionReference(sails, methodGroup.path);
    let ok = {
      description: 'The requested resource'
    };
    if ($ref) {
      ok.schema = { '$ref': $ref }
    }
    return {
      '200': ok,
      '404': { description: 'Resource not found' },
      '500': { description: 'Internal server error' }
    }
  }
};

module.exports = Transformer;
