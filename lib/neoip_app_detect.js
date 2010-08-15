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

// TODO put this function elsewhere
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
var discover_app	= function(ctor_opts){
	// copy ctor_opts + set default values if needed
	var app_suffix	= ctor_opts.app_suffix	|| console.assert(ctor_opts.app_suffix);
	var success_cb	= ctor_opts.success_cb	|| function(){};
	var failure_cb	= ctor_opts.failure_cb	|| function(){};
	var nocache	= ctor_opts.nocache	|| false;
	var verbose	= ctor_opts.verbose	|| 0;
	// sanity check
	console.assert(app_suffix == "oload" || app_suffix == "casti" || app_suffix == "casto");
	// if callback are not specified, use a dummy one
	if(!failure_cb)	failure_cb = function(){};
	// handle cache
	if(app_suffix in disc_app_cache && !nocache ){
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
	oload	: "0.0.1",
	casto	: "0.0.1",
	casti	: "0.0.2"
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
var discover_webpack	= function(ctor_opts){
	// copy ctor_opts + set default values if needed
	var completed_cb= ctor_opts.completed_cb	|| function(){};
	var nocache	= ctor_opts.nocache		|| false;
	// internal vars
	var nprobe	= 3;
	var callback	= function(){
		nprobe	-= 1;
		if( nprobe > 0 )	return;
		var status	= webpack_status();
		completed_cb(status);
	}
	// launch the discovery of each app
	for(var app_suffix in webpack_versions_min){
		discover_app({
			app_suffix	: app_suffix,
			nocache		: nocache,
			success_cb	: callback,
			failure_cb	: callback
		})
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
exports.webpack_avail 	= function(){ return webpack_status() == "installed"; };
exports.webpack_status	= webpack_status;
exports.clear		= disc_app_cache_clear;

