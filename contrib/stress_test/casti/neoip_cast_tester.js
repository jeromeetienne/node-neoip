#!/usr/bin/env node

/**
 *
 * How to reproduce by Hand
 * - to get the stream original server
 *   node vendor/node-chargen/node-chargen.js -v
 * - to publish the stream
 *   node lib/casti_ctrl_exe.js --call_url http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js -o mdata_srv_uri http://localhost/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi -o cast_name superstream -o cast_privtext supersecret -o scasti_uri http://127.0.0.1:8124 -o scasti_mod raw -o http_peersrc_uri '' -o web2srv_str 'dummyweb2serv_str' -v
 * - to retrieve the stream
 *   curl `node lib/url_builder_casto_exe.js a761ce3a superstream`
*/


//
// - casti core dump with casti_ctrl_t with short period and > 3 stream
//   - this one 'disapeared'.... no good
//   - maybe because now the dns resolution is much faster... so the race no more happen
// - TODO
//   - need to get autodetection for casto and casti
//   - ability to configure casto hostname, casti hostname and chargen destination addr

var project_path	= "../../..";
var casti_ctrl_t	= require(project_path+'/lib/casti_ctrl_t');
var url_builder_casto	= require(project_path+'/lib/url_builder_casto'); 
var casto_testclient_t	= require(project_path+'/lib/casto_testclient_t');
var app_detect		= require(project_path+'/lib/neoip_app_detect');
var node_chargen	= require(project_path+'/vendor/node-chargen/node-chargen');
var tty_color		= require(project_path+'/vendor/node-helpers/ez_tty_color');

// tunable from cmdline
var n_casti		= 1;
var n_casto		= 3;
var casto_max_recved	= null;
var verbose		= 0;


var casto_base_url	= "http://127.0.0.1:4560";
var casti_base_url	= "http://127.0.0.1:4570";
var node_chargen_host	= "127.0.0.1";
var node_chargen_listen	= "127.0.0.1";
var node_chargen_port	= 8124;
var mdata_srv_uri	= "http://jmebox.local/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi";

//////////////////////////////////////////////////////////////////////////////////
//		chargen								//
//////////////////////////////////////////////////////////////////////////////////
var chargen	= null;
var chargen_start	= function(){
	console.assert(chargen_running() === false);
	// create chargen
	chargen	= node_chargen.create({
		hostname	: node_chargen_listen,
		port		: node_chargen_port
	});
}
var chargen_stop	= function(){
	if( chargen_running() )	chargen.destroy();
	chargen	= null;
}
var chargen_running	= function(){
	return chargen !== null;
}

//////////////////////////////////////////////////////////////////////////////////
//		casti_ctrls							//
//////////////////////////////////////////////////////////////////////////////////
var casti_ctrls	= []
var casti_ctrls_start	= function(succeed_cb, failure_cb){
	for(var i = 0; i < n_casti; i++){
		(function(){
			var casti_idx	= i;
			// launch the casti_ctrl_t
			var casti_ctrl	= casti_ctrl_t.create({
				call_url	: casti_base_url+"/neoip_casti_ctrl_wpage_jsrest.js",
				casti_opts	: {
					mdata_srv_uri	: mdata_srv_uri,
					cast_name	: "superstream"+i,
					cast_privtext	: "supersecret"+i,
					scasti_uri	: "http://"+node_chargen_host+":"+node_chargen_port,
					scasti_mod	: "raw",
					http_peersrc_uri: "",
					web2srv_str	: "dummyuserdata"
				},
				event_cb	: function(event_type, event_data){
					//console.log("event_cb: type="+event_type+" data="+require('sys').inspect(event_data));
					//console.log("casti_idx="+casti_idx);
					//console.log("all published ? "+casti_ctrls_published());
					if( event_type == "ispublished" ){
						if( verbose )	console.log("casti_ctrl "+casti_idx+" published")
					}else if( event_type == "rpc_error" ){
						failure_cb("rpc_error");
					}
					if( casti_ctrls_published() )	succeed_cb();
				}
			});
			// add it to casto_testclients
			casti_ctrls.push(casti_ctrl);
		})();
	}
}
var casti_ctrls_stop	= function(){
	for(var i = 0; i < casti_ctrls.length; i++){
		var casti_ctrl	= casti_ctrls[i];
		casti_ctrl.release();
	}
}
var casti_ctrls_published= function(){
	if( casti_ctrls.length != n_casti )	return false;
	for(var i = 0; i < casti_ctrls.length; i++){
		var casti_ctrl	= casti_ctrls[i];
		if( ! casti_ctrl.published() )	return false;
	}
	// if all tests passed, return true
	return true;	
}

//////////////////////////////////////////////////////////////////////////////////
//		casto_testclient						//
//////////////////////////////////////////////////////////////////////////////////
var casto_testclients	= []
var casto_testclients_start	= function(succeed_cb, failure_cb){
	for(var i = 0; i < n_casti; i++){
		for(var j = 0; j < n_casto; j++){
			(function(){ // TODO this closure stuff is bad
				var casto_idx	= i*n_casto + j;
				// build the stream_url
				var stream_url		= url_builder_casto.create({
					base_url	: casto_base_url,
					cast_name	: "superstream"+i,
					cast_privhash	: casti_ctrls[i].cast_privhash()
				});
				if( verbose > 2 )	console.log("stream_url="+stream_url);
				// launch the casti_testclient_t
				var casto_testclient	= casto_testclient_t.create({
					stream_url	: stream_url,
					max_recved_len	: casto_max_recved,
					event_cb	: function(event_type, event_data){
						//console.log("casto event_type="+event_type+" event_data="+event_data);
						if( event_type == "cnx_begin" ){
							if( verbose )	console.log("casto_testclient "+casto_idx+" connected");
						}else if(event_type == "error"){
							console.log("casto "+casto_idx+" event_type="+event_type+" event_data="+event_data);
							process.exit(-1);
						}else if(event_type == "recved_len_maxed"){
							if( verbose )	console.log('casto testclient '+casto_idx+' is done');
							casto_testclients[casto_idx].destroy();
							casto_testclients[casto_idx]	= null;
							if(!casto_testclients_running())	succeed_cb();
						}
					}
				});
				// add it to casto_testclients
				casto_testclients[casto_idx]	= casto_testclient;
			})();
		}
	}
}
var casto_testclients_stop	= function(){
	for(var i = 0; i < casto_testclients.length; i++){
		var casto_testclient	= casto_testclients[i];
		if( ! casto_testclient )	continue;
		casto_testclient.destroy();
	}
	casto_testclients	= [];
}

var casto_testclients_running	= function(){
	for(var i = 0; i < casto_testclients.length; i++){
		var casto_testclient	= casto_testclients[i];
		if( casto_testclient )	return true;
	}
	return false
}


//////////////////////////////////////////////////////////////////////////////////
//		main()								//
//////////////////////////////////////////////////////////////////////////////////
var main	= function(){
	// TODO put that in cmdline
	var run_chargen	= true;
	var run_casti	= true;
	var run_casto	= true;
	
	var stop_all	= function(){
		casto_testclients_stop();
		casti_ctrls_stop();
		chargen_stop();
	}
	
	if(run_chargen){
		console.log("node-chargen starting (will be used as stream original source)");
		chargen_start();
		console.log("node-chargen started: "+tty_color.fg_green+"OK"+tty_color.all_off);
	}else{
		console.log("node-chargen not started");
	}
	
	if( run_casti ){
		console.log("casti_ctrl starting: publishing "+n_casti+" streams. May take a while");
		casti_ctrls_start(function(){
			console.log("casti_ctrl started: "+tty_color.fg_green+"all streams published"+tty_color.all_off+". ("+n_casti+" of them)");
			if( run_chargen ){
				if( chargen.nb_clients() == n_casti ){			
					console.log("node-chargen server got as many connection as casti. all is "+tty_color.fg_green+"OK"+tty_color.all_off);
				}else{
					console.log("ERROR: node-chargen server has "+tty_color.fg_green+chargen.nb_clients()+" and should have "+n_casti+tty_color.all_off);
					process.exit();					
				}
			}
			if( run_casto && !casto_testclients_running() ){
				console.log("casto_testclient starting: ("+n_casti*n_casto+" of them. "+n_casto+" on each stream)");
				casto_testclients_start(function(){
					console.log("casto_testclients "+tty_color.fg_green+"succeed"+tty_color.all_off);
					stop_all();
				}, function(){
					console.log("ERROR: casto_testclients failed!");
					process.exit();
				});
			}
		}, function(){
			console.log("ERROR: casti_ctrls "+tty_color.fg_red+"failed"+tty_color.all_off+"!");
			process.exit();
		});
	}
	
	// trap SIGINT 
	process.addListener('SIGINT', function(){
		console.log("Received sigint, start releasing the stream");
		casto_testclients_stop();
		casti_ctrls_stop();
		chargen_stop();
		// remove handler - so first = release(), second normal behavior 
		process.removeListener('SIGINT', arguments.callee);
	});
}
//////////////////////////////////////////////////////////////////////////////////
//		Main code							//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	//////////////////////////////////////////////////////////////////////////////////
	//	parse cmdline								//
	//////////////////////////////////////////////////////////////////////////////////
	// cmdline_opts default
	cmdline_opts	= {
		n_casti		: null,
		n_casto		: null,
		casto_max_recved: null,
		webpeer_host	: "127.0.0.1",
		chargen_host	: "127.0.0.1",
		verbose		: null
	};
	var disp_usage	= function(prefix){
		if(prefix)	console.log(prefix + "\n");
		console.log("usage: neoip_cast_tester [options]");
		console.log("");
		console.log("Test neoip-casto/neoip-casti.");
		console.log("");
		console.log("-w|--webpeer_host str\t\tSet the hostname to probe for webpeer.");
		console.log("-c|--chargen_host str\t\tSet the hostname to listen on chargen.");
		console.log("-i|--n_casti num\t\tSet the number of broadcast to setup.");
		console.log("-o|--n_casto num\t\tSet the number of reader on each of broadcasts");
		console.log("-l|--casti_max_recved len\tSet the number of byte to read by each neoip-casto.");
		console.log("-v|--verbose\t\t\tIncrease the verbose level (for debug).");
		console.log("-h|--help\t\t\tDisplay the inline help.");
	}
	var optind	= 2;
	for(;optind < process.argv.length; optind++){
		var key	= process.argv[optind];
		var val	= process.argv[optind+1];
		//console.log("key="+key+" val="+val);
		if( key == '-w' || key == "--webpeer_host" ){
			cmdline_opts.webpeer_host	= val;
			optind		+= 1;
		}else if( key == '-c' || key == "--chargen_host" ){
			cmdline_opts.chargen_host	= val;
			optind		+= 1;
		}else if( key == '-i' || key == "--n_casti" ){
			cmdline_opts.n_casti	= parseInt(val);
			optind		+= 1;
		}else if( key == '-o' || key == "--n_casto" ){
			cmdline_opts.n_casto	= parseInt(val);
			optind		+= 1;
		}else if( key == '-l' || key == "--casto_max_recved" ){
			cmdline_opts.casto_max_recved	= parseInt(val);
			optind		+= 1;			
		}else if( key == '-v' || key == "--verbose" ){
			cmdline_opts.verbose	+= 1;
		}else if( key == "-h" || key == "--help" ){
			disp_usage();
			process.exit(0);
		}else{
			// if the option doesnt exist, consider it is the first non-option parameters
			break;
		}
	}
	
	
	
	
	// copy the cmdline_opts
	n_casti			= cmdline_opts.n_casti		|| n_casti;
	n_casto			= cmdline_opts.n_casto		|| n_casto;
	casto_max_recved	= cmdline_opts.casto_max_recved	|| casto_max_recved;
	verbose			= cmdline_opts.verbose		|| verbose;

	node_chargen_host	= cmdline_opts.chargen_host;
	node_chargen_listen	= cmdline_opts.chargen_host;

	// perform discovery
	app_detect.discover_webpeer({
		completed_cb	: function(status){
			if(status != "installed"){
				console.log("webpeer is "+status);
				process.exit(-1);
			}
			// set casto_base_url + casti_base_url according to app_detect cache
			casto_base_url		= app_detect.cache_get("casto").root_url,
			casti_base_url		= app_detect.cache_get("casti").root_url,
			// call the main()
			main();
		},
		hostname	: cmdline_opts.webpeer_host
	});
}
