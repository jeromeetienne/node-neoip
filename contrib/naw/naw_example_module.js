require("./naw").init(exports)({sys: "sys"}, "example_module", function(exports, require){
	require('sys').puts("testPPP");
	sys.puts("pp ok SYS passed in "+module_name);
	//console.dir(exports);
	exports.test	= function(){ console.log(module_name + ": output of exported function") }
})


/**
 * - body of module function must be unmodified nodejs code
 * - warper must be as simple as possible
*/

/**
 * CommonJS loader for browser
 * - CommonJSWebLoader
 * - cwl
*/

/**
 * Possibility without require and dependancies
*/
if(false){
	require("./naw").set(exports).declare("example_module", function(exports, require){
	});
}

/**
 * Possibility without require
 * 
*/
if(false){
	require("./naw").set(exports).declare("example_module").ensure("sys", "http").body(function(exports){
	});
}

if(false){
	require("./naw").set(exports).declare("example_module", "sys", "http", function(exports, require){
	});
}
if(false){
	require("./naw").declare("example_module", "sys", "http", exports, function(exports){
	});
}
if(false){
	require("./naw").to(exports).module("example_module", function(exports){
	});
}
