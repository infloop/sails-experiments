'use strict';

var ApiController = require('./ApiController');


/**
 * UserController
 *
 * @description :: Server-side logic for managing Api
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 * @sw-model-alias({name: UserEditable, model: User, exclude: ['id']})
 */
class UserController extends ApiController {

  /**
   * @sw-description('The response body contains properties of user settings.\n')
   * @sw-accepts({args:'json', type: "User", required: true, http: {source: 'body'}})
   * @sw-returns({arg: 'data', type: 'User', root: true, description: 'The response body contains properties of user settings.\n'})
   * @sw-http({verb: 'post', path: '/users'})
   *
   * @param {req} req
   * @param {res} res
   */
  create(req, res) {
    super.create(req, res);
  }

  updateOne(req, res) {
    super.updateOne(req, res);
  }

  /**
   * @sw-description('The response body contains properties of user settings.\n')
   * @sw-accepts({args:'json', type: "User", required: true, http: {source: 'body'}})
   * @sw-returns({arg: 'data', type: 'User', root: true, description: 'The response body contains properties of user settings.\n'})
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

module.exports = (new UserController());
