

var casto_testclient_t	= function(opts, event_cb){
	// alias some variables to ease readability
	var base_url		= opts.base_url;
	var cast_privhash	= opts.cast_privhash;
	var cast_name		= opts.cast_name;
	
	
	var url_str		= base_url + "/" + cast_privhash + "/" + cast_name;
	
	var url		= require('url').parse(url_str);
	var client	= http.createClient((url.port||80), url.hostname);
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
	
}


//////////////////////////////////////////////////////////////////////////////////
//	main programm								//
//////////////////////////////////////////////////////////////////////////////////
if( process.argv[1] == __filename ){
	var opts	= {}
	var event_cb	= function(){}
	var client	= new casto_testclient_t(opts, event_cb);
}