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


var url		= "http://localhost/~jerome/Videos/Fearless.avi";
//var url	= "http://localhost:4550/http://localhost/~jerome/Videos/Fearless.avi";
var filename	= '/home/jerome/Videos/Fearless.avi';


//var url		= process.argv[2];
//var filename	= process.argv[3];

sys.puts("url="+url);
sys.puts("filename="+filename);

// make that tunable via cmdline options
var range_len_base	= 3*1024*1024;
var range_len_rand	= 512*1024;
var nb_concurent	= 1;

var filesize		= fs.statSync(filename).size


var cmp_digest_multiple	= function(){
	var range_len	= range_len_base - range_len_rand + Math.floor(Math.random()*range_len_rand*2);
	var range_beg	= Math.floor(Math.random()*(filesize - range_len));

	cmp_digest(url, filename, range_beg, range_len, function(err, succeed){
		sys.puts("beg="+range_beg+" len="+range_len+" succeed="+succeed);
		cmp_digest_multiple();
	})
}

for(var i = 0; i < nb_concurent; i++ ){
	cmp_digest_multiple();
}





