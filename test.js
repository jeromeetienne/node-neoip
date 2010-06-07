var neoip	= require('./neoip/neoip');
var sys		= require('sys');

var probe_one	= function(app_suffix, completed_cb){
	// if completed_cb is not specified, use a dummy one
	if(!completed_cb)	completed_cb	= function(){}
	neoip.discover_app(app_suffix, function(root_url, version){
		sys.puts(app_suffix+"-"+version+" found at "+root_url);
		completed_cb();
	}, function(reason){
		sys.puts(app_suffix+" not found");
		completed_cb();
	})
}

if(false){
	probe_one("oload", function(){
		probe_one('casto', function(){		
			probe_one('casti', function(){
				sys.log(sys.inspect(neoip.disc_app_cache));
			})
		});
	})
}
if( false ){
	probe_one("oload", function(){
		probe_one('oload', function(){		
			sys.log(sys.inspect(neoip.disc_app_cache));
		});
	})
}
if(true){
	neoip.discover_webpack(function(status){
		sys.puts("status="+status);
		//sys.log(sys.inspect(neoip.disc_app_cache));
	})
}