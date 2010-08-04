/*
 * This tool is used to build neoip-oload url
 * - step 1: discover if oload is present
 *   - potentially cache the result for speed ?
 * - step 2: if not present, return the normal url
 * - step 3: if present, build the nested url
 *
 * output the resulting url to stdout
 * - thus it is possible to do : mplayer `neoip-url http://example.org/movie.mp4`
*/

var app_detect	= require('./neoip_app_detect');
var nested_uri_t= require('./nested_uri_t').nested_uri_t;

/**
 * Display the cmdline usage
*/
var disp_usage	= function(){
	console.log('Usage: neoip-url [options] uri')
	console.log('Discover neoip-webpack presence and generate the url for it. If it');
	console.log("is not present, it fallbacks on the normal. The generated url is ");
	console.log("outputed on STDOUT.");
	console.log('');
	console.log('Options: for advanced usage only');
	console.log('--outter_var KEY=VAL, -o KEY=VAL');
	console.log('\tSet an outter_var.');
	console.log('--minner_var KEY=VAL, -o KEY=VAL');
	console.log('\tSet an minner_var.');
	console.log('--dupuri URI, -d URI');
	console.log("\tSet this URI as a duplicate uri from the main uri. More just");
	console.log("\tan alias for 'outter_var/dupuri', as it handle gory details of");
	console.log("\tdupuri index for you.");
	console.log('--mode STR, -m STR');
	console.log("\tSet the modification. Possible values are 'raw' and 'flv', it");
	console.log("\tdefaults to 'raw'. just an alias for 'outter_var/mod'");
	console.log('--type STR, -t STR');
	console.log("\tSet the type of the file pointed by the url. Possible values");
	console.log("\tare 'static', 'torrent' and 'metalink'. It defaults");
	console.log("\tto 'static'. 'static' are for http static file, 'torrent' is for ");
	console.log("\tbittorrent files and 'metalink' for metalink files(beta).")
	console.log('--path STR, -p STR');
	console.log("\tUsed to select a given file when the uri points is a multi-file");
	console.log("\tmetafile (torrent or metalink).");
	console.log('');
	console.log('Examples:');
	console.log('neoip-url http://example.com/mystaticfile');
	console.log("\tDisplay the url for mystaticfile. Which gonna go thru neoip-webpack");
	console.log('\tif it is present.')
	console.log('mplayer `neoip-url http://example.com/video.mp4`');
	console.log("\tWill generate the neoip url for this file and mplayer will directly");
	console.log("\tread the video from neoip-webpack. This means you can read a video");
	console.log("\tdirectly from a torrent!");
}



// build the nested_uri depending on the cmdline argv
var nested_uri	= new nested_uri_t();
for(var arg_idx = 2; arg_idx < process.argv.length; ){
	var arg	= process.argv[arg_idx];
	if( arg == "--outter_var" || arg == "-o" ){
		var keyval	= process.argv[arg_idx+1];
		var keyval_arr	= keyval.split('=', 2)
		var key		= keyval_arr[0];
		var val		= keyval_arr[1];
		nested_uri.set("outter_var/"+key, val);
		arg_idx	+= 2;
	}else if( arg == "--minner_var" || arg == "-o" ){
		var keyval	= process.argv[arg_idx+1];
		var keyval_arr	= keyval.split('=', 2)
		var key		= keyval_arr[0];
		var val		= keyval_arr[1];
		nested_uri.set("minner_var/"+key, val);
		arg_idx	+= 2;
	}else if( arg == "--dupuri" || arg == "-d" ){
		var val		= process.argv[arg_idx+1];
		nested_uri.dupuri(val);
		arg_idx	+= 2;
	}else if( arg == "--mode" || arg == "-m" ){
		var val		= process.argv[arg_idx+1];
		nested_uri.set("outter_var/mod", val);
		arg_idx	+= 2;
	}else if( arg == "--path" || arg == "-p" ){
		var val		= process.argv[arg_idx+1];
		nested_uri.set("outter_var/subfile_path", val);
		arg_idx	+= 2;
	}else if( arg == "--type" || arg == "-t" ){
		var val		= process.argv[arg_idx+1];
		nested_uri.set("outter_var/link_type", val);
		arg_idx	+= 2;
	}else if( arg == "--help" || arg == "-h" ){
		disp_usage();
		process.exit();
	}else{
		nested_uri.set("inner_uri", arg)
		arg_idx	+= 1;
	}
}


// discover neoip-oload and act depending on its presence or not
app_detect.discover_app("oload", function(root_url, version){
	// if oload is present, output nested_uri 
	nested_uri.set('outter_uri', root_url);
	console.log(nested_uri.to_string());
}, function(error){
	// if oload is not present, output plain inner_uri
	var inner_uri	= nested_uri.get('inner_uri');
	console.log(inner_uri)
})


