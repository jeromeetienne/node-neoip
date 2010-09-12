var twitter_client_t	= function(){
	var consumer_key	= "8ho0SXoPa10N193ytZGcg";
	var consumer_secret	= "xEGPFDZuGcCUPZf6tT98Q0ZQPwW7LXn1JEnh3RF7Q";
	
	var OAuth	= require('./node-oauth/lib/oauth').OAuth;
	var oauth	= new OAuth("https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
				consumer_key, consumer_secret, 
				"1.0A", "http://localhost:3000/oauth/callback", "HMAC-SHA1"
			);
	
	var access_token	= "178784305-cnVAD7XrvM45VwdiGJ7OZZ4YO4brYvrQQkyJjfjJ";
	var access_token_secret	= "MLOc5ZyvSkJdcvqiGzhYjsUpoLuotZoCV4VKJzXIDE";
	
	var retweeted_by_me	= function(callback){
		callback	= callback || function(error, data){}
		oauth.get("http://api.twitter.com/1/statuses/retweeted_by_me.json", access_token, access_token_secret, callback);		
	}
	var update		= function(text, callback){
		callback	= callback || function(error, data){}
		oauth.post("http://api.twitter.com/1/statuses/update.json", access_token, access_token_secret, {"status": text}, callback);		
	}
	var public_timeline	= function(callback){
		callback	= callback || function(error, data){}
		oauth.get("http://api.twitter.com/1/statuses/public_timeline.json", access_token, access_token_secret, callback);		
	}
	var mentions		= function(callback){
		callback	= callback || function(error, data){}
		oauth.get("http://api.twitter.com/1/statuses/mentions.json", access_token, access_token_secret, callback);		
	}
	
	return {
		retweeted_by_me	: retweeted_by_me,
		update		: update,
		public_timeline	: public_timeline,
		mentions	: mentions
	}
}



var twi_nicks	= {
	"jetienne"	: "jerome_etienne"
}
var irc_channel	= "#Node.js"
var twi_client	= new twitter_client_t();
var irc		= require('irc');
var irc_client	= new irc.Client('irc.freenode.org', 'prouter', {
	channels: [irc_channel]
});

irc_client.addListener('join'+irc_channel, function(irc_nick){
	console.log("channel joined");
	//irc_client.say(irc_channel, irc_client.nick+' is in and retweeting is on.');
});

irc_client.addListener('message'+irc_channel, function(irc_nick, irc_mesg) {
	console.log(irc_nick + ' => #yourchannel: ' + irc_mesg);
	
	var twi_nick	= twi_nicks[irc_nick];

	var twi_mesg	= irc_mesg;
	
	// nickname conversion if at the begining of irc_mesg
	var dst_matches	= twi_mesg.match(/^(\w+)[:, ]?\s*(.*)/);
	console.dir(dst_matches);
	if( dst_matches ){
		var dst_inick	= dst_matches[1];
		var dst_mesg	= dst_matches[2];
		if( twi_nicks[dst_inick] ){
			twi_mesg	= "@"+twi_nicks[dst_inick]+" "+dst_mesg;
		}
	}
	
	// add the suitable 'via @nickname' in twi_mesg	
	if( twi_nick )	twi_mesg	+= " (via @"+twi_nick+")";
	else		twi_mesg	+= " (via "+irc_nick+")";

	// send twitter update	
	twi_client.update(twi_mesg, function(error, data){
		console.log("data", data, "error", JSON.stringify(error));
		//irc_client.say('#jotnode', irc_nick+', retweeted');
	})
});



// some bot commands via pm
irc_client.addListener('pm', function(irc_nick, irc_mesg) {
	console.log(irc_nick + ' => pm: ' + irc_mesg);
	var irc_argv	= irc_mesg.split(' ');
	var command	= irc_argv[0].toLowerCase();
	irc_client.say(irc_nick, "your command is "+command);
	if( command == "register" ){
		console.assert(irc_argv.length == 2)
		var twi_nick	= irc_argv[1];
		var twi_mesg	= "wow tweetboo @webpeerit";
		var url		= "http://twitter.com/home?status="+escape(twi_mesg);
		irc_client.say(irc_nick, "in order to link your irc nick to twitter nick, you need to go there "+url+" and then use 'confirm "+twi_nick+"'.");
	}else if( command == "confirm" ){
		console.assert(irc_argv.length == 2)
		var twi_nick	= irc_argv[1];
		twi_client.mentions(function(error, data){
			var mentions	= JSON.parse(data);
			// remove useless one
			mentions	= mentions.filter(function(mention){
				var screen_name	= mention.user.screen_name;
				var twi_mesg	= mention.text;
				if( screen_name != twi_nick )			return false;
				if( twi_mesg != "wow tweetboo @webpeerit")	return false;
				return true;
			});
			console.log("mentions")
			console.dir(error);
			console.dir(mentions);
			if( mentions.length > 0 ){
				irc_client.say(irc_nick, "Your registration has been found. You are now registered as "+twi_nick);				
			}else{
				irc_client.say(irc_nick, "Cant find your registration message. try 'register' command");
			}
		})
	}else if( command == "help" ){
		var help_lines	= [
			"super bot"
		];
		help_lines.forEach(function(line){
			irc_client.say(irc_nick, line);
		})
	}
});
