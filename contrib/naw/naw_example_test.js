var naw = require("./naw").init(exports);

naw({"exmod"	: "./naw_example_module"}, "example_test", function(exports){
	console.log("inside naw example test");
	exmod.test();
});
