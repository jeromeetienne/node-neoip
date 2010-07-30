var sys		= require('sys');
var http	= require('http');
var url_module	= require('url');
var crypto	= require('crypto');
var fs		= require('fs');

var ez_output	= require('../vendor/node-helpers/ez_output');
var ez_fileutils= require('../vendor/node-helpers/ez_fileutils');
var http_get	= require('../vendor/node-helpers/ez_http').http_get;

/**
 * cpu digest http
*/
var cpu_digest_http	= function(url_str, range_beg, range_len, completed_cb){
	http_get(url_str, range_beg, range_len, function(error, data){
		//console.log("stress: beg="+range_beg+" len="+range_len+" error="+error);
		if( error !== null ){
			completed_cb(error, null);
		}else{
			var digest_http	= crypto.createHash('md5').update(data).digest("hex");
			completed_cb(null, digest_http);			
		}
	})
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
		//console.log("url="+url+" hex="+digest_http);
		cpu_digest_file(filename, range_beg, range_len, function(err, digest_file){
			//console.log("filename="+filename+" hex="+digest_file);
			var succeed	= digest_http == digest_file;
			completed_cb(null, succeed);
		})
	})	
}

exports.cmp_digest	= cmp_digest;

