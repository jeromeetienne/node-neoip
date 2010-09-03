/**
 * tools to preload static files in webpeer
*/

// include system dependancies
var http		= require('http');
// include local dependancies
var url_builder_oload_t	= require('./url_builder_oload_t');


/**
 * Preload static http file in oload
 * * use a trick on neoip-oload
 * ** httpo_maxrate=0k thus neoip-oload will never deliver data on the client http cnx
 * ** read_ahead=2g thus neoip-oload will read up to 2gbyte on this url
*/
var oload_preloader_t	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// copy ctor_opts + set default values if needed
	var url_builder_oload	= ctor_opts.url_builder_oload	|| console.assert(false);
	var failure_cb		= ctor_opts.failure_cb		|| function(error){};

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
	//		http client						//
	//////////////////////////////////////////////////////////////////////////
	var client_req		= null;
	var client_start	= function(){
		// build the webpeer_url
		var webpeer_url	= url_builder_oload
			.set('outter_var/httpo_maxrate'	, '0k')
			.set('outter_var/read_ahead'	, '2g')		// FIXME this hardcoded length is lame
			.to_string();
		// create http client
		var parsed_url	= require('url').parse(webpeer_url);
		var client	= http.createClient((parsed_url.port||80), parsed_url.hostname)
		// bind error cases at the socket level
		client.on("error"	, function(e){ failure_cb("error due to "+e.message)	});
		client.on("timeout"	, function(e){ failure_cb("timeout")			});	
		// create the request
		var client_req	= client.request('GET', parsed_url.pathname,  {
			'host'	: parsed_url.hostname
		});
		// init the reponse
		client_req.on('response', function(response) {
			// handle error at http level 
			if( response.statusCode != 200 ){
				failure_cb("http error ("+response.statusCode+")")
				return;
			}
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
oload_preloader_t.create	= function(ctor_opts){
	return new oload_preloader_t(ctor_opts);
}

// export it via commonjs
exports.create	= oload_preloader_t.create;

