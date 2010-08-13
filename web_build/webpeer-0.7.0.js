
/**
 * This file will be prepended to webpeer.js during the builder
*/

/**
 * Library closure
 * * GLOBAL is the external global
*/
(function(GLOBAL){


// firebugx - 
// see http://code.google.com/p/fbug/source/browse/branches/firebug1.2/lite/firebugx.js
if (!window.console)
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}
// Brequire - CommonJS support for the browser
function require(path) {
  var module = require.modules[path]
  if(!module) console.log("couldn't find module for: " + path)
  if(!module.exports) {
    module.exports = {}
    module.call(module.exports, module.exports, bind(path))
  }
  return module.exports
}

require.modules = {}

function bind(path) {
  var cwd = path.replace(/[^\/]*$/,"")
  return function(p) {
    p = (cwd + p).replace(/\/\.\//, "/").replace(/[^/]*\/\.\./,"").replace(/\/\//,"/")
    return require(p)
  }  
}

require.module = function(path, fn) {
  require.modules["./" + path] = fn
};require.module('base64', function(exports, require) {
// start module 

/**
 * - this file provide a way to encode/decode base64 using the url-self alphabet
 * - it is used to build the dupuri in the nested uri
 * - adapted to use the base64 safe alphabet
 *   - rfc3548.4 "Base 64 Encoding with URL and Filename Safe Alphabet"
 * - this source has been taken from http://www.webtoolkit.info/ 
 *   - the license is unknown aka unspecified
 * - TODO put this in the neoip namespace
**/


/** 
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

var base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",

	// public method for encoding
	encode_safe : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			base64._keyStr.charAt(enc1) + base64._keyStr.charAt(enc2) +
			base64._keyStr.charAt(enc3) + base64._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode_safe : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\-\_\=]/g, "");

		while (i < input.length) {

			enc1 = base64._keyStr.indexOf(input.charAt(i++));
			enc2 = base64._keyStr.indexOf(input.charAt(i++));
			enc3 = base64._keyStr.indexOf(input.charAt(i++));
			enc4 = base64._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

}

// exports public functions
exports.base64	= base64;


// end module
});require.module('casti_ctrl_t', function(exports, require) {
// start module 

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



// end module
});require.module('casto_testclient_t', function(exports, require) {
// start module 

// import the required dependancies
var http	= require('http');

/**
 * it read the stream from stream_url.
 * - it isnt specific to webpeer stream at all
 * - it is mostly a debug tool.
 *
 * opts:
 * - opts.stream_url	: url for the stream
 * - opts.notify_unit	: the unit to notify recved_data (default to 1024)
 * - opts.event_cb	: callback event_cb(event_type, event_data):
 *   - "cnx_begin"/null: server connected
 *   - "cnx_end"/null: server disconnected
 *   - "recved_size"/nunits: when data is received (nunit is the amount of data
 *     in 'unit'). it is notified when there is at least one unit to notified.
 *   - "idle_timeout"/null: when no data has been received for 
*/
var casto_testclient_t	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self	= this;
	// sanity check - all mandatory fields must be present
	console.assert(ctor_opts.stream_url);
	// copy ctor_opts + set default values if needed
	var stream_url		= ctor_opts.stream_url;
	var event_cb		= ctor_opts.event_cb		|| function(event_type, event_data){};
	var notify_unit		= ctor_opts.notify_unit		|| 1024;
	var verbose		= ctor_opts.verbose		|| 0;
	var idle_timer_delay	= ctor_opts.idle_timer_delay	|| 20*1000;
	var max_recved_len	= ctor_opts.max_recved_len	|| null;
	
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
	//		idle_timer						//
	//////////////////////////////////////////////////////////////////////////
	var idle_timer_id	= null;
	var idle_timer_start	= function(){
		if( verbose > 1 )	console.log("launch idle_timer timeout in "+idle_timer_delay+"-msec");
		idle_timer_id	= setTimeout(idle_timer_cb, idle_timer_delay);
	}
	var idle_timer_stop	= function(){
		if( idle_timer_id !== null )	clearTimeout(idle_timer_id);
		idle_timer_id	= null;		
	}
	var idle_timer_refresh	= function(){
		if( verbose )	console.log("idle_time_refresh");
		idle_timer_stop();
		idle_timer_start();
	}
	var idle_timer_cb	= function(){
		if( verbose )	console.log("idle timer expired. next in "+idle_timer_delay+"-msec");
		event_cb("error", "idle timeout after "+idle_timer_delay+"-msec");
	}

	//////////////////////////////////////////////////////////////////////////
	//		http client						//
	//////////////////////////////////////////////////////////////////////////
	var client_req		= null;
	var client_start	= function(){
		var recved_len	= 0;
		var notified_len= 0;
		// create the http client
		var url		= require('url').parse(stream_url);
		var client	= http.createClient((url.port||80), url.hostname);
		// bind error cases at the socket level
		client.on("error"	, function(e){ event_cb("error", e.message); });
		client.on("timeout"	, function(e){ event_cb("error", e.message); });
		// create the request
		client_req	= client.request('GET', url.pathname, {'host': url.host});
		client_req.on('response', function(client_res){
			// log to debug
			if( verbose )	console.log("Connected to "+stream_url);
			// start the idle_timer
			idle_timer_start();
			// Handle faillure at http level
			if(client_res.statusCode != 200){
				event_cb("error", "statusCode="+client_res.statusCode);
				return
			}
			// notify the caller
			event_cb("cnx_begin", null);
			//client_res.setEncoding('utf8');
			client_res.on('data', function( chunk ){
				// refresh idle_timer
				idle_timer_refresh();
				//console.log("chunk len="+chunk.length);
				// update recved_len
				recved_len	+= chunk.length;
				// notify the recved_size in notify_unit
				var notified_chunk	= Math.floor(notified_len	/ notify_unit);
				var tonotify_chunk	= Math.floor(recved_len		/ notify_unit);
				var nb_chunks		= tonotify_chunk - notified_chunk;
				if(nb_chunks > 0)	event_cb("recved_size", nb_chunks);
				// update notified_len
				notified_len		= recved_len;
				// notify the caller
				if( max_recved_len && recved_len >= max_recved_len )	event_cb("recved_len_maxed", null);
			});
			client_res.on('end', function(){
				// log the event
				if( verbose )	console.log("Connection ended");
				// notify the caller
				event_cb("cnx_closed", null);
			}); 
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
casto_testclient_t.create	= function(ctor_opts){
	return new casto_testclient_t(ctor_opts);
}

// export it via commonjs
exports.create	= casto_testclient_t.create;


// end module
});require.module('collection', function(exports, require) {
// start module 

var collection	= function(){
	// define private variables
	var _map	= {}
	
	var _parse_key	= function(key, non_exist_callback){
		// parse the key into parts
		var key_parts	= key.split("/");
		// goto the proper submap (and create it if needed)
		var submap	= _map;
		var subkey	= key_parts[0]
		for(var i = 0; i < key_parts.length - 1; i++){
			// if this subkey is not present in submap, notify an exception
			if( typeof submap[subkey] == 'undefined' )	non_exist_callback(submap, subkey);
			// goto the next submap
			submap	= submap[subkey];
			subkey	= key_parts[i+1];
		}
		// return the result
		return {
			'submap': submap,
			'subkey': subkey
		};
	};
	
	/**
	 * Set the variable namespace/key to the value val
	 */
	var set	= function(key, val) {
		// parse the key
		var parsed_key	= _parse_key(key, function(submap, subkey){
			// if this subkey is not present in submap, create an empty object
			submap[subkey]	= {}
		});
		// set this value in the last submap
		parsed_key.submap[parsed_key.subkey]	= val;
	}
	/**
	 * Return the value of the variable namespace/key (note: it MUST be defined)
	*/
	var get	= function(key) {
		// sanity check - the key MUST be present
		console.assert( has(key) );
		// parse the key
		var parsed_key	= _parse_key(key, function(submap, subkey){
			// if this subkey is not present in submap, notify an exception
			throw new Error('subkey '+subkey+' (from key '+key+') doesnt exist');
		});
		// get this value in the last submap
		var val	= parsed_key.submap[parsed_key.subkey];
		// return this val
		return val;
	}
	var get_dfl	= function(key, dfl){ return has(key) ? get(key) : dfl; }

	
	/**
	 * delete this key (note: it MUST be defined)
	*/
	var del	= function(key) {
		// sanity check - the key MUST be present
		console.assert( has(key) );
		// parse the key
		var parsed_key	= _parse_key(key, function(submap, subkey){	
			// if this subkey is not present in submap, notify an exception
			throw new Error('subkey '+subkey+' (from key '+key+') doesnt exist');
		});
		// get this value in the last submap
		var val	= parsed_key.submap[parsed_key.subkey];
		// delete in the last submap
		delete parsed_key.submap[parsed_key.subkey];
	}
	
	/**
	 * Return true if this variable is defined, false otherwize
	*/
	var has	= function(key) {
		// parse the key
		var parsed_key	= null;
		// TODO i could avoid the exception by doing closure on parsed_key ?
		try {
			parsed_key	= _parse_key(key, function(submap, subkey){
				// if this subkey is not present in submap, notify an exception
				throw new Error('subkey '+subkey+' (from key '+key+') doesnt exist');
			});
		}catch(error) {
			// return false now, if the key cant be parsed
			return	false;		
		}
		// if this subkey is not present in submap, notify an exception
		if( typeof parsed_key.submap[parsed_key.subkey] == 'undefined' ) return false;
		// if all previous tests passed, return true
		return true;
	}
	
	return {
		"set"		: set,
		"get"		: get,
		"get_dfl"	: get_dfl,
		"del"		: del,
		"has"		: has
	}
};

// exports public functions
exports.collection	= collection;


// end module
});require.module('neoip_app_detect', function(exports, require) {
// start module 

// import required modules
if( typeof(process) == "object" )	var rpc_call	= require("./neoip_rpc_node").rpc_call;
else					var rpc_call	= require("./neoip_rpc_web").rpc_call;

var verbose	= 0;
/**
 * Constant informations about applications
*/
var app_infos	= {
	"oload": {
		"port_beg": 4550,
		"port_end": 4553
	},
	"casto": {
		"port_beg": 4560,
		"port_end": 4563
	},
	"casti": {
		"port_beg": 4570,
		"port_end": 4573
	}
};

// cache for discovery results
var disc_app_cache	= {};
var disc_app_cache_contain	= function(app_suffix){ return app_suffix in disc_app_cache;	}
var disc_app_cache_get		= function(app_suffix){ return disc_app_cache[app_suffix];	}
var disc_app_cache_clear	= function(app_suffix){ disc_app_cache	= {};			}


var app_available	= function(app_suffix){
	if( !disc_app_cache_contain(app_suffix) )		return false;
	if( disc_app_cache_get(app_suffix).version == false )	return false;
	return true;
}

/**
 * Discover an neoip application
 * 
 * @param {String} app_suffix the neoip application suffix
 * @param {function(root_url, version)} success_cb notified if app is found
 * @param {function(error)} failure_cb notified if app is not found
*/
var discover_app	= function(app_suffix, success_cb, failure_cb){
	// sanity check
	console.assert(success_cb);
	console.assert(app_suffix == "oload" || app_suffix == "casti" || app_suffix == "casto");
	// if callback are not specified, use a dummy one
	if(!failure_cb)	failure_cb = function(){};
	// handle cache
	if(app_suffix in disc_app_cache){
		var cache_item	= disc_app_cache[app_suffix];
		if( cache_item.version === false ){
			setTimeout(function(){failure_cb(true);}, 0);
		}else{
			setTimeout(function(){success_cb(cache_item.root_url, cache_item.version)}, 0);			
		}
		return;
	}
	// get info from app_infos
	var port_beg	= app_infos[app_suffix]["port_beg"];
	var port_end	= app_infos[app_suffix]["port_end"];
	var port_cur	= port_beg;
	// define the callbacks
	var probe_succ_cb	= function(version){
		if( verbose )	console.log("found "+app_suffix+" version "+version+" at port "+port_cur);
		var root_url	= "http://127.0.0.1:"+port_cur;
		// cache the result
		disc_app_cache[app_suffix]	= {
			"root_url"	: root_url,
			"version"	: version
		};
		// notify the caller
		success_cb(root_url, version);		
	};
	var probe_fail_cb	= function(had_error){
		if( verbose )	console.log(app_suffix+' not found port_cur='+port_cur);
		if(port_cur == port_end){
			// cache the result
			disc_app_cache[app_suffix]	= { "version"	: false	};
			// report "not found" when all port has been tested
			failure_cb("not found");
		}else{
			// test the next port
			port_cur++;
			probe_launch();
		}
	};
	var probe_launch	= function(){
		rpc_call.create({
			call_url	: "http://127.0.0.1:"+port_cur+"/neoip_"+app_suffix+"_appdetect_jsrest.js",
			method_name	: 'probe_apps',
			method_args	: [],
			success_cb	: probe_succ_cb,
			failure_cb	: probe_fail_cb
		});
	}
	// start the probbing
	probe_launch();
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//	Webpack special case							//
// - this special case is no good						//
//   - first it isnt clean							//
//   - second neoip-webpack use 3 time more port than it should			//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/**
 * Compare version ala memcmp. format is major.minor.patch
 * - used in discover_webpack()
*/
var version_compare	= function(version1, version2){
	// parse the versions
	var matches1	= version1.match(/(\d+).(\d+).(\d+)/);
	var matches2	= version2.match(/(\d+).(\d+).(\d+)/);
	// compare the major
	var major1	= parseInt(matches1[1], 10);
	var major2	= parseInt(matches2[1], 10);
	if( major1 > major2 )	return +1;
	if( major1 < major2 )	return -1;
	// compare the minor
	var minor1	= parseInt(matches1[2], 10);
	var minor2	= parseInt(matches2[2], 10);
	if( minor1 > minor2 )	return +1;
	if( minor1 < minor2 )	return -1;
	// compare the patch
	var patch1	= parseInt(matches1[3], 10);
	var patch2	= parseInt(matches2[3], 10);
	if( patch1 > patch2 )	return +1;
	if( patch1 < patch2 )	return -1;
	// return 0, they are considered equal
	return 0;
}


// defined the minimal version for each apps
var webpack_versions_min	= {
	"oload"	: "0.0.1",
	"casto"	: "0.0.1",
	"casti"	: "0.0.2"
};

/**
 * Possible value of the status
 * - "toinstall" = not even present
 * - "toupgrade" = present but not the minimal version
 * - "installed" = present and uptodate
 *
 * @returns {string} return the status of webpack, or null if not in the cache
*/
var webpack_status	= function(){
	var versions_min	= webpack_versions_min;
	// test if all the apps got probed
	for(var app_suffix in versions_min){
		if( !(app_suffix in disc_app_cache) )	return null;	
	}
	// test if all the apps got probed
	for(var app_suffix in versions_min){
		var version	= disc_app_cache[app_suffix].version;
		if( version === false )	return "toinstall";
	}
	// test if all the apps got probed
	for(var app_suffix in versions_min){
		var version_cur	= disc_app_cache[app_suffix].version;
		var version_min	= versions_min[app_suffix];
		if( version_compare(version_cur, version_min) < 0 )	return "toupgrade";
	}
	// notify the caller
	return "installed";
}

/**
 * Discover webpack on localhost and notify the result
 * 
 * @param callback {Function} callback notified "toinstall", "toupgrade", "installed"
*/
var discover_webpack	= function(callback){
	var completed_cb	= function(){
		var status	= webpack_status();
		if( status == null )	return;
		callback(status);
	}
	// launch the discovery of each app
	var versions_min	= webpack_versions_min;	
	for(var app_suffix in versions_min){
		discover_app(app_suffix, completed_cb, completed_cb);		
	}
}


// exports public functions
exports.discover_app		= discover_app;
exports.discover_webpack	= discover_webpack;
exports.cache_contain		= disc_app_cache_contain;
exports.cache_get		= disc_app_cache_get;
exports.cache_clear		= disc_app_cache_clear;

// a new api... simpler
exports.avail		= app_available;
exports.probe		= discover_app;
exports.webpack_probe	= discover_webpack;
exports.webpack_avail 	= function(){ return webpack_status == "installed"; };
exports.webpack_status	= webpack_status;
exports.clear		= disc_app_cache_clear;



// end module
});require.module('neoip_jsonp_call', function(exports, require) {
// start module 

/**
 * a serial to uniquely define a given call
*/
var jsonp_call_counter	= 0;

/**
 * do a jsonp call
 * - NOTE: needed because jquery getJSON is not able to handle failure_cb
*/
var jsonp_call	= function(ctor_opts)
{
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self	= this;
	// copy ctor_opts + set default values if needed
	var url		= ctor_opts.url		|| console.assert(ctor_opts.url);
	var success_cb	= ctor_opts.success_cb	|| function(data){};
	var failure_cb	= ctor_opts.failure_cb	|| function(error){};
	
	// determine the function name
	var fct_name	= "jsonp_call_cb_"+jsonp_call_counter++;
	// sanity check - callback=? MUST be present in the url
	console.assert( /callback=\?(&|$)/.test(url) );
	// replace callback=? by fct_name
	url	= url.replace("callback=?", "callback="+fct_name);

	// create DOM elements
	// - need to do that here because closure
	var root_elem	= document.getElementsByTagName('head')[0]
	var script_elem	= document.createElement('script');
	
	// function used to cleanup after completion
	var cleanup	= function(){
		// remove the script
		root_elem.removeChild(script_elem);
		// GC the function
		window[ fct_name ] = undefined;
		try {
			delete window[ fct_name ];
		} catch(e) {}		
	}

	// declare the jsonp callback in window[]
	window[fct_name]	= function(data){
		cleanup()
		success_cb(data);
	};

	// create the script element
	script_elem.src	= url;
	script_elem.onerror	= function(){
		cleanup()
		failure_cb("Network error");		
	}
	// append the script element to HEAD
	root_elem.appendChild(script_elem);	

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return the public properties
	return {
		destroy	: cleanup
	}
}

// exports public functions
exports.jsonp_call	= jsonp_call;


// end module
});require.module('neoip_rpc_node', function(exports, require) {
// start module 

var http	= require('http');

/**
 * do a rpc call to a neoip application 
*/
var rpc_call = function(ctor_opts){
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
rpc_call.create	= function(ctor_opts){	return new rpc_call(ctor_opts);	}

// exports public functions
exports.rpc_call	= rpc_call;


// end module
});require.module('neoip_rpc_web', function(exports, require) {
// start module 


// import required modules
var jsonp_call	= require("neoip_jsonp_call").jsonp_call;

/**
 * do a rpc call to a neoip application 
*/
var rpc_call = function(ctor_opts){
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
		client_call	= new jsonp_call({
			url		: url,
			success_cb	: function(data){
				if( verbose > 1 )	console.dir(data);
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
rpc_call.create	= function(ctor_opts){	return new rpc_call(ctor_opts);	}

// exports public functions
exports.rpc_call	= rpc_call;


// end module
});require.module('url_builder_casto', function(exports, require) {
// start module 

/**
 * Create an url for neoip-casto
 * - opts.base_url	: casto base_url	(REQUIRED)
 * - opts.cast_privhash	: cast_privhash		(REQUIRED)
 * - opts.cast_name	: cast_name		(REQUIRED)
 * - opts.mdata_srv_uri	: url of the nameserver (OPTIONAL)
 *
 * - NOTE: no detection of the neoip-casto apps is done
 *
 * @return {string} the url for the stream out of neoip-casto
*/
var create = function(opts){
	// sanity check - all mandatory fields MUST be present
	console.assert(opts.base_url);
	console.assert(opts.cast_privhash);
	console.assert(opts.cast_name);
	// build the url
	var url	= opts.base_url + "/" + opts.cast_privhash + "/" + opts.cast_name;
	// add mdata_srv_uri if any
	if( opts.mdata_srv_uri )	url	+= "?mdata_srv_uri=" + escape(opts.mdata_srv_uri);
	// return the just built url
	return url;
}

// export it via commonjs
exports.create	= create;


// end module
});require.module('url_builder_oload_t', function(exports, require) {
// start module 

// import required modules
var collection	= require('./collection').collection;
var base64	= require('./base64').base64;

var url_builder_oload_t	= function(nested_uri_str){
	var _col	= new collection();
	
	var outter_uri	= function(val){ _col.set('outter_uri'	, val); }
	var inner_uri	= function(val){ _col.set('inner_uri'	, val); }
	var outter_var	= function(key, val){ return _col.set('outter_var/'+key, val);	}
	var minner_var	= function(key, val){ return _col.set('minner_var/'+key, val);	}
	var dupuri	= function(val){
				for(var i = 0; ; i++){
					var key	= "outter_var/dupuri/"+i;
					if( _col.has(key) ) continue;
					_col.set(key, val);
					break;
				}
			}
	
	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	//			Checker function
	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	
	/** \brief throw an exception is this object is not considered sane 
	 */
	var _is_sane_internal	= function() {
		if( !_col.has("outter_uri") )	throw new Error("No outter_uri");
		if( !_col.has("inner_uri") )	throw new Error("No inner_uri");
		
		// TODO do all the sanity check here
		// - if subfile_level exist, a subfile_path MUST too
		// - subfile_path MUST always start with '/'
		// - if 'type' check the value is a legal one
		// - if 'mod' check the value is a legal one
		// - for dupuri and http_peersrc_uri, it MUST start by 'http://'
	}
	
	/** \brief If this object is considered sane, return true. false otherwise
	 */
	var is_sane	= function(){
		try {
			// call the version with exception
			_is_sane_internal();
		}catch(error) {
			console.log("url_builder_oload_t not sane due to " + error);
			return	false;		
		}
		// if all previous tests passed, this is considered sane
		return true;
	}
	

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	//			to_string() function
	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	
	/** \brief return a string of the nested_uri
	 */
	var to_string	= function(){
		// some functions pointer for configuration
		//var url_encode_safe	= neoip_base64.encode_safe;
		var _url_encode_safe	= base64.encode_safe;
		var _url_decode_safe	= base64.decode_safe;
		//var url_doscramble	= neoip.core.doscramble_uri;
		var _url_doscamble	= function(url){ return url; }
		// define local variables
		var result	= "";
		// sanity check - the object MUST be sane
		console.assert( is_sane() );
// neoip-url inner_uri
// outter_uri = discovered
// inner_uri  = from cmdline
// --outter_var/-o	key=val
// --minner_var/-i	key=val
//------------------
// --mode/-m		alias for outter_var/mod
// --dupuri/-d  	alias for outter_var/dupuri
// --path/-p		alias for outter_var/subfile_path
// --type/-t		alias for outter_var/link_type

// {{outter_uri}}/{{mod}}/(*{{outter_var_key}}*{{outter_var_val}}/)*
// /{{inner_uri}}(?@)neoip_metavar_{{minner_var_key}}=#{{minner_var_val}}

		// start building the nested_uri
		result	+= _col.get('outter_uri') + "/";
		
		// put the 'mod' variable first
		if( _col.has('outter_var/mod') )	result += _col.get('outter_var/mod') + "/";
	
		// put all the outter variables
		for(var key in _col.get_dfl('outter_var', {}) ){
			// skip key equal to dupuri/subfile_path, they are handled separatly
			if( key == 'dupuri' )		continue;
			if( key == 'subfile_path' )	continue;
			if( key == 'mod' )		continue;
			// put the key of the variable
			result	+= "*" + key + "*";
			// get the value
			var val	= _col.get('outter_var/'+key);
			// http_peersrc_uri is specific - values are encoded in base64-urlsafe
			if( key == "http_peersrc_uri" )	val = url_encode_safe(val)
			// put the values according to the keys
			result	+= val;
			// add the separator
			result	+= "/";
		}
		
		// handle outter_var/subfile_path, aka insert the dynamic outter_var subfile_level
		if( _col.has('outter_var/subfile_path') ){
			var subfile_path	= _col.get('outter_var/subfile_path');
			var subfile_level	= subfile_path.split("/").length - 1;	// put the key of the variable
			// add the subfile_level as outter_var in result
			result	+= "*subfile_level*"+subfile_level+'/';
		}
		
		// put all the dupuri with value in base64-urlsafe encoding
		for(var dupuri_idx in _col.get_dfl('outter_var/dupuri', {})){
			result	+= "*dupuri*";
			result	+= _url_encode_safe(_col.get('outter_var/dupuri/'+dupuri_idx));
			result	+= "/";
		}
	
		// put the inner_uri at the end
		// - made complex by the need to put the m_subfile_path between the 
		//   path and the query part of the inner_uri
		var inner_uri	= _col.get('inner_uri');
		var has_subfile	= _col.has('outter_var/subfile_path')
		var subfile_path= _col.get_dfl("outter_var/subfile_path", null);
		var query_pos	= inner_uri.indexOf("?");
		if( query_pos != -1 )	result	+= inner_uri.substr(0, query_pos);
		else			result	+= inner_uri;
		if( subfile_path )	result	+= subfile_path
		if( query_pos != -1 )	result	+= inner_uri.substr(query_pos, inner_uri.length);
	
		// put all the inner variables aka "neoip_metavar_"
		for(var key in _col.get_dfl('minner_var', {}) ){
			// put the variable separator
			result	+= result.indexOf('?') == -1 ? "?" : "&";
			// put the key of the variable
			result	+= 'neoip_metavar_' + key + "=" + escape(_col.get('minner_var/'+key));
		}
		
		// scramble the result
		result	= _url_doscamble(result);
		// return the just built nested_uri
		return result;
	}

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	//			from_string() function
	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	/**
	 * Parse a string and set _col with it
	*/
	var from_string	= function(from_str){
		// some functions pointer for configuration
		//var url_decode_safe	= neoip_base64.decode_safe;
		var _url_decode_safe	= base64.decode_safe;
		// initialisation of nleft_str/nright_str from nested_str
		var nested_str	= from_str;
		var nleft_str	= nested_str.substr(0, from_str.indexOf('/http:/'));
		var nright_str	= nested_str.substr(from_str.indexOf('/http:/')+1);
		// Process outter_var: consume all the outter_var in nleft_str (outter_var/mod included)
		while( true ){
			// extract last_level from nleft_str
			var last_level	= nleft_str.substr(nleft_str.lastIndexOf('/')+1);
			// if last_level is a normally encoded outter_var
			if( last_level.substr(0, 1) == '*' ){
				var matches	= last_level.match(/\*(.+)\*(.+)$/);
				var key		= matches[1];
				var val		= matches[2];
				if( key != "dupuri" )	_col.set('outter_var/'+key, val);
				else			dupuri(_url_decode_safe(val));
			}else if( last_level == "raw" || last_level == "flv" ){
				// if last_level is a outter_var/mod
				_col.set('outter_var/mod', last_level)
			}else {
				// if last_level is not recognized, leave the loop
				break;
			}
			// consume in nleft_str
			nleft_str	= nleft_str.substr(0, nleft_str.lastIndexOf('/'));
		}
		// set "outter_uri" - what remains in nleft_str is 'outter_uri'
		_col.set("outter_uri", nleft_str);
		// declare the 'actual inner uri variables' array
		var ainner_vars	= [];
		// if the right part contains variables, process them to extract minner_vars
		if( nright_str.lastIndexOf('?') != -1 ){
			var search_str	= nright_str.substr(nright_str.lastIndexOf('?')+1);
			var keyval_arr	= search_str.split("&");
			// go thru each variable
			for(var i = 0; i < keyval_arr.length; i++ ){
				var keyval	= keyval_arr[i].split("=");
				var key		= keyval[0];
				var val		= keyval[1];
				// if this key is not a minner_var, simply copy it in ainner_vars
				if( key.indexOf("neoip_metavar_") != 0 ){
					ainner_vars.push(keyval_arr[i]);
					continue
				}
				var minner_key	= key.substr("neoip_metavar_".length);
				_col.set("minner_var/"+minner_key, val);
			}
			// consume the query part of the nright_str
			nright_str	= nright_str.substr(0, nright_str.lastIndexOf('?'));
		}
		// if outter_var/subfile_level is present, handle it here
		if( _col.has('outter_var/subfile_level') ){
			var subfile_level	= _col.get('outter_var/subfile_level');
			// find the begining of the subfile_path
			var pos 		= null;
			for(var i = 0; i < subfile_level; i++){
				if( pos )	pos = nright_str.lastIndexOf('/', pos-1);
				else		pos = nright_str.lastIndexOf('/');
			}
			// extract the subfile_path
			var subfile_path	= nright_str.substr(pos);
			_col.set("outter_var/subfile_path"	, subfile_path);
			// delete outter_var/subfile_level
			_col.del("outter_var/subfile_level");
			// consume the subfile_path
			nright_str	= nright_str.substr(0, pos);
		}
		// generate the inner_uri
		var inner_uri	= nright_str;
		// append actual inner variables, if there is any
		if( ainner_vars.length > 0 )	inner_uri	+= '?' + ainner_vars.join('&');
		// set inner_uri
		_col.set('inner_uri'	, inner_uri);		
	}
	
	
	// if nested_uri_str is defined, use it for building the uri
	if( nested_uri_str !== undefined )	from_string(nested_uri_str);
	
	
	// export the public function
	var returned_obj	= {
		"outter_uri"	: outter_uri,
		"inner_uri"	: inner_uri,
		"outter_var"	: outter_var,
		"minner_var"	: minner_var,
		"dupuri"	: dupuri,
		"set"		: function(key, val) { _col.set(key, val); return this;},
		"get"		: _col.get,
		"get_dfl"	: _col.get_dfl,
		"del"		: _col.del,
		"has"		: _col.has,
		"is_sane"	: is_sane,
		"to_string"	: to_string,
		"from_string"	: from_string
	}
	return returned_obj;
}


/**
 * Class method to create an object
 * - thus avoid new operator
*/
url_builder_oload_t.create	= function(ctor_opts){	return new url_builder_oload_t(ctor_opts);	}

// exports public functions
exports.url_builder_oload_t	= url_builder_oload_t;
exports.create		= url_builder_oload_t.create;


// end module
});require.module('webpeer', function(exports, require) {
// start module 

// import required modules
var app_detect	= require('./neoip_app_detect');
var url_builder_oload_t= require('./url_builder_oload_t');

var verbose	= 1;

/**
 * probe webpeer and notify the callback once completed
 * 
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
 * - this is an minimal helper on top of url_builder_oload_t
 * - url_builder_oload_t implementation is complete and much more complex
 * 
 * @param url {string} original url to webpeerify
*/
webpeer_url	= function(url){
	if( !webpeer_avail() )	return url;
	return url_builder_oload_t.create(url)
			.set('outter_uri', app_detect.cache_get('oload').root_url)
			.to_string();
}


// exports public functions
exports.ready	= webpeer_ready;
exports.avail	= webpeer_avail;
exports.url	= webpeer_url;


// end module
});/**
 * This file will be happened to webpeer.js during the builder
*/

// exports the public symbols
GLOBAL.webpeer	= require('./webpeer');

// end of the global closure
})(window);