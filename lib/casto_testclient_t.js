// import the required dependancies
var http	= require('http');

/**
 * it read the stream from stream_url.
 * - it isnt specific to webpeer stream at all
 * - it is mostly a debug tool.
 *
 * opts:
 * - opts.stream_url	: url for the stream
 * - opts.notify_unit	: the unit to notify recved_data (default to 1024)
 * - opts.event_cb	: callback event_cb(event_type, event_data):
 *   - "cnx_begin"/null: server connected
 *   - "cnx_end"/null: server disconnected
 *   - "recved_size"/nunits: when data is received (nunit is the amount of data
 *     in 'unit'). it is notified when there is at least one unit to notified.
 *   - "idle_timeout"/null: when no data has been received for 
*/
var casto_testclient_t	= function(ctor_opts){
	//////////////////////////////////////////////////////////////////////////
	//		class variables						//
	//////////////////////////////////////////////////////////////////////////
	// alias 'this' for this object, to self
	var self	= this;
	// sanity check - all mandatory fields must be present
	console.assert(ctor_opts.stream_url);
	// copy ctor_opts + set default values if needed
	var stream_url		= ctor_opts.stream_url;
	var event_cb		= ctor_opts.event_cb		|| function(event_type, event_data){};
	var notify_unit		= ctor_opts.notify_unit		|| 1024;
	var verbose		= ctor_opts.verbose		|| 0;
	var idle_timer_delay	= ctor_opts.idle_timer_delay	|| 20*1000;
	var max_recved_len	= ctor_opts.max_recved_len	|| null;
	
	//////////////////////////////////////////////////////////////////////////
	//		ctor/dtor						//
	//////////////////////////////////////////////////////////////////////////
	var ctor	= function(){
		client_start();
	}
	var dtor	= function(){
		idle_timer_stop();
		client_stop();
	}
	
	//////////////////////////////////////////////////////////////////////////
	//		idle_timer						//
	//////////////////////////////////////////////////////////////////////////
	var idle_timer_id	= null;
	var idle_timer_start	= function(){
		if( verbose > 1 )	console.log("launch idle_timer timeout in "+idle_timer_delay+"-msec");
		idle_timer_id	= setTimeout(idle_timer_cb, idle_timer_delay);
	}
	var idle_timer_stop	= function(){
		if( idle_timer_id !== null )	clearTimeout(idle_timer_id);
		idle_timer_id	= null;		
	}
	var idle_timer_refresh	= function(){
		if( verbose )	console.log("idle_time_refresh");
		idle_timer_stop();
		idle_timer_start();
	}
	var idle_timer_cb	= function(){
		if( verbose )	console.log("idle timer expired. next in "+idle_timer_delay+"-msec");
		event_cb("error", "idle timeout after "+idle_timer_delay+"-msec");
	}

	//////////////////////////////////////////////////////////////////////////
	//		http client						//
	//////////////////////////////////////////////////////////////////////////
	var client_req		= null;
	var client_start	= function(){
		var recved_len	= 0;
		var notified_len= 0;
		// create the http client
		var url		= require('url').parse(stream_url);
		var client	= http.createClient((url.port||80), url.hostname);
		// bind error cases at the socket level
		client.on("error"	, function(e){ event_cb("error", e.message); });
		client.on("timeout"	, function(e){ event_cb("error", e.message); });
		// create the request
		client_req	= client.request('GET', url.pathname, {'host': url.host});
		client_req.on('response', function(client_res){
			// log to debug
			if( verbose )	console.log("Connected to "+stream_url);
			// start the idle_timer
			idle_timer_start();
			// Handle faillure at http level
			if(client_res.statusCode != 200){
				event_cb("error", "statusCode="+client_res.statusCode);
				return
			}
			// notify the caller
			event_cb("cnx_begin", null);
			//client_res.setEncoding('utf8');
			client_res.on('data', function( chunk ){
				// refresh idle_timer
				idle_timer_refresh();
				//console.log("chunk len="+chunk.length);
				// update recved_len
				recved_len	+= chunk.length;
				// notify the recved_size in notify_unit
				var notified_chunk	= Math.floor(notified_len	/ notify_unit);
				var tonotify_chunk	= Math.floor(recved_len		/ notify_unit);
				var nb_chunks		= tonotify_chunk - notified_chunk;
				if(nb_chunks > 0)	event_cb("recved_size", nb_chunks);
				// update notified_len
				notified_len		= recved_len;
				// notify the caller
				if( max_recved_len && recved_len >= max_recved_len )	event_cb("recved_len_maxed", null);
			});
			client_res.on('end', function(){
				// log the event
				if( verbose )	console.log("Connection ended");
				// notify the caller
				event_cb("cnx_closed", null);
			}); 
		});
		client_req.end();		
	}
	var client_stop		= function(){
		client_req.connection.destroy();
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// call the contructor
	ctor();
	// return the public properties
	return {
		destroy	: dtor
	}
}

/**
 * Class method to create an object
 * - thus avoid new operator
*/
casto_testclient_t.create	= function(ctor_opts){
	return new casto_testclient_t(ctor_opts);
}

// export it via commonjs
exports.create	= casto_testclient_t.create;
