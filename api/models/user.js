//var bcrypt = require('bcrypt');

function hashPassword(values, next) {
  //bcrypt.hash(values.password, 10, function(err, hash) {
  //  if (err) {
  //    return next(err);
  //  }
  //  values.password = hash;
  //  next();
  //});
  next();
}

module.exports = {
  attributes: {
    id: {
      type: 'string',
      unique: true,
      primaryKey: true
    },
    username: {
      type: 'string',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6
    },
    email: {
      type: 'email',
      required: true,
      unique: true
    },
    firstName: {
      type: 'string',
      required: false
    },
    lastName: {
      type: 'string',
      required: false
    },
    age: {
      type: 'integer',
      required: false
    },
    sex: {
      type: 'string',
      enum: ['m', 'f', 'denied']
    },

    // Override toJSON instance method to remove password value
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    },
    validPassword: function(password, callback) {
      var obj = this.toObject();
      if (callback) {
        //callback (err, res)
        return bcrypt.compare(password, obj.password, callback);
      }
      return bcrypt.compareSync(password, obj.password);
    }
  },
  autoCreatedAt: true,
  autoUpdatedAt: true,

  hiddenAttributes: ['password'],
  protectedAttributes: ['id','createdAt','updatedAt'],

  // Lifecycle Callbacks
  beforeCreate: function(values, next) {
    hashPassword(values, next);
  },
  beforeUpdate: function(values, next) {
    if (values.password) {
      hashPassword(values, next);
    }
    else {
      //IMPORTANT: The following is only needed when a BLANK password param gets submitted through a form. Otherwise, a next() call is enough.
      User.findOne(values.id).done(function(err, user) {
        if (err) {
          next(err);
        }
        else {
          values.password = user.password;
          next();
        }
      });
    }
  }
};
