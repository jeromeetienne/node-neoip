#!/usr/bin/env node
// - BUG: neoip-casti to never timeout a swarm
// - BUG: kinda casti should publish much faster than that
// - BUG: publication seems to fails if there are too many casti are the same time

var casti_ctrl_t	= require('./casti_ctrl_t');
var node_chargen	= require('../vendor/node-chargen/node-chargen');
var casto_url_builder	= require('./casto_url_builder');
var casto_testclient_t	= require('./casto_testclient_t');


// TODO make that tunable from cmdline
var n_casti		= 1;
var n_casto		= 20;
var casto_max_recved	= 20*1024;
var verbose		= 0;

//////////////////////////////////////////////////////////////////////////////////
//		chargen								//
//////////////////////////////////////////////////////////////////////////////////
var chargen	= null;
var chargen_start	= function(){
	console.assert(chargen_running() === false);
	// create chargen
	chargen	= node_chargen.create({
		hostname	: "127.0.0.1",
		port		: 8124
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
		// launch the casti_ctrl_t
		var casti_ctrl	= casti_ctrl_t.create({
			call_url	: "http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js",
			casti_opts	: {
				mdata_srv_uri	: "http://localhost/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi",
				cast_name	: "superstream"+i,
				cast_privtext	: "supersecret"+i,
				scasti_uri	: "http://127.0.0.1:8124",
				scasti_mod	: "raw",
				http_peersrc_uri: "",
				web2srv_str	: "dummyuserdata"
			},
			event_cb	: function(event_type, event_data){
				console.log("event_cb: type="+event_type+" data="+require('sys').inspect(event_data));
				console.log("all published ? "+casti_ctrls_published());
				if( casti_ctrls_published() )	succeed_cb();
			}
		});
		// add it to casto_testclients
		casti_ctrls.push(casti_ctrl);
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
			var casto_idx	= i*n_casto + j;
			// build the stream_url
			var stream_url		= casto_url_builder.create({
				base_url	: "http://127.0.0.1:4560",
				cast_name	: "superstream"+i,
				cast_privhash	: casti_ctrls[i].cast_privhash()
			});
			if( verbose > 1 )	console.log("stream_url="+stream_url);
		// TODO this closure stuff is bad
		(function(casto_idx){
			// launch the casti_testclient_t
			var casto_testclient	= casto_testclient_t.create({
				stream_url	: stream_url,
				max_recved_len	: casto_max_recved,
				event_cb	: function(event_type, event_data){
					console.log("event_type="+event_type+" event_data="+event_data);
					if( event_type == "recved_size" ){
						var nb_unit	= event_data;
						for(var i = 0; i < nb_unit; i++){
							require("sys").print('.');
						}
					}else if(event_type == "recved_len_maxed"){
						console.log('casto testclient '+casto_idx+' is done');
						casto_testclients[casto_idx].destroy();
						casto_testclients[casto_idx]	= null;
						if(!casto_testclients_running())	succeed_cb();
					}
				}
			});
			// add it to casto_testclients
			casto_testclients[casto_idx]	= casto_testclient;
		})(casto_idx);
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

var main	= function(){
	var stop_all	= function(){
		casto_testclients_stop();
		casti_ctrls_stop();
		chargen_stop();
	}
	
	console.log("node-chargen starting (will be used as stream original source)");
	chargen_start();
	console.log("node-chargen started");
	
	console.log("casti_ctrl starting: "+n_casti+" publishing may take a while");
	casti_ctrls_start(function(){
		if( chargen.nb_clients() == n_casti ){			
			if(!casto_testclients_running()){
				console.log("casti_ctrl started: all casti_ctrl published ("+n_casti+" of them)");
				console.log("node-chargen server got as many connection as casti. all is ok");
				console.log("casto_testclient starting: ("+n_casti*n_casto+" of them)");
				casto_testclients_start(function(){
					console.log("casto_testclients suceed!");
					stop_all();
				}, function(){
					console.log("ERROR: casto_testclients failed!");
					process.exit();
				});
			}
		}else{
			console.log("ERROR: node-chargen server has "+chargen.nb_clients()+" and should have "+n_casti);
			process.exit();
		}
	}, function(){
		console.log("ERROR: casti_ctrls failed!");
		process.exit();
	});
	
	// trap SIGINT - first = release(), second normal behavior
	process.addListener('SIGINT', function(){
		console.log("Received sigint, start releasing the stream");
		casto_testclients_stop();
		casti_ctrls_stop();
		chargen_stop();
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
		verbose		: null
	};
	var disp_usage	= function(prefix){
		if(prefix)	console.log(prefix + "\n");
		console.log("usage: neoip_cast_tester [options]");
		console.log("");
		console.log("Test neoip-casto/neoip-casti.");
		console.log("");
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
		if( key == '-i' || key == "--n_casti" ){
			cmdline_opts.n_casti	= parseInt(val);
			optind		+= 1;
		}else if( key == '-o' || key == "--n_casto" ){
			cmdline_opts.n_casto	= parseInt(val);
			optind		+= 1;
		}else if( key == '-l' || key == "--casti_max_recved" ){
			cmdline_opts.casti_max_recved	= parseInt(val);
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
	// call the main()
	main();
}
