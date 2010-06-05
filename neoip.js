var sys		= require('sys');
var http	= require('http');
var assert	= require('assert');


var probe = function(apps_suffix, host, port, method_name, success_cb, failure_cb){
	var path	= "/neoip_"+apps_suffix+"_appdetect_jsrest.js?method_name="+method_name;
	var client	= http.createClient(port, host);
	// bind error cases at the socket level
	// - REPORT: to report bug, "error" is reported twice
	// - REPORT: "error" is not in the doc
	// - REPORT: is there a parameter to this callback, it doesnt seems to be
	if(failure_cb){
		// KLUDGE: workaround because node.js report twice the error
		var reported	= false;
		client.addListener("error"	, function(had_error){
			if( !reported )	failure_cb(had_error)
			reported	= true;
		});
	}
	//if(failure_cb)	client.addListener("error"	, failure_cb);
	//if(failure_cb)	client.addListener("timeout"	, failure_cb);
	var request	= client.request('GET', path, {'host': host});
	request.addListener('response', function(response){
		sys.puts('STATUS: ' + response.statusCode);
		sys.puts('HEADERS: ' + JSON.stringify(response.headers));
		// Handle faillure at http level
		if(response.statusCode != 200){
			if(failure_cb)	failure_cb(new Error("http statuscode="+response.statuscode));
			return
		}
		response.setEncoding('utf8');
		response.addListener('data', function( reply_json ){
			sys.puts('BODY: ' + reply_json);
			// TODO: make this jsrest.js able to answer jsonp.
			// - if obj_id=present, then use it to define the variable
			// - if callback=present, then use it to support jsonp
			// - if none is present, just reply the json
			// TODO: fix json. the keys of the object MUST have double-quotes
			//chunk	= 'neoip_xdomrpc_script_reply_var_123 = {"fault": null, "returned_val": "0.0.1"};';
			// REPORT: JSON.parse(' {};'); hangs in node-console
			// get data from the chunk
			//var reply_json	= chunk.match(/=(.*);/)[1];
			var reply_data	= JSON.parse(reply_json);
			sys.puts('bla='+sys.inspect(reply_data));
			var returned_val= reply_data['returned_val'];
			success_cb(returned_val);
		});
	});
	request.end();
};

/**
 * Constant informations about applications
*/
var app_infos	= {
	"oload": {
		"port_beg": 4550,
		"port_end": 4553
	},
	"casto": {
		"port_beg": 4560,
		"port_end": 4563
	},
	"casti": {
		"port_beg": 4570,
		"port_end": 4573
	}
};

/**
 *
 * @param {String} app_suffix the neoip application suffix
 * @param {function} callback called to notify the result to the caller callback(version, strerror)
*/
exports.discover_app	= function(app_suffix, callback){
	// sanity check
	assert.ok(callback);
	assert.ok(app_suffix == "oload" || app_suffix == "casti" || app_suffix == "casto");
	// get info from app_infos
	var port_beg	= app_infos[app_suffix]["port_beg"];
	var port_end	= app_infos[app_suffix]["port_end"];
	var port_cur	= port_beg;
	// define the callbacks
	var success_cb	= function(version){
		callback(version, null);		
	};
	var failure_cb	= function(had_error){
		sys.puts('port_cur='+port_cur);
		if(port_cur == port_end){
			// report "not found" when all port has been tested
			callback(null, "not found");
		}else{
			// test the next port
			port_cur++;
			probe(app_suffix, "127.0.0.1", port_cur, "probe_apps", success_cb, failure_cb);
		}
	};
	// start the probbing
	probe(app_suffix, "127.0.0.1", port_cur, "probe_apps", success_cb, failure_cb);
}
