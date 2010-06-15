var Buffer	= require('buffer').Buffer
var fs		= require('fs');
var sys		= require('sys');

var ez_fileread	= function(path, range_beg, range_len, completed_cb){
	// open the file
	fs.open(path, "r", 0644, function(err, fd){
		// report the error if needed
		if( err !== null ){
			completed_cb(err, null);
			return;
		}
		// allocate the buffer
		var buf		= new Buffer(range_len);
		// start the read
		fs.read(fd, buf, 0, range_len, range_beg, function(err, bytesRead){
			fs.close(fd, function(){
				// report the error if needed
				if( err !== null ){
					completed_cb(err, null);
					return;
				}
				// convert the Buffer into a string
				var data	= buf.toString("binary", 0, bytesRead);
				// notify the caller
				completed_cb(null, data);				
			})
		})
	})
}

exports.ez_fileread	= ez_fileread;