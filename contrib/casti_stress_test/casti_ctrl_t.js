var assert	= require('assert');
var neoip_rpc	= require('../../lib/neoip_rpc');

/**
 * - opts.refresh_period : period in msec
 * - opts.call_url: call url for neoip-casti
 * - opts.call_args: all the parameters for casti call url
*/
var casti_ctrl_t	= function(opts, user_cb){
	var self		= {};
	var refresh_timerid	= null;
	var rpc_call		= null;
	var refresh_period	= opts['refresh_period'] || 1*1000;
	var call_url		= opts['call_url'] || "http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js";
	var call_args		= opts['call_args'];
	
	var ctor	= function(){
		// start the action
		start();
	}
	
	var request_stream	= function(){
		// sanity check
		assert.ok(rpc_call === null);
		
		var method_name	= "request_stream";
		var rpc_call	= new neoip_rpc.call(call_url, method_name, call_args, function(cast_privhash){
			console.log("succeed");	
			console.log();
		}, function(){
			console.log("failed");
		});		
		
	}
	var release_stream	= function(){
		// sanity check
		assert.ok(rpc_call === null);
		
	}
	
	var refresh_cb	= function(){
		// log to debug
		console.log("refresh cb");
		// sanity check
		assert.ok(rpc_call === null);
		assert.ok(refresh_timerid !== null);
		// start the timeout
		//refresh_timerid	= setInterval(refresh_cb, refresh_period);	}
	
	/**
	 * Start the action
	*/
	var start	= function(){
		// sanity check
		assert.ok( !self.is_started() );
		// start the timeout
		refresh_timerid	= setInterval(refresh_cb, 0);
	}
	
	/**
	 * Stop the action
	*/
	self.stop	= function(){
		// cancel refresh_timerid if needed
		if( refresh_timerid !== null ){
			clearTimeout( refresh_timerid );
			refresh_timerid	= null;
		}
		// cancel rpc_call if needed
		if( rpc_call !== null ){
			rpc_call.stop();
			rpc_call	= null;
		}
	}
	
	/**
	 * return true if it is started, false otherwise
	*/
	self.is_started	= function(){
		if( refresh_timerid !== null )	return true;
		if( rpc_call !== null )		return true;
		return true;
	}
	
	// call the constructor
	ctor();
	// return the object itself
	return self;	
}

exports.create	= function(){
	return new casti_ctrl_t(arguments)
}