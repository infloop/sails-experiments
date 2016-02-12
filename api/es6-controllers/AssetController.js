'use strict';

var ApiController = require('./ApiControllerAbstract');
let decorators = require('../decorators/controllers');
let route = decorators.route;
let swagger = decorators.swagger;
let swaggerApi = decorators.swaggerApi;

@swaggerApi({
  tags: [{
    title: 'Assets',
    description: 'Operations with assets'
  }],
  models: {
    responseAsset: {
      data: { type: 'asset' }
    },
    responseListAsset: {
      data: { type: ['asset'] }
    }
  }
})
class AssetController extends ApiController {

  /**
   *
   * @param req
   * @param res
   */
  @swagger({
    tags: ['Users'],
    consumes: 'multipart/form-data',
    description: 'Uploads new avatar to a user.',
    accepts: [
      {args:'id', type: "string", required: true, http: {source: 'path'}},
      {args:'avatar', type: "file", required: true, http: {source: 'formData'}}
    ],
    returns: {status: 201, arg: 'JSON', type: 'responseUser', root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'post', path: '/api/v1/users/:id/avatar'})
  createUserAsset(req, res) {
    var userId = req.params.all().id;

    req.file('avatar').upload({
      // don't allow the total upload size to exceed ~10MB
      dirname: require('path').resolve(sails.config.appPath, './uploads/avatars/'),
      maxBytes: 10*1024*1024
    },function done(err, uploadedFiles) {
      if (err) {
        return res.negotiate(err);
      }

      // If no files were uploaded, respond with an error.
      if (uploadedFiles.length === 0){
        return res.badRequest('No file was uploaded');
      }

      asset.create({
          path: uploadedFiles[0].fd,
          description: 'user avatar'
      })
      .then(function(asset) {
        user.update(userId, {
          avatar: asset.id,
        })
        .then(res.ok)
      })
      .catch(res.badRequest);
    });
  }

  @swagger({
    description: 'Find {model}s by query.\n',
    accepts: [
      {args:'offset', type: "integer", required: false, http: {source: 'query'}},
      {args:'limit', type: "integer", required: false, http: {source: 'query'}}
    ],
    returns: {status: 200, arg: 'JSON', type: 'responseListAsset', root: true, description: 'The response body contains list of {model}.\n'}
  })
  @route({verb: 'get', path: '/api/v1/assets'})
  find(req, res) {
    super.find(req,res);
  }
}

module.exports = new AssetController();
