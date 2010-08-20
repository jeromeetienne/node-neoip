// import required modules
var app_detect		= require('./neoip_app_detect');
var url_builder_oload_t	= require('./url_builder_oload_t');

var verbose	= 1;
var webpeer	= {};

/**
 * probe webpeer and notify the callback once completed
 * 
 * @param completed_cb {function} callback notified on completion completed(present){}
*/
webpeer.ready	= function(completed_cb){
	// discover neoip-webpeer
	app_detect.webpeer_probe({
		completed_cb	: function(status){
			if( status == "toinstall" )	completed_cb(false);
			else if( status == "toupgrade")	completed_cb(true);
			else if( status == "installed")	completed_cb(true);
			else console.assert(false);
		}
	})
};


/**
 * @returns {boolean} true if webpeer is present, false otherwise
*/
webpeer.present	= function(){
	return app_detect.webpeer_status() == "installed";
}

/**
 * webpeerify a url to static file
 * - this is an minimal helper on top of url_builder_oload_t
 * - url_builder_oload_t implementation is complete and much more complex
 * 
 * @param url {string} original url to webpeerify
*/
webpeer.url	= function(url){
	if( !webpeer.present() )	return url;
	return url_builder_oload_t.create(url)
			.set('outter_uri', app_detect.cache_get('oload').root_url)
			.to_string();
}


/**
 * Continuously probe webpeer and notify on status change
*/
webpeer.monitor	= function(ctor_opts){
	if( typeof(ctor_opts) == "undefined" )	ctor_opts = {};
	if( typeof(ctor_opts) == "function" )	ctor_opts = {completed_cb: ctor_opts};
	// copy ctor_opts + set default values if needed
	var completed_cb= ctor_opts.completed_cb	|| function(){};
	var delay	= ctor_opts.delay		|| 1*1000;
	// class variables
	var prev_status	= null;
	var timer_cb	= function(){
		app_detect.webpeer_probe({
			completed_cb	: function(status){
				if( status != prev_status ){
					prev_status	= status;
					completed_cb(status);
				}
				setTimeout(timer_cb, delay);
			},
			nocache		: true
		})
	}
	// launch initial timer
	setTimeout(timer_cb, 0);
}

/**
 * - this function is web-only
 * @param {string} the dom element id of the img tag
*/
webpeer.badge	= function(elem_id){
	webpeer.ready(function(){
		var elem	= document.getElementById("webpeer_badge");
		elem.src	= "http://webpeer.it/images/badge/" + (webpeer.present() ? 'accept.png' : 'exclamation.png');
		if( webpeer.present() ){
			elem.title	= "You are a web peer. Congrats!";
		}else{
			elem.title	= "You are not yet a web peer. Click to be one.";		
		}
	});
}

// exports public functions
exports.present	= webpeer.present;
exports.url	= webpeer.url;
exports.ready	= webpeer.ready;
exports.monitor	= webpeer.monitor;
exports.badge	= webpeer.badge;
// backward compatible API - deprecated
exports.avail	= function(){ console.log('Obsolet function. use .present()'); webpeer.present.apply(this, arguments);	}
