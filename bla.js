var neoip	= require('./neoip');
var sys		= require('sys');

neoip.discover_app("oload", function(version, strerror){
	sys.puts("version:"+version);
	sys.puts("strerror:"+strerror);
});
