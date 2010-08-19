/**
 * http proxy which webpeer content which looks like static files
 *
 * - run with:
 *   node webpeer-http-proxy.js
 * - on ubuntu, setup http proxy with:
 *   export http_proxy=http://127.0.0.1:8080
 * - use with
 *   mplayer http://example.com/movie.mp4
 * 
 * - initial proxy code from Peteris Krumins (peter@catonmat.net)
 *   - http://www.catonmat.net  --  good coders code, great reuse
*/

// include system dependancies
var http	= require('http');
var url_module	= require('url');
// include local dependancies
var webpeer	= require('../../lib/webpeer')


/**
 * The file extensions to route thru webpeer
*/
var webpeer_extnames	= ['.webm', '.mp4', '.avi', '.mp3', '.ogg'];

/**
 * Callback for http_server
 * - it handles the proxying itself
*/
function http_server_cb(request, response) {
	// extract path extname for the request url
	var req_url		= request.url;
	var url_pathname	= require('url').parse(req_url).pathname;
	var url_extname		= require('path').extname(url_pathname);
	// if webpeer is present and requested url got a extension to reroute
	var webpeer_it	= webpeer.present() && webpeer_extnames.indexOf(url_extname) != -1;
	if( webpeer_it ){
		req_url		= webpeer.url(req_url);
	}
	// log the event
	var msg	= request.connection.remoteAddress + ": " + request.method + " " + request.url;
	msg	+= " ("+ (webpeer_it ? "thru": 'without') + ' webpeer)';
	console.log(msg);
	// normal http proxying
	var host_field		= require('url').parse(req_url).host.split(':');
	var proxy		= http.createClient(host_field[1] || 80, host_field[0])
	var proxy_request	= proxy.request(request.method, req_url, request.headers);
	proxy_request.addListener('response', function(proxy_response) {
		proxy_response.addListener('data', function(chunk) {
			response.write(chunk, 'binary');
		});
		proxy_response.addListener('end', function() {
			response.end();
		});
		response.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
	request.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	request.addListener('end', function() {
		proxy_request.end();
	});
}

// probe webpeer present and then 
webpeer.ready(function(){
	// launch http server
	console.log("Starting the proxy server on port " + 8080 + " (webpeer "+(webpeer.present() ? "present" : "not present")+")");
	http.createServer(http_server_cb).listen(8080);
});

// thus we keep monitoring webpeer
// - needed if webpeer may goes up/down during the webpeer-http-proxy lifetime
webpeer.monitor();
