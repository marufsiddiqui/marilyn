(function() {

	// _socketConnection should be shared between all the models
	// it's a single connection to the server
	var _socketConnection;

	// the is where all the models will be stored so getters can be used to retrieve them
	var _models = {};

	function _modelGet(modelName) {
		return _models[modelName];
	};

	function _modelSet(modelName, init) {

		var model = _models[modelName] = {};

		model.name = modelName;

		// setup the private variables of the model
		// collection will store all the data in the model
		model._collection = [];

		model._befores = {};
		model._afters = {};

		model._receivers = {};

		// this is a variable that will be overrided each time scope needs to be retained
		model._retainScope;

		// Socket.IO events

		model.on = function(eventType, callback) {

			if (_socketConnection) {
				_socketConnection.on(eventType, function(data) {
					model._retainScope = callback;
					model._retainScope(data);
				});
			}

		};

		model.emit = function(eventType, data) {
			if (_socketConnection) {
				_socketConnection.emit(eventType, data);
			}
		};

		// internal events

		model.before = function(eventType, callback) {
			model._befores[eventType] = callback;
		};

		model.beforeRemove = function(eventType) {
			model._befores[eventType] = function() {
			};
		};

		model.after = function(eventType, callback) {
			model._afters[eventType] = callback;
		};

		model.afterRemove = function(eventType) {
			model._afters[eventType] = function() {
			};
		};

		model.inform = function(eventType, data) {
			if (model._receivers[eventType]) {
				model._retainScope = model._receivers[eventType];
				model._retainScope(data);
			}
		};

		model.receive = function(eventType, callback) {
			model._receivers[eventType] = callback;
		};

		model.receiveRemove = function(eventType) {

			if (_.isEmpty(eventType)) {
				model._receivers = {};
			} else {
				model._receivers[eventType] = function() {
				};
			}

		};

		// query methods

		model.create = function(element, callback) {

			if (model._befores.hasOwnProperty('create')) {
				model._retainScope = model._befores['create'];
				model._retainScope(function() {
					runComplete();
				});
			} else {
				runComplete();
			}

			function runComplete() {

				model.createSilent(element, function(err, results) {

					if (callback) {
						model._retainScope = callback;
						model._retainScope(err, results);
					}

					if (model._afters.hasOwnProperty('create')) {
						model._retainScope = model._afters['create'];
						model._retainScope(element);
					}

				});

			}

		};

		model.createSilent = function(element, callback) {

			var err = null;

			model._collection.push(element);

			model.inform('create', element);

			if (callback) {
				model._retainScope = callback;
				model._retainScope(err, element);
			}

		};

		model.read = function(query, callback) {

			if (model._befores.hasOwnProperty('read')) {
				model._retainScope = model._befores['read'];
				model._retainScope(function() {
					runComplete();
				});
			} else {
				runComplete();
			}

			function runComplete() {

				model.readSilent(query, function(err, results) {

					if (callback) {
						model._retainScope = callback;
						model._retainScope(err, results);
					}

					if (model._afters.hasOwnProperty('read')) {
						model._retainScope = model._afters['read'];
						model._retainScope(results);
					}

				});

			}

		};

		model.readSilent = function(query, callback) {

			var err = null;

			var readAll = false;

			// if no query was passed
			if ( typeof query === 'function') {
				callback = query;
				readAll = true;
			}

			// or if the query object was empty
			else if (_.isEmpty(query)) {
				readAll = true;
			}

			var results = [];

			if (readAll) {
				results = model._collection;
			} else {
				results = _.where(model._collection, query);
			}

			if (callback) {
				model._retainScope = callback;
				model._retainScope(err, results);
			}

		};

		model.readOne = function(query, callback) {

			if (model._befores.hasOwnProperty('readOne')) {
				model._retainScope = model._befores['readOne'];
				model._retainScope(function() {
					runComplete();
				});
			} else {
				runComplete();
			}

			function runComplete() {

				model.readOneSilent(query, function(err, results) {

					if (callback) {
						model._retainScope = callback;
						model._retainScope(err, results);
					}

					if (model._afters.hasOwnProperty('readOne')) {
						model._retainScope = model._afters['readOne'];
						model._retainScope(results);
					}

				});

			}

		};

		model.readOneSilent = function(query, callback) {

			var err = null;

			var results = _.where(model._collection, query);

			var result = null;

			if (results[0]) {
				result = results[0];
			} else {
				err = 'item not found';
			}

			if (callback) {
				model._retainScope = callback;
				model._retainScope(err, result);
			}

		};

		model.update = function(query, changes, callback) {

			if (model._befores.hasOwnProperty('update')) {
				model._retainScope = model._befores['update'];
				model._retainScope(function() {
					runComplete();
				});
			} else {
				runComplete();
			}

			function runComplete() {

				model.updateSilent(query, changes, function(err, results) {

					if (callback) {
						model._retainScope = callback;
						model._retainScope(err, results);
					}

					if (model._afters.hasOwnProperty('update')) {
						model._retainScope = model._afters['update'];
						model._retainScope(results);
					}

				});

			}

		};

		model.updateSilent = function(query, changes, callback) {

			var err = null;

			var results = _.where(model._collection, query);

			if (results) {

				_.each(results, function(element) {

					_.each(changes, function(value, key) {
						element[key] = value;
					});

				});

				model.inform('update', results);

			} else {
				err = 'item not found';
			}

			if (callback) {
				model._retainScope = callback;
				model._retainScope(err, results);
			}

		};

		model.del = model['delete'] = function(query, callback) {

			if (model._befores.hasOwnProperty('delete')) {
				model._retainScope = model._befores['delete'];
				model._retainScope(function() {
					runComplete();
				});
			} else {
				runComplete();
			}

			function runComplete() {

				model.deleteSilent(query, function(err, results) {

					if (callback) {
						model._retainScope = callback;
						model._retainScope(err, results);
					}

					if (model._afters.hasOwnProperty('delete')) {
						model._retainScope = model._afters['delete'];
						model._retainScope(results);
					}

				});

			}

		};

		model.delSilent = model.deleteSilent = function(query, callback) {

			var err = null;

			var results = _.where(model._collection, query);

			if (results) {

				_.each(results, function(element) {

					var index = _.indexOf(model._collection, element);
					model._collection.splice(index, 1);

				});

				model.inform('delete', results);

			} else {
				err = 'item not found';
			}

			if (callback) {
				model._retainScope = callback;
				model._retainScope(err, results);
			}

		};

		// run the callback init function if it was passed
		if (init) {

			// make "this" work inside of the callback
			model.init = init;
			model.init();

			// delete the init function as it should only run once
			delete model.init;

		}

		return model;

	};

	// create the Marilyn object
	var Marilyn = {};
	
	Marilyn.VERSION = '0.5.1';

	Marilyn.config = function(socketConnection) {
		_socketConnection = socketConnection;
	};

	Marilyn.model = function(modelName, init) {
		if (_models[modelName]) {
			return _modelGet(modelName);
		} else {
			return _modelSet(modelName, init);
		}
	};

	Marilyn.modelRemove = function(modelName) {
		_models[modelName] = null;
	};

	Marilyn.receiveRemove = function(modelName) {
		for (var model in _models) {
			_models[model].receiveRemove();
		}
	};

	window.Marilyn = Marilyn;

})();