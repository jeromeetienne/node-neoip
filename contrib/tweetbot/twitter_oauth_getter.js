#!/usr/bin/env node

var sys = require('sys');
var OAuth = require('./node-oauth/lib/oauth').OAuth;

function getAccessToken(oa, oauth_token, oauth_token_secret, pin) {
  oa.getOAuthAccessToken(oauth_token, oauth_token_secret, pin,
    function(error, oauth_access_token, oauth_access_token_secret, results2) {
      if (error) {
        console.log(error);
        return;
        
      }
      sys.puts('Your OAuth Access Token:' + oauth_access_token);
      sys.puts('Your OAuth Token Secret: ' + oauth_access_token_secret);
      sys.puts('Now, save these two values, along with your origional consumer secret and key and use these in your twitter app');
      process.exit(1);
    });
}

function getRequestToken(oa) {
  
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if(error) {
      sys.puts('error :' + error);
    } else { 
      sys.puts('In your browser, log in to your twitter account.  Then visit:')
      sys.puts('https://twitter.com/oauth/authorize?oauth_token=' + oauth_token)
      sys.puts('After logged in, you will be promoted with a pin number')
      sys.puts('Enter the pin number here:');
      var stdin = process.openStdin();
      stdin.on('data', function(chunk) {
        pin = chunk.toString().trim();
        getAccessToken(oa, oauth_token, oauth_token_secret, pin);
      });
    }
  });
}

var consumer_key	= "8ho0SXoPa10N193ytZGcg";
var consumer_secret	= "xEGPFDZuGcCUPZf6tT98Q0ZQPwW7LXn1JEnh3RF7Q";
    
function startAuth() {
  var oa = new OAuth('http://api.twitter.com/oauth/request_token',
      'http://api.twitter.com/oauth/access_token',
      consumer_key,
      consumer_secret,
      '1.0',
      null, 'HMAC-SHA1');
      
  getRequestToken(oa);
}


startAuth();

/**
 * jerome@jmebox:~/webwork/node-neoip/contrib/tweetbot$ node twitter_oauth_getter.js 
In your browser, log in to your twitter account.  Then visit:
https://twitter.com/oauth/authorize?oauth_token=pu1nafDvkir2tSiCJAGRaWaEiRAdKbaAz3j3tlCg
After logged in, you will be promoted with a pin number
Enter the pin number here:
7294770
Your OAuth Access Token:10162102-kMNP7XRBV7YN41GIZyl7QXEuwL7jj3O6Y7DhRAGQ
Your OAuth Token Secret: GIIuynA8dmIAEPazgzAkaWHj9mQhsJCKJuXKgTkHwwc
Now, save these two values, along with your origional consumer secret and key and use these in your twitter app
*/