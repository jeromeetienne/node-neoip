var neoip	= require('./neoip');
var sys		= require('sys');

var probe_one	= function(app_suffix, completed_cb){
	neoip.discover_app(app_suffix, function(root_url, version){
		sys.puts(app_suffix+"-"+version+" found at "+root_url);
		if( completed_cb )	completed_cb();
	}, function(reason){
		sys.puts(app_suffix+" not found");
		if( completed_cb )	completed_cb();
	})
}

probe_one("oload", function(){
	probe_one('casto', function(){		
		probe_one('casti');
	});
})
