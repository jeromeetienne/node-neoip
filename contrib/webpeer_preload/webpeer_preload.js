/**
 * tools to preload static files in webpeer
 *
 * * TODO change the naming
 * ** class naming + file naming
 * * do i make this a real tool or just a demo
 * ** man page + inline help
 * ** source cleanup
*/

// include system dependancies
var http		= require('http');
// include local dependancies
var url_builder_oload_t	= require('../../lib/url_builder_oload_t');
var app_detect		= require('../../lib/neoip_app_detect');


/**
 * Preload static http file in oload
 * * use a trick on neoip-oload
 * ** httpo_maxrate=0k thus neoip-oload will never deliver data on the client http cnx
 * ** read_ahead=2g thus neoip-oload will read up to 2gbyte on this url
*/
var oload_content_preload	= function(content_url, failure_cb){
	// set default value if needed
	if( !failure_cb )	failure_cb = function(error){}
	// build the webpeer_url
	var webpeer_url	= url_builder_oload_t.create(content_url)
		.set('outter_var/httpo_maxrate'	, '0k')
		.set('outter_var/read_ahead'	, '2g')		// FIXME this hardcoded length is lame
		.set('outter_uri', app_detect.cache_get('oload').root_url)
		.to_string();

	// create http client
	var parsed_url	= require('url').parse(webpeer_url);
	var client	= http.createClient((parsed_url.port||80), parsed_url.hostname)
	// bind error cases at the socket level
	client.on("error"	, function(e){ failure_cb("error due to "+e.message)	});
	client.on("timeout"	, function(e){ failure_cb("timeout")			});	
	// create the request
	var request	= client.request('GET', parsed_url.pathname,  {
		'host'	: parsed_url.hostname
	});
	// init the reponse
	request.on('response', function(response) {
		// handle error at http level 
		if( response.statusCode != 200 ){
			failure_cb("http error ("+response.statusCode+")")
			return;
		}
	});
	request.end();
	
	/** Stop this preload
	*/
	var close	= function(){
		client_req.connection.destroy();
	}
	
	// return the public API
	return {
		close	: close
	}
}


// get content_urls from the cmdline
var content_urls	= process.argv.slice(2);

// discover neoip-oload and act depending on its presence or not
app_detect.discover_app({
	app_suffix	: "oload",
	hostname	: "127.0.0.1",
	success_cb	: function(root_url, version){
		// once neoip-oload found, preload all content_urls
		for(var i = 0; i < content_urls.length; i++){
			var content_url	= content_urls[i];
			oload_content_preload(content_url);
		}
	},
	failure_cb	: function(error){
		console.log("Webpeer has not been found (due to "+error+")");
	}
})