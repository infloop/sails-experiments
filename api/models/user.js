
module.exports = {
  attributes: {
    //id: {
    //  type: 'string',
    //  primaryKey: true
    //},
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
      enum: ['m', 'f']
    },
    avatar: {
      type: 'string'
    },

    // Override toJSON instance method to remove password value
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
  },
  autoCreatedAt: true,
  autoUpdatedAt: true,

  hiddenAttributes: ['password'],
  protectedAttributes: ['id','createdAt','updatedAt','avatar'],

  // Lifecycle Callbacks
  beforeUpdate: function (values, next) {
    CipherService.hashPassword(values);
    next();
  },
  beforeCreate: function (values, next) {
    CipherService.hashPassword(values);
    next();
  }
};
