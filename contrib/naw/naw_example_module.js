var naw = require("./naw");

naw({sys: "sys"}, "example_module", exports, function(exports, require){
	require('sys').puts("testPPP");
	sys.puts("pp ok SYS passed");
	//console.dir(exports);
	exports.test	= function(){ console.log("output of exported function") }
})
