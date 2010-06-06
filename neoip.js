var sys		= require('sys');
var http	= require('http');
var assert	= require('assert');


var probe_app = function(apps_suffix, host, port, method_name, success_cb, failure_cb){
	var path	= "/neoip_"+apps_suffix+"_appdetect_jsrest.js?method_name="+method_name;
	var client	= http.createClient(port, host);
	// if callback are not specified, use a dummy one
	if(!success_cb)	success_cb = function(){};
	if(!failure_cb)	failure_cb = function(){};
	// bind error cases at the socket level
	client.addListener("error"	, failure_cb);
	client.addListener("timeout"	, failure_cb);
	// create the request
	var request	= client.request('GET', path, {'host': host});
	request.addListener('response', function(response){
		//sys.puts('STATUS: ' + response.statusCode);
		//sys.puts('HEADERS: ' + JSON.stringify(response.headers));
		// Handle faillure at http level
		if(response.statusCode != 200){
			failure_cb(new Error("http statuscode="+response.statuscode));
			return
		}
		response.setEncoding('utf8');
		response.addListener('data', function( reply_json ){
			//sys.puts('BODY: ' + reply_json);
			// REPORT: JSON.parse(' {};'); hangs in node-console
			// get data from the chunk
			var reply_data	= JSON.parse(reply_json);
			var returned_val= reply_data['returned_val'];
			success_cb(returned_val);
		});
	});
	request.end();
};

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

var disc_app_cache	= {};
var disc_app_cache_contain	= function(app_suffix){ return app_suffix in disc_app_cache_contain;	}
exports.disc_app_cache	= disc_app_cache;

/**
 *
 * @param {String} app_suffix the neoip application suffix
 * @param {function} callback called to notify the result to the caller callback(version, strerror)
*/
var discover_app	= function(app_suffix, success_cb, failure_cb){
	// sanity check
	assert.ok(success_cb);
	assert.ok(app_suffix == "oload" || app_suffix == "casti" || app_suffix == "casto");
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
		//sys.puts("found version "+version+" port_cur="+port_cur);
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
		//sys.puts('not found port_cur='+port_cur);
		if(port_cur == port_end){
			// cache the result
			disc_app_cache[app_suffix]	= { "version"	: false	};
			// report "not found" when all port has been tested
			failure_cb("not found");
		}else{
			// test the next port
			port_cur++;
			probe_app(app_suffix, "127.0.0.1", port_cur, "probe_apps", probe_succ_cb, probe_fail_cb);
		}
	};
	// start the probbing
	probe_app(app_suffix, "127.0.0.1", port_cur, "probe_apps", probe_succ_cb, probe_fail_cb);
}

exports.discover_app	= discover_app;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//	Webpack
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

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


/**
 * @param callback {Function} callback notified "toinstall", "toupgrade", "installed"
*/
var discover_webpack	= function(callback){
	// defined the minimal version for each apps
	var versions_min	= {
		"oload"	: "0.0.1",
		"casto"	: "0.0.1",
		"casti"	: "0.0.1"
	};
	var completed_cb	= function(){
		// test if all the apps got probed
		for(var app_suffix in versions_min){
			if( !(app_suffix in disc_app_cache) )	return;	
		}
		// test if all the apps got probed
		for(var app_suffix in versions_min){
			var version	= disc_app_cache[app_suffix].version;
			if( version === false ){
				callback("toinstall");
				return;
			}
		}
		// test if all the apps got probed
		for(var app_suffix in versions_min){
			var version_cur	= disc_app_cache[app_suffix].version;
			var version_min	= versions_min[app_suffix];
			if( version_compare(version_cur, version_min) < 0 ){
				callback("toupgrade");
				return;
			}
		}
		// notify the caller
		callback("installed");
	}
	// launch the discovery of each app
	for(var app_suffix in versions_min){
		discover_app(app_suffix, completed_cb, completed_cb);		
	}
}
exports.discover_webpack	= discover_webpack;