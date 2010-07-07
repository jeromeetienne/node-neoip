var assert	= require('assert');
var rpc_call	= require('../../lib/neoip_rpc').rpc_call;

/**
 * - opts.refresh_period : period in msec
 * - opts.call_url: call url for neoip-casti
 * - opts.casti_opts: all the parameters for casti call url
*/
var casti_ctrl_t	= function(opts, user_cb){
	var self		= {};
	var refresh_timerid	= null;
	var refresh_period	= opts['refresh_period'] || 1*1000;
	var call_url		= opts['call_url'] || "http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js";
	var casti_opts		= opts['casti_opts'];
	
	var ctor	= function(){
		// start the action
		start();
	}
	
	var refresh_cb	= function(){
		// log to debug
		console.log("refresh cb");
		// start the timeout
		refresh_timerid	= setInterval(refresh_cb, refresh_period);
	}
	
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
	}
	
	/**
	 * return true if it is started, false otherwise
	*/
	self.is_started	= function(){
		if( refresh_timerid === null )	return false;
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