/**
 * tools to preload static files in webpeer
 *
*/

// include local dependancies
var oload_preloader_t	= require('./oload_preloader_t');
var app_detect		= require('./neoip_app_detect');
var url_builder_oload_t	= require('./url_builder_oload_t');

// get content_urls from the cmdline
var content_urls	= process.argv.slice(2);

// discover neoip-oload and act depending on its presence or not
app_detect.discover_app({
	app_suffix	: "oload",
	hostname	: "127.0.0.1",
	success_cb	: function(root_url, version){
		// once neoip-oload found, preload all content_urls
		for(var i = 0; i < content_urls.length; i++){
			var content_url		= content_urls[i];
			var url_builder_oload	= url_builder_oload_t.create(content_url);
			url_builder_oload.set('outter_uri', app_detect.cache_get('oload').root_url);
			oload_preloader_t.create({
				url_builder_oload	: url_builder_oload
			});
		}
	},
	failure_cb	: function(error){
		console.log("Webpeer has not been found (due to "+error+")");
	}
})

//////////////////////////////////////////////////////////////////////////////////
//		Man Page							//
//////////////////////////////////////////////////////////////////////////////////

/* Man page in perlpod format. to view with "pod2man thisfile | man -l -"
=pod

=head1 NAME

webpeer-preloader - Preload content in webpeer

=head1 SYNOPSIS

B<webpeer_preloader> url [url...]

=head1 DESCRIPTION

It will preload the content of each URL in webpeer. It aims speed up delivery.

=head1 EXAMPLES

=over

=item B<basic usage>

$ webpeer-preloader http://example.com/movie.mp4  http://example.com/song.mp3

It will discover local webpeer and preload both urls

=cut

*/
