var neoip	= require('./neoip');
var sys		= require('sys');

var disc	= function(app_suffix, callback){
	return 
}

var app_suffix	= "oload";
neoip.discover_app(app_suffix, function(root_url, version){
	sys.puts(app_suffix+"-"+version+" found at "+root_url);
}, function(reason){
	sys.puts(app_suffix+" not found");
});