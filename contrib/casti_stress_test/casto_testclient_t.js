#!/usr/bin/env node

var http	= require('http');
var sys		= require('sys');

/**
 * opts:
 * - opts.stream_url	: url for the stream
 * - opts.notify_unit	: the unit to notify recved_data (default to 1024)
 * - opts.event_cb	: callback event_cb(event_typem event_data):
 *   - "cnx_begin"/null: server connected
 *   - "cnx_end"/null: server disconnected
 *   - "recved_data"/nunits: when data is received (nunit is the amount of data
 *     in 'unit'). it is notified when there is at least one unit to notified.
*/
var casto_testclient_t	= function(opts){
	// sanity check - all mandatory fields must be present
	console.assert(opts.stream_url);
	console.assert(opts.event_cb);
	// alias some variables to ease readability
	var stream_url	= opts.stream_url;
	var event_cb	= opts.event_cb;

	// init local variables
	var recved_len	= 0;
	var notified_len= 0;
	var notify_unit	= opts.notify_unit || 1024;
	// create the http client
	var url		= require('url').parse(stream_url);
	var client	= http.createClient((url.port||80), url.hostname);
	// bind error cases at the socket level
	client.addListener("error"	, function(e){ event_cb("error", e.message);	});
	client.addListener("timeout"	, function(e){ event_cb("error", e.message);	});
	// create the request
	var request	= client.request('GET', url.pathname, {'host': url.host});
	request.addListener('response', function(response){
		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
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

	var event_cb	= function(event_type, event_data){
		//console.log("event_type="+event_type);
		//console.log("event_data="+event_data);
		if( event_type == "recved_size" ){
			var nb_unit	= event_data;
			for(var i = 0; i < nb_unit; i++){
				sys.print('.');
			}
		}
	}
	var client	= new casto_testclient_t({
		stream_url	: stream_url,
		event_cb	: event_cb
	});
}