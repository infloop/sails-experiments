"use strict";

module.exports = {
  route: function(route) {
    var self = this;
    return function decorator(target, key, descriptor) {
      route.verb = route.verb || 'get';
      if(!route.path)
        throw new new RangeError('Path not defined for function \'' +(descriptor||{}).name + '\'');

      descriptor.enumerable = true;
      descriptor.value.action = true;
      descriptor.value.route = route;
      target.extended = true;
    }
  },
  swagger: function(docs) {
    return function decorator(target, key, descriptor) {
      descriptor.value.swaggerDocs = docs;
    }
  },
  swaggerApi: function(api) {
    return function decorator(target, key, descriptor) {
      target.prototype.extended = true;
      target.prototype.swaggerApi = api;
    }
  }
};
