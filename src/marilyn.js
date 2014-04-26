(function() {

	// _socketConnection should be shared between all the models
	// it's a single connection to the server
	var _socketConnection;
	var _models = {};

	function _modelGet(modelName){
		return _models[modelName];
	};

	function _modelSet(modelName, init) {

		var model = _models[modelName] = {};

		// setup the private variables of the model
		// collection will store all the data in the model
		model._collection = [];
		model._schema = {};
		model._receivers = {};
		model._befores = {};
		model._afters = {};

		// this is a variable that will be overrided each time scope needs to be retained
		model._retainScope;

		// setup the schema

		model.schema = function(schema) {
			model._schema = schema;
		};

		// Socket.IO events

		model.on = function(eventType, callback){

			if (_socketConnection) {
				_socketConnection.on(eventType, function(data){
					model._retainScope = callback;
					model._retainScope(data);
				});
			}

		};

		model.emit = function(eventType, data){
			if (_socketConnection) {
				_socketConnection.emit(eventType, data);
			}
		};

		// internal events

		model.inform = function(eventType, data) {
			if (this._receivers[eventType]) {
				this._retainScope = this._receivers[eventType];
				this._retainScope(data);
			}
		};

		model.receive = function(eventType, callback) {
			this._receivers[eventType] = callback;
		};

		// query methods

		model.create = function(element, callback) {

			this._collection.push(element);

			this.inform('create', element);

			if (callback) {
				callback(null, element);
			}

		};

		model.read = function(query, callback) {

			var readAll = false;

			// if no query was passed
			if(typeof query === 'function'){
				callback = query;
				readAll = true;
			}

			// or if the query object was empty
			else if(_.isEmpty(query)){
				readAll = true;
			}

			var results = [];

			if(readAll){
				results = this._collection;
			}else{
				results = _.where(this._collection, query);
			}

			if (callback) {
				callback(null, results);
			}

		};

		model.readOne = function(query, callback) {

			var results = _.find(this._collection, query);

			if (callback) {
				callback(null, results);
			}

		};

		model.update = function(query, changes, callback) {

			var err = null;
			var results = _.where(this._collection, query);

			if(results){

				_.each(results, function(element){

					_.each(changes, function(value, key) {
						element[key] = value;
					});

				});

				this.inform('update', results);

			}else{
				err = 'item not found';
			}

			if (callback) {
				callback(err, results);
			}

		};

		model.remove = function(query, callback) {

			var err = null;
			var results = _.where(this._collection, query);

			if(results){

				_.each(results, function(element){

					var index = _.indexOf(model._collection, element);
					model._collection.splice(index, 1)

				});

				this.inform('remove', results);

			}else{
				err = 'item not found';
			}

			if (callback) {
				callback(err, results);
			}

		};

		// run the callback init function if it was passed
		if (init) {

			// make "this" work inside of the callback
			model.init = init;
			model.init();

			// remove the init function as it should only run once
			delete model.init;

		}

		return model;

	};

	// create the Marilyn object
	var Marilyn = {};

	Marilyn.config = function(socketConnection) {
		_socketConnection = socketConnection;
	};

	Marilyn.model =  function(modelName, init) {
		if(_models[modelName]){
			return _modelGet(modelName);
		}else{
			return _modelSet(modelName, init);
		}
	};

	window.Marilyn = Marilyn;

})();
