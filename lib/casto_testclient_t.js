#!/usr/bin/env node

var http	= require('http');

/*
- prototype approche is well known and well understood
- does it support protected/private ?
  - yep but only at function level, not at the object level
  - need a _myvar trick to show what is local or not.
    - CON: adversory only
    - CON: polute the code
- i need a clear and strict way to write it. no time to waste
- prototype approche put a lot of this.* everywhere
  - polute the code
- ptototype approche limit the possibility of closure
- prototype is not the common principle in js

- for callback
  - always report error when possible
  - if only a few different values may be reported, consider succeed_cb/failure_cb
  - if many different values may be reported, considere a event_cb(even_type, event_data)
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
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self	= this;
	// sanity check - all mandatory fields must be present
	console.assert(ctor_opts.stream_url);
	// copy ctor_opts + set default values if needed
	var stream_url		= ctor_opts.stream_url;
	var event_cb		= ctor_opts.event_cb		|| function(event_type, event_data){};
	var notify_unit		= ctor_opts.notify_unit		|| 1024;
	var verbose		= ctor_opts.verbose		|| 0;
	var idle_timer_delay	= ctor_opts.idle_timer_delay	|| 20*1000;
	var max_recved_len	= ctor_opts.max_recved_len	|| null;
	
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
	var idle_timer_start	= function(){
		if( verbose > 1 )	console.log("launch idle_timer timeout in "+idle_timer_delay+"-msec");
		idle_timer_id	= setTimeout(idle_timer_cb, idle_timer_delay);
	}
	var idle_timer_stop	= function(){
		if( idle_timer_id !== null )	clearTimeout(idle_timer_id);
		idle_timer_id	= null;		
	}
	var idle_timer_refresh	= function(){
		if( verbose )	console.log("idle_time_refresh");
		idle_timer_stop();
		idle_timer_start();
	}
	var idle_timer_cb	= function(){
		if( verbose )	console.log("idle timer expired. next in "+idle_timer_delay+"-msec");
		event_cb("error", "idle timeout after "+idle_timer_delay+"-msec");
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
		client.on("error"	, function(e){ event_cb("error", e.message); });
		client.on("timeout"	, function(e){ event_cb("error", e.message); });
		// create the request
		client_req	= client.request('GET', url.pathname, {'host': url.host});
		client_req.on('response', function(client_res){
			// log to debug
			if( verbose )	console.log("Connected to "+stream_url);
			// start the idle_timer
			idle_timer_start();
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
				// notify the caller
				if( max_recved_len && recved_len >= max_recved_len )	event_cb("recved_len_maxed", null);
			});
			client_res.on('end', function(){
				// log the event
				if( verbose )	console.log("Connection ended");
				// notify the caller
				event_cb("cnx_closed", null);
			}); 
		});
		client_req.end();		
	}
	var client_stop		= function(){
		client_req.connection.destroy();
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
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
	return new casto_testclient_t(ctor_opts);
}

// export it via commonjs
exports.create	= casto_testclient_t.create;

//////////////////////////////////////////////////////////////////////////////////
//	main programm								//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	//////////////////////////////////////////////////////////////////////////////////
	//	parse cmdline								//
	//////////////////////////////////////////////////////////////////////////////////
	// cmdline_opts default
	cmdline_opts	= {
		stream_url	: {},
		verbose		: 0,
		max_recved_len	: null,
		notify_unit	: null,
		nconcurent_cnx	: 1
	};
	var disp_usage	= function(prefix){
		if(prefix)	console.log(prefix + "\n");
		console.log("usage: casto_testclient [-n unitbyte] [-v [-v]] [-c ncnx] stream_url");
		console.log("");
		console.log("Establish a connection with a http stream.");
		console.log("- intended to test neoip-casto.");
		console.log("");
		console.log("-l|--max_recved_len lbytes\t\tSet the max amount of kbytes to receive.");
		console.log("-n|--notify_unit bytes\t\tSet the amount of bytes to notify");
		console.log("-v|--verbose\t\t\tIncrease the verbose level (for debug).");
		console.log("-h|--help\t\t\tDisplay the inline help.");
	}
	var optind	= 2;
	for(;optind < process.argv.length; optind++){
		var key	= process.argv[optind];
		var val	= process.argv[optind+1];
		//console.log("key="+key+" val="+val);
		if( key == '-l' || key == "--max_recved_len" ){
			cmdline_opts.max_recved_len	= parseInt(val);
			optind		+= 1;
		}else if( key == '-n' || key == "--notify_unit" ){
			cmdline_opts.notify_unit	= parseInt(val);
			optind		+= 1;
		}else if( key == '-c' || key == "--nconcurent_cnx" ){
			cmdline_opts.nconcurent_cnx	= parseInt(val);
			optind		+= 1;			
		}else if( key == '-v' || key == "--verbose" ){
			cmdline_opts.verbose	+= 1;
		}else if( key == "-h" || key == "--help" ){
			disp_usage();
			process.exit(0);
		}else{
			// if the option doesnt exist, consider it is the first non-option parameters
			break;
		}
	}
	// get required options from the rest of the cmdline
	var stream_url	= process.argv[optind++];	
	

	if( false ){
		stream_url	= "http://127.0.0.1:8124/";
		cmdline_opts.verbose	= 1
	}
	// create casto_client
	for(var i = 0; i < cmdline_opts.nconcurent_cnx; i++ ){
		var casto_client	= casto_testclient_t.create({
			stream_url	: stream_url,
			event_cb	: function(event_type, event_data){
				if( cmdline_opts.verbose ) console.log("event_type="+event_type+" event_data="+event_data);
				if( event_type == "recved_size" ){
					var nb_unit	= event_data;
					for(var i = 0; i < nb_unit; i++){
						require("sys").print('.');
					}
				}else if(event_type == "recved_len_maxed"){
					casto_client.destroy();
				}
			},
			max_recved_len	: cmdline_opts.max_recved_len	|| null,
			notify_unit	: cmdline_opts.notify_unit	|| null,
			verbose		: cmdline_opts.verbose		|| 0
		});
	}
}
