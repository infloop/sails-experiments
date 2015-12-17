"use strict";

module.exports = {
  route: function(http) {
    return function decorator(target, key, descriptor) {
      descriptor.http = http;
    }
  },
  description: function(text) {
    return function decorator(target, key, descriptor) {
      descriptor.description = text;
    }
  },
  swagger: function(docs) {
    return function decorator(target, key, descriptor) {
      descriptor.swaggerdocs = docs;
    }
  }
};
