'use strict';

var ApiController = require('./ApiControllerAbstract');

var route = require('./swaggerDocs');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Api
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 * @sw-model-alias({name: UserEditable, model: User, exclude: ['id']})
 */
class UserController extends ApiController {

  constructor() {
    super();
  }

  /**
   *
   * @param req
   * @param res
  */
  @route({
    inherited: false,
    model: 'user',
    modelEditable: 'userEditable',
    http: {verb: 'post', path: '/users'},
    description: 'The response body contains properties of {model} settings.\n',
    accepts: {args:'JSON', type: "userEditable", required: true, http: {source: 'body'}},
    returns: {arg: 'JSON', type: "user", root: true, description: 'The response body contains properties of {model} settings.\n'}
  })
  create(req, res) {
    super.create(req, res);
  }


  updateOne(req, res) {
    super.updateOne(req, res);
  }

  /**
   * @sw-description('The response body contains properties of user settings.\n')
   * @sw-accepts(})
   * @sw-returns()
   * @sw-http({verb: 'post', path: '/users'})
   *
   * @param {req} req
   * @param {res} res
   */
  find(req, res) {
    super.find(req, res);
  }

  /**
   *
   * @param {req} req
   * @param {res} res
   */
  findOne(req, res) {
    super.findOne(req, res);
  }

  /**
   *
   * @param {req} req
   * @param {res} res
   */
  destroyOne(req, res) {
    super.destroyOne(req, res);
  }
}

var a = module.exports = new UserController();
console.log(a);
