#!/usr/bin/env node

var http	= require('http');

/**
 * opts:
 * - opts.stream_url	: url for the stream
 * - opts.notify_unit	: the unit to notify recved_data (default to 1024)
 * - opts.event_cb	: callback event_cb(event_type, event_data):
 *   - "cnx_begin"/null: server connected
 *   - "cnx_end"/null: server disconnected
 *   - "recved_size"/nunits: when data is received (nunit is the amount of data
 *     in 'unit'). it is notified when there is at least one unit to notified.
 *   - "idle_timeout"/null: when no data has been received for 
*/
var casto_testclient_t	= function(opts){

/*
- ctor
  - init var
  - launch client
  - start idle timeout
- dtor
  - stop client
  - stop idle timeout
  
  
- prototype approche is well known and well understood
- does it support protected/private ?
  - yep but only at function level, not at the object level
  - need a _myvar trick to show what is local or not
- i need a clear and strict way to write it. no time to waste
- prototype approche put a lot of this.* everywhere
- ptototype approche limit the possibility of closure
- prototype is not the common principle in js

*/
	
	
	var self	= this;
	// sanity check - all mandatory fields must be present
	console.assert(opts.stream_url);
	console.assert(opts.event_cb);
	// alias some variables to ease readability
	var stream_url	= opts.stream_url;
	var event_cb	= opts.event_cb;
	var notify_unit	= opts.notify_unit	|| 1024;
	var verbose	= opts.verbose		|| 0;

	var client_launch	= function(){
		// init local variables
		var recved_len	= 0;
		var notified_len= 0;
		// create the http client
		var url		= require('url').parse(stream_url);
		var client	= http.createClient((url.port||80), url.hostname);
		// bind error cases at the socket level
		client.addListener("error"	, function(e){ event_cb("error", e.message);	});
		client.addListener("timeout"	, function(e){ event_cb("error", e.message);	});
		// create the request
		var request	= client.request('GET', url.pathname, {'host': url.host});
		request.addListener('response', function(response){
			// log to debug
			if(verbose > 0)	console.log("Connected to "+stream_url);
			// Handle faillure at http level
			if(response.statusCode != 200){
				event_cb("error", "statusCode="+response.statusCode);
				return
			}
			// notify the caller
			event_cb("cnx_begin", null);
			//response.setEncoding('utf8');
			response.addListener('data', function( chunk ){
				//console.log("chunk len="+chunk.length);
				// update recved_len
				recved_len	+= chunk.length;
				// notify the recved_size in notify_unit
				var notified_chunk	= Math.floor(notified_len	/ notify_unit);
				var tonotify_chunk	= Math.floor(recved_len		/ notify_unit);
				var nb_chunks		= tonotify_chunk - notified_chunk;
				if(nb_chunks > 0)	event_cb("recved_size", nb_chunks);
				// update notified_len
				notified_len		= recved_len;
			});
			response.addListener('end', function(){
				// log the event
				console.log("Connection ended");
				// notify the caller
				event_cb("cnx_end", null);
			}); 
		});
		request.end();		
	}
	
	var ctor	= function(){
		client_launch();		
	}
	
	var dtor	= function(){
		console.log("dtor")
	}
	
	ctor();
	// return the public properties
	return {
		destroy	: dtor
	}
}

casto_client_t = function(opts)
{
	var self	= this;
	// sanity check - all mandatory fields must be present
	console.assert(opts.stream_url);
	console.assert(opts.event_cb);
	// alias some variables to ease readability
	self.stream_url	= opts.stream_url;
	self.event_cb	= opts.event_cb;
	self.notify_unit= opts.notify_unit	|| 1024;
	self.verbose	= opts.verbose		|| 0;

	this._idle_timeout_start();
}

/**
 * Destructor
*/
casto_client_t.prototype.dtor	= function()
{
	this._idle_timout_stop();
	this._client_stop();
}

//////////////////////////////////////////////////////////////////////////////////
//		idle_timeout							//
//////////////////////////////////////////////////////////////////////////////////
casto_client_t.prototype._idle_timeout_start	= function()
{
	console.assert(this.idle_timeout_id === null || this.idle_timeout_id === undefined);
	this.idle_timeout_id	= setTimeout(this._idle_timeout_cb, 1*1000);
	console.log("ddd");
}

casto_client_t.prototype._idle_timeout_stop	= function()
{
	if( this.idle_timeout_id !== null )	clearTimeout(this.idle_timeout_cb);
	this.idle_timeout_id	= null;
	this._idle_timeout_start();
}

casto_client_t.prototype._idle_timeout_cb	= function()
{
	console.log("idle timeout expired. next in "+this._idle_timeout_delay);
}

//////////////////////////////////////////////////////////////////////////////////
//		client								//
//////////////////////////////////////////////////////////////////////////////////
casto_client_t.prototype._client_start	= function()
{
}

casto_client_t.prototype._client_stop	= function()
{
}

//////////////////////////////////////////////////////////////////////////////////
//	main programm								//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){

	// build stream_url for neoip-casto
	var stream_url	= require('./casto_url').create({
		"base_url"	: "http://localhost:4560",
		"cast_privhash"	: "a761ce3a",
		"cast_name"	: "superstream"
	});

// TODO dunno why but the actual url is never
stream_url	= "http://127.0.0.1:8124/";
console.log("stream_url="+stream_url);

if(false){
	var client	= new casto_testclient_t({
		stream_url	: stream_url,
		verbose		: 1,
		event_cb	: function(event_type, event_data){
			//console.log("event_type="+event_type);
			//console.log("event_data="+event_data);
			if( event_type == "recved_size" ){
				var nb_unit	= event_data;
				for(var i = 0; i < nb_unit; i++){
					require("sys").print('.');
				}
			}
		}
	});
}

if(true){
	var client	= new casto_client_t({
		stream_url	: stream_url,
		verbose		: 1,
		event_cb	: function(event_type, event_data){
			//console.log("event_type="+event_type);
			//console.log("event_data="+event_data);
			if( event_type == "recved_size" ){
				var nb_unit	= event_data;
				for(var i = 0; i < nb_unit; i++){
					require("sys").print('.');
				}
			}
		}
	});	
}
}