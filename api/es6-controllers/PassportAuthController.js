
let decorators = require('../decorators/controllers');
let route = decorators.route;
let swagger = decorators.swagger;
let swaggerApi = decorators.swaggerApi;

var passport = require('passport');

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
    res.view({ message: req.flash('error') });
  }

  loginProcess(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.view('passportauth/login', {
          username: req.body.username,
          message: info.message
        });
      }
      req.logIn(user, function(err) {
        if (err) return next(err);
        // TODO make UnAuthenticated error
        return res.redirect('/protected');
      });
    })(req, res, next);
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

  protected(req, res) {
    res.view();
  }
}

module.exports = new PassportAuthController();
