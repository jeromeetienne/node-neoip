var assert		= {
	equal	: function(result, expected, msg){
		if( result == expected ) return;
		console.log("Error: "+msg+" (result:"+JSON.stringify(result)+" expected:"+JSON.stringify(expected)+")");
	}
}
var test	= function(testname, test_cb){
	console.log("Test "+testname+" Started");
	test_cb();
	console.log("Test "+testname+" Done");		
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//		tests								//
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

var base64	= require('./base64').base64;
// one test
test("random playground", function(){
	var origin	= "slota";
	var encoded	= base64.encode_safe(origin);
	var decoded	= base64.decode_safe(encoded);
	console.log("origin="+origin);
	console.log("encoded="+encoded);
	console.log("decoded="+decoded);
	console.assert(origin==decoded);
	console.log("Testing Done");	
});
