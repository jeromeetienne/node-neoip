/**
 * This file will be prepended to webpeer.js during the builder
*/

/**
 * Library closure
 * * GLOBAL is the external global
*/
(function(GLOBAL){


// firebugx - 
// see http://code.google.com/p/fbug/source/browse/branches/firebug1.2/lite/firebugx.js
if (!window.console)
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}
