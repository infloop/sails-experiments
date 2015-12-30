'use strict';

var path = require('path');
var _ = require('lodash');
var xfmr = require('./lib/xfmr');

/**
 * Expose `controllers` hook definition
 */
module.exports = function(sails) {

  return {
    defaults: {
      'swagger': {
        pkg: {
          name: 'No package information',
          description: 'You should set sails.config.swagger.pkg to retrieve the content of the package.json file',
          version: '0.0.0'
        },
        ui: {
          url: 'http://localhost:8080/'
        }
      },
      'routes': {
        '/swagger/doc': {
          cors: {
            origin: 'http://localhost:8080',
            methods: 'GET,OPTIONS,HEAD'
          },
          controller: 'SwaggerController',
          action: 'doc'
        }
      }
    },

    initialize: function(cb) {
      let hook = sails.hooks.swagger;
      sails.after('lifted', () => {
        hook.doc = xfmr.getSwagger(sails, sails.config.swagger.pkg)
      });
      cb();
    }
  }
};

