// declare neoip namespace
var neoip	= neoip || {};

/**
 * a serial to uniquely define a given call
*/
neoip.jsonp_call_counter	= 0;

/**
 * do a jsonp call
 * - NOTE: needed because jquery getJSON is not able to handle failure_cb
*/
neoip.jsonp_call	= function(ctor_opts)
{
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self	= this;
	// copy ctor_opts + set default values if needed
	var url		= ctor_opts.url		|| console.assert(ctor_opts.url);
	var success_cb	= ctor_opts.success_cb	|| function(data){};
	var failure_cb	= ctor_opts.failure_cb	|| function(error){};
	
	// determine the function name
	var fct_name	= "jsonp_call_cb_"+neoip.jsonp_call_counter++;
	// sanity check - callback=? MUST be present in the url
	console.assert( /callback=\?(&|$)/.test(url) );
	// replace callback=? by fct_name
	url	= url.replace("callback=?", "callback="+fct_name);

	// create DOM elements
	// - need to do that here because closure
	var root_elem	= document.getElementsByTagName('head')[0]
	var script_elem	= document.createElement('script');
	
	// function used to cleanup after completion
	var cleanup	= function(){
		// remove the script
		root_elem.removeChild(script_elem);
		// GC the function
		window[ fct_name ] = undefined;
		try {
			delete window[ fct_name ];
		} catch(e) {}		
	}

	// declare the jsonp callback in window[]
	window[fct_name]	= function(data){
		cleanup()
		success_cb(data);
	};

	// create the script element
	script_elem.src	= url;
	script_elem.onerror	= function(){
		cleanup()
		failure_cb("Network error");		
	}
	// append the script element to HEAD
	root_elem.appendChild(script_elem);	

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return the public properties
	return {
		destroy	: cleanup
	}
}
