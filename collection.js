var sys		= require('sys');
var console	= require('./firebug').console;

var collection	= function(){
	// define private variables
	var _map	= {}
	
	var _parse_key	= function(key, non_exist_callback){
		// parse the key into parts
		var key_parts	= key.split("/");
		// goto the proper submap (and create it if needed)
		var submap	= _map;
		var subkey	= key_parts[0]
		for(var i = 0; i < key_parts.length - 1; i++){
			// if this subkey is not present in submap, notify an exception
			if( typeof submap[subkey] == 'undefined' )	non_exist_callback(submap, subkey);
			// goto the next submap
			submap	= submap[subkey];
			subkey	= key_parts[i+1];
		}
		// return the result
		return {
			'submap': submap,
			'subkey': subkey
		};
	};
	
	/**
	 * Set the variable namespace/key to the value val
	 */
	var set	= function(key, val) {
		// parse the key
		var parsed_key	= _parse_key(key, function(submap, subkey){
			// if this subkey is not present in submap, create an empty object
			submap[subkey]	= {}
		});
		// set this value in the last submap
		parsed_key.submap[parsed_key.subkey]	= val;
	}
	/**
	 * Return the value of the variable namespace/key (note: it MUST be defined)
	*/
	var get	= function(key) {
		// sanity check - the key MUST be present
		console.assert( has(key) );
		// parse the key
		var parsed_key	= _parse_key(key, function(submap, subkey){
			// if this subkey is not present in submap, notify an exception
			throw new Error('subkey '+subkey+' (from key '+key+') doesnt exist');
		});
		// get this value in the last submap
		var val	= parsed_key.submap[parsed_key.subkey];
		// return this val
		return val;
	}
	var get_dfl	= function(key, dfl){ return has(key) ? get(key) : dfl; }

	
	/**
	 * delete this key (note: it MUST be defined)
	*/
	var del	= function(key) {
		// sanity check - the key MUST be present
		console.assert( has(key) );
		// parse the key
		var parsed_key	= _parse_key(key, function(submap, subkey){	
			// if this subkey is not present in submap, notify an exception
			throw new Error('subkey '+subkey+' (from key '+key+') doesnt exist');
		});
		// get this value in the last submap
		var val	= parsed_key.submap[parsed_key.subkey];
		// delete in the last submap
		delete parsed_key.submap[parsed_key.subkey];
	}
	
	/**
	 * Return true if this variable is defined, false otherwize
	*/
	var has	= function(key) {
		// parse the key
		var parsed_key	= null;
		// TODO i could avoid the exception by doing closure on parsed_key ?
		try {
			parsed_key	= _parse_key(key, function(submap, subkey){
				// if this subkey is not present in submap, notify an exception
				throw new Error('subkey '+subkey+' (from key '+key+') doesnt exist');
			});
		}catch(error) {
			// return false now, if the key cant be parsed
			return	false;		
		}
		// if this subkey is not present in submap, notify an exception
		if( typeof parsed_key.submap[parsed_key.subkey] == 'undefined' ) return false;
		// if all previous tests passed, return true
		return true;
	}
	
	return {
		"set"		: set,
		"get"		: get,
		"get_dfl"	: get_dfl,
		"del"		: del,
		"has"		: has
	}
};

// export it via commonjs
exports.collection	= collection;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//	Main program - for unit testing
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

if( module === require.main ){
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
}





