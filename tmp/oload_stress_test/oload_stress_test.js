#!/usr/bin/env node

var sys		= require('sys');
var http	= require('http');
var url_module	= require('url');
var crypto	= require('crypto');
var fs		= require('fs');

var ez_output	= require('./ez_output');
var ez_fileutils= require('./ez_fileutils');

/**
 * cpu digest http
*/
var cpu_digest_http	= function(url_str, range_beg, range_len, completed_cb){
	var url		= url_module.parse(url_str);
	var range_end	= range_beg+range_len-1;
	var hash	= crypto.createHash('md5');

	// rebuild the path_query_hash string to put in the request path
	var pqh_str	 = url.pathname;
	if( url.query !== undefined )	pqh_str	+= "?"+url.query;
	if( url.hash  !== undefined )	pqh_str	+= url.hash;
	// create the http client
	var client	= http.createClient((url.port||80), url.hostname);
	var request	= client.request('GET', pqh_str,  {
		'host'	: url.hostname,
		'Range'	: "bytes="+range_beg+"-"+range_end
	});
	request.addListener('response', function(response) {
		response.setEncoding('binary');
		response.addListener('data', function(chunk){
			//ez_output.hexa_dump(chunk);
			hash.update(chunk);
		});
		response.addListener('end', function(){
			var digest_http	= hash.digest("hex");
			// notify caller
			completed_cb(null, digest_http);
		});
	});
	request.end();	
}

/**
 * cpu digest file
*/
var cpu_digest_file	= function(filename, range_beg, range_len, completed_cb){
	var hash	= crypto.createHash('md5');
	var read_len	= 0;
	var chunk_max	= 512*1024;
	
	var callback	= function(err, data){
		if( err !== null ){
			completed_cb(err, null);
			return;
		}
		read_len	+= data.length;
		hash.update(data);
		
		if(read_len == range_len){
			var digest_file	= hash.digest('hex');
			completed_cb(null, digest_file);
		}else{
			var chunk_len	= Math.min(chunk_max, range_len - read_len);
			ez_fileutils.ez_fileread(filename, range_beg+read_len, chunk_len, callback);			
		}
	}
	
	var chunk_len	= Math.min(chunk_max, range_len - read_len);
	ez_fileutils.ez_fileread(filename, range_beg+read_len, chunk_len, callback);
}

/**
 * compare digest http vs file
*/
var cmp_digest	= function(url, filename, range_beg, range_len, completed_cb){
	cpu_digest_http(url, range_beg, range_len, function(err, digest_http){
		sys.puts("url="+url+" hex="+digest_http);
		completed_cb(null, true);
		if(false){
			//sys.puts("url="+url+" hex="+digest_http);
			cpu_digest_file(filename, range_beg, range_len, function(err, digest_file){
				//sys.puts("filename="+filename+" hex="+digest_file);
				var succeed	= digest_http == digest_file;
				completed_cb(null, succeed);
			})
		}
	})	
}

var url		= "http://localhost/~jerome/Videos/Fearless.avi";
var url		= "http://localhost:4550/http://localhost/~jerome/Videos/Fearless.avi";
var filename	= '/home/jerome/Videos/Fearless.avi';

var range_len_base	= 3*1024*1024;
var range_len_rand	= 512*1024;
var nb_concurent	= 1;

var filesize	= fs.statSync(filename).size

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





