module.exports = {
  attributes: {
    //id: {
    //  type: 'string',
    //  unique: true,
    //  primaryKey: true
    //},
    path: {
      type: 'string',
      required: true
    },
    bucket: {
      type: 'string'
    },
    description: {
      type: 'string',
      required: true
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

  hiddenAttributes: [],
  protectedAttributes: ['id','createdAt','updatedAt'],

  // Lifecycle Callbacks
  beforeCreate: function(values, next) {
    next();
  },
  beforeUpdate: function(values, next) {
    next();
  }
};
