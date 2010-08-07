// declare neoip namespace
neoip		= neoip 		|| {};
neoip.rpc_call	= neoip.rpc_call	|| {};

/**
 * do a rpc call to a neoip application 
*/
neoip.rpc_call = function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// copy ctor_opts + set default values if needed
	var call_url	= ctor_opts.call_url	|| console.assert(ctor_opts.call_url);
	var method_name	= ctor_opts.method_name	|| console.assert(ctor_opts.method_name);
	var method_args	= ctor_opts.method_args	|| [];
	var success_cb	= ctor_opts.success_cb	|| function(returned_val){};
	var failure_cb	= ctor_opts.failure_cb	|| function(error){};
	var verbose	= ctor_opts.verbose	|| 0;

	//////////////////////////////////////////////////////////////////////////
	//		ctor/dtor						//
	//////////////////////////////////////////////////////////////////////////
	var ctor	= function(){
		client_start();
	}
	var dtor	= function(){
		//console.log("Stop neoip rpc call");
		client_stop();
	}

	//////////////////////////////////////////////////////////////////////////
	//		http client						//
	//////////////////////////////////////////////////////////////////////////
	var client_call		= null;
	var client_start	= function(){
		// sanity check
		console.assert( client_call == null );
		// build url_path
		var url	= call_url + "?callback=?&method_name=" + method_name;
		for(var i = 0; i < method_args.length; i++){
			url	+= "&arg"+i+"=" + escape(method_args[i]);
		}
		if( verbose > 1 )	console.log("url="+url);
		// create the jsonp_call
		client_call	= new neoip.jsonp_call({
			url		: url,
			success_cb	: function(data){
				console.dir(data);
				// handle faillure/success_cb at the call level
				if( data['fault'] ){
					failure_cb(data['fault']);	// TODO what about the error itself	
				}else{
					var returned_val= data['returned_val'];
					success_cb(returned_val);
				}				
			},
			failure_cb	: function(error){
				// log to debug
				if( verbose )	console.log("failed due to "+error);
				// notify the caller
				failure_cb(error);
			}
		})

	}	
	var client_stop		= function(){
		// destroy client_call if needed
		if( client_call )	client_call.destroy();
		client_call	= null;
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
};

/**
 * Class method to create an object
 * - thus avoid new operator
*/
neoip.rpc_call.create	= function(ctor_opts){	return new neoip.rpc_call(ctor_opts);	}