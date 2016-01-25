'use strict';

var ApiController = require('./ApiControllerAbstract');

let decorators = require('../decorators/controllers');
let route = decorators.route;
let swagger = decorators.swagger;
let swaggerApi = decorators.swaggerApi;

/**
 * UserController
 *
 * @description :: Server-side logic for managing Api
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 * @sw-model-alias({name: UserEditable, model: User, exclude: ['id']})
 */
@swaggerApi({
  tags: [{
    title: 'Pairs',
    description: 'Operations with pairs'
  }],
  models: {
    pairUser: {
      avatar: { type: 'string'}
    },
    pair: {
      id: { type: 'string'},
      userA: { type: 'pairUser' },
      userB: { type: 'pairUser' }
    },
    responsePair: {
      data: { type: 'pair' }
    },
    responseListPair: {
      data: { type: ['pair'] }
    }
  }
})
class PairController extends ApiController {
  /**
   * @param {req} req
   * @param {res} res
   */
  @swagger({
    description: 'Get random pair',
    accepts: [],
    returns: [
      {status: 200, arg: 'JSON', type: 'responsePair', root: true, description: 'Pair data'},
      {status: 403, description: 'Forbidden exception'}
    ]
  })
  @route({verb: 'get', path: '/api/v1/pairs'})
  findOne(req, res) {
    res.status(200);
    res.jsonx({
      data: {
        id: 'FGHDFRFESRR3434FSFDG',
        userA: {
          avatar: 'http://lorempixel.com/200/200/people'
        },
        userB: {
          avatar: 'http://lorempixel.com/200/200/people'
        }
      }
    });
  }
}

module.exports = new PairController();
