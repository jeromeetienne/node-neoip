#!/usr/bin/env node

// import required dependancies
var app_detect	= require('./neoip_app_detect');

//////////////////////////////////////////////////////////////////////////////////
//	parse cmdline								//
//////////////////////////////////////////////////////////////////////////////////
// cmdline_opts default
cmdline_opts	= {
	loop_4ever	: false,
	loop_delay	: 1*1000,
	hostname	: null,
	verbose		: 0
};
var disp_usage	= function(prefix){
	if(prefix)	console.log(prefix + "\n");
	console.log("usage: neoip-detect [options] appname [output_type]");
	console.log("");
	console.log("Discover neoip-apps.");
	console.log("Valid appnames are in 'oload', 'casti', 'casto' and 'webpeer'.");
	console.log("appname is optionnal and defaults to 'webpeer'.");
	console.log("Valid output_type are : 'root_url', 'version' and 'presence'.");
	console.log("output_type is optionnal and defaults to 'presence'.");
	console.log("if appname is 'webpeer', 'presence' is the only valid output_type.");
	console.log("");
	console.log("-n|--hostname str\tSet the hostname to probe.");
	console.log("-c|--continue\t\tContinue for ever, instead of only 1 iteration.");
	console.log("-d|--delay num\t\tSet the loop delay (valid only with --continue).");
	console.log("-v|--verbose\t\tIncrease the verbose level (for debug).");
	console.log("-h|--help\t\tDisplay the inline help.");
}
var optind	= 2;
for(;optind < process.argv.length; optind++){
	var key	= process.argv[optind];
	var val	= process.argv[optind+1];
	//console.log("key="+key+" val="+val);
	if( key == "--hostname" || key == "-n" ){
		cmdline_opts.hostname	= val;
		optind	+= 1;
	}else if( key == '-c' || key == "--continue" ){
		cmdline_opts.loop_4ever	= true;
	}else if( key == '-d' || key == "--delay" ){
		cmdline_opts.loop_delay	= parseFloat(val)*1000;
		optind++;
	}else if( key == '-v' || key == "--verbose" ){
		cmdline_opts.verbose	+= 1;
	}else if( key == "-h" || key == "--help" ){
		disp_usage();
		process.exit(0);
	}else{
		// if the option doesnt exist, consider it is the first non-option parameters
		break;
	}
}
	
// get required options from the rest of the cmdline
var app_name	= process.argv[optind++] || 'webpeer';
var output_type	= process.argv[optind++] || 'presence';

var loop_4ever	= cmdline_opts.loop_4ever;
var loop_delay	= cmdline_opts.loop_delay;
var hostname	= cmdline_opts.hostname;
var verbose	= cmdline_opts.verbose;

// sanity check - app_name MUST be in valid_names
var valid_names = ['oload', 'casti', 'casto', 'webpeer'];
if( valid_names.indexOf(app_name) == -1 ){
	console.log("app_name '"+app_name+"' is not possible.");
	console.log("Valid names are ", valid_names);
	process.exit(-1);
}

// sanity check - app_name MUST be in valid_names
var valid_types = ['root_url', 'version', 'presence'];
if( valid_types.indexOf(output_type) == -1 ){
	console.log("output_type '"+output_type+"' is not possible.");
	console.log("Valid types are "+require('sys').inspect(valid_names));
	process.exit(-1);
}
if( app_name == 'webpeer' && output_type != 'presence' ){
	console.log("with 'webpeer' apps name, 'presence' is the only valid output_type");
	process.exit(-1);
}

// trace for the user
if( verbose )	console.log("discovering '"+app_name+"' for "+output_type);

//////////////////////////////////////////////////////////////////////////
//	do actual discovery						//
//////////////////////////////////////////////////////////////////////////
var one_iter	= function(completed_cb){
	if( app_name != 'webpeer' ){
		// discover neoip-oload and act depending on its presence or not
		app_detect.discover_app({
			app_suffix	: app_name,
			hostname	: hostname,
			success_cb	: function(root_url, version){
				//console.log("root_url="+root_url+ " version="+version);
				if( output_type == 'root_url' )		console.log(root_url);
				else if( output_type == 'version' )	console.log(version);
				else if( output_type == 'presence' )	console.log("present ("+version+")");
				completed_cb(0);
			},
			failure_cb	: function(reason){
				if( verbose )			console.log("Failed due to "+reason);
				if( output_type == 'presence' )	console.log("not present");
				completed_cb(-1);
			}
		})
	}else if( app_name == 'webpeer' && output_type == 'presence' ){
		app_detect.discover_webpeer({
			completed_cb	: function(status){
				if( verbose )	console.log("webpeer status="+status);	
				if( status == "installed" )		console.log("webpeer is installed and uptodate.");
				else if( status == "toupgrade" )	console.log("webpeer is installed and needs upgrade.");
				else if( status == "toinstall" )	console.log("webpeer is not installed.");
				else console.assert(false);
				// return the proper statuscode
				if( status == "toinstall" )	completed_cb(-1);
				else				completed_cb(0);
			},
			hostname	: cmdline_opts.hostname
		});
	}
}

if( loop_4ever == false ){
	one_iter(function(statuscode){
		process.exit(statuscode);
	})
}else{
	// trap SIGINT - exit with error
	process.on('SIGINT', function(){
		process.exit(-1);
	});
	var	endless_loop	= function(){
		one_iter(function(statuscode){
			// clear the cache - force to get fresh result
			app_detect.cache_clear();
			setTimeout(endless_loop, loop_delay);
		})
	}
	endless_loop();		
}
 
//////////////////////////////////////////////////////////////////////////////////
//		Man Page							//
//////////////////////////////////////////////////////////////////////////////////

/* Man page in perlpod format. to view with "pod2man thisfile | man -l -"
=pod

=head1 NAME

neoip-detect - Detect neoip applications

=head1 SYNOPSIS

B<neoip-detect>  [options] [appname [output_type]]

=head1 DESCRIPTION

B<neoip-detect> detect neoip-applications presence and related informations, like
version or api's root_url.

=over

=item I<appname>

Valid appnames are in 'oload', 'casti', 'casto' and 'webpeer'.
It is optionnal and defaults to 'presence'.

=item I<output_type>

Determine the type of output to use. Valid output_type are : 'root_url', 'version' and 'presence'.
It is optionnal and defaults to 'presence'.

B<Note>: if I<appname> is 'webpeer', the only valid type is 'presence'

=over

=item I<root_url>

It will output in stdout the API's root url for this application.

=item I<version>

It will output in stdout version this application.

=item I<presence>

It will display a human readable message on stdout. This option is interesting
mainly for its statuscode returned by the executable.

=back

=back

=head1 OPTIONS

The following options are available:

=over

=item B<--c|--continue>

It will continue looping for ever.
By default, it does only one iteration.

=item B<--d|--delay sec>

It will set the delay between each loop iteration.
This option is valid only with B<--continue>.
By default, it is 1-sec. Fractional seconds is supported.

=item B<-v|--verbose>

Increase the verbose level. It may be used multiple times.

=back

=head1 EXAMPLES

=over

=item B<version display>

$ neoip-detect oload version

This will display the following in stdout

0.0.1

=item B<detecting presence>

$ neoip-detect webpeer && echo "detected" || echo "not detected"

This will display I<detected> in stdout if neoip-webpeer is detected
and I<not detected> otherwise.

=cut

*/

