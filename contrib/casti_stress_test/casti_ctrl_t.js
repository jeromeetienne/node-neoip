#!/usr/bin/env node

var neoip_rpc	= require('./neoip_rpc_node');
var sys		= require('sys');

/**
*/
var casti_ctrl_t	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self	= this;
	// copy ctor_opts + set default values if needed
	var call_url		= ctor_opts.call_url		|| console.assert(false);
	var casti_opts		= ctor_opts.casti_opts		|| console.assert(false);
	var event_cb		= ctor_opts.event_cb		|| function(event_type, event_data){}
	var req_timer_delay	= ctor_opts.req_timer_delay	|| 0.5*1000;
	var verbose		= ctor_opts.verbose		|| 0;

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
		rpc_call	= neoip_rpc.call.create({
			call_url	: call_url,
			method_name	: 'request_stream',
			method_args	: [co.mdata_srv_uri, co.cast_name, co.cast_privtext, co.scasti_uri
						, co.scasti_mod, co.http_peersrc_uri, co.web2srv_str],
			success_cb	: function(returned_val){
				rpc_call_destroy();
				req_timer_refresh();
				if(returned_val.length > 0)	event_cb("ispublished", {cast_privhash: returned_val});			
				else				event_cb("nopublished", null);
				
			},
			failure_cb	: function(fault){
				if( verbose )	console.log("failure: "+require('sys').inspect(fault));
				rpc_call_destroy();
				event_cb("rpc_error", null);
			}
		});
	}
	var rpc_call_release	= function(){
		// log to debug
		if( verbose > 1 )	console.log("rpc: rpc_call_release enter")
		// sanity check
		console.assert(rpc_call === null);
		// create the neoip_rpc.call
		var co		= casti_opts;
		rpc_call	= neoip_rpc.call.create({
			call_url	: call_url,
			method_name	: 'release_stream',
			method_args	: [co.mdata_srv_uri, co.cast_name, co.cast_privtext],
			success_cb	: function(returned_val){
				rpc_call_destroy();
				event_cb("released", null);
			},
			failure_cb	: function(fault){
				if( verbose )	console.log("failure: "+require('sys').inspect(fault));
				rpc_call_destroy();
				event_cb("rpc_error", null);
			}
		});	
	}
	var rpc_call_destroy	= function(){
		if( rpc_call !== null )	rpc_call.destroy();
		rpc_call	= null;
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// call the contructor
	ctor();
	// return the public properties
	return {
		release	: start_release,
		destroy	: dtor
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

//////////////////////////////////////////////////////////////////////////////////
//	main programm								//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
// ************************************
// - in neoip-casti
//   - idle timeout (given by casti cmd with default. with a max in .conf)
//   - faster publishing


	//////////////////////////////////////////////////////////////////////////////////
	//	parse cmdline								//
	//////////////////////////////////////////////////////////////////////////////////
	// cmdline_opts default
	cmdline_opts	= {
		casti_opts		: {},
		call_url		: null,
		req_timer_delay		: null,
		verbose			: 0,
		no_gracefull_shutdown	: false
	};
	var disp_usage	= function(prefix){
		if(prefix)	console.log(prefix + "\n");
		console.log("usage: casti_ctrl -o key val -u url [-d msec] [-n] [-v [-v]]");
		console.log("");
		console.log("Control neoip-casti");
		console.log("");
		console.log("-o|--casti_opts key val\t\tSet the key/val options for casti call.");
		console.log("-u|--call_url url\t\tSet the call_url for the rpc");
		console.log("-d|--req_timer_delay sec\tSet the delay between 2 request_stream calls.");
		console.log("-n|--no_gracefull_shutdown\tDont explicitly release the stream on SIGINT");
		console.log("-v|--verbose\t\t\tIncrease the verbose level (for debug).");
		console.log("-h|--help\t\t\tDisplay the inline help.");
	}
	var optind	= 2;
	for(;optind < process.argv.length; optind++){
		var key	= process.argv[optind];
		var val	= process.argv[optind+1];
		//console.log("key="+key+" val="+val);
		if( key == '-o' || key == "--casti_opts" ){
			cmdline_opts.casti_opts[val]	= process.argv[optind+2];
			optind		+= 2;
		}else if( key == '-u' || key == "--call_url" ){
			// TODO if call_url unspecified, try to autodetect casti on localhost			
			cmdline_opts.call_url	= val;
			optind		+= 1;
		}else if( key == '-d' ||key == "--req_timer_delay" ){
			cmdline_opts.req_timer_delay	= parseFloat(val)*1000;
			optind		+= 1;
		}else if( key == '-n' || key == "--no_gracefull_shutdown" ){
			cmdline_opts.no_gracefull_shutdown	= true;
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
	
	if(false){
		// example of cmdline
		// node casti_ctrl_t2.js --call_url http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js -o mdata_srv_uri http://localhost/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi -o cast_name superstream -o cast_privtext supersecret -o scasti_uri http://127.0.0.1:8124 -o scasti_mod raw -o http_peersrc_uri '' -o web2srv_str 'dummyweb2serv_str' -v 
		cmdline_opts.call_url	= "http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js";
		cmdline_opts.casti_opts	= {
			mdata_srv_uri	: "http://localhost/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi",
			cast_name	: "superstream",
			cast_privtext	: "supersecret",
			scasti_uri	: "http://127.0.0.1:8124",
			scasti_mod	: "raw",
			http_peersrc_uri: "",
			web2srv_str	: "dummyuserdata"
		};
	}
	
	

	// build casti_ctrl ctor_opts
	var ctor_opts	= {
		call_url	: cmdline_opts.call_url,
		casti_opts	: cmdline_opts.casti_opts,
		event_cb	: function(event_type, event_data){
			console.log("event_cb: type="+event_type+" data="+require('sys').inspect(event_data));
		}
	};
	ctor_opts.req_timer_delay	= cmdline_opts.req_timer_delay	|| null;
	ctor_opts.verbose		= cmdline_opts.verbose		|| 0;
	// init casti_ctrl
	var casti_ctrl	= casti_ctrl_t.create(ctor_opts);

	// init gracefull_shutdown if not specified otherwise in cmdline
	if( cmdline_opts.no_gracefull_shutdown === false ){
		// trap SIGINT - first = release(), second normal behavior
		process.addListener('SIGINT', function(){
			console.log("Received sigint, start releasing the stream");
			casti_ctrl.release();
			process.removeListener('SIGINT', arguments.callee);
		});
	}
}
