
neoip	= {a:3}

require("./neoip_app_detect_web");


// discover neoip-oload and act depending on its presence or not
neoip.discover_app("oload", function(root_url, version){
	console.log("root_url " + root_url + " version "+ version);
}, function(error){
	console.log("error", error)
})
