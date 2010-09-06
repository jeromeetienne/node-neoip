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

/**
 * base64 support
 * - nodejs specific
*/
var base64	= {
	encode	: function(data){
		return new Buffer(data,"binary").toString("base64");
	},
	decode	: function(data){
		return new Buffer(data, "base64").toString("binary");
	}
}

console.log(base64.decode(base64.encode("bonjour")));

process.exit(-1);

/**
 * bunch of x509 generation on top of certtool from gnutls
*/
var x509_certtool	= function(){
	//////////////////////////////////////////////////////////////////////////
	//		internal						//
	//////////////////////////////////////////////////////////////////////////
	var cmdline_run	= function(cmdline, success_cb, faillure_cb){
		if(!faillure_cb)	faillure_cb	= function(error){
			console.log('exec ('+cmdline+') error: ' + error);
			process.exit(-1);		
		}
		console.log(cmdline);
		require('child_process').exec(cmdline, function (error, stdout, stderr) {
			if (error !== null)	faillure_cb(error)
			else			success_cb();
		})
	}
	
	//////////////////////////////////////////////////////////////////////////
	//		public functions					//
	//////////////////////////////////////////////////////////////////////////
	var priv_generate	= function(nbits, fname_priv, success_cb, faillure_cb){
		var cmdline	= "certtool --generate-privkey";
		cmdline		+= " --outder --outfile '"+fname_priv+"'";
		cmdline		+= " --bits "+nbits;
		cmdline_run(cmdline, success_cb, faillure_cb);
	}
	
	var ssig_generate	= function(fname_priv, fname_cert, fname_temp, success_cb, faillure_cb){
		var cmdline	= "certtool --generate-self-signed";
		cmdline		+= " --inder  --load-privkey '"+fname_priv+"'";
		cmdline		+= " --outder --outfile '"+fname_cert+"'";
		cmdline		+= " --template '"+fname_temp+"'";
		cmdline_run(cmdline, success_cb, faillure_cb);
	}
	
	var creq_generate	= function(fname_priv, fname_creq, fname_temp, success_cb, faillure_cb){
		var cmdline	= "certtool --generate-request";
		cmdline		+= " --inder --infile '"+fname_priv+"'";
		cmdline		+= " --outder --outfile '"+fname_creq+"'";
		cmdline		+= " --template '"+fname_temp+"'";
		cmdline_run(cmdline, success_cb, faillure_cb);
	}
	
	var cert_generate	= function(fname_capriv, fname_cacert, fname_catemp, fname_creq, fname_cert, success_cb, faillure_cb){
		var cmdline	= "certtool --generate-request";
		cmdline		+= " --inder  --load-request '"+fname_creq+"'";
		cmdline		+= " --outder --outfile '"+fname_cert+"'";
		cmdline		+= " --load-ca-privkey '"+fname_capriv+"'";
		cmdline		+= " --load-ca-certificate '"+fname_cacert+"'";
		cmdline		+= " --template '"+fname_temp+"'";
		cmdline_run(cmdline, success_cb, faillure_cb);
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return the public properties
	return {
		priv_generate	: priv_generate,
		ssig_generate	: ssig_generate,
		creq_generate	: creq_generate,
		cert_generate	: cert_generate
	}
}

if(false){
	var fname_priv	= "/tmp/user.priv.der";
	var fname_creq	= "/tmp/user.creq.der";
	var fname_cert	= "/tmp/user.cert.der";
	var fname_temp	= "./certtool.template";
	var fname_capriv= "/tmp/user.capriv.der";
	var fname_cacert= "/tmp/user.cacert.der";
	var fname_catemp= "./certtool.template";
	var x509	= x509_certtool();
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
}
