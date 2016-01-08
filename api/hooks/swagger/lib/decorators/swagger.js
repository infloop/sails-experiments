"use strict";

var _ = require('lodash');
var xfmr = require('../xfmr');
/**
 * @typedef {Object} ISwaggerDocs
 * @property {array<string>|string|undefined} consumes
 * @property {array<string>|string|undefined} produces
 * @property {string} summary
 * @property {string|undefined} description
 * @property {array<string>|string|undefined} tags
 * @property {array<string>|string|undefined} accepts
 * @property {array<string>|string|undefined} returns
 * @property {array<string>} parameters
 * @property {object} responses
 */

/**
 * @typedef {Object} ISwaggerApi
 * @property {array<ISwaggerTag>|undefined} tags
 * @property {array<ISwaggerModel>|undefined} models
 *
 */

/**
 * @typedef {Object} ISwaggerTag
 * @property {string|undefined} title
 * @property {string|undefined} description
 */

/**
 * @typedef {Object} ISwaggerModel
 */

var SwaggerDecorator = module.exports = {
  /**
   *
   * @param {ISwaggerDocs} docs
   * @returns {function}
  */
  swagger: function(docs) {
    return function decorator(target, key, descriptor) {
      target._routes = target._routes || {};
      target._routes[key] = target._routes[key] || {};

      docs.consumes = docs.consumes || ['application/json'];
      docs.produces = docs.produces || ['application/json'];

      docs.consumes = _.isArray(docs.consumes) ? docs.consumes : [docs.consumes];
      docs.produces = _.isArray(docs.produces) ? docs.produces : [docs.produces];

      docs.summary = docs.description || '';

      // tags
      var tags = docs.tags || [];
      docs.tags = {
        valueOf:function() {
          if(target._swagger && target._swagger.api) {
            return _.merge(tags, _.pluck(target._swagger.api.tags,'title'));
          }
          return tags;
        }
      };

      docs.accepts = _.isArray(docs.accepts) ? docs.accepts : [docs.accepts];

      //parametes
      docs.parameters = _.map(docs.accepts, (item) => {
        let parameter = {
          in: (item.http || {}).source,
          name: item.args,
          required: item.required || false
        };
        if(_.isArray(item.type)) {
          parameter.type = 'array';
          parameter.items = { $ref: '#/definitions/'+_.first(item.type) };
        } else if(['integer','string','boolean'].indexOf(item.type)>=0) {
          parameter.type = item.type;
        } else {
          parameter.schema = { $ref: '#/definitions/'+item.type };
        }

        return parameter;
      });

      // responses
      docs.returns = _.isArray(docs.returns) ? docs.returns :[docs.returns];

      docs.responses = _.chain(docs.returns)
        .map((item) => {
          let response = {};
          response.status = item.status || 200;
          response.description = item.description || '';
          if(_.isArray(item.type)) {
            response.schema = {
              type: 'array',
              items: {$ref: '#/definitions/' + _.first(item.type)}
            }
          } else if(['integer','string','boolean'].indexOf(item.type)>=0) {
            response.type = item.type;
          } else if(item.type) {
            response.schema = { $ref: '#/definitions/'+item.type };
          }

          return response;
        })
        .groupBy('status')
        .mapValues((item) => {
          return _.omit(_.first(item), 'status')
        })
        .value();

      target._routes[key] = _.merge(target._routes[key], docs);
    }
  },

  /**
   *
   * @param {ISwaggerApi} api
   * @returns {function}
   */
  swaggerApi: function(api) {
    return function decorator(target, key, descriptor) {
      target.prototype.extended = true;
      target.prototype._swagger = target.prototype._swagger || {};
      target.prototype._swagger.api = {
        tags: api.tags || [],
        models: api.models || {}
      };
      xfmr.addCustomDefinitions(api.models || {});
    };
  }
};
