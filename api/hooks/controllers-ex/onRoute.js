/**
 * Module dependencies.
 */

var _ = require('lodash'),
	util = require('sails-util');


/**
 * Expose route parser.
 * @type {Function}
 */
module.exports = function (sails) {
	return interpretRouteSyntax;


	/**
	 * interpretRouteSyntax
	 *
	 * "Teach" router to understand references to controllers.
	 *
	 * @param  {[type]} route [description]
	 * @return {[type]}       [description]
	 * @api private
	 */
	function interpretRouteSyntax (route) {
		var target = route.target,
			path = route.path,
			verb = route.verb,
			options = route.options;

		if (_.isObject(target) && !_.isFunction(target) && !_.isArray(target)) {

			// Merge target into `options` to get hold of relevant
			// route options:
			options = _.merge(options, target);

			// Support { controller: 'FooController' } notation
			if (!_.isUndefined(target.controller)) {
				return bindController(path, target, verb, options);
			}

			// Support resourceful sub-mappings for verbless routes
			// e.g. '/someRoute': { post: 'FooController.bar', get: '...', /* ... */ }
			// If verb was manually specified in route (e.g. `get /someRoute`), ignore the sub-mappings
			if ( !options.detectedVerb ) {
				if ( target.get ) { sails.router.bind (path, target['get'],'get', options); }
				if ( target.post ) { sails.router.bind (path, target['post'],'post', options); }
				if ( target.put ) { sails.router.bind (path, target['put'],'put', options); }
				if ( target['delete'] ) { sails.router.bind (path, target['delete'],'delete', options); }

				// TODO: if there is a legitimate use case for it, add other HTTP verbs here for completeness.
			}
		}

		// Support string ('FooController.bar') notation
		if (_.isString(target)) {

			// Handle dot notation
			var parsedTarget = target.match(/^([^.]+)\.?([^.]*)?$/);

			// If target matches a controller (or, if views hook enabled, a view)
			// go ahead and assume that this is a dot notation route
			var controllerId = util.normalizeControllerId(parsedTarget[1]);
			var actionId = _.isString(parsedTarget[2]) ? parsedTarget[2].toLowerCase() : 'index';

			// If this is a known controller, bind it
			if ( controllerId && (
				sails.middleware['controllers-ex'][controllerId] ||
				(sails.config.hooks.views.blueprints && sails.middleware.views[controllerId])
				)
			) {
				return bindController (path, {
					controller: controllerId,
					action: actionId
				}, verb, options);
			}
		}

		// Ignore unknown route syntax
		// If it needs to be understood by another hook, the hook would have also received
		// the typeUnknown event, so we're done.
		return;
	}



	/**
	 * Bind route to a controller/action.
	 *
	 * @param  {[type]} path   [description]
	 * @param  {[type]} target [description]
	 * @param  {[type]} verb   [description]
	 * @param  {[type]} options[description]
	 * @return {[type]}        [description]
	 * @api private
	 */
	function bindController ( path, target, verb, options ) {

    console.log('path: ' + path + ' verb: ' + verb);
		// Normalize controller and action ids
		var controllerId = util.normalizeControllerId(target.controller);
    //console.log('controllerId: ' + controllerId + ' action: ' + target.action);
		var actionId = _.isString(target.action) ? target.action.toLowerCase() : null;

    //console.log('keys');
    //console.log(_.keys(sails.middleware['controllers-ex']));

		// Look up appropriate controller/action and make sure it exists
		var controller = sails.middleware['controllers-ex'][controllerId];

    //console.log('controller.name:' + controller.name);
    //console.log(controller);
		// Fall back to matching view
		if (!controller) {
			controller = sails.middleware.views[controllerId];
		}

		// If a controller and/or action was specified,
		// but it's not a match, warn the user
		if ( ! ( controller && _.isObject(controller) )) {
			sails.after('lifted', function () {
				sails.log.error(
					'***Ignored attempt to bind route (' + path + ') to unknown controller ::',
					controllerId+'.'
				);
			});
			return;
		}
		if ( actionId && !controller[actionId] ) {
			sails.after('lifted', function () {
				sails.log.error(
					'****Ignored attempt to bind route (' + path + ') to unknown controller.action ::',
					controllerId + '.' + (actionId || 'index')
				);
			});
			return;
		}

		// (if unspecified, default actionId to 'index'
		actionId = actionId || 'index';

		// Merge the target controller/action into our route options:
		options.controller = controllerId;
		options.action = actionId;


    // Determine the model connected to this controller either by:
    // -> on the routes config
    // -> on the controller
    var modelId = options.model || controllerId;

    // If the orm hook is enabled, it has already been loaded by this time,
    // so just double-check to see if the attached model exists in `sails.models`.
    if (sails.hooks.orm && sails.models && sails.models[modelId]) {

      // If a model with matching identity exists,
      // extend route options with the id of the model.
      options.model = modelId;

      var Model = sails.models[modelId];

      // Mix in the known associations for this model to the route options.
      options = _.merge({ associations: _.cloneDeep(Model.associations) }, options);

      // Mix in the relevant blueprint config
      options = _.defaults(options, {
        populate: sails.config.blueprints.populate,
        defaultLimit: sails.config.blueprints.defaultLimit
      });

    }

		// 1. Bind the specified `action`
		var subTarget = controller[actionId];
		if (_.isArray(subTarget)) {
			_.each(subTarget, function bindEachMiddlewareInSubTarget (fn) {
				sails.router.bind(path, controllerHandler(fn), verb, options);
			});
			return;
		}

		// -- or --

		// 2. Bind a controller which is actually a function to the destination route (rare)
		sails.router.bind(path, controllerHandler(subTarget), verb, options);



		// Wrap up the controller middleware to supply access to
		// the original target when requests comes in
		function controllerHandler (originalFn) {

			if ( !_.isFunction(originalFn) ) {
				sails.after('lifted', function () {
					sails.log.error(
						'In '+controllerId + '.' + actionId+', ignored invalid attempt to bind route to a non-function controller:',
						originalFn, 'for path: ', path, verb ? ('and verb: ' + verb) : '');
				});
				return;
			}

			// Bind intercepted middleware function to route
			return originalFn;
		}

		return;
	}
};

