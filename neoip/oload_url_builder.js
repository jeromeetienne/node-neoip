/*
 * This tool is used to build neoip-oload url
 * - step 1: discover if oload is present
 *   - potentially cache the result for speed ?
 * - step 2: if not present, return the normal url
 * - step 3: if present, build the nested url
 *
 * output the resulting url to stdout
 * - thus it is possible to do : mplayer `neoip-url http://example.org/movie.mp4`
*/

var sys		= require('sys')
var neoip	= require('./neoip');
var nested_uri_t= require('./nested_uri_t').nested_uri_t;

var inner_uri	= process.argv[2];


neoip.discover_app("oload", function(root_url, version){
	// if oload is present, output nested_uri 
	var nested_uri	= new nested_uri_t();
	nested_uri.set('outter_uri', root_url);
	nested_uri.set('inner_uri', inner_uri);
	sys.puts(nested_uri.to_string());
}, function(reason){
	// if oload is not present, output plain inner_uri
	sys.puts(inner_uri)
})


