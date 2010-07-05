var sys		= require('sys');
var http	= require('http');
var assert	= require('assert');
var console	= require('./firebug').console;
/**
 * Probe an application 
*/
var rpc_call = function(call_url, method_name, success_cb, failure_cb){
	var url		= require('url').parse(call_url);
	var path	= url.pathname + "?method_name=" + method_name;
sys.puts(sys.inspect(url));
sys.puts(path);
console.log(arguments);
console.log(arguments.length);

	if(arguments.length > 4){
		for(var i = 2; i < arguments.length-2; i++){
			var val	= arguments[i];
			path	+= "&arg"+(i-2)+"=" + val;
		}
		success_cb	= arguments[arguments.length-2];
		failure_cb	= arguments[arguments.length-1];
	}

  console.log("path="+path);
	var client	= http.createClient((url.port||80), url.hostname);
	// if callback are not specified, use a dummy one
	if(!success_cb)	success_cb = function(){};
	if(!failure_cb)	failure_cb = function(){};
	// bind error cases at the socket level
	client.addListener("error"	, failure_cb);
	client.addListener("timeout"	, failure_cb);
	// create the request
	var request	= client.request('GET', path, {'host': url.host});
	request.addListener('response', function(response){
		sys.puts('STATUS: ' + response.statusCode);
		sys.puts('HEADERS: ' + JSON.stringify(response.headers));
		// Handle faillure at http level
		if(response.statusCode != 200){
			//failure_cb(new Error("http statuscode="+response.statuscode));
			//return
		}
		response.setEncoding('utf8');
		response.addListener('data', function( reply_json ){
			sys.puts('BODY: ' + reply_json);
			// get data from the chunk
			var reply_data	= JSON.parse(reply_json);
			var returned_val= reply_data['returned_val'];
			success_cb(returned_val);
		});
	});
	request.end();
};

// export it via commonjs
exports.rpc_call	= rpc_call;
