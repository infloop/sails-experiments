/**
 * Passport configuration file where you should configure strategies
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;

var EXPIRES_IN_MINUTES = 60 * 24;
var SECRET = process.env.tokenSecret || "6ukI0uIVnB3iI1yxjdfgdfgdfgjzzdfgrGDFG44tNg7jO4GDFGRFGG5F7Trtwe7OM";
var ALGORITHM = "HS256";
var ISSUER = "localhost:1337";
var AUDIENCE = "localhost:1337";


/**
 * Configuration object for local strategy
 */
var LOCAL_STRATEGY_CONFIG = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: false
};

/**
 * Configuration object for JWT strategy
 */

var JWT_STRATEGY_CONFIG = {
  secretOrKey: SECRET,
  issuer : ISSUER,
  audience: AUDIENCE,
  passReqToCallback: false
};

/**
 * Triggers when user authenticates via local strategy
 */
function onLocalStrategyAuth(email, password, next) {
  user.findOne({email: email})
    .exec(function (error, user) {
      if (error) return next(error, false, {});

      if (!user) return next(null, false, {
        code: 'E_USER_NOT_FOUND',
        message: email + ' is not found'
      });

      // TODO: replace with new cipher service type
      /** @type {CipherService} */

       if (!CipherService.comparePassword(password, user))
        return next(null, false, {
          code: 'E_WRONG_PASSWORD',
          message: 'Password is wrong'
        });

      return next(null, user, {});
    });
}

/**
 * Triggers when user authenticates via JWT strategy
 */
function onJwtStrategyAuth(payload, next) {
  var user = payload.user;
  return next(null, user, {});
}

passport.use(
  new LocalStrategy(LOCAL_STRATEGY_CONFIG, onLocalStrategyAuth));
passport.use(
  new JwtStrategy(JWT_STRATEGY_CONFIG, onJwtStrategyAuth));

module.exports.jwtSettings = {
  expiresInMinutes: EXPIRES_IN_MINUTES,
  secret: SECRET,
  algorithm : ALGORITHM,
  issuer : ISSUER,
  audience : AUDIENCE
};
