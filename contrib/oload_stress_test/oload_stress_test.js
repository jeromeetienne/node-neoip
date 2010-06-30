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
var ezhttp	= require('../vendor/node-helpers/ez_http');
var ttyc	= require('../vendor/node-helpers/ez_tty_color');
var strutils	= require('../vendor/node-helpers/strutils');

sys.puts( strutils.string_to_size('300') );
sys.puts( strutils.string_to_size('300b') );
sys.puts( strutils.string_to_size('300k') );
process.exit();
//var url		= "http://localhost/~jerome/Videos/Fearless.avi";
//var url	= "http://localhost:4550/http://127.0.0.1/~jerome/Videos/Fearless.avi";
//var ref_fname	= '/home/jerome/Videos/Fearless.avi';
//var ref_fname	= null;
var url		= process.argv[2];
var ref_fname	= process.argv[3];

// make that tunable via cmdline options
var range_len_base	= null;
var range_len_rand	= null;
var nb_concurent	= 1;



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
		sys.puts("usage: oload_stress_test [-c ncnx] [-l nbytes] [-r nbytes] URL [filename]");
		sys.puts(" - If <filename> is present, an accuracy test is performed. AKA data are loaded from");
		sys.puts("   the reference file and from the <URL> and both are checked to be equal.");
		sys.puts(" - If <filename> is not present, a stress test is performed. AKA data are loaded from");
		sys.puts("   the url as fast as possible.");
		sys.puts("");
		sys.puts("-c|--concurent ncnx\t\tDetermine the number of concurent connections during the tests.");
		sys.puts("-l|--req_length_base nbytes\tThe base length of the request to make");
		sys.puts("-r|--req_length_rand nbytes\tThe randomized length of the request to make");
		process.exit(0);
	}else{
		// if the option doesnt exist, consider it is the first non-option parameters
		break;
	}
}




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
}

//////////////////////////////////////////////////////////////////////////////////
//	stress	test								//
//////////////////////////////////////////////////////////////////////////////////

function do_test_stress()
{
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
	
	var callback	= function(error, headers){
		//sys.puts('HEADERS: ' + sys.inspect(headers));
		filesize	= parseInt(headers['content-length'], 10);
		// set default range_len_base/range_len_rand
		range_len_base	= range_len_base || Math.floor(filesize / 20);
		range_len_rand	= range_len_rand || Math.floor(range_len_base / 2);
		// clamp range_len_base/range_len_rand
		range_len_base	= Math.min(range_len_base, filesize);
		range_len_rand	= Math.min(range_len_rand, range_len_base);

		// display informations headers
		sys.log("Stress server at url "+url);
		sys.log("Total content length "+filesize);
		sys.log("using "+nb_concurent+" concurent requests");
		sys.log("of "+range_len_base+"-bytes +/- "+range_len_rand+"-bytes");
	
		for(var i = 0; i < nb_concurent; i++ ){
			http_request_multiple();
		}
	}
	
	ezhttp.http_resp_headers(url, callback);
}

if( ref_fname !== undefined )	do_test_accuracy();
else				do_test_stress();

