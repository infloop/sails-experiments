'use strict';

var ApiController = require('./ApiControllerAbstract');

let decorators = require('./Decorators');
var route = decorators.route;
var swagger = decorators.swagger;
var swaggerApi = decorators.swaggerApi;

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
    title: 'Users',
    description: 'Operations with users'
  }]
})
class UserController extends ApiController {

  constructor() {
    super();
  }

  /**
   *
   * @param req
   * @param res
  */
  @swagger({
    description: 'Creates new {model}.',
    accepts: {args:'JSON', type: "userEditable", required: true, http: {source: 'body'}},
    returns: {arg: 'JSON', type: "user", root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'post', path: '/api/v1/users'})
  create(req, res) {
    super.create(req, res);
  }

  @swagger({
    description: 'Updates a existing {model}.\n',
    accepts: {args:'JSON', type: "userEditable", required: true, http: {source: 'body'}},
    returns: {arg: 'JSON', type: "user", root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'put', path: '/api/v1/users/:id'})
  updateOne(req, res) {
    super.updateOne(req, res);
  }

  /**
   * @param {req} req
   * @param {res} res
   */

  @swagger({
    description: 'Find {model}s by query.\n',
    accepts: [
      {args:'offset', type: "integer", required: true, http: {source: 'query'}},
      {args:'limit', type: "integer", required: true, http: {source: 'query'}}
    ],
    returns: {arg: 'JSON', type: ["user"], root: true, description: 'The response body contains list of {model}.\n'}
  })
  @route({verb: 'get', path: '/api/v1/users'})
  find(req, res) {
    super.find(req, res);
  }

  /**
   * @param {req} req
   * @param {res} res
   */
  @swagger({
    description: 'Get {model} by primary key.',
    accepts: [
      {args:'id', type: "integer", required: true, http: {source: 'path'}}
    ],
    returns: {arg: 'JSON', type: ["user"], root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'get', path: '/api/v1/users/:id'})
  findOne(req, res) {
    super.findOne(req, res);
  }

  /**
   * @param {req} req
   * @param {res} res
   */

  @swagger({
    description: 'Delete {model} by primary key.',
    accepts: [
      {args:'id', type: "integer", required: true, http: {source: 'path'}}
    ],
    returns: {arg: 'JSON', type: ["user"], root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'delete', path: '/api/v1/users/:id'})
  destroyOne(req, res) {
    super.destroyOne(req, res);
  }
}

var a = module.exports = new UserController();
console.log(a);
