#!/usr/bin/env node

var sys		= require('sys');

sys.puts("start");

var http	= require('http');
var url_module	= require('url');
var crypto	= require('crypto');
var fs		= require('fs');

var url_str	= "http://127.0.0.1:4550/http://localhost/~jerome/Videos/Fearless.avi?slota=33#DDD"
var url_str	= "http://127.0.0.1:4550/http://localhost/~jerome/Videos/Fearless.avi?slota=33"
var url_str	= "http://127.0.0.1:4550/http://localhost/~jerome/Videos/Fearless.avi#DDD"
//var url_str	= "http://127.0.0.1:4550/http://localhost/~jerome/Videos/Fearless.avi"
var url_str	= "http://localhost/~jerome/Videos/Fearless.avi"


var url		= url_module.parse(url_str);







sys.puts('port='+url.port);
sys.puts('host='+url.hostname);
sys.puts('path='+url.pathname);
sys.puts('query='+url.query);
sys.puts('hash='+url.hash);


// rebuild the path_query_hash string to put in the request path
pqh_str	 = url.pathname;
if( url.query !== undefined )	pqh_str	+= "?"+url.query;
if( url.hash  !== undefined )	pqh_str	+= url.hash;

range_beg	= 100;
range_len	= 2000;
range_end	= range_beg+range_len-1;

//sys.puts("pqh="+pqh_str);
//sys.puts('range='+(range_beg+"-"+range_end+"/*"));

//process.exit()

var hash	= crypto.createHash('md5');
//hash.update("");
//sys.puts("result="+hash.digest('hex'));
//process.exit();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/**
 * Pad a string
*/
var pad_string	= function(str, length, pad_str) {
	// determine pad_str if not done
	if( pad_str === undefined )	pad_str= " ";
	// pad until it is at least the proper length
	while(str.length < length)	str	= pad_str+str;
	// return the output
	return str;
}

/**
 * Dump an buffer in hexa
 * - inspired by hd(1)
*/
var hexa_dump_str	= function(data){
	var num_to_hex	= function(num){
		return pad_string(num.toString(16), 2);
	}
	var output	= "";
	for(var offset = 0; ; offset += 16){
		if( offset >= data.length )	break;
		if(output.length > 0)		output	+= "\n";
		output	+= pad_string(offset.toString(16),6, '0')+"  ";
		for(var i = 0; i < 16; i++){
			var val		= data.charCodeAt(offset+i);
			if( offset + i < data.length ){
				output	+= pad_string(val.toString(16), 2, '0')+" ";
			}else{
				output	+= "   ";
			}
		}
		output	+= "   |";
		for(var i = 0; i < 16; i++){
			var val	= data.charAt(offset+i);
			if( offset + i < data.length ){
				var is_printable	= val.charCodeAt(0) >= 32
				if( is_printable )	output	+= val;
				else			output	+= ".";
			}else{
				output	+= " ";
			}
		}
		output	+= "|";
	}
	return output;
}

var hexa_dump	= function(data){
	sys.puts(hexa_dump_str(data));
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var Buffer = require('buffer').Buffer
var ez_fileread	= function(path, range_beg, range_len, completed_cb){
	// open the file
	fs.open(path, "r", 0644, function(err, fd){
		sys.puts("err="+err);
		// report the error if needed
		if( err !== null )	return completed_cb(err, null);
		sys.puts("fd="+fd);
		// allocate the buffer
		var buf		= new Buffer(range_len+1);
		// start the read
		fs.read(fd, buf, 0, range_len, range_beg, function(err, byteRead){
			// report the error if needed
			if( err !== null )	return completed_cb(err, null);
			sys.puts("err="+err);
			sys.puts("byteRead="+byteRead);
			// convert the Buffer into a string
			var data	= buf.toString("binary", 0, byteRead);
			// notify the caller
			return completed_cb(null, data);
		})
		// just to avoid a warning in my text editor
		return undefined;
	});
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

if(false){
	ez_fileread('/home/jerome/Videos/Fearless.avi', 1, range_len, function(err, data){
		var digest_file	= crypto.createHash('md5').update(data).digest('hex');
		sys.debug("digest_file:"+digest_file);
		sys.puts("err="+err);
		hexa_dump(data);
	});
}

if(true){
	// create the http client
	var client	= http.createClient((url.port||80), url.hostname);
	var request	= client.request('GET', pqh_str,  {
		'host'	: url.hostname,
		'Range'	: "bytes="+range_beg+"-"+range_end
	});
	request.addListener('response', function(response) {
		response.setEncoding('binary');
		response.addListener('data', function (chunk) {
			hexa_dump(chunk);
			hash.update(chunk);
		});
		response.addListener('end', function(){
			var digest_http	= hash.digest("hex");
			sys.debug("digest_http="+digest_http);

			ez_fileread('/home/jerome/Videos/Fearless.avi', range_beg, range_len, function(err, data){
				var digest_file	= crypto.createHash('md5').update(data).digest('hex');
				sys.debug("digest_file:"+digest_file);
				sys.puts("err="+err);
				hexa_dump(data);
				if( digest_http == digest_file ){
					sys.puts("SUCCEED");
				}else{
					sys.puts("FAILED");
				}
			});
		});
	});
	request.end();
}