/**
 * bunch of x509 generation on top of certtool from gnutls
*/
var x509_certtool_t	= function(){
	//////////////////////////////////////////////////////////////////////////
	//		internal						//
	//////////////////////////////////////////////////////////////////////////
	var cmdline_run	= function(cmdline, success_cb, faillure_cb){
		if(!faillure_cb)	faillure_cb	= function(error){
			console.log('exec ('+cmdline+') error: ' + error);
			process.exit(-1);		
		}
		console.log(cmdline);
		require('child_process').exec(cmdline, function (error, stdout, stderr) {
			if (error !== null)	faillure_cb(error)
			else			success_cb();
		})
	}
	
	//////////////////////////////////////////////////////////////////////////
	//		public functions					//
	//////////////////////////////////////////////////////////////////////////
	var priv_generate	= function(nbits, fname_priv, success_cb, faillure_cb){
		var cmdline	= "certtool --generate-privkey";
		cmdline		+= " --outder --outfile '"+fname_priv+"'";
		cmdline		+= " --bits "+nbits;
		cmdline_run(cmdline, success_cb, faillure_cb);
	}
	
	var ssig_generate	= function(fname_priv, fname_cert, fname_temp, success_cb, faillure_cb){
		var cmdline	= "certtool --generate-self-signed";
		cmdline		+= " --inder  --load-privkey '"+fname_priv+"'";
		cmdline		+= " --outder --outfile '"+fname_cert+"'";
		cmdline		+= " --template '"+fname_temp+"'";
		cmdline_run(cmdline, success_cb, faillure_cb);
	}
	
	var creq_generate	= function(fname_priv, fname_creq, fname_temp, success_cb, faillure_cb){
		var cmdline	= "certtool --generate-request";
		cmdline		+= " --inder --infile '"+fname_priv+"'";
		cmdline		+= " --outder --outfile '"+fname_creq+"'";
		cmdline		+= " --template '"+fname_temp+"'";
		cmdline_run(cmdline, success_cb, faillure_cb);
	}
	
	var cert_generate	= function(fname_capriv, fname_cacert, fname_catemp, fname_creq, fname_cert, success_cb, faillure_cb){
		var cmdline	= "certtool --generate-request";
		cmdline		+= " --inder  --load-request '"+fname_creq+"'";
		cmdline		+= " --outder --outfile '"+fname_cert+"'";
		cmdline		+= " --load-ca-privkey '"+fname_capriv+"'";
		cmdline		+= " --load-ca-certificate '"+fname_cacert+"'";
		cmdline		+= " --template '"+fname_temp+"'";
		cmdline_run(cmdline, success_cb, faillure_cb);
	}

	//////////////////////////////////////////////////////////////////////////
	//		run initialisation					//
	//////////////////////////////////////////////////////////////////////////
	// return the public properties
	return {
		priv_generate	: priv_generate,
		ssig_generate	: ssig_generate,
		creq_generate	: creq_generate,
		cert_generate	: cert_generate
	}
}

/**
 * Class method to create an object
 * - thus avoid new operator
*/
x509_certtool_t.create	= function(){
	return new x509_certtool_t();
}

// export it via commonjs
exports.create	= x509_certtool_t.create;



