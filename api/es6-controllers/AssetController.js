
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
      {args:'id', type: "string", required: true, http: {source: 'path'}},
      {args:'avatar', type: "file", required: true, http: {source: 'formData'}}
    ],
    returns: {status: 201, arg: 'JSON', type: 'responseUser', root: true, description: 'The response body contains properties of {model}.\n'}
  })
  @route({verb: 'post', path: '/api/v1/users/:id/avatar'})
  createUserAsset(req, res) {
    req.file('avatar').upload({
      // don't allow the total upload size to exceed ~10MB
      dirname: require('path').resolve(sails.config.appPath, '/uploads/avatars'),
      maxBytes: 10*1024*1024
    },function whenDone(err, uploadedFiles) {
      if (err) {
        return res.negotiate(err);
      }

      // If no files were uploaded, respond with an error.
      if (uploadedFiles.length === 0){
        return res.badRequest('No file was uploaded');
      }


      // Save the "fd" and the url where the avatar for a user can be accessed
      user.update(req.params.all().id, {

          // Generate a unique URL where the avatar can be downloaded.
          avatar: require('util').format('%s/user/avatar/%s', sails.getBaseUrl(), req.session.me),

          // Grab the first file and use it's `fd` (file descriptor)
          avatarFd: uploadedFiles[0].fd
        })
        .exec(function (err){
          if (err) return res.negotiate(err);
          return res.jsonx({data:'ok'});
        });
    });
  }
}

module.exports = new AssetController();
