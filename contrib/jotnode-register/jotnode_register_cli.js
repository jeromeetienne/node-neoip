#!/bin/env nodejs
/*
 * generate request - ask for email + fqdn
 * - put that in the template
 * - on client
 *   - certtool --generate-privkey --outfile key.pem
 *   - certtool --generate-request --load-privkey key.pem --outfile request.pem
 * - on server
 *   - certtool --generate-certificate --load-request request.pem --outfile cert.pem \
 *              --load-ca-certificate ca-cert.pem --load-ca-privkey ca-key.pem
 * communication is done via post url encoded
 *
 *
 * - (new Buffer(chunk,"binary")).toString("base64")
 * - new Buffer(blabla,"base64")
*/



if( false ){
	var exec	= require('child_process').exec;
	var child;
	child	= exec('ls -l', function (error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}

var http	= require('http');
var url		= "http://127.0.0.1:8124/?User=bob&GetChallenge=1";
var parsed_url	= require('url').parse(url);
var pqh_str	 = parsed_url.pathname;
if( parsed_url.query )	pqh_str	+= "?"+parsed_url.query;
if( parsed_url.hash  )	pqh_str	+= parsed_url.hash;
var client	= http.createClient((parsed_url.port||80), parsed_url.hostname);
var request	= client.request('GET', pqh_str, {
	'host'	: parsed_url.host
});
request.end();
request.on('response', function (response) {
	console.log('STATUS: ' + response.statusCode);
	console.log('HEADERS: ' + JSON.stringify(response.headers));
	response.setEncoding('utf8');
	response.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
	});
});
