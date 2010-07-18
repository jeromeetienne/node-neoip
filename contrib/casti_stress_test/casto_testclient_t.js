#!/usr/bin/env node

var http	= require('http');
var sys		= require('sys');

var casto_testclient_t	= function(opts, event_cb){
	// alias some variables to ease readability
	var base_url		= opts.base_url;
	var cast_privhash	= opts.cast_privhash;
	var cast_name		= opts.cast_name;


	// build the url_str
	var url_str		= base_url + "/" + cast_privhash + "/" + cast_name;
// TODO dunno why but the actual url is never
//url_str	= "http://127.0.0.1:8124/";
sys.puts("url_str="+url_str);
	var recved_len	= 0;
	var notified_len= 0;
	var notify_unit	= 1024;
	// create the http client
	var url		= require('url').parse(url_str);
	var client	= http.createClient((url.port||80), url.hostname);
	// bind error cases at the socket level
	client.addListener("error"	, function(e){ event_cb("error", e.message);	});
	client.addListener("timeout"	, function(e){ event_cb("error", e.message);	});
	// create the request
	var request	= client.request('GET', url.pathname, {'host': url.host});
	request.addListener('response', function(response){
		sys.puts('STATUS: ' + response.statusCode);
		sys.puts('HEADERS: ' + JSON.stringify(response.headers));
		// Handle faillure at http level
		if(response.statusCode != 200){
			event_cb("error", "statusCode="+response.statusCode);
			return
		}
		//response.setEncoding('utf8');
		response.addListener('data', function( chunk ){
			sys.puts("chunk len="+chunk.length);
			sys.print('.');
			var notified_chunk	= Math.floor(notified_len % notify_unit);
			var new_len	= recved_len
			// update recved_len
			recved_len	+= chunk.length;
		});
		response.addListener('end', function(){
			a.b += 1;
			sys.puts("Connection ended");
		});
	});
	request.end();	
}


//////////////////////////////////////////////////////////////////////////////////
//	main programm								//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	var opts	= {
		"base_url"	: "http://localhost:4560",
		"cast_privhash"	: "a761ce3a",
		"cast_name"	: "superstream"
	}
	var event_cb	= function(event_type, event_data){
		console.log("event_type="+event_type);
		console.log("event_data="+event_data);
	}
	var client	= new casto_testclient_t(opts, event_cb);
}