var sys		= require('sys');
var http	= require('http');
var assert	= require('assert');


var probe = function(apps_suffix, host, port, method_name, success_cb, failure_cb){
	var path	= "/neoip_"+apps_suffix+"_appdetect_jsrest.js?method_name="+method_name;
	var client	= http.createClient(port, host);
	// if callback are not specified, use a dummy one
	if(!success_cb)	success_cb = function(){};
	if(!failure_cb)	failure_cb = function(){};
	// bind error cases at the socket level
	client.addListener("error"	, failure_cb);
	client.addListener("timeout"	, failure_cb);
	// create the request
	var request	= client.request('GET', path, {'host': host});
	request.addListener('response', function(response){
		//sys.puts('STATUS: ' + response.statusCode);
		//sys.puts('HEADERS: ' + JSON.stringify(response.headers));
		// Handle faillure at http level
		if(response.statusCode != 200){
			failure_cb(new Error("http statuscode="+response.statuscode));
			return
		}
		response.setEncoding('utf8');
		response.addListener('data', function( reply_json ){
			//sys.puts('BODY: ' + reply_json);
			// REPORT: JSON.parse(' {};'); hangs in node-console
			// get data from the chunk
			var reply_data	= JSON.parse(reply_json);
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
exports.discover_app	= function(app_suffix, success_cb, failure_cb){
	// sanity check
	assert.ok(success_cb);
	assert.ok(app_suffix == "oload" || app_suffix == "casti" || app_suffix == "casto");
	// if callback are not specified, use a dummy one
	if(!failure_cb)	failure_cb = function(){};
	// get info from app_infos
	var port_beg	= app_infos[app_suffix]["port_beg"];
	var port_end	= app_infos[app_suffix]["port_end"];
	var port_cur	= port_beg;
	// define the callbacks
	var probe_succ_cb	= function(version){
		//sys.puts("found version "+version+" port_cur="+port_cur);
		var root_url	= "http://127.0.0.1:"+port_cur;
		success_cb(root_url, version);		
	};
	var probe_fail_cb	= function(had_error){
		//sys.puts('not found port_cur='+port_cur);
		if(port_cur == port_end){
			// report "not found" when all port has been tested
			failure_cb("not found");
		}else{
			// test the next port
			port_cur++;
			probe(app_suffix, "127.0.0.1", port_cur, "probe_apps", probe_succ_cb, probe_fail_cb);
		}
	};
	// start the probbing
	probe(app_suffix, "127.0.0.1", port_cur, "probe_apps", probe_succ_cb, probe_fail_cb);
}
