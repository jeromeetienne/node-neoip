var assert		= {
	equal	: function(result, expected, msg){
		if( result == expected ) return;
		console.log("Error: "+msg+" (result:"+JSON.stringify(result)+" expected:"+JSON.stringify(expected)+")");
	},
	ok	: function(result, msg){
		console.assert(result, msg);
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

var collection	= require('collection').collection;

// one test
test("random playground", function(){
	var key	= "foo";
	var val	= "bar"
	var col	= new collection();
	console.assert( ! col.has(key) );
	console.assert( col.get_dfl(key)		== undefined );
	console.assert( col.get_dfl(key, "bar2")	== "bar2" );
	col.set(key, val);
	console.assert( col.has(key) );
	console.assert( col.get(key)	== val );
	col.del(key);
	console.assert( ! col.has(key) );
});
