// import required modules
var app_detect	= require('./neoip_app_detect');
var nested_uri_t= require('./nested_uri_t');

var verbose	= 1;

/**
 * @param completed_cb {function} callback notified on completion completed(avail){}
*/
webpeer_ready	= function(completed_cb){
	// discover neoip-oload
	app_detect.webpack_probe(function(status){
		if( status == "toinstall" )	completed_cb(false);
		else if( status == "toupgrade")	completed_cb(true);
		else if( status == "installed")	completed_cb(true);
		else console.assert(false);
	})
};


/**
 * @returns {boolean} true if webpeer is available, false otherwise
*/
webpeer_avail	= function(){
	return app_detect.webpack_status() == "installed";
}

/**
 * webpeerify a url to static file
 * - this is an minimal helper on top of nested_uri_t
 * - nested_uri_t implementation is complete and much more complex
 * 
 * @param url {string} original url to webpeerify
*/
webpeer_url	= function(url){
	if( !webpeer_avail() )	return url;
	return nested_uri_t.create(url)
			.set('outter_uri', app_detect.cache_get('oload').root_url)
			.to_string();
}


// exports public functions
exports.ready	= webpeer_ready;
exports.avail	= webpeer_avail;
exports.url	= webpeer_url;
