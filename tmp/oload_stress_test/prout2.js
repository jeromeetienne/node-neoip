#!/usr/bin/env node

var sys		= require("sys");
var crypto	= require('crypto');
var fs		= require('fs');
var Buffer	= require('buffer').Buffer

if( process.argv.length < 3 ){
	sys.puts("Usage: node "+process.argv[1]+" filename");
	process.exit();
}

var filename	= process.argv[2];
var filesize	= fs.statSync(filename).size
var buf_len	= 512*1024;

sys.puts("filename="+filename);
sys.puts("filesize="+filesize);

// open the file
var fd		= fs.openSync(filename, "r");
var buffer	= new Buffer(buf_len);

var hash	= new crypto.Hash;

for(var i = 0; i < 30000; i++){
	var bytesRead	= fs.readSync(fd, buffer, 0, buf_len, 0);
	var data	= buffer.toString("binary", 0, bytesRead);
	//
	// This hash computation cause a memory leak of "data"
	// - look at memory info in top and you will see it grow
	//
	hash.init('md5');
	var digest_hex	= hash.update(data).digest("hex");
	
	sys.puts("done reading "+buf_len+"-bytes");
}

fs.closeSync(fd);

