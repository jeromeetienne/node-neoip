var webpeer	= require('./webpeer');
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

webpeer.monitor(function(){
	console.log("avail="+webpeer.avail());
	//console.log("url is " + webpeer.url("http://example.com/file.ext"));
})

