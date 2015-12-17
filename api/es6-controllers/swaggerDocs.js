"use strict";

module.exports = function(value) {
  return function decorator(target, key, descriptor) {
    descriptor.isTestable = value;
  }
};
