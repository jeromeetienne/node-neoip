#!/usr/bin/env node
/**
 * Mode of operation
 * - check result accuracy
 *   - get a url, and a local path for the same content
 *   - do request on the url and on the local file, and check the result are the same
 * - load test
 *   - get an url on a static content
 *   - just hammer the server with random request
 *
 * TODO
 * - put the oload tester in contrib/
*/


// system dependancies
var sys		= require('sys');
var fs		= require('fs');
// local dependancies
var cmp_digest	= require('./accuracy_test').cmp_digest;
var http_get	= require('../vendor/node-helpers/ez_http').http_get;

var ttyc	= require('../vendor/node-helpers/ez_tty_color');


//var url		= "http://localhost/~jerome/Videos/Fearless.avi";
var url		= "http://localhost:4550/http://127.0.0.1/~jerome/Videos/Fearless.avi";
var ref_fname	= '/home/jerome/Videos/Fearless.avi';
//var url	= process.argv[2];
//var ref_fname	= process.argv[3];

//////////////////////////////////////////////////////////////////////////////////
//	parse cmdline								//
//////////////////////////////////////////////////////////////////////////////////
var optind	= 2;
for(;optind < process.argv.length; optind){
	var key	= process.argv[optind];
	var val	= process.argv[optind+1];
	if( key == "-c" || key == "--concurent" ){
		nb_concurent	= parseInt(val);
		optind		+= 1;
	}else if( key == "-l" || key == "--req_length_base" ){
		range_len_base	= parseInt(val);
		optind		+= 1;
	}else if( key == "-r" || key == "--req_length_rand" ){
		range_len_rand	= parseInt(val);
		optind		+= 1;
	}else if( key == "-h" || key == "--help" ){
		sys.puts("usage: oload_stress_test [-c ncnx] [-l nbytes] [-r nbytes] URL [ref_fname]")
		sys.puts("-c|--concurent ncnx\t\tDetermine the number of concurent connections");
		sys.puts("-l|--req_length_base nbytes\tThe base length of the request to make");
		sys.puts("-r|--req_length_rand nbytes\tThe randomized length of the request to make");
		process.exit(0);
	}
}

//process.exit();

//url	= process.argv[optind];


sys.puts("url="+url);
sys.puts("ref_fname="+ref_fname);

// make that tunable via cmdline options
var range_len_base	= 300*1024;
var range_len_rand	= 50*1024;
var nb_concurent	= 25;

var filesize		= fs.statSync(ref_fname).size


//////////////////////////////////////////////////////////////////////////////////
//	accuracy test								//
//////////////////////////////////////////////////////////////////////////////////

if( false && ref_fname ){
	var cmp_digest_multiple	= function(){
		var range_len	= range_len_base - range_len_rand + Math.floor(Math.random()*range_len_rand*2);
		var range_beg	= Math.floor(Math.random()*(filesize - range_len));
	
		cmp_digest(url, ref_fname, range_beg, range_len, function(err, succeed){
			if( succeed )	sys.print(".");
			else		sys.puts("accuracy: beg="+range_beg+" len="+range_len+" succeed="+succeed);
			cmp_digest_multiple();
		})
	}
	
	// display informations headers
	sys.log("Check accuracy between url "+url);
	sys.log("and file "+ ref_fname);
	sys.log("using "+nb_concurent+" concurent requests");
	sys.log("of "+range_len_base+"-bytes +/- "+range_len_rand+"-bytes");
	
	for(var i = 0; i < nb_concurent; i++ ){
		cmp_digest_multiple();
	}
	// TODO here dont go on...
	// - sleep until ?... i dunno
}

//////////////////////////////////////////////////////////////////////////////////
//	stress	test								//
//////////////////////////////////////////////////////////////////////////////////

if( true ){
	var http_request_multiple	= function(){
		var range_len	= range_len_base - range_len_rand + Math.floor(Math.random()*range_len_rand*2);
		var range_beg	= Math.floor(Math.random()*(filesize - range_len));
	
		http_get(url, range_beg, range_len, function(error, data){
			//sys.puts("stress: beg="+range_beg+" len="+range_len+" error="+error);
			if( error === null )	sys.print(".");
			else			sys.log("beg="+range_beg+" len="+range_len+" error="+error);
			http_request_multiple();
		})
	}
	
	
	// display informations headers
	sys.log("Stress server at url "+url);
	sys.log("using "+nb_concurent+" concurent requests");
	sys.log("of "+range_len_base+"-bytes +/- "+range_len_rand+"-bytes");
	
	for(var i = 0; i < nb_concurent; i++ ){
		http_request_multiple();
	}
}


