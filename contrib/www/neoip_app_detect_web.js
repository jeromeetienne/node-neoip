// declare needed namespaces
if( typeof(exports)==="object" )	GLOBAL.neoip	= GLOBAL.neoip	|| {}
else					neoip		= neoip 	|| {}
neoip.app_detect	= neoip.app_detect	|| {};
(function(){	// module closure begining

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		module start							//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

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


var disc_app_cache	= {};
var disc_app_cache_contain	= function(app_suffix){ return app_suffix in disc_app_cache_contain;	}

/**
 * Discover an neoip application
 * 
 * @param {String} app_suffix the neoip application suffix
 * @param {function} success_cb notified if app is found success_cb(root_url, version)
 * @param {function} failure_cb notified if app is not found failure_cb(reason)
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
		neoip.rpc_call.create({
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

/**
 * Discover webpack on localhost and notify the result
 * 
 * @param callback {Function} callback notified "toinstall", "toupgrade", "installed"
*/
var discover_webpack	= function(callback){
	// defined the minimal version for each apps
	var versions_min	= {
		"oload"	: "0.0.1",
		"casto"	: "0.0.1",
		"casti"	: "0.0.2"
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


//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		module end							//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// exports public functions
neoip.app_detect.discover_app		= discover_app;
neoip.app_detect.discover_webpack	= discover_webpack;

})();	// end of the module closure
 