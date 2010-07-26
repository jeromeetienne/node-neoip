#!/usr/bin/env node

var neoip_rpc	= require('./neoip_rpc_node');
var sys		= require('sys');

/**
*/
var casti_ctrl_t	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self	= this;
	// copy ctor_opts + set default values if needed
	var call_url		= ctor_opts.call_url		|| console.assert(false);
	var casti_opts		= ctor_opts.casti_opts		|| console.assert(false);
	var event_cb		= ctor_opts.event_cb		|| function(event_type, event_data){}
	var req_timer_delay	= ctor_opts.req_timer_delay	|| 0.5*1000;
	var verbose		= ctor_opts.verbose		|| 0;

	//////////////////////////////////////////////////////////////////////////
	//		ctor/dtor						//
	//////////////////////////////////////////////////////////////////////////
	var ctor	= function(){
		rpc_call_request();
	}
	var dtor	= function(){
		// destroy pending rpc_call if needed
		rpc_call_destroy();
		// stop the req_timer if needed
		req_timer_stop();
	}

	//////////////////////////////////////////////////////////////////////////
	//		misc							//
	//////////////////////////////////////////////////////////////////////////
	var start_release	= function(){
		// destroy pending rpc_call if needed
		rpc_call_destroy();
		// stop the req_timer if needed
		req_timer_stop();
		// launch_rpc_call_release
		rpc_call_release();
	}

	//////////////////////////////////////////////////////////////////////////
	//		req_timer						//
	//////////////////////////////////////////////////////////////////////////
	var req_timer_id	= null;
	var req_timer_start	= function(delay){
		// if not specified, set delay to default value
		if( delay == undefined )	delay	= req_timer_delay;
		console.assert(req_timer_id === null);
		req_timer_id	= setTimeout(req_timer_cb, delay);
	}
	var req_timer_stop	= function(){
		if( req_timer_id !== null )	clearTimeout(req_timer_id);
		req_timer_id	= null;		
	}
	var req_timer_refresh	= function(){
		req_timer_stop();
		req_timer_start();
	}
	var req_timer_cb	= function(){
		if( verbose > 1 )	console.log("req_timer expired. next in "+req_timer_delay+"-msec");
		rpc_call_request();
	}

	//////////////////////////////////////////////////////////////////////////
	//		rpc_call						//
	//////////////////////////////////////////////////////////////////////////
	var rpc_call		= null;
	var rpc_call_request	= function(){
		// log to debug
		if( verbose > 1 )	console.log("rpc: rpc_call_request enter")
		// sanity check
		console.assert(rpc_call === null);
		// create the neoip_rpc.call
		var co		= casti_opts;
		rpc_call	= neoip_rpc.call.create({
			call_url	: call_url,
			method_name	: 'request_stream',
			method_args	: [co.mdata_srv_uri, co.cast_name, co.cast_privtext, co.scasti_uri
						, co.scasti_mod, co.http_peersrc_uri, co.web2srv_str],
			success_cb	: function(returned_val){
				rpc_call_destroy();
				req_timer_refresh();
				if(returned_val.length > 0)	event_cb("ispublished", {cast_privhash: returned_val});			
				else				event_cb("nopublished", null);
				
			},
			failure_cb	: function(fault){
				if( verbose )	console.log("failure: "+require('sys').inspect(fault));
				rpc_call_destroy();
				event_cb("rpc_error", null);
			}
		});
	}
	var rpc_call_release	= function(){
		// log to debug
		if( verbose > 1 )	console.log("rpc: rpc_call_release enter")
		// sanity check
		console.assert(rpc_call === null);
		// create the neoip_rpc.call
		var co		= casti_opts;
		rpc_call	= neoip_rpc.call.create({
			call_url	: call_url,
			method_name	: 'release_stream',
			method_args	: [co.mdata_srv_uri, co.cast_name, co.cast_privtext],
			success_cb	: function(returned_val){
				rpc_call_destroy();
				event_cb("released", null);
			},
			failure_cb	: function(fault){
				if( verbose )	console.log("failure: "+require('sys').inspect(fault));
				rpc_call_destroy();
				event_cb("rpc_error", null);
			}
		});	
	}
	var rpc_call_destroy	= function(){
		if( rpc_call !== null )	rpc_call.destroy();
		rpc_call	= null;
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// call the contructor
	ctor();
	// return the public properties
	return {
		release	: start_release,
		destroy	: dtor
	}
}

/**
 * Class method to create an object
 * - thus avoid new operator
*/
casti_ctrl_t.create	= function(ctor_opts){
	return new casti_ctrl_t(ctor_opts);
}

// export it via commonjs
exports.create	= casti_ctrl_t.create;

//////////////////////////////////////////////////////////////////////////////////
//	main programm								//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	var casti_ctrl	= casti_ctrl_t.create({
		call_url	: "http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js",
		casti_opts	: {
			mdata_srv_uri	: "http://localhost/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi",
			cast_name	: "superstream",
			cast_privtext	: "supersecret",
			scasti_uri	: "http://127.0.0.1:8124",
			scasti_mod	: "raw",
			http_peersrc_uri: "",
			web2srv_str	: "dummyuserdata"
		},
		event_cb	: function(event_type, event_data){
			console.log("event_cb: type="+event_type+" data="+require('sys').inspect(event_data));
		}
	});
	// trap SIGINT - first = release(), second normal behavior
	process.addListener('SIGINT', function(){
		console.log("Received sigint, start releasing the stream");
		casti_ctrl.release();
		process.removeListener('SIGINT', arguments.callee);
	});
}
