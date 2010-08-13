// import required dependancies
var url_builder_casto	= require('./url_builder_casto');


opts	= {
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
	console.log("usage: neoip-url-stream [-s url] base_url cast_privhash cast_name");
	console.log("");
	console.log("Build an url for neoip-casto");
	console.log("");
	console.log("-s|--mdata_srv_uri\n\t\tSet url for the mdata_srv.");
	console.log("-h|--help\tDisplay the inline help.");
}
var optind	= 2;
for(;optind < process.argv.length; optind++){
	var key	= process.argv[optind];
	var val	= process.argv[optind+1];
	//console.log("key="+key+" val="+val);
	if( key == "-s" || key == "--mdata_srv_uri" ){
		opts.mdata_srv_uri	= val;
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
if( process.argv.length - optind < 3 ){
	disp_usage("missing parameters to buidl the url");
	process.exit(0);		
}

// get required options from the rest of the cmdline
opts.base_url		= process.argv[optind++];
opts.cast_privhash	= process.argv[optind++];
opts.cast_name		= process.argv[optind++];

// create the url
var url	= url_builder_casto.create(opts);
// output the url on stdout
console.log(url);