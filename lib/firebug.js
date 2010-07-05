var sys		= require('sys');
var assert_mod	= require('assert');

/**
 * Define the basic function of firebug console
 * - allow to run code using those functions. even on server
 * - thus it give better code sharing between client and server
 * - var console	= require('firebug').console;
*/
var console	= (function(){
	var log		= function(msg)		{ sys.puts(msg) 			}
	var dir		= function(variable)	{ sys.puts(sys.inspect(variable))	}
	var assert	= function(cond)	{ assert_mod.ok(cond);			}
	return {
		"log"	: log,
		"info"	: log,
		"dir"	: dir,
		"assert": assert
	}
})();

// export it via commonjs
exports.console	= console;