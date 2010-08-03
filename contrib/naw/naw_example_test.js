
var naw = require("./naw");

naw({"exmod"	: "./naw_example_module"}, "example_test", exports, function(exports, require){
	console.log("inside naw example test");
	exmod.test();
});
