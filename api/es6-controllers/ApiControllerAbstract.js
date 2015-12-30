'use strict';
/**
 * Module dependencies
 */
var actionUtil = require('../hooks/blueprints-ex/actionUtil.js');

let decorators = require('./Decorators');
var route = decorators.route;
var description = decorators.description;
var swagger = decorators.swagger;

class ApiController {

  constructor() {
    this._config = { actions: false, rest: false, shortcuts: false };
    this.name = this.constructor.name;
  }

  @swagger({
    description: 'The response body contains properties of {model}.\n',
    accepts: {args:'JSON', type: null, required: true, http: {source: 'body'}},
    returns: {arg: 'JSON', type: null, root: true, description: 'The response body contains properties of {model} settings.\n'}
  })
  create(req, res) {
    var Model = actionUtil.parseModel(req);

    // Create data object (monolithic combination of all parameters)
    // Omit the blacklisted params (like JSONP callback param, etc.)
    var data = actionUtil.parseValues(req);


    // Create new instance of model using data from params
    Model.create(data).exec(function created(err, newInstance) {

      // Differentiate between waterline-originated validation errors
      // and serious underlying issues. Respond with badRequest if a
      // validation error is encountered, w/ validation info.
      if (err) return res.negotiate(err);

      // If we have the pubsub hook, use the model class's publish method
      // to notify all subscribers about the created item
      if (req._sails.hooks.pubsub) {
        if (req.isSocket) {
          Model.subscribe(req, newInstance);
          Model.introduce(newInstance);
        }
        Model.publishCreate(newInstance, !req.options.mirror && req);
      }

      // Send JSONP-friendly response if it's supported
      res.created(newInstance);
    });
  }

  //@route({
  //  inherited: false,
  //  model: null,
  //  modelEditable: null,
  //  http: null,
  //  description: 'Destroy {model}.\n',
  //  accepts: {args:'JSON', type: null, required: true, http: {source: 'body'}},
  //  returns: {arg: 'JSON', type: null, root: true, description: 'The response body contains properties of {model} settings.\n'}
  //})
  destroyOne(req, res) {
  var Model = actionUtil.parseModel(req);
  var pk = actionUtil.requirePk(req);

  var query = Model.findOne(pk);
  query = actionUtil.populateEach(query, req);
  query.exec(function foundRecord(err, record) {
    if (err) return res.serverError(err);
    if (!record) return res.notFound('No record found with the specified `id`.');

    Model.destroy(pk).exec(function destroyedRecord(err) {
      if (err) return res.negotiate(err);

      if (sails.hooks.pubsub) {
        Model.publishDestroy(pk, !sails.config.blueprints.mirror && req, {previous: record});
        if (req.isSocket) {
          Model.unsubscribe(req, record);
          Model.retire(record);
        }
      }

      return res.ok(record);
    });
  });
  }

  updateOne(req, res) {

    // Look up the model
    var Model = actionUtil.parseModel(req);

    // Locate and validate the required `id` parameter.
    var pk = actionUtil.requirePk(req);

    // Create `values` object (monolithic combination of all parameters)
    // But omit the blacklisted params (like JSONP callback param, etc.)
    var values = actionUtil.parseValues(req);

    // Omit the path parameter `id` from values, unless it was explicitly defined
    // elsewhere (body/query):
    var idParamExplicitlyIncluded = ((req.body && req.body.id) || req.query.id);
    if (!idParamExplicitlyIncluded) delete values.id;


    // Find and update the targeted record.
    //
    // (Note: this could be achieved in a single query, but a separate `findOne`
    //  is used first to provide a better experience for front-end developers
    //  integrating with the blueprint API.)
    Model.findOne(pk).populateAll().exec(function found(err, matchingRecord) {

      if (err) return res.serverError(err);
      if (!matchingRecord) return res.notFound();

      Model.update(pk, values).exec(function updated(err, records) {

        // Differentiate between waterline-originated validation errors
        // and serious underlying issues. Respond with badRequest if a
        // validation error is encountered, w/ validation info.
        if (err) return res.negotiate(err);


        // Because this should only update a single record and update
        // returns an array, just use the first item.  If more than one
        // record was returned, something is amiss.
        if (!records || !records.length || records.length > 1) {
          req._sails.log.warn(
            util.format('Unexpected output from `%s.update`.', Model.globalId)
          );
        }

        var updatedRecord = records[0];

        // If we have the pubsub hook, use the Model's publish method
        // to notify all subscribers about the update.
        if (req._sails.hooks.pubsub) {
          if (req.isSocket) {
            Model.subscribe(req, records);
          }
          Model.publishUpdate(pk, _.cloneDeep(values), !req.options.mirror && req, {
            previous: matchingRecord.toJSON()
          });
        }

        // Do a final query to populate the associations of the record.
        //
        // (Note: again, this extra query could be eliminated, but it is
        //  included by default to provide a better interface for integrating
        //  front-end developers.)
        var Q = Model.findOne(updatedRecord[Model.primaryKey]);
        Q = actionUtil.populateEach(Q, req);
        Q.exec(function foundAgain(err, populatedRecord) {
          if (err) return res.serverError(err);
          if (!populatedRecord) return res.serverError('Could not find record after updating!');
          res.ok(populatedRecord);
        }); // </foundAgain>
      });// </updated>
    }); // </found>
  }

  findOne(req, res) {

    var Model = actionUtil.parseModel(req);
    var pk = actionUtil.requirePk(req);

    var query = Model.findOne(pk);
    query = actionUtil.populateEach(query, req);
    query.exec(function found(err, matchingRecord) {
      if (err) return res.serverError(err);
      if (!matchingRecord) return res.notFound('No record found with the specified `id`.');

      if (sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, matchingRecord);
        actionUtil.subscribeDeep(req, matchingRecord);
      }

      res.ok(matchingRecord);
    });
  }

  find(req,res){

    // Look up the model
    var Model = actionUtil.parseModel(req);


    // If an `id` param was specified, use the findOne blueprint action
    // to grab the particular instance with its primary key === the value
    // of the `id` param.   (mainly here for compatibility for 0.9, where
    // there was no separate `findOne` action)
    if ( actionUtil.parsePk(req) ) {
      return this.findOne(req,res);
    }

    // Lookup for records that match the specified criteria
    var query = Model.find()
      .where( actionUtil.parseCriteria(req) )
      .limit( actionUtil.parseLimit(req) )
      .skip( actionUtil.parseSkip(req) )
      .sort( actionUtil.parseSort(req) );
    // TODO: .populateEach(req.options);
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
}

module.exports = ApiController;
