
let decorators = require('../decorators/controllers');
let route = decorators.route;
let swagger = decorators.swagger;
let swaggerApi = decorators.swaggerApi;

@swaggerApi({

})
class AssetController {

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
      {args:'User ID', type: "integer", required: true, http: {source: 'path'}},
      {args:'Avatar', type: "file", required: true, http: {source: 'formData'}}
    ],
    returns: {status: 201, arg: 'JSON', type: 'responseUser', root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'post', path: '/api/v1/users/:id/avatar'})
  createUserAsset(req, res) {

  }
}

module.exports = new AssetController();
