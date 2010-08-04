// this one may have a version node and another web
// - in web, it will be  : var require = naw || function(){}
// - in node, it will be : modules.exports

exports.require	= function(modname){
	console.log("internal require of "+modname);
	return require(modname);
}

exports.init	= function(node_exports){
	var in_node	= true
	return function(modules, module_name, module_func){
		if( in_node ){
			// handle require() dependancies
			for(module in modules){
				console.log(module_name+" : preload "+module);
				this[module]	= require(modules[module]);
			}
			// to handle exports
			this['exports']	= {};
			this['require']	= function(modname){
				console.log("internal require of "+modname);
				return require(modname);
			}
			this['module_name']	= module_name;
		}else{
			// how to handle require in js web ?
			// export
			this[module_name]	= {};
			return;
		}
	
		console.log(module_name+" : do call");
		// call the module function
		module_func(this['exports'], this['require']);
		
		console.log(module_name+" : postloading");
		console.dir(this['exports']);
		if( in_node ){
			for(ex in this['exports']){
				console.log(module_name+" : exporting "+ex);
				node_exports[ex]	= this['exports'][ex];
			}
		}
	}
}
