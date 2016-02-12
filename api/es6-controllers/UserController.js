'use strict';

var ApiController = require('./ApiControllerAbstract');
var actionUtil = require('../hooks/controllers-ex/lib/actionUtil.js');

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
    title: 'Users',
    description: 'Operations with users'
  }],
  models: {
    responseUser: {
      data: { type: 'user' }
    },
    responseListUser: {
      data: { type: ['user'] }
    }
  }
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
    returns: {status: 201, arg: 'JSON', type: "responseUser", root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'post', path: '/api/v1/users'})
  create(req, res) {
    super.create(req, res);
  }

  @swagger({
    description: 'Updates a existing {model}.\n',
    accepts: {args:'JSON', type: "userEditable", required: true, http: {source: 'body'}},
    returns: {status: 200, arg: 'JSON', type: 'responseUser', root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'put', path: '/api/v1/users/:id'})
  updateOne(req, res) {
    super.updateOne(req, res);
  }


  @swagger({
    description: 'Find {model}s by query.\n',
    accepts: [
      {args:'offset', type: "integer", required: false, http: {source: 'query'}},
      {args:'limit', type: "integer", required: false, http: {source: 'query'}}
    ],
    returns: {status: 200, arg: 'JSON', type: 'responseListUser', root: true, description: 'The response body contains list of {model}.\n'}
  })
  @route({verb: 'get', path: '/api/v1/users'})
  find(req, res) {
    // Lookup for records that match the specified criteria
    var query = user.find()
      .populate('avatar')
      .where( actionUtil.parseCriteria(req) )
      .limit( actionUtil.parseLimit(req) )
      .skip( actionUtil.parseSkip(req) )
      .sort( actionUtil.parseSort(req) );
    query = actionUtil.populateEach(query, req);
    query.exec(function found(err, matchingRecords) {
      if (err) return res.serverError(err);

      // Only `.watch()` for new instances of the model if
      // `autoWatch` is enabled.
      if (req._sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, matchingRecords);
        if (req.options.autoWatch) { Model.watch(req); }
        // Also subscribe to instances of all associated models
        _.each(matchingRecords, function (record) {
          actionUtil.subscribeDeep(req, record);
        });
      }

      res.dataOk(matchingRecords);
    });
  }

  /**
   * @param {req} req
   * @param {res} res
   */
  @swagger({
    description: 'Get {model} by primary key.',
    accepts: [
      {args:'id', type: "string", required: true, http: {source: 'path'}}
    ],
    returns: [
      {status: 200, arg: 'JSON', type: 'responseUser', root: true, description: 'The response body contains properties of {model}.\n'},
      {status: 404, description: 'User not found exception'},
      {status: 403, description: 'Forbidden exception'}
    ]
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
      {args:'id', type: "string", required: true, http: {source: 'path'}}
    ],
    returns: {status: 204, arg: 'JSON', type: 'responseUser', root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'delete', path: '/api/v1/users/:id'})
  destroyOne(req, res) {
    super.destroyOne(req, res);
  }
}

module.exports = new UserController();
