var collection	= require('./collection').collection;
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


console.log("Testing collection Started");	
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
console.log("Testing collection Done");	
