#!/usr/bin/env node

// import the required dependancies
var casti_ctrl_t	= require('./casti_ctrl_t');

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
	// Start the original stream
	// $ node node-chargen.js
	// tell webpeer to read this stream:
	// $ node casti_ctrl_exe.js --call_url http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js -o mdata_srv_uri http://localhost/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi -o cast_name superstream -o cast_privtext supersecret -o scasti_uri http://127.0.0.1:8124 -o scasti_mod raw -o http_peersrc_uri '' -o web2srv_str 'dummyweb2serv_str' -v
	// Read the stream from webpeer
	// curl `node casto_url_builder.js http://127.0.0.1:4560 a761ce3a superstream`
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

// init casti_ctrl
var casti_ctrl	= casti_ctrl_t.create({
	call_url	: cmdline_opts.call_url,
	casti_opts	: cmdline_opts.casti_opts,
	event_cb	: function(event_type, event_data){
		console.log("event_cb: type="+event_type+" data="+require('sys').inspect(event_data));
		console.log("casti_ctrl: published()="+casti_ctrl.published()+" cast_privhash()="+casti_ctrl.cast_privhash());
	},
	req_timer_delay	: cmdline_opts.req_timer_delay	|| null,
	verbose		: cmdline_opts.verbose		|| 0
});

// init gracefull_shutdown if not specified otherwise in cmdline
if( cmdline_opts.no_gracefull_shutdown === false ){
	// trap SIGINT - first = release(), second normal behavior
	process.on('SIGINT', function(){
		console.log("Received sigint, start releasing the stream");
		casti_ctrl.release();
		process.removeListener('SIGINT', arguments.callee);
	});
}