// set - also returns the model
var marilynModel = Marilyn.model('modelName', function(){

	// "this" represents the model

	// SOCKET.IO abstraction

	// listen for event from server
	this.on('socketIOEventFromServer', function(data){

		this.create({}, function(err, results){

		});

		this.update({}, function(err, results){

		});

		this.remove({}, function(err, results){

		});

	});


	this.on('socketIOEventFromServer', function(data){
		// the model can dispatch events 
		this.inform('customEvent', data);
	});

	// MONGOOSE abstraction

	// get the collection
	// the collection is the data held within the model
	// this data can be directly manipulated
	// when the data changes four automatic events can be dispatched
	// create, update, remove, change
	this.collection;

	// schema
	this.schema({
		// "this" represents the schema
		// "this.property" are other properties of the schema
	});

	// events
	this.before('event', function(callback){
		// "this" represents the model
		callback();
	});

	this.before('event', function(){
		// "this" represents the model
	});

	// before and after are useful for syncing socket data
	this.after('create', function(data){
		this.emit('socketIOEventFromClient', data);
	});

	this.after('update', function(data){
		this.emit('socketIOEventFromClient', data);
	});

	this.after('remove', function(data){
		this.emit('socketIOEventFromClient', data);
	});

	this.after('customEvent', function(data){
		this.emit('socketIOEventFromClient', data);
	});

});

// get
var marilynModel = Marilyn.model('modelName');

// query
// in all of these "this" represents the model
marilynModel.create({}, function(err, results){});
marilynModel.read({}, function(err, results){});
marilynModel.readOne({}, function(err, results){});
marilynModel.update({}, function(err, results){});
marilynModel.remove({}, function(err, results){});

// events
marilynModel.receive('create', function(collection, createdElement){});
marilynModel.receive('update', function(collection, updatedElement, oldUpdatedElement){});
marilynModel.receive('remove', function(collection, removedElement){});
marilynModel.receive('change', function(collection, oldCollection){});
marilynModel.receive('customEvent', function(data){});