#!/usr/bin/env node

// import the required dependancies
var casto_testclient_t	= require('./casto_testclient_t');


//////////////////////////////////////////////////////////////////////////////////
//	parse cmdline								//
//////////////////////////////////////////////////////////////////////////////////
// cmdline_opts default
cmdline_opts	= {
	stream_url	: {},
	verbose		: 0,
	max_recved_len	: null,
	notify_unit	: null,
	nconcurent_cnx	: 1
};
var disp_usage	= function(prefix){
	if(prefix)	console.log(prefix + "\n");
	console.log("usage: casto_testclient [-n unitbyte] [-v [-v]] [-c ncnx] stream_url");
	console.log("");
	console.log("Establish a connection with a http stream.");
	console.log("- intended to test neoip-casto.");
	console.log("");
	console.log("-l|--max_recved_len lbytes\t\tSet the max amount of kbytes to receive.");
	console.log("-n|--notify_unit bytes\t\tSet the amount of bytes to notify");
	console.log("-v|--verbose\t\t\tIncrease the verbose level (for debug).");
	console.log("-h|--help\t\t\tDisplay the inline help.");
}
var optind	= 2;
for(;optind < process.argv.length; optind++){
	var key	= process.argv[optind];
	var val	= process.argv[optind+1];
	//console.log("key="+key+" val="+val);
	if( key == '-l' || key == "--max_recved_len" ){
		cmdline_opts.max_recved_len	= parseInt(val);
		optind		+= 1;
	}else if( key == '-n' || key == "--notify_unit" ){
		cmdline_opts.notify_unit	= parseInt(val);
		optind		+= 1;
	}else if( key == '-c' || key == "--nconcurent_cnx" ){
		cmdline_opts.nconcurent_cnx	= parseInt(val);
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
// get required options from the rest of the cmdline
var stream_url	= process.argv[optind++];	


if( false ){
	stream_url	= "http://127.0.0.1:8124/";
	cmdline_opts.verbose	= 1
}
// create casto_client
for(var i = 0; i < cmdline_opts.nconcurent_cnx; i++ ){
	var casto_client	= casto_testclient_t.create({
		stream_url	: stream_url,
		event_cb	: function(event_type, event_data){
			if( cmdline_opts.verbose ) console.log("event_type="+event_type+" event_data="+event_data);
			if( event_type == "recved_size" ){
				var nb_unit	= event_data;
				for(var i = 0; i < nb_unit; i++){
					require("sys").print('.');
				}
			}else if(event_type == "recved_len_maxed"){
				casto_client.destroy();
			}
		},
		max_recved_len	: cmdline_opts.max_recved_len	|| null,
		notify_unit	: cmdline_opts.notify_unit	|| null,
		verbose		: cmdline_opts.verbose		|| 0
	});
}
