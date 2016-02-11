let decorators = require('../decorators/controllers');
let route = decorators.route;
let swagger = decorators.swagger;
let swaggerApi = decorators.swaggerApi;

var passport = require('passport');

/**
 * Triggers when user authenticates via passport
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Object} error Error object
 * @param {Object} user User profile
 * @param {Object} info Info if some error occurs
 * @private
 */
function processPassportAuth(req, res, error, user, info) {
  if (error) return res.serverError(error);
  if (!user) return res.unauthorized(null, info && info.code, info && info.message);

  return res.ok({
    // TODO: replace with new type of cipher service
    token: CipherService.createToken(user),
    user: user
  });
}

@swaggerApi({
  tags: [{
    title: 'Auth',
    description: 'Authentication operations'
  }],
  models: {
    credentials: {
      login: { type: 'string' },
      password: { type: 'string' }
    },
    authOk: {
      token: { type: 'string' },
      data: { type: 'user' }
    }
  }
})
class PassportAuthController {

  /**
   * @param {req} req
   * @param {res} res
   */
  @swagger({
    description: 'Login by credentials',
    accepts: [
      {args:'json', type: "credentials", required: true, http: {source: 'body'}}
    ],
    returns: {status: 200, arg: 'JSON', type: 'authOk', root: true, description: 'The response body contains properties of {model}.\n'},
  })
  @route({verb: 'post', path: '/api/v1/auth/login'})
  login(req,res) {
    passport.authenticate('local',
      processPassportAuth.bind(this, req, res))(req, res);
  }

  @swagger({
    description: 'Logout by credentials',
    accepts: [],
    returns: {status: 204, arg: 'JSON', type: null, root: true, description: 'Empty response'}
  })
  @route({verb: 'post', path: '/api/v1/auth/logout'})
  logout(req,res) {
    req.logout();
    res.redirect('/');
  }
}

module.exports = new PassportAuthController();
