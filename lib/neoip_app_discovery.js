#!/usr/bin/env node

var sys		= require('sys');
var http	= require('http');
var neoip_rpc	= require('./neoip_rpc_node');

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
		if( verbose )	console.log("found "+app_suffix+" version "+sys.inspect(version)+" at port "+port_cur);
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
		neoip_rpc.call.create({
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

exports.discover_app	= discover_app;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//	Webpack
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

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
exports.discover_webpack	= discover_webpack;

//////////////////////////////////////////////////////////////////////////////////
//		Main code							//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	//////////////////////////////////////////////////////////////////////////////////
	//	parse cmdline								//
	//////////////////////////////////////////////////////////////////////////////////
	// cmdline_opts default
	cmdline_opts	= {
		verbose		: 0
	};
	var disp_usage	= function(prefix){
		if(prefix)	console.log(prefix + "\n");
		console.log("usage: neoip_apps_discovery [options] appname [output_type]");
		console.log("");
		console.log("Discover neoip-apps.");
		console.log("Valid appnames are in 'oload', 'casti', 'casto' and 'webpack'.");
		console.log("Valid output_type are : 'root_url', 'version' and 'presence'.");
		console.log("output_type defaults to 'presence'.");
		console.log("if appname is 'webpack', 'presence' is the only valid output_type.");
		console.log("");
		console.log("-v|--verbose\t\t\tIncrease the verbose level (for debug).");
		console.log("-h|--help\t\t\tDisplay the inline help.");
	}
	var optind	= 2;
	for(;optind < process.argv.length; optind++){
		var key	= process.argv[optind];
		var val	= process.argv[optind+1];
		//console.log("key="+key+" val="+val);
		if( key == '-v' || key == "--verbose" ){
			cmdline_opts.verbose	+= 1;
		}else if( key == "-h" || key == "--help" ){
			disp_usage();
			process.exit(0);
		}else{
			// if the option doesnt exist, consider it is the first non-option parameters
			break;
		}
	}
		
	// get required options from the rest of the cmdline
	var app_name	= process.argv[optind++];
	var output_type	= process.argv[optind++] || 'presence';
	
	var verbose	= cmdline_opts.verbose;
	
	// sanity check - app_name MUST be in valid_names
	var valid_names = ['oload', 'casti', 'casto', 'webpack'];
	if( valid_names.indexOf(app_name) == -1 ){
		console.log("app_name '"+app_name+"' is not possible.");
		console.log("Valid names are "+require('sys').inspect(valid_names));
		process.exit(-1);
	}
	
	// sanity check - app_name MUST be in valid_names
	var valid_types = ['root_url', 'version', 'presence'];
	if( valid_types.indexOf(output_type) == -1 ){
		console.log("output_type '"+output_type+"' is not possible.");
		console.log("Valid types are "+require('sys').inspect(valid_names));
		process.exit(-1);
	}
	if( app_name == 'webpack' && output_type != 'presence' ){
		console.log("with 'webpack' apps name, 'presence' is the only valid output_type");
		process.exit(-1);
	}
	
	// trace for the user
	if( verbose )	console.log("discovering '"+app_name+"' for "+output_type);

	//////////////////////////////////////////////////////////////////////////
	//	do actual discovery						//
	//////////////////////////////////////////////////////////////////////////
	if( app_name != 'webpack' ){
		// discover neoip-oload and act depending on its presence or not
		discover_app(app_name, function(root_url, version){
			//console.log("root_url="+root_url+ " version="+version);
			if( output_type == 'root_url' )		console.log(root_url);
			else if( output_type == 'version' )	console.log(version);
			else if( output_type == 'presence' )	process.exit(0);
		}, function(reason){
			if( verbose )	console.log("Failed due to "+reason);
			process.exit(-1);
		})
	}else if( app_name == 'webpack' && output_type == 'presence' ){
		discover_webpack(function(status){
			if( verbose )	console.log("webpack status="+status);	
			if( status == "installed" )		process.exit(0);
			else if( status == "toupgrade" )	process.exit(0);	// TODO fix this... not sure
			else if( status == "toinstall" )	process.exit(-1);
			else console.assert(false);
		});
	}
}
 