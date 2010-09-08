/**
 * Minimal version of mustache
 * - a lot less that the real thing, but maintainable by me :)
 * - http://mustache.github.com/
*/
var render	= function(tmpl, data){
	var result	= tmpl;
	for(var key in data){
		var val	= data[key];
		var re	= new RegExp("{{\\s*"+key+"\\s*}}");
		result	= result.replace(re, val)
	}
	return result;	
}

// export it via commonjs
exports.render	= render;