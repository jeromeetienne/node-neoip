#!/usr/bin/env node
/*
 * This tool is used to build neoip-oload url
 * - step 1: discover if oload is present
 *   - potentially cache the result for speed ?
 * - step 2: if not present, return the normal url
 * - step 3: if present, build the nested url
 *
 * output the resulting url to stdout
 * - thus it is possible to do : mplayer `neoip-url-static http://example.org/movie.mp4`
*/

//////////////////////////////////////////////////////////////////////////////////
//		Main code							//
//////////////////////////////////////////////////////////////////////////////////

var app_detect		= require('./neoip_app_detect');
var url_builder_oload_t	= require('./url_builder_oload_t');

//////////////////////////////////////////////////////////////////////////////////
//	parse cmdline								//
//////////////////////////////////////////////////////////////////////////////////

// cmdline_opts default
cmdline_opts	= {
	hostname	: null
};
/**
 * Display the cmdline usage
*/
var disp_usage	= function(){
	console.log('Usage: neoip-url-static [options] uri')
	console.log('');
	console.log('Discover neoip-webpeer presence and generate the url for it. If it');
	console.log("is not present, it fallbacks on the normal. The generated url is ");
	console.log("outputed on STDOUT.");
	console.log('');
	console.log('Options: for advanced usage only');
	console.log("-n|--hostname str\n");
	console.log("\tSet the hostname to probe.");	
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
	console.log("\tDisplay the url for mystaticfile. Which gonna go thru neoip-webpeer");
	console.log('\tif it is present.')
	console.log('mplayer `neoip-url http://example.com/video.mp4`');
	console.log("\tWill generate the neoip url for this file and mplayer will directly");
	console.log("\tread the video from neoip-webpeer. This means you can read a video");
	console.log("\tdirectly from a torrent!");
}



// build the nested_uri depending on the cmdline argv
var nested_uri	= url_builder_oload_t.create();
for(var optind = 2; optind < process.argv.length; optind++){
	var key	= process.argv[optind];
	var val	= process.argv[optind+1];
	if( key == "--hostname" || key == "-n" ){
		cmdline_opts.hostname	= val;
		optind	+= 1;
	}else if( key == "--outter_var" || key == "-o" ){
		var keyval_arr	= val.split('=', 2)
		nested_uri.set("outter_var/"+keyval_arr[0], keyval_arr[1]);
		optind	+= 1;
	}else if( key == "--minner_var" || key == "-m" ){
		var keyval_arr	= val.split('=', 2)
		nested_uri.set("minner_var/"+keyval_arr[0], keyval_arr[1]);
		optind	+= 1;
	}else if( key == "--dupuri" || key == "-d" ){
		nested_uri.dupuri(val);
		optind	+= 1;
	}else if( key == "--mode" || key == "-m" ){
		nested_uri.set("outter_var/mod", val);
		optind	+= 1;
	}else if( key == "--path" || key == "-p" ){
		nested_uri.set("outter_var/subfile_path", val);
		optind	+= 1;
	}else if( key == "--type" || key == "-t" ){
		nested_uri.set("outter_var/link_type", val);
		optind	+= 1;
	}else if( key == "--help" || key == "-h" ){
		disp_usage();
		process.exit();
	}else{
		nested_uri.set("inner_uri", key)
		optind	+= 1;
	}
}

// get required options from the rest of the cmdline
var hostname	= cmdline_opts.hostname;

// discover neoip-oload and act depending on its presence or not
app_detect.discover_app({
	app_suffix	: "oload",
	hostname	: hostname,
	success_cb	: function(root_url, version){
		// if oload is present, output nested_uri 
		nested_uri.set('outter_uri', root_url);
		console.log(nested_uri.to_string());	
		//neoip.static_url.create("http://example.com").to_string();
	},
	failure_cb	: function(error){
		// if oload is not present, output plain inner_uri
		var inner_uri	= nested_uri.get('inner_uri');
		console.log(inner_uri)
	}
})

//////////////////////////////////////////////////////////////////////////////////
//		Man Page							//
//////////////////////////////////////////////////////////////////////////////////

/* Man page in perlpod format. to view with "pod2man thisfile | man -l -"
=pod

=head1 NAME

neoip-url-static - Helps build url for neoip-webpeer

=head1 SYNOPSIS

B<neoip-url-static>  [options] url

=head1 DESCRIPTION

B<neoip-url-static> Discover neoip-webpeer presence and generate the url for it. If
not present, it fallbacks on the original url. The generated url is outputed on STDOUT.

=head1 OPTIONS

The following options are available:

=over

=item B<-n|--hostname> I<host>

Use to set the hostname to probe. (OPTIONAL, default to 127.0.0.1)

=item B<--outter_var KEY=VAL, -o KEY=VAL>

Set an outter_var.

=item B<--minner_var KEY=VAL, -o KEY=VAL>

Set an minner_var.

=item B<--dupuri URI, -d URI>

Set this URI as a duplicate uri from the main uri. More just
an alias for 'outter_var/dupuri', as it handle gory details of
dupuri index for you.

=item B<--mode STR, -m STR>

Set the modification. Possible values are 'raw' and 'flv', it
defaults to 'raw'. just an alias for 'outter_var/mod'

=item B<--type STR, -t STR>

Set the type of the file pointed by the url. Possible values
are 'static', 'torrent' and 'metalink'. It defaults
to 'static'. 'static' are for http static file, 'torrent' is for 
bittorrent files and 'metalink' for metalink files(beta).

=item B<--path STR, -p STR>

Used to select a given file when the uri points is a multi-file
metafile (torrent or metalink).

=item B<-v>

Increase the verbose level. It may be used multiple times.

=back

=head1 EXAMPLES

=over

=item B<basic url building>

$ neoip-url-static http://example.com/mystaticfile

Display the url for mystaticfile. Which gonna go thru neoip-webpeer
if it is present.

=item B<Coupling with other tools>

$ mplayer `neoip-url-static http://example.com/video.mp4`

Will generate the neoip url for this file and mplayer will directly
read the video from neoip-webpeer. This means you can read a video
directly from a torrent!

=cut

*/
