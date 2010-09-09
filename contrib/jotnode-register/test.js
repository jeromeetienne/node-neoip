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

if( false ){
	console.log(base64.decode(base64.encode("bonjour")));
	process.exit(-1);
}


if(true){
	var fname_priv	= "/tmp/user.priv.der";
	var fname_creq	= "/tmp/user.creq.der";
	var fname_cert	= "/tmp/user.cert.der";
	var fname_temp	= "./certtool.template";
	var fname_capriv= "/tmp/user.capriv.der";
	var fname_cacert= "/tmp/user.cacert.der";
	var fname_catemp= "./certtool.ca.template";
	x509.priv_generate(512, fname_capriv, function(){
	x509.ssig_generate(fname_capriv, fname_cacert, fname_catemp, function(){
	x509.priv_generate(512, fname_priv, function(){
	x509.creq_generate(fname_priv, fname_creq, fname_temp, function(){
	x509.cert_generate(fname_capriv, fname_cacert, fname_catemp, fname_creq, fname_cert, function(){
	});
	});
	});
	});
	});
}



if( false ){
	var http	= require('http');
	var url		= "http://127.0.0.1:8124/register?creq="+base64.encode_safe("supertruc");
	var parsed_url	= require('url').parse(url);
	var pqh_str	= parsed_url.pathname;
	if( parsed_url.query )	pqh_str	+= "?"+parsed_url.query;
	if( parsed_url.hash  )	pqh_str	+= parsed_url.hash;
	var client	= http.createClient((parsed_url.port||80), parsed_url.hostname);
	var request	= client.request('POST', pqh_str, {
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
}
