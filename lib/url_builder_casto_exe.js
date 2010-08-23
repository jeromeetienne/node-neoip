/**
 * Build the url for neoip-casto
 *
 *
 * FIXME: why is there no neoip-casto detection in this ?
 * - url_build_oload_exe got it
 * - additionnaly put a way to setup
 *   - either the host to probe
 *   - or directly the root url (in case of several web peer per host)
*/

// import required dependancies
var url_builder_casto	= require('./url_builder_casto');
var app_detect		= require('./neoip_app_detect');

cmdline_opts	= {
	hostname	: "127.0.0.1",
	base_url	: null,
	cast_privhash	: null,
	cast_name	: null,
	mdata_srv_uri	: null
};

//////////////////////////////////////////////////////////////////////////////////
//	parse cmdline								//
//////////////////////////////////////////////////////////////////////////////////
var disp_usage	= function(prefix){
	if(prefix)	console.log(prefix + "\n");
	console.log("usage: neoip-url-stream [-s url] cast_privhash cast_name");
	console.log("");
	console.log("Build an url for neoip-casto");
	console.log("");
	console.log("-n|--hostname str\tSet the hostname to probe.");
	console.log("-s|--mdata_srv_uri\n\t\tSet url for the mdata_srv.");
	console.log("-h|--help\tDisplay the inline help.");
}
var optind	= 2;
for(;optind < process.argv.length; optind++){
	var key	= process.argv[optind];
	var val	= process.argv[optind+1];
	//console.log("key="+key+" val="+val);
	if( key == "--hostname" || key == "-n" ){
		cmdline_opts.hostname		= val;
		optind	+= 1;
	}else if( key == "-s" || key == "--mdata_srv_uri" ){
		cmdline_opts.mdata_srv_uri	= val;
		optind		+= 1;			
	}else if( key == "-h" || key == "--help" ){
		disp_usage();
		process.exit(0);
	}else{
		// if the option doesnt exist, consider it is the first non-option parameters
		break;
	}
}
// check there are at least 3 parameters remaining in the cmdline
if( process.argv.length - optind < 2 ){
	disp_usage("missing parameters to buidl the url");
	process.exit(0);		
}

// get required options from the rest of the cmdline
var cast_privhash	= process.argv[optind++];
var cast_name		= process.argv[optind++];
var hostname		= cmdline_opts.hostname;
var mdata_srv_uri	= cmdline_opts.mdata_srv_uri;

// discover neoip-oload and act depending on its presence or not
app_detect.discover_app({
	app_suffix	: "casto",
	hostname	: hostname,
	success_cb	: function(root_url, version){
		// build the url
		var url	= url_builder_casto.create({
			base_url	: root_url,
			cast_name	: cast_name,
			cast_privhash	: cast_privhash,
			mdata_srv_uri	: mdata_srv_uri
		});
		// output the url on stdout
		console.log(url);
	},
	failure_cb	: function(error){
		console.log("oload is not present");
		process.exit(-1);
	}
})

//////////////////////////////////////////////////////////////////////////////////
//		Man Page							//
//////////////////////////////////////////////////////////////////////////////////

/* Man page in perlpod format. to view with "pod2man thisfile | man -l -"
=pod

=head1 NAME

neoip-url-stream - build a url for neoip-casto

=head1 SYNOPSIS

B<neoip-url-stream> [-s mdata_srv_uri] [-n hostname] cast_privhash cast_name

=head1 DESCRIPTION

Build an url for neoip-casto. This url will point on a normal http stream.
Thus the client may be any client which understand http, it doesnt have to modified
to use this url.

=over

=item I<cast_privhash>

This is the hash of the broadcast password (aka casti_privtext). This is used
to ensure the http client got the permission to read the broadcast.

=item I<cast_name>

cast_name is the name of the broadcast. This name is unique inside the I<mdata_srv_uri>.

=back

=head1 OPTIONS

The following options are available:

=over

=item B<-s|--mdata_srv_uri> I<url>

Use to set the url for the metadata server. This server got the metadata information
about the broadcast. (OPTIONAL)


=item B<-n|--hostname> I<host>

Use to set the hostname to probe. (OPTIONAL, default to 127.0.0.1)

=back

=head1 EXAMPLES

=over

=item B<basic usage>

$ neoip-url-stream http://localhost:4560 a761ce3a superstream

This will display the following in stdout

http://localhost:4560/a761ce3a/superstream

=item B<specifying mdata_srv_uri>

$ neoip-url-stream -s http://example.com http://localhost:4560 a761ce3a superstream

This will display the following in stdout

http://localhost:4560/a761ce3a/superstream?mdata_srv_uri=http%3A//example.com

=cut


*/

