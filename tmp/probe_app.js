var jsonp_call_counter	= 0;
/**
 * do a jsonp call
 * - NOTE: needed because jquery getJSON is not able to handle failure_cb
 * - jquery getJSON is 
*/
var jsonp_call	= function(url, succeed_cb, failure_cb)
{
	// determine the function name
	var fct_name	= "jsonp_call_cb_"+jsonp_call_counter++;
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
		succeed_cb(data);
	};

	// create the script element
	script_elem.src	= url;
	script_elem.onerror	= function(){
		cleanup()
		failure_cb("Network error");		
	}
	// append the script element to HEAD
	root_elem.appendChild(script_elem);
}


var probe_app_browser = function(apps_suffix, host, port, method_name, success_cb, failure_cb){
	var path	= "neoip_"+apps_suffix+"_appdetect_jsrest.js?callback=?&method_name="+method_name;
	var url		= "http://"+host+":"+port+"/"+path;
	jsonp_call(url, function(data){
		var returned_val	= data['returned_val']
		success_cb(returned_val);
	}, function(reason){
		failure_cb(reason);
	});
}


/** @define {boolean} */
var IN_NODEJS = false;

var probe_app	= null;
if( IN_NODEJS )	probe_app	= function(){};
else		probe_app	= probe_app_browser;
window['probe_app']	= probe_app;