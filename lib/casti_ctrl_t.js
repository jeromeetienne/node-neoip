#!/usr/bin/env node

var neoip_rpc	= require('./neoip_rpc_node');
var sys		= require('sys');
var underscore	= require('../vendor/underscore/underscore')._; underscore.noConflict();

/**
*/
var casti_ctrl_t	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self		= this;
	// copy ctor_opts + set default values if needed
	var call_url		= ctor_opts.call_url		|| console.assert(false);
	var casti_opts		= ctor_opts.casti_opts		|| console.assert(false);
	var event_cb		= ctor_opts.event_cb		|| function(event_type, event_data){}
	var req_timer_delay	= ctor_opts.req_timer_delay	|| 0.5*1000;
	var verbose		= ctor_opts.verbose		|| 0;
	// private methods
	var cast_privhash	= null;

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
		rpc_call	= neoip_rpc.rpc_call.create({
			call_url	: call_url,
			method_name	: 'request_stream',
			method_args	: [co.mdata_srv_uri, co.cast_name, co.cast_privtext, co.scasti_uri
						, co.scasti_mod, co.http_peersrc_uri, co.web2srv_str],
			success_cb	: function(returned_val){
				rpc_call_destroy();
				req_timer_refresh();
				if(returned_val.length > 0){
				// mark this cast as "published"
					cast_privhash	= returned_val;
					notify_event("ispublished", {cast_privhash: returned_val});			
				}else{
					// mark this cast as "not published"
					cast_privhash	= null;
					notify_event("nopublished", null);
				}
			},
			failure_cb	: function(fault){
				// mark this cast as "not published"
				cast_privhash	= null;
				if( verbose )	console.log("failure: "+require('sys').inspect(fault));
				rpc_call_destroy();
				notify_event("rpc_error", null);
			}
		});
	}
	var rpc_call_release	= function(){
		// log to debug
		if( verbose > 1 )	console.log("rpc: rpc_call_release enter")
		// sanity check
		console.assert(rpc_call === null);
		// mark this cast as "not published"
		cast_privhash	= null;
		// create the neoip_rpc.call
		var co		= casti_opts;
		rpc_call	= neoip_rpc.rpc_call.create({
			call_url	: call_url,
			method_name	: 'release_stream',
			method_args	: [co.mdata_srv_uri, co.cast_name, co.cast_privtext],
			success_cb	: function(returned_val){
				rpc_call_destroy();
				notify_event("released", null);
			},
			failure_cb	: function(fault){
				if( verbose )	console.log("failure: "+require('sys').inspect(fault));
				rpc_call_destroy();
				notify_event("rpc_error", null);
			}
		});	
	}
	var rpc_call_destroy	= function(){
		if( rpc_call !== null )	rpc_call.destroy();
		rpc_call	= null;
	}

	//////////////////////////////////////////////////////////////////////////
	//		notify_event						//
	//////////////////////////////////////////////////////////////////////////
	var last_event_type	= null;
	var last_event_data	= null;
	var notify_event	= function(event_type, event_data){
		// return if current event is equal to last event
		if( event_type == last_event_type && underscore.isEqual(event_data, last_event_data) )
			return;
		// backup current event_type/event_data
		last_event_data	= event_data;
		last_event_type	= event_type;
		// do notify the event_cb
		event_cb(event_type, event_data);
	}


	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// call the contructor
	ctor();
	// return the public properties
	return {
		release		: start_release,
		published	: function(){ return cast_privhash !== null 	},
		cast_privhash	: function(){ return cast_privhash;		},
		destroy		: dtor
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

