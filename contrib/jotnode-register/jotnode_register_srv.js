
(new Buffer("xyz","utf8")).toString("base64")
var http = require('http');

http.createServer(function(req, res) {
	console.dir(req);	
	//console.dir(res);
	//res.writeHead(200, {'Content-Type': 'text/plain'});
	//res.end('Hello World\n');
	var url	= require('url').parse(req.url);
	
	console.dir(url);
	if( req.url == "/register" && req.method == "POST" ){
		var query_vars	= {};
		// parse the url query
		var url		= require('url').parse(req.url);
		console.dir(url.query.split("&").forEach(function(item){
			var keyval	= item.split('=');
			query_vars[keyval[0]]	= keyval[1];
		}));
	
	}else{
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('hello World\n')
		res.end();
	}
	
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');