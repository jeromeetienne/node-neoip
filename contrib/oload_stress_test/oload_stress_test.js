#!/usr/bin/env node
/**
 * Mode of operation
 * - check result accuracy
 *   - get a url, and a local path for the same content
 *   - do request on the url and on the local file, and check the result are the same
 * - load test
 *   - get an url on a static content
 *   - just hammer the server with random request
 * Usage Example:
 * ./oload_stress_test.js -l 30k -r 5k `neoip-url http://localhost/~jerome/Videos/Fearless.mp4` ~/Videos/Fearless.mp4
*/


// system dependancies
var sys		= require('sys');
var fs		= require('fs');
// local dependancies
var cmp_digest	= require('./test_accuracy').cmp_digest;
var http_get	= require('../vendor/node-helpers/ez_http').http_get;
var ezhttp	= require('../vendor/node-helpers/ez_http');
var ttyc	= require('../vendor/node-helpers/ez_tty_color');
var strutils	= require('../vendor/node-helpers/strutils');

// default parameters for cmdline options
var range_len_base	= null;
var range_len_rand	= null;
var nb_concurent	= 1;
var requests_max	= null;
var verbose		= 0;

var requests_count	= 0;

//////////////////////////////////////////////////////////////////////////////////
//	parse cmdline								//
//////////////////////////////////////////////////////////////////////////////////
var optind	= 2;
for(;optind < process.argv.length; optind++){
	var key	= process.argv[optind];
	var val	= process.argv[optind+1];
	//console.log("key="+key+" val="+val);
	if( key == "-c" || key == "--concurent" ){
		nb_concurent	= parseInt(val);
		optind		+= 1;
	}else if( key == "-l" || key == "--req_length_base" ){
		range_len_base	= strutils.string_to_size(val);
		optind		+= 1;
		//console.log("range_len_base="+range_len_base);
	}else if( key == "-r" || key == "--req_length_rand" ){
		range_len_rand	= strutils.string_to_size(val);
		optind		+= 1;
	}else if( key == "-n" || key == "--nb_requests" ){
		requests_max	= parseInt(val);
		optind		+= 1;
	}else if( key == "-h" || key == "--help" ){
		console.log("usage: oload_stress_test [-c ncnx] [-l nbytes] [-r nbytes] [-n nreq] URL [filename]");
		console.log(" - If <filename> is present, an accuracy test is performed. AKA data are loaded from");
		console.log("   the reference file and from the <URL> and both are checked to be equal.");
		console.log(" - If <filename> is not present, a stress test is performed. AKA data are loaded from");
		console.log("   the url as fast as possible.");
		console.log("");
		console.log("-n|--nb_requests num\t\tDetermine the number of requests to do before stopping.");
		console.log("-c|--concurent ncnx\t\tDetermine the number of concurent connections during the tests.");
		console.log("-l|--req_length_base nbytes\tThe base length of the request to make");
		console.log("-r|--req_length_rand nbytes\tThe randomized length of the request to make");
		process.exit(0);
	}else{
		// if the option doesnt exist, consider it is the first non-option parameters
		break;
	}
}

// get url/ref_fname from cmdline
var url		= process.argv[optind++];
var ref_fname	= process.argv[optind++];

//////////////////////////////////////////////////////////////////////////////////
//	accuracy test								//
//////////////////////////////////////////////////////////////////////////////////

function do_test_accuracy()
{
	var filesize	= fs.statSync(ref_fname).size
	// set default range_len_base/range_len_rand
	range_len_base	= range_len_base || (filesize / 20.0);
	range_len_rand	= range_len_rand || (range_len_base / 2.0);
	// clamp range_len_base/range_len_rand
	range_len_base	= Math.min(range_len_base, filesize);
	range_len_rand	= Math.min(range_len_rand, range_len_base);

	var cmp_digest_multiple	= function(){
		// count this request, and exist 
		requests_count	+= 1;
		if( requests_max && requests_max < requests_count ){
			console.log("All "+requests_max+" requests done.")
			process.exit(0);
		}
		// compute the range to request
		var range_len	= range_len_base - range_len_rand + Math.floor(Math.random()*range_len_rand*2);
		var range_beg	= Math.floor(Math.random()*(filesize - range_len));
		// do the request	
		cmp_digest(url, ref_fname, range_beg, range_len, function(err, succeed){
			if( succeed )	sys.print(".");
			else		console.log("accuracy: beg="+range_beg+" len="+range_len+" succeed="+succeed);
			cmp_digest_multiple();
		})
	}
	
	// display informations headers
	if( verbose ){
		console.log("Check accuracy between url "+url);
		console.log("and file "+ ref_fname);
		console.log("Total content length "+filesize+"-bytes");
		console.log("using "+nb_concurent+" concurent requests");
		console.log("of "+range_len_base+"-bytes +/- "+range_len_rand+"-bytes.");
		console.log("It will perform "+(requests_max?requests_max:"an unlimited number of")+" requests.");
	}
	
	for(var i = 0; i < nb_concurent; i++ ){
		cmp_digest_multiple();
	}
}

//////////////////////////////////////////////////////////////////////////////////
//	stress	test								//
//////////////////////////////////////////////////////////////////////////////////

function do_test_stress()
{
	var http_request_multiple	= function(){
		// count this request, and exist 
		requests_count	+= 1;
		if( requests_max && requests_max < requests_count ){
			console.log("All "+requests_max+" requests done.")
			process.exit(0);
		}
		// compute the range to request
		var range_len	= range_len_base - range_len_rand + Math.floor(Math.random()*range_len_rand*2);
		var range_beg	= Math.floor(Math.random()*(filesize - range_len));
		// do the request
		http_get(url, range_beg, range_len, function(error, data){
			//console.log("stress: beg="+range_beg+" len="+range_len+" error="+error);
			if( error === null )	sys.print(".");
			else			console.log("beg="+range_beg+" len="+range_len+" error="+error);
			http_request_multiple();
		})
	}
	
	var callback	= function(error, headers){
		//console.log('HEADERS: ' + sys.inspect(headers));
		filesize	= parseInt(headers['content-length'], 10);
		// set default range_len_base/range_len_rand
		range_len_base	= range_len_base || Math.floor(filesize / 20);
		range_len_rand	= range_len_rand || Math.floor(range_len_base / 2);
		// clamp range_len_base/range_len_rand
		range_len_base	= Math.min(range_len_base, filesize);
		range_len_rand	= Math.min(range_len_rand, range_len_base);

		// display informations headers
		if( verbose ){
			console.log("Stress server at url "+url);
			console.log("Total content length "+filesize+"-bytes");
			console.log("using "+nb_concurent+" concurent requests");
			console.log("of "+range_len_base+"-bytes +/- "+range_len_rand+"-bytes.");
			console.log("It will perform "+(requests_max?requests_max:"an unlimited number of")+" requests.");
		}
	
		for(var i = 0; i < nb_concurent; i++ ){
			http_request_multiple();
		}
	}
	
	ezhttp.http_resp_headers(url, callback);
}

//////////////////////////////////////////////////////////////////////////////////
//	main program								//
//////////////////////////////////////////////////////////////////////////////////
if( ref_fname !== undefined )	do_test_accuracy();
else				do_test_stress();

