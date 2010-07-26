#!/usr/bin/env node

var http	= require('http');
var sys		= require('sys');

/**
 * do a rpc call to a neoip application 
*/
var call = function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self	= this;
	// copy ctor_opts + set default values if needed
	var call_url	= ctor_opts.call_url	|| console.assert(ctor_opts.call_url);
	var method_name	= ctor_opts.method_name	|| console.assert(ctor_opts.method_name);
	var method_args	= ctor_opts.method_args	|| [];
	var success_cb	= ctor_opts.success_cb	|| function(){};
	var failure_cb	= ctor_opts.failure_cb	|| function(){};
	var verbose	= ctor_opts.verbose		|| 0;

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
	var client_req		= null;
	var client_start	= function(){
		var url		= require('url').parse(call_url);
		// build url_path
		var url_path	= url.pathname + "?method_name=" + method_name;
		for(var i = 0; i < method_args.length; i++){
			url_path	+= "&arg"+i+"=" + escape(method_args[i]);
		}
		// create the request	  
		var client	= http.createClient((url.port||80), url.hostname);
		// bind error cases at the socket level
		client.on("error"	, function(e){ failure_cb({code: -1, string: e.message});});
		client.on("timeout"	, function(e){ failure_cb({code: -1, string: e.message});});
		// create the request
		client_req	= client.request('GET', url_path, {'host': url.host});
		client_req.on('response', function(client_res){
			// log to debug
			if( verbose )	console.log('STATUS: ' + client_res.statusCode);
			if( verbose )	console.log('HEADERS: ' + JSON.stringify(client_res.headers));
			// Handle faillure at http level
			if(client_res.statusCode != 200)
				return failure_cb(new Error("http statuscode="+client_res.statuscode));
			client_res.setEncoding('utf8');
			client_res.on('data', function( reply_json ){
				if( verbose )	console.log('BODY: ' + reply_json);
				// convert reply_json to native data
				var reply_data	= JSON.parse(reply_json);
				// handle faillure/success_cb at the call level
				if( reply_data['fault'] ){
					if( verbose > 1 )	console.dir(reply_data);
					failure_cb(reply_data['fault']);	// TODO what about the error itself	
				}else{
					var returned_val= reply_data['returned_val'];
					success_cb(returned_val);
				}
			});
			return undefined;
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
};

/**
 * Class method to create an object
 * - thus avoid new operator
*/
call.create	= function(ctor_opts){	return new call(ctor_opts);	}

// export it via commonjs
exports.call	= call;

//////////////////////////////////////////////////////////////////////////////////
//	main programm								//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	var rpc_call	= call.create({
		call_url	: 'http://localhost:4550/neoip_oload_appdetect_jsrest.js',
		method_name	: 'probe_apps',
		success_cb	: function(returned_val){
			console.log("succeed");	
			console.log(sys.inspect(returned_val));
		},
		failure_cb	: function(){
			console.log('failed');
		}
	});	
}
