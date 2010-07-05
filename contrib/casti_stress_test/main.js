#!/usr/bin/env node
// initial version of casti/casto tester
/**
 * TODO
 * - make a casti_ctrl_t
 * - make a url builder for casto
 * - potentially a casto_bwlimiter_t
*/


// url for casto "http://localhost:4560/a761ce3a/superstream"

var sys		= require('sys');

var rpc_call	= require('../../lib/neoip_rpc').rpc_call;

// start the probbing
var call_url	= "http://localhost:4550/neoip_oload_appdetect_jsrest.js";
call_url	= "http://localhost:4570/neoip_casti_ctrl_wpage_jsrest.js";


var mdata_srv_uri	= "http://localhost/~jerome/neoip_html/cgi-bin/cast_mdata_echo_server.fcgi";
var cast_name		= "superstream"
var cast_privtext	= "supersecret"
var scasti_uri		= "http://127.0.0.1:8124"
var scasti_mod		= "raw"
var http_peersrc_uri	= ""
var web2srv_str		= "dummyuserdata"

if( process.argv[1] == __filename ){
	rpc_call(call_url, "request_stream", mdata_srv_uri, cast_name, cast_privtext, scasti_uri, scasti_mod, http_peersrc_uri, web2srv_str, function(returned_val){
		console.log("succeed");	
		console.log(sys.inspect(returned_val));
	}, function(){
		console.log("failed");
	});
}