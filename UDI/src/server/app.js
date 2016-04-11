    var express = require('express'); 
    var app = express(); 

    var rawBodyParser = require('raw-body-parser');
    app.use(rawBodyParser());

    var fs = require('fs');
    app.use(express.static('../client'));
    var router = express.Router();
	var path=require('path'); 
    var configuration = JSON.parse(
    	    fs.readFileSync('config.json')
    );
    
    app.use(function(req, res, next){
        // create a domain for this request
        var domain = require('domain').create();
        // handle errors on this domain
        domain.on('error', function(err){
            console.error('DOMAIN ERROR CAUGHT\n', err.stack);
            try {
                // failsafe shutdown in 5 seconds
                setTimeout(function(){
                    console.error('Failsafe shutdown.');
                    process.exit(1);
                }, 5000);

                // disconnect from the cluster
                var worker = require('cluster').worker;
                if(worker) worker.disconnect();

                // stop taking new requests
                server.close();

                try {
                    // attempt to use Express error route
                    next(err);
                } catch(error){
                    // if Express error route failed, try
                    // plain Node response
                    console.error('Express error mechanism failed.\n', error.stack);
                    res.statusCode = 500;
                    res.setHeader('content-type', 'text/plain');
                    res.end('Server error.');
                }
            } catch(error){
                console.error('Unable to send 500 response.\n', error.stack);
            }
        });

        // add the request and response objects to the domain
        domain.add(req);
        domain.add(res);

        // execute the rest of the request chain in the domain
        domain.run(next);
    });

    app.use('/api/fda-udi', router);
    router.route('/')
    .get(function(req, res) {
    	 res.json({ message: 'hooray! welcome to our api!' }); 
    	 
    });
    router.route('/requests/:filename')
     .post(function(req, res) {
    	var rawBody = req.rawBody.toString('utf8');
    	if(!req.headers['x-as2-userid']){
    		return res.json({error_code:401, err_desc:'The user id is not found'});
    	}
    	if(!req.headers['x-as2-timestamp'] || !req.headers['x-as2-auth-token']){
    		return res.json({error_code:403, err_desc:'Invalid request'});
    	}
    	if(!authenticate(req, true)){
    		var respData = {
    				"Code": 401,
    				"Content": "After concatenating the userid, filename, timestamp, and the content of the HL7 XML file and applying the HMAC-SHA256 with a secret key, the hash value is different than the value in the x-as2-authtoken"
    			};
    		return res.json(respData);    		
    	}
//    	 if(req.get('Content-Type') ==='application/xml'){
    			if (!fs.existsSync(configuration.uploadpath)){
    			    fs.mkdirSync(configuration.uploadpath);
    			}
    		 	var writeStream = fs.createWriteStream(configuration.uploadpath + req.params.filename);
    	    	writeStream.write(rawBody);
    	    	var respData = {
    	    				"Code": 200,
    	    				"Content": { "message-id": req.headers['message-id'] }
    	    			};
    	    	return res.json(respData);
//    	 } else {
//    		 return res.json({error_code:403, err_desc:'Invalid Content Type.'});
//    	 }
     });
    
    router.route('/responses')
    .get(function(req, res) {
	   	if(!req.headers['x-as2-userid']){
	   		return res.json({error_code:401, err_desc:'The user id is not found'});
	   	}
   	if(!req.headers['x-as2-timestamp'] || !req.headers['x-as2-auth-token']){
   		return res.json({error_code:403, err_desc:'Invalid request'});
   	}
		   	if(!authenticate(req, false)){
		   		var respData = {
						"Code": 401,
						"Content": "After concatenating the userid, filename, timestamp, and the content of the HL7 XML file and applying the HMAC-SHA256 with a secret key, the hash value is different than the value in the x-as2-authtoken"
					};
				return res.json(respData);    		
		   	}

    		var fileList = [];
			var dir=path.resolve(configuration.uploadpath); // give path
			var files = fs.readdirSync(dir);
			for (var i=0; i<files.length; i++) {

		        var temp = {"filename": files[i]};
		        fileList.push(temp);
		    }
			var respData = {
					"Code": 200,
					"Content": {"responses" : fileList}
			};

   	    	return res.json(respData);

    });
    
    router.route('/responses/:filename')
    .get(function(req, res) {
	   	if(!req.headers['x-as2-userid']){
	   		return res.json({error_code:401, err_desc:'The user id is not found'});
	   	}
	   	if(!req.headers['x-as2-timestamp'] || !req.headers['x-as2-auth-token']){
	   		return res.json({error_code:403, err_desc:'Invalid request'});
	   	}
		   if(!authenticate(req, false)){
		   		var respData = {
						"Code": 401,
						"Content": "After concatenating the userid, filename, timestamp, and the content of the HL7 XML file and applying the HMAC-SHA256 with a secret key, the hash value is different than the value in the x-as2-authtoken"
					};
				return res.json(respData);    		
		   	}
   	
	        var file = req.params.filename;
	    	var fpath = path.resolve(configuration.uploadpath)+'/'+file;
			var data = fs.readFileSync(fpath);
			var sts = fs.statSync(fpath);

			
			var respData = {
					"Code": 200,
					"Content": {
								"content" : data.toString(),
								"created-date":sts.ctime
								}
			};
   	    	return res.json(respData);

    });
  

    app.listen('3000', function(){
        console.log('running on 3000...');
    });
    
    authenticate = function(req, fileNameReqd){
//    	console.log(process.env.API_SECRET);
    	var crypto = require('crypto');
    	var requeststring = '';
    	if(fileNameReqd){        	
    		requeststring = req.headers['x-as2-userid'] +  req.params.filename + req.headers['x-as2-timestamp'] + req.rawBody.toString('utf8');
    	} else {
    		requeststring = req.headers['x-as2-userid'] +  req.headers['x-as2-timestamp'] ;	
    	}
    	

    	var hmac = crypto.createHmac('sha256', 'Api Secret');
    	var token = decodeURIComponent(req.headers['x-as2-auth-token']);
    	var tempToken = hmac.update(requeststring).digest('base64');  
    	return token == tempToken;

    }