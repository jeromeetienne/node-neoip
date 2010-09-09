#!/bin/env nodejs 
/*
 * generate request - ask for email + fqdn
 * - put that in the template
 * - on client
 *   - certtool --generate-priv --outfile key.pem
 *   - certtool --generate-request --load-priv key.pem --outfile request.pem
 * - on server
 *   - certtool --generate-certificate --load-request request.pem --outfile cert.pem \
 *              --load-ca-certificate ca-cert.pem --load-ca-priv ca-key.pem
 * communication is done via post url encoded
*/

// require local dependancies
var base64	= require('../../lib/base64');
var x509	= require('./x509_certtool_t').create();

var do_create_rootca	= function(rootca_domain){
	
}
var do_register		= function(dnsname){

}

//////////////////////////////////////////////////////////////////////////////////
//	parse cmdline								//
//////////////////////////////////////////////////////////////////////////////////
// cmdline_opts default
cmdline_opts	= {
	verbose			: 0
};
var PROGRAM_NAME	= require('path').basename(process.argv[1]);
var disp_usage	= function(prefix){
	if(prefix)	console.log(prefix + "\n");
	console.log("usage:", PROGRAM_NAME, "[OPTIONS]");
	console.log("");
	console.log("Super stuff");
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
var operation	= process.argv[optind++];

// process the operation
if( operation == "create_rootca" ){
	var rootca_domain	= process.argv[optind++];
	do_create_rootca(rootca_domain);
}else if( operation == "register" ){
	var dnsname	= process.argv[optind++];
	do_register(dnsname);
}
