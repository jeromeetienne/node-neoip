/*
 * All the qunit test for neoip_playlist_t classes
*/
var neoip_nested_uri2_qunit	= function(){
	// define the name of the module
	module("tests for neoip_nested_uri2_t classes");
	
/**
 * TODO:
 * - put this get/set/has/del in a collection.js tool ?
*/

	/**
	 * JS Object assignment MUST be done by reference
	*/
	test('test js Object assignement made by reference', function(){
		var foo	= {};
		var bar	= foo;
		bar['slota']	= "prout";
		equals(foo['slota'], "prout", "Assignement of Object is by reference (no copy)");
	});
	
	// one test
	test("test get/set/has/del consistency", function(){
		// create the initial object
		var nested_uri	= new neoip.nested_uri2_t()
		// define all the values to test
		var testvals	= [
			[ 'outter_uri'		, "http://localhost:4550"		],
			[ 'inner_uri'		, "http://example.com/file.flv?bla=gou"	],
			[ 'outter_var/mod'	, 'flv'					],
			[ 'outter_var/dupuri/0'	, 'http://jetienne.fr'			],
		];
		// test all values
		for(var i = 0; i < testvals.length; i++ ){
			var testval	= testvals[i];
			var key		= testval[0];
			var val		= testval[1];
			equals(nested_uri.has(key), false	, key+" not present as expected");
			nested_uri.set(key	, val);
			equals(nested_uri.has(key), true	, key+" present as expected");
			equals(nested_uri.get(key), val		, key+" is properly set");
			nested_uri.del(key);
			equals(nested_uri.has(key), false	, key+" no more present after delete as expected");
		}
	});

	// one test
	test("build most basic uri", function(){
		var nested_uri	= new neoip.nested_uri2_t()
		nested_uri.outter_uri("http://localhost:4550");
		nested_uri.inner_uri("http://example.com/file.flv?bla=gou");
		equals(nested_uri.is_sane(), true	, "most basic nested_uri verified as sane");		
		// test to_string() produces what is expected
		var result	= nested_uri.to_string();
		var expected	= "http://localhost:4550/http://example.com/file.flv?bla=gou";
		equals(result, expected, "most basic properly built");		
	});

	// one test
	test("build with subfile_path", function(){
		var nested_uri	= new neoip.nested_uri2_t()
		nested_uri.outter_uri	("http://localhost:4550");
		nested_uri.inner_uri	("http://example.com/file.flv?bla=gou");
		nested_uri.set		("outter_var/subfile_path"	, "/test/file");
		var result	= nested_uri.to_string();
		var expected	= "http://localhost:4550/*subfile_level*2/http://example.com/file.flv/test/file?bla=gou";
		equals(result, expected, "properly built");		
	});
	
	test("build with dupuri", function(){
		// create the initial object
		var nested_uri	= new neoip.nested_uri2_t()
		// define all the values to test
		var keys	= [
			[ 'outter_uri'		, "http://localhost:4550"		],
			[ 'inner_uri'		, "http://example.com/file.flv?bla=gou"	],
			[ 'outter_var/mod'	, 'flv'					],
			[ 'outter_var/dupuri/0'	, 'http://jetienne.fr'			],
		];
		var expected	= "http://localhost:4550/flv/*dupuri*aHR0cDovL2pldGllbm5lLmZy/http://example.com/file.flv?bla=gou"
		// test all values
		for(var i = 0; i < keys.length; i++ )	nested_uri.set(keys[i][0], keys[i][1]);
		var result	= nested_uri.to_string();
		var expected	= "http://localhost:4550/flv/*dupuri*aHR0cDovL2pldGllbm5lLmZy/http://example.com/file.flv?bla=gou"
		equals(result, expected, "properly built");
		// test self consistency parse/build
		var result	= (new neoip.nested_uri2_t(result)).to_string();
		equals(result, expected, "parse/build self consistent with dupuri");
	});

	// one test
	test("build with outter_var/mod", function(){
		var nested_uri	= new neoip.nested_uri2_t()
		nested_uri.outter_uri	("http://localhost:4550");
		nested_uri.inner_uri	("http://example.com/file.flv?bla=gou");
		nested_uri.set		("outter_var/mod"	, "flv");
		console.log("nested_uri=%s", nested_uri.to_string());
		var result	= nested_uri.to_string();
		var expected	= "http://localhost:4550/flv/http://example.com/file.flv?bla=gou";
		equals(result, expected, "properly built");		
	});

	/**
	 * parse/build consistency
	*/
	test('parse/build consistency', function(){
		// define all the values to test
		var testvals	= [
			"http://localhost:4550/flv/*subfile_level*2/http://example.com/file.flv/test/file?bla=gou",
			"http://localhost:4550/raw/http://example.com/file?bla=gou&foo=bar&neoip_metavar_prout=slota",
		];
		for(var i = 0; i < testvals.length; i ++){
			var expected	= testvals[i];
			var nested_uri	= new neoip.nested_uri2_t(expected);
			var result	= nested_uri.to_string();
			equals(result, expected, "self consistant nested uri "+expected);			
		}
	});
}
