var sys		= require('sys');
var http	= require('http');
var assert	= require('assert');
var console	= require('./firebug').console;
/**
 * Probe an application 
*/
var call = function(call_url, method_name, method_args, success_cb, failure_cb){
	var url		= require('url').parse(call_url);
	var url_path	= url.pathname + "?method_name=" + method_name;
sys.puts(sys.inspect(url));
sys.puts(url_path);
console.log(arguments);
console.log(arguments.length);

	// build url_path
	for(var i = 0; i < method_args.length; i++){
		// TODO need escape ?
		url_path	+= "&arg"+i+"=" + method_args[i];
	}

  console.log("url_path="+url_path);
	var client	= http.createClient((url.port||80), url.hostname);
	// if callback are not specified, use a dummy one
	if(!success_cb)	success_cb = function(){};
	if(!failure_cb)	failure_cb = function(){};
	// bind error cases at the socket level
	client.addListener("error"	, failure_cb);
	client.addListener("timeout"	, failure_cb);
	// create the request
	var request	= client.request('GET', url_path, {'host': url.host});
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
	
	/**
	 * Public function to stop the call
	*/
	var destroy	= function(){
		console.log("Stop neoip rpc call");
		// TODO
	}
	
	return {
		destroy:	destroy
	}
};

// export it via commonjs
exports.call	= call;
