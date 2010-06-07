var neoip	= require('./neoip');
var sys		= require('sys');
var base64	= require('./base64').base64;


if(true){
	var origin	= "slota";
	var encoded	= base64.encode_safe(origin);
	var decoded	= base64.decode_safe(encoded);
	console.log("origin="+origin);
	console.log("encoded="+encoded);
	console.log("decoded="+decoded);
	
}


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
if(false){
	neoip.discover_webpack(function(status){
		sys.puts("status="+status);
		//sys.log(sys.inspect(neoip.disc_app_cache));
	})
}