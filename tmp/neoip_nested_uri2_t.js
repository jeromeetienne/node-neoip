/*! \file
    \brief Definition of the nested_uri2_t

\par Brief Description
nested_uri2_t is a class to help build neoip-oload nested uri.

*/

// defined the namespace if not yet done
if( typeof neoip == 'undefined' )	var neoip	= {};


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//			ctor/dtor
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** \brief Constructor
 * 
 * @param nested_uri_str {string} nested uri string to parse
 */
neoip.nested_uri2_t = function(nested_uri_str)
{
	// zero some values
	this.m_map	= {};
	// if nested_uri_str is defined, use it for building the uri
	if( typeof nested_uri_str != "undefined" )	this.from_string(nested_uri_str);
}

/** \brief Destructor
 */
neoip.nested_uri2_t.prototype.destructor	= function()
{
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//			action function
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

neoip.nested_uri2_t.prototype._parse_key	= function(key, non_exist_callback)
{
	// parse the key into parts
	var key_parts	= key.split("/");
	// goto the proper submap (and create it if needed)
	var submap	= this.m_map;
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
}

/**
 * Set the variable namespace/key to the value val
 */
neoip.nested_uri2_t.prototype.set	= function(key, val)
{
	// parse the key
	var parsed_key	= this._parse_key(key, function(submap, subkey){
		// if this subkey is not present in submap, create an empty object
		submap[subkey]	= {}
	});
	// set this value in the last submap
	parsed_key.submap[parsed_key.subkey]	= val;
}

/**
 * Return the value of the variable namespace/key (note: it MUST be defined)
*/
neoip.nested_uri2_t.prototype.get	= function(key)
{
	// sanity check - the key MUST be present
	console.assert( this.has(key) );
	// parse the key
	var parsed_key	= this._parse_key(key, function(submap, subkey){
		// if this subkey is not present in submap, notify an exception
		throw new Error('subkey '+subkey+' (from key '+key+') doesnt exist');
	});
	// get this value in the last submap
	var val	= parsed_key.submap[parsed_key.subkey];
	// return this val
	return val;
}

/**
 * delete this key (note: it MUST be defined)
*/
neoip.nested_uri2_t.prototype.del	= function(key)
{
	// sanity check - the key MUST be present
	console.assert( this.has(key) );
	// parse the key
	var parsed_key	= this._parse_key(key, function(submap, subkey){	
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
neoip.nested_uri2_t.prototype.has	= function(key)
{
	// parse the key
	var parsed_key	= null;
	// TODO i could avoid the exception by doing closure on parsed_key ?
	try {
		parsed_key	= this._parse_key(key, function(submap, subkey){
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

neoip.nested_uri2_t.prototype.get_default	= function(key, dfl){ return this.has(key) ? this.get(key) : dfl; }

// shortcuts
neoip.nested_uri2_t.prototype.outter_uri	= function(val){ this.set('outter_uri'	, val); }
neoip.nested_uri2_t.prototype.inner_uri		= function(val){ this.set('inner_uri'	, val); }

neoip.nested_uri2_t.prototype.outter_var	= function(key, val){ return this.set('outter_var/'+key, val);	}
neoip.nested_uri2_t.prototype.minner_var	= function(key, val){ return this.set('minner_var/'+key, val);	}
neoip.nested_uri2_t.prototype.dupuri		= function(val){
							for(var i = 0; ; i++){
								var key	= "outter_var/dupuri/"+i;
								if( this.has(key) ) continue;
								this.set(key, val);
								break;
							}
						}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//			Internal function
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** \brief throw an exception is this object is not considered sane 
 */
neoip.nested_uri2_t.prototype._is_sane_internal	= function()
{
	if( !this.has("outter_uri") )	throw new Error("No outter_uri");
	if( !this.has("inner_uri") )	throw new Error("No inner_uri");
	
	// TODO do all the sanity check here
	// - if subfile_level exist, a subfile_path MUST too
	// - subfile_path MUST always start with '/'
	// - if 'type' check the value is a legal one
	// - if 'mod' check the value is a legal one
	// - for dupuri and http_peersrc_uri, it MUST start by 'http://'
}

/** \brief If this object is considered sane, return true. false otherwise
 */
neoip.nested_uri2_t.prototype.is_sane	= function()
{
	try {
		// call the version with exception
		this._is_sane_internal();
	}catch(error) {
		console.log("nested_uri_t not sane due to " + error);
		return	false;		
	}
	// if all previous tests passed, this is considered sane
	return true;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//			to_string() function
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** \brief return a string of the nested_uri
 */
neoip.nested_uri2_t.prototype.to_string	= function()
{
	var	result	= "";
	// sanity check - the object MUST be sane
	console.assert( this.is_sane() );

	// start building the nested_uri
	result	+= this.get('outter_uri') + "/";
	
	// put the 'mod' variable first
	if( this.has('outter_var/mod') )	result += this.get('outter_var/mod') + "/";

	// put all the outter variables
	for(var key in this.get_default('outter_var', {}) ){
		// skip key equal to dupuri/subfile_path, they are handled separatly
		if( key == 'dupuri' )		continue;
		if( key == 'subfile_path' )	continue;
		if( key == 'mod' )		continue;
		// put the key of the variable
		result	+= "*" + key + "*";
		// get the value
		var val	= this.get('outter_var/'+key);
		// http_peersrc_uri is specific - values are encoded in base64-urlsafe
		if( key == "http_peersrc_uri" )	val = neoip_base64.encode_safe(val)
		// put the values according to the keys
		result	+= val;
		// add the separator
		result	+= "/";
	}
	
	// handle outter_var/subfile_path, aka insert the dynamic outter_var subfile_level
	if( this.has('outter_var/subfile_path') ){
		var subfile_path	= this.get('outter_var/subfile_path');
		var subfile_level	= subfile_path.split("/").length - 1;		// put the key of the variable
		// add the subfile_level as outter_var in result
		result	+= "*subfile_level*"+subfile_level+'/';
	}
	
	// put all the dupuri with value in base64-urlsafe encoding
	for(var dupuri_idx in this.get_default('outter_var/dupuri', {})){
		result	+= "*dupuri*";
		result	+= neoip_base64.encode_safe(this.get('outter_var/dupuri/'+dupuri_idx));
		result	+= "/";
	}

	// put the inner_uri at the end
	// - made complex by the need to put the m_subfile_path between the 
	//   path and the query part of the inner_uri
	var inner_uri	= this.get('inner_uri');
	var has_subfile	= this.has('outter_var/subfile_path')
	var subfile_path= this.get_default("outter_var/subfile_path", null);
	var	query_pos		 = inner_uri.indexOf("?");
	if( query_pos != -1 )	result	+= inner_uri.substr(0, query_pos);
	else			result	+= inner_uri;
	if( subfile_path )	result	+= subfile_path
	if( query_pos != -1 )	result	+= inner_uri.substr(query_pos, inner_uri.length);

	// put all the inner variables aka "neoip_metavar_"
	for(var key in this.get_default('minner_var', {}) ){
		// put the variable separator
		result	+= result.indexOf('?') == -1 ? "?" : "&";
		// put the key of the variable
		result	+= 'neoip_metavar_' + key + "=" + escape(this.get('minner_var/'+key));
	}
	
	// scramble the result
	result	= neoip.core.doscramble_uri(result);
	// return the just built nested_uri
	return result;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//			from_string() function
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/** \brief return a string of the nested_uri
 */
neoip.nested_uri2_t.prototype.from_string	= function(/* string */from_str)
{
	// initialisation of nleft_str/nright_str from nested_str
	var nested_str	= from_str;
	var nleft_str	= nested_str.substr(0, from_str.indexOf('/http:/'));
	var nright_str	= nested_str.substr(from_str.indexOf('/http:/')+1);
	// Process outter_var: consume all the outter_var in nleft_str (outter_var/mod included)
	while( true ){
		// extract last_level from nleft_str
		var last_level	= nleft_str.substr(nleft_str.lastIndexOf('/')+1);
		// if last_level is a normally encoded outter_var
		if( last_level.substr(0, 1) == '*' ){
			var matches	= last_level.match(/\*(.+)\*(.+)$/);
			var key		= matches[1];
			var val		= matches[2];
			if( key != "dupuri" )	this.set('outter_var/'+key, val);
			else			this.dupuri(neoip_base64.decode_safe(val));
		}else if( last_level == "raw" || last_level == "flv" ){
			// if last_level is a outter_var/mod
			this.set('outter_var/mod', last_level)
		}else {
			// if last_level is not recognized, leave the loop
			break;
		}
		// consume in nleft_str
		nleft_str	= nleft_str.substr(0, nleft_str.lastIndexOf('/'));
	}
	// set "outter_uri" - what remains in nleft_str is 'outter_uri'
	this.set("outter_uri", nleft_str);
	// declare the 'actual inner uri variables' array
	var ainner_vars	= [];
	// if the right part contains variables, process them to extract minner_vars
	if( nright_str.lastIndexOf('?') != -1 ){
		var search_str	= nright_str.substr(nright_str.lastIndexOf('?')+1);
		var keyval_arr	= search_str.split("&");
		// go thru each variable
		for(var i = 0; i < keyval_arr.length; i++ ){
			var keyval	= keyval_arr[i].split("=");
			var key		= keyval[0];
			var val		= keyval[1];
			// if this key is not a minner_var, simply copy it in ainner_vars
			if( key.indexOf("neoip_metavar_") != 0 ){
				ainner_vars.push(keyval_arr[i]);
				continue
			}
			var minner_key	= key.substr("neoip_metavar_".length);
			this.set("minner_var/"+minner_key, val);
		}
		// consume the query part of the nright_str
		nright_str	= nright_str.substr(0, nright_str.lastIndexOf('?'));
	}
	// if outter_var/subfile_level is present, handle it here
	if( this.has('outter_var/subfile_level') ){
		var subfile_level	= this.get('outter_var/subfile_level');
		// find the begining of the subfile_path
		var pos 		= null;
		for(var i = 0; i < subfile_level; i++){
			if( pos )	pos = nright_str.lastIndexOf('/', pos-1);
			else		pos = nright_str.lastIndexOf('/');
		}
		// extract the subfile_path
		var subfile_path	= nright_str.substr(pos);
		this.set("outter_var/subfile_path"	, subfile_path);
		// delete outter_var/subfile_level
		this.del("outter_var/subfile_level");
		// consume the subfile_path
		nright_str	= nright_str.substr(0, pos);
	}
	// generate the inner_uri
	var inner_uri	= nright_str;
	// append actual inner variables, if there is any
	if( ainner_vars.length > 0 )	inner_uri	+= '?' + ainner_vars.join('&');
	// set inner_uri
	this.set('inner_uri'	, inner_uri);
}