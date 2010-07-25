#!/usr/bin/env node

var http	= require('http');

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
var casto_testclient_t	= function(ctor_opts){
	var self	= this;
	// sanity check - all mandatory fields must be present
	console.assert(ctor_opts.stream_url);
	console.assert(ctor_opts.event_cb);
	// alias some variables to ease readability
	var stream_url		= ctor_opts.stream_url;
	var event_cb		= ctor_opts.event_cb		|| function(event_type, event_data){};
	var notify_unit		= ctor_opts.notify_unit		|| 1024;
	var verbose		= ctor_opts.verbose		|| 0;
	var idle_timer_delay	= ctor_opts.idle_timer_delay	|| 1*1000;
	
	//////////////////////////////////////////////////////////////////////////
	//		ctor/dtor						//
	//////////////////////////////////////////////////////////////////////////
	var ctor	= function(){
		client_start();
	}
	var dtor	= function(){
		idle_timer_stop();
		client_stop();
	}
	
	//////////////////////////////////////////////////////////////////////////
	//		idle_timer						//
	//////////////////////////////////////////////////////////////////////////
	var idle_timer_id	= null;
	var idle_timer_start	= function(delay){
		// if not specified, set delay to default value
		if( delay == undefined )	delay	= idle_timer_delay;
		console.assert(idle_timer_id === null);
		idle_timer_id	= setTimeout(idle_timer_cb, delay);
	}
	var idle_timer_stop	= function(){
		if( idle_timer_id !== null )	clearTimeout(idle_timer_id);
		idle_timer_id	= null;		
	}
	var idle_timer_refresh	= function(){
		idle_timer_stop();
		idle_timer_start();
	}
	var idle_timer_cb	= function(){
		console.log("idle timer expired. next in "+idle_timer_delay+"-msec");
		event_cb("idle_timeout", null);
	}

	//////////////////////////////////////////////////////////////////////////
	//		http client						//
	//////////////////////////////////////////////////////////////////////////
	var client_req		= null;
	var client_start	= function(){
		var recved_len	= 0;
		var notified_len= 0;
		// create the http client
		var url		= require('url').parse(stream_url);
		var client	= http.createClient((url.port||80), url.hostname);
		// bind error cases at the socket level
		client.addListener("error"	, function(e){ event_cb("error", e.message);	});
		client.addListener("timeout"	, function(e){ event_cb("error", e.message);	});
		// create the request
		client_req	= client.request('GET', url.pathname, {'host': url.host});
		client_req.on('response', function(client_res){
			// log to debug
			if(verbose > 0)	console.log("Connected to "+stream_url);
			// start the idle_timer
			idle_timer_start(0);
			// Handle faillure at http level
			if(client_res.statusCode != 200){
				event_cb("error", "statusCode="+client_res.statusCode);
				return
			}
			// notify the caller
			event_cb("cnx_begin", null);
			//client_res.setEncoding('utf8');
			client_res.on('data', function( chunk ){
				// refresh idle_timer
				idle_timer_refresh();
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
			client_res.on('end', function(){
				// log the event
				console.log("Connection ended");
				// notify the caller
				event_cb("cnx_end", null);
			}); 
		});
		client_req.end();		
	}
	var client_stop		= function(){
		client_req.connection.destroy();
	}

	//////////////////////////////////////////////////////////////////////////
	//									//
	//////////////////////////////////////////////////////////////////////////
	// call the contructor
	ctor();
	// return the public properties
	return {
		destroy	: dtor
	}
}

/**
 * Class method to create an object
 * - thus avoid new operator
*/
casto_testclient_t.create	= function(ctor_opts){
	return new casto_testclient_t(ctor_opts)
}

//////////////////////////////////////////////////////////////////////////////////
//	main programm								//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	// TODO dunno why but the actual url is never
	stream_url	= "http://127.0.0.1:8124/";
	console.log("stream_url="+stream_url);

	var client	= casto_testclient_t.create({
		stream_url	: stream_url,
		verbose		: 1,
		event_cb	: function(event_type, event_data){
			//console.log("event_type="+event_type+" event_data="+event_data);
			if( event_type == "recved_size" ){
				var nb_unit	= event_data;
				for(var i = 0; i < nb_unit; i++){
					require("sys").print('.');
				}
			}
		}
	});
}
