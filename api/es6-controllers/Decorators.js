"use strict";

var _ = require('lodash');

module.exports = {
  route: function(route) {
    var self = this;
    return function decorator(target, key, descriptor) {
      route.verb = route.verb || 'get';
      if(!route.path)
        throw new new RangeError('Path not defined for function \'' +(descriptor||{}).name + '\'');

      target._routes = target._routes || {};
      target._routes[key] = target._routes[key] || {};
      target._routes[key] = _.merge(target._routes[key], route);

      descriptor.enumerable = true;
      target.extended = true;
    }
  },
  swagger: function(docs) {
    return function decorator(target, key, descriptor) {
      target._routes = target._routes || {};
      target._routes[key] = target._routes[key] || {};

      docs.consumes = ['application/json'];
      docs.produces = ['application/json'];
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


      if(!_.isArray(docs.accepts)) {
        docs.accepts = [docs.accepts];
      }

      //parametes
      docs.parameters = _.map(docs.accepts, (item) => {
        return {
          in: (item.http || {}).source,
          name: item.args,
          required: item.required || false,
          type: item.type
        };
      });


      // responses
      if(!_.isArray(docs.returns)) {
        docs.returns = [docs.returns];
      }

      docs.responses = _.map(docs.returns, (item) => {
        return {
          '200':{
            description: item.description,
            type: item.type
          }
        }
      }
      );

      target._routes[key] = _.merge(target._routes[key], docs);
    }
  },
  swaggerApi: function(api) {
    return function decorator(target, key, descriptor) {
      target.prototype.extended = true;
      target.prototype._swagger = target.prototype._swagger || {};
      target.prototype._swagger.api = api;
    }
  }
};
