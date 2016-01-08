"use strict";

var _ = require('lodash');

/**
 * @typedef {Object} IRouteDocs
 * @property {string} verb
 * @property {string} path
 * @property {object} cors
 * @property {object} methods
 */

module.exports = {
  /**
   *
   * @param {IRouteDocs} route
   * @returns {function}
  */
  route: function(route) {
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
  }
};
