// import required dependancies
var app_detect	= require('./neoip_app_detect');

if(false){
        app_detect.discover_app({
                hostname        : "127.1.1.1",
                app_suffix	: "oload",
                success_cb	: function(root_url, version){
                        console.log("GOOD: found");
                },
                failure_cb	: function(error){
                        console.log("BAD: not found");
                }
        })
}

if( true ){
        app_detect.discover_webpeer({
                completed_cb    : function(status){
                        console.log("webpeer's status is "+status);      
                },
                hostname        : "127.1.0.1"
        })
}