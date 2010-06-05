var neoip	= require('./neoip');
var sys		= require('sys');

neoip.discover_app("casti", function(version, strerror){
	// TODO what about the port ?
	sys.puts("version:"+version);
	sys.puts("strerror:"+strerror);
});
