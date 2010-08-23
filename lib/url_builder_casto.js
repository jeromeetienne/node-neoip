/**
 * Create an url for neoip-casto
 * - opts.base_url	: casto base_url	(REQUIRED)
 * - opts.cast_privhash	: cast_privhash		(REQUIRED)
 * - opts.cast_name	: cast_name		(REQUIRED)
 * - opts.mdata_srv_uri	: url of the nameserver (OPTIONAL)
 *
 * - NOTE: no detection of the neoip-casto apps is done
 *
 * @return {string} the url for the stream out of neoip-casto
*/
var create = function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// copy ctor_opts + set default values if needed
	var base_url		= ctor_opts.base_url		|| console.assert(false);
	var cast_privhash	= ctor_opts.cast_privhash	|| console.assert(false);
	var cast_name		= ctor_opts.cast_name		|| console.assert(false);
	var mdata_srv_uri	= ctor_opts.mdata_srv_uri	|| null;
	// build the url
	var url	= base_url + "/" + cast_privhash + "/" + cast_name;
	// add mdata_srv_uri if any
	if( mdata_srv_uri )	url	+= "?mdata_srv_uri=" + escape(mdata_srv_uri);
	// return the just built url
	return url;
}

// export it via commonjs
exports.create	= create;
