'use strict';

var path = require('path');


module.exports = {
  attributes: {
    //id: {
    //  type: 'string',
    //  unique: true,
    //  primaryKey: true
    //},
    url: {
      type: 'string'
    },
    filename: {
      type: 'string'
    },
    path: {
      type: 'string',
      required: true
    },
    bucket: {
      type: 'string'
    },
    description: {
      type: 'string',
      required: true
    },


    // Override toJSON instance method to remove password value
    toJSON: function() {
      var obj = this.toObject();
      //delete obj.path;
      //delete obj.description;
      //delete obj.createdAt;
      //delete obj.updatedAt;
      return obj;
    }
  },
  autoCreatedAt: true,
  autoUpdatedAt: true,

  hiddenAttributes: ['path'],
  protectedAttributes: ['id','createdAt','updatedAt'],

  // Lifecycle Callbacks
  beforeCreate: function(values, next) {
    values.filename = path.basename(values.path);
    values.url = require('util').format('%s/images/avatars/%s', sails.getBaseUrl(), values.filename);
    next();
  },
  beforeUpdate: function(values, next) {
    values.filename = path.basename(values.path);
    values.url = require('util').format('%s/images/avatars/%s', sails.getBaseUrl(), values.filename);
    next();
  }
};
