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

var sys		= require('sys')
var neoip	= require('./neoip');
var nested_uri_t= require('./nested_uri_t').nested_uri_t;

/**
 * Display the cmdline usage
*/
var disp_usage	= function(){
	sys.puts('Usage: neoip-url [options] uri')
	sys.puts('Discover neoip-webpack presence and generate the url for it. If it');
	sys.puts("is not present, it fallbacks on the normal. The generated url is ");
	sys.puts("outputed on STDOUT.");
	sys.puts('');
	sys.puts('Options: for advanced usage only');
	sys.puts('--outter_var KEY=VAL, -o KEY=VAL');
	sys.puts('\tSet an outter_var.');
	sys.puts('--minner_var KEY=VAL, -o KEY=VAL');
	sys.puts('\tSet an minner_var.');
	sys.puts('--dupuri URI, -d URI');
	sys.puts("\tSet this URI as a duplicate uri from the main uri. More just");
	sys.puts("\tan alias for 'outter_var/dupuri', as it handle gory details of");
	sys.puts("\tdupuri index for you.");
	sys.puts('--mode STR, -m STR');
	sys.puts("\tSet the modification. Possible values are 'raw' and 'flv', it");
	sys.puts("\tdefaults to 'raw'. just an alias for 'outter_var/mod'");
	sys.puts('--type STR, -t STR');
	sys.puts("\tSet the type of the file pointed by the url. Possible values");
	sys.puts("\tare 'static', 'torrent' and 'metalink'. It defaults");
	sys.puts("\tto 'static'. 'static' are for http static file, 'torrent' is for ");
	sys.puts("\tbittorrent files and 'metalink' for metalink files(beta).")
	sys.puts('--path STR, -p STR');
	sys.puts("\tUsed to select a given file when the uri points is a multi-file");
	sys.puts("\tmetafile (torrent or metalink).");
	sys.puts('');
	sys.puts('Examples:');
	sys.puts('neoip-url http://example.com/mystaticfile');
	sys.puts("\tDisplay the url for mystaticfile. Which gonna go thru neoip-webpack");
	sys.puts('\tif it is present.')
	sys.puts('mplayer `neoip-url http://example.com/myvideofile`');
	sys.puts("\tWill generate the neoip url for this file and mplayer will directly");
	sys.puts("\tread the video from neoip-webpack. This means you can read a video");
	sys.puts("\tdirectly from a torrent!");
}


var nested_uri	= new nested_uri_t();

// build the nested_uri depending on the cmdline argv
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



neoip.discover_app("oload", function(root_url, version){
	// if oload is present, output nested_uri 
	nested_uri.set('outter_uri', root_url);
	sys.puts(nested_uri.to_string());
}, function(reason){
	// if oload is not present, output plain inner_uri
	sys.puts(inner_uri)
})


