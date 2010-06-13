var sys		= require('sys');

/**
 * Pad a string
*/
var pad_string	= function(str, length, pad_str) {
	// determine pad_str if not done
	if( pad_str === undefined )	pad_str= " ";
	// pad until it is at least the proper length
	while(str.length < length)	str	= pad_str+str;
	// return the output
	return str;
}

/**
 * Dump an buffer in hexa
 * - inspired by hd(1)
*/
var hexa_dump_str	= function(data){
	var num_to_hex	= function(num){
		return pad_string(num.toString(16), 2);
	}
	var output	= "";
	for(var offset = 0; ; offset += 16){
		if( offset >= data.length )	break;
		if(output.length > 0)		output	+= "\n";
		output	+= pad_string(offset.toString(16),6, '0')+"  ";
		for(var i = 0; i < 16; i++){
			var val		= data.charCodeAt(offset+i);
			if( offset + i < data.length ){
				output	+= pad_string(val.toString(16), 2, '0')+" ";
			}else{
				output	+= "   ";
			}
		}
		output	+= "   |";
		for(var i = 0; i < 16; i++){
			var val	= data.charAt(offset+i);
			if( offset + i < data.length ){
				var is_printable	= val.charCodeAt(0) >= 32
				if( is_printable )	output	+= val;
				else			output	+= ".";
			}else{
				output	+= " ";
			}
		}
		output	+= "|";
	}
	return output;
}

var hexa_dump	= function(data){
	sys.puts(hexa_dump_str(data));
}

exports.pad_string	= pad_string;
exports.hexa_dump_str	= hexa_dump_str;
exports.hexa_dump	= hexa_dump;
