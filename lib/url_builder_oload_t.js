// import required modules
var collection	= require('./collection').collection;
var base64	= require('./base64').base64;

/**
 * Build url for neoip-oload
 * * TODO make a sanity check a LOT more powerfull
 * ** important to debug caller
*/
var url_builder_oload_t	= function(nested_uri_str){
	var _col	= new collection();
	
	var outter_uri	= function(val){ _col.set('outter_uri'	, val); }
	var inner_uri	= function(val){ _col.set('inner_uri'	, val); }
	var outter_var	= function(key, val){ return _col.set('outter_var/'+key, val);	}
	var minner_var	= function(key, val){ return _col.set('minner_var/'+key, val);	}
	var dupuri	= function(val){
				for(var i = 0; ; i++){
					var key	= "outter_var/dupuri/"+i;
					if( _col.has(key) ) continue;
					_col.set(key, val);
					break;
				}
			}
	
	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	//			Checker function
	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	
	/** \brief throw an exception is this object is not considered sane 
	 */
	var _is_sane_internal	= function() {
		if( !_col.has("outter_uri") )	throw new Error("No outter_uri");
		if( !_col.has("inner_uri") )	throw new Error("No inner_uri");
		
		// TODO do all the sanity check here
		// - if subfile_level exist, a subfile_path MUST too
		// - subfile_path MUST always start with '/'
		// - if 'type' check the value is a legal one
		// - if 'mod' check the value is a legal one
		// - for dupuri and http_peersrc_uri, it MUST start by 'http://'
	}
	
	/** \brief If this object is considered sane, return true. false otherwise
	 */
	var is_sane	= function(){
		try {
			// call the version with exception
			_is_sane_internal();
		}catch(error) {
			console.log("url_builder_oload_t not sane due to " + error);
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
	var to_string	= function(){
		// some functions pointer for configuration
		//var url_encode_safe	= neoip_base64.encode_safe;
		var _url_encode_safe	= base64.encode_safe;
		var _url_decode_safe	= base64.decode_safe;
		//var url_doscramble	= neoip.core.doscramble_uri;
		var _url_doscamble	= function(url){ return url; }
		// define local variables
		var result	= "";
		// sanity check - the object MUST be sane
		console.assert( is_sane() );
// neoip-url inner_uri
// outter_uri = discovered
// inner_uri  = from cmdline
// --outter_var/-o	key=val
// --minner_var/-i	key=val
//------------------
// --mode/-m		alias for outter_var/mod
// --dupuri/-d  	alias for outter_var/dupuri
// --path/-p		alias for outter_var/subfile_path
// --type/-t		alias for outter_var/link_type

// {{outter_uri}}/{{mod}}/(*{{outter_var_key}}*{{outter_var_val}}/)*
// /{{inner_uri}}(?@)neoip_metavar_{{minner_var_key}}=#{{minner_var_val}}

		// start building the nested_uri
		result	+= _col.get('outter_uri') + "/";
		
		// put the 'mod' variable first
		if( _col.has('outter_var/mod') )	result += _col.get('outter_var/mod') + "/";
	
		// put all the outter variables
		for(var key in _col.get_dfl('outter_var', {}) ){
			// skip key equal to dupuri/subfile_path, they are handled separatly
			if( key == 'dupuri' )		continue;
			if( key == 'subfile_path' )	continue;
			if( key == 'mod' )		continue;
			// put the key of the variable
			result	+= "*" + key + "*";
			// get the value
			var val	= _col.get('outter_var/'+key);
			// http_peersrc_uri is specific - values are encoded in base64-urlsafe
			if( key == "http_peersrc_uri" )	val = url_encode_safe(val)
			// put the values according to the keys
			result	+= val;
			// add the separator
			result	+= "/";
		}
		
		// handle outter_var/subfile_path, aka insert the dynamic outter_var subfile_level
		if( _col.has('outter_var/subfile_path') ){
			var subfile_path	= _col.get('outter_var/subfile_path');
			var subfile_level	= subfile_path.split("/").length - 1;	// put the key of the variable
			// add the subfile_level as outter_var in result
			result	+= "*subfile_level*"+subfile_level+'/';
		}
		
		// put all the dupuri with value in base64-urlsafe encoding
		for(var dupuri_idx in _col.get_dfl('outter_var/dupuri', {})){
			result	+= "*dupuri*";
			result	+= _url_encode_safe(_col.get('outter_var/dupuri/'+dupuri_idx));
			result	+= "/";
		}
	
		// put the inner_uri at the end
		// - made complex by the need to put the m_subfile_path between the 
		//   path and the query part of the inner_uri
		var inner_uri	= _col.get('inner_uri');
		var has_subfile	= _col.has('outter_var/subfile_path')
		var subfile_path= _col.get_dfl("outter_var/subfile_path", null);
		var query_pos	= inner_uri.indexOf("?");
		if( query_pos != -1 )	result	+= inner_uri.substr(0, query_pos);
		else			result	+= inner_uri;
		if( subfile_path )	result	+= subfile_path
		if( query_pos != -1 )	result	+= inner_uri.substr(query_pos, inner_uri.length);
	
		// put all the inner variables aka "neoip_metavar_"
		for(var key in _col.get_dfl('minner_var', {}) ){
			// put the variable separator
			result	+= result.indexOf('?') == -1 ? "?" : "&";
			// put the key of the variable
			result	+= 'neoip_metavar_' + key + "=" + escape(_col.get('minner_var/'+key));
		}
		
		// scramble the result
		result	= _url_doscamble(result);
		// return the just built nested_uri
		return result;
	}

	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	//			from_string() function
	////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////
	/**
	 * Parse a string and set _col with it
	*/
	var from_string	= function(from_str){
		// some functions pointer for configuration
		//var url_decode_safe	= neoip_base64.decode_safe;
		var _url_decode_safe	= base64.decode_safe;
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
				if( key != "dupuri" )	_col.set('outter_var/'+key, val);
				else			dupuri(_url_decode_safe(val));
			}else if( last_level == "raw" || last_level == "flv" ){
				// if last_level is a outter_var/mod
				_col.set('outter_var/mod', last_level)
			}else {
				// if last_level is not recognized, leave the loop
				break;
			}
			// consume in nleft_str
			nleft_str	= nleft_str.substr(0, nleft_str.lastIndexOf('/'));
		}
		// set "outter_uri" - what remains in nleft_str is 'outter_uri'
		_col.set("outter_uri", nleft_str);
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
				_col.set("minner_var/"+minner_key, val);
			}
			// consume the query part of the nright_str
			nright_str	= nright_str.substr(0, nright_str.lastIndexOf('?'));
		}
		// if outter_var/subfile_level is present, handle it here
		if( _col.has('outter_var/subfile_level') ){
			var subfile_level	= _col.get('outter_var/subfile_level');
			// find the begining of the subfile_path
			var pos 		= null;
			for(var i = 0; i < subfile_level; i++){
				if( pos )	pos = nright_str.lastIndexOf('/', pos-1);
				else		pos = nright_str.lastIndexOf('/');
			}
			// extract the subfile_path
			var subfile_path	= nright_str.substr(pos);
			_col.set("outter_var/subfile_path"	, subfile_path);
			// delete outter_var/subfile_level
			_col.del("outter_var/subfile_level");
			// consume the subfile_path
			nright_str	= nright_str.substr(0, pos);
		}
		// generate the inner_uri
		var inner_uri	= nright_str;
		// append actual inner variables, if there is any
		if( ainner_vars.length > 0 )	inner_uri	+= '?' + ainner_vars.join('&');
		// set inner_uri
		_col.set('inner_uri'	, inner_uri);		
	}
	
	
	// if nested_uri_str is defined, use it for building the uri
	if( nested_uri_str !== undefined )	from_string(nested_uri_str);
	
	
	// export the public function
	var returned_obj	= {
		"outter_uri"	: outter_uri,
		"inner_uri"	: inner_uri,
		"outter_var"	: outter_var,
		"minner_var"	: minner_var,
		"dupuri"	: dupuri,
		"set"		: function(key, val) { _col.set(key, val); return this;},
		"get"		: _col.get,
		"get_dfl"	: _col.get_dfl,
		"del"		: _col.del,
		"has"		: _col.has,
		"is_sane"	: is_sane,
		"to_string"	: to_string,
		"from_string"	: from_string
	}
	return returned_obj;
}


/**
 * Class method to create an object
 * - thus avoid new operator
*/
url_builder_oload_t.create	= function(ctor_opts){	return new url_builder_oload_t(ctor_opts);	}

// exports public functions
exports.url_builder_oload_t	= url_builder_oload_t;
exports.create		= url_builder_oload_t.create;
