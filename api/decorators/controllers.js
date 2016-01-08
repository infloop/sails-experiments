'use strict';

let swaggerDecorators = require('../hooks/swagger/lib/decorators/swagger');
let routeDecorators = require('../hooks/controllers-ex/lib/decorators/route');

module.exports = {
  swagger: swaggerDecorators.swagger,
  swaggerApi: swaggerDecorators.swaggerApi,

  route: routeDecorators.route
};
