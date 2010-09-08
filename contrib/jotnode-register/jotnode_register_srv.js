

// require system dependancies
var http	= require('http');
var fs		= require('fs');
// require local dependancies
var base64	= require('../../lib/base64');
var x509	= require('./x509_certtool_t').create();


var fname_priv	= "/tmp/user.priv.der";
var fname_creq	= "/tmp/user.creq.der";
var fname_cert	= "/tmp/user.cert.der";
var fname_temp	= "./certtool.template";
var fname_capriv= "/tmp/user.capriv.der";
var fname_cacert= "/tmp/user.cacert.der";
var fname_catemp= "./certtool.template";

http.createServer(function(req, res) {
	console.dir(req);	
	//console.dir(res);
	//res.writeHead(200, {'Content-Type': 'text/plain'});
	//res.end('Hello World\n');
	var url	= require('url').parse(req.url);
	
	console.dir(url);
	if( url.pathname == "/register" && req.method == "POST" ){
		var query_vars	= {};
		// parse the url query
		var url		= require('url').parse(req.url);
		console.dir(url.query.split("&").forEach(function(item){
			var keyval	= item.split('=');
			query_vars[keyval[0]]	= keyval[1];
		}));
		console.dir(query_vars);
		// extract creq_data
		console.assert(query_vars.creq);
		if(true){
			// send the cert_base64 back to client
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write(base64.encode('prout'));
			res.end();
		}
		if(false){
			var creq_base64	= query_vars.creq;
			var creq_data	= base64.decode_safe(creq_base64);
			// write the cert request in a file
			fs.writeFileSync(fname_creq, creq_data, 'binary');
			// generate the x509 certificate
			x509.cert_generate(fname_capriv, fname_cacert, fname_catemp, fname_creq, fname_cert, function(){
				// read cert file
				var cert_data	= fs.readFileSync(fname_cert);
				var cert_base64	= base.encode(cert_data);
				// send the cert_base64 back to client
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.write(cert_base64);
				res.end();
			})
		}
	}else{
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('hello World\n')
		res.end();
	}
	
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');