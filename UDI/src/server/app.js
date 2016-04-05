    var express = require('express'); 
    var app = express(); 

    var rawBodyParser = require('raw-body-parser');
    app.use(rawBodyParser());

    var fs = require('fs');
    var router = express.Router();
    
    app.use('/api/fda-udi', router);
    router.route('/')
    .get(function(req, res) {
    	 res.json({ message: 'hooray! welcome to our api!' }); 
    	 
    });
    router.route('/requests/:filename')
     .post(function(req, res) {
    	 console.log('DEMO---'+req.params.filename);
    	 var rawBody = req.rawBody.toString('utf8');
     	console.log(rawBody);
    	if(!req.headers['x-as2-userid']){
    		return res.json({error_code:401, err_desc:'The user id is not found'});
    	}
//    	if(!req.headers['x-as2-timestamp'] || !req.headers['x-as2-auth-token']){
//    		return res.json({error_code:403, err_desc:'Invalid request'});
//    	}
//    	if(!authenticate(req, true)){
//    		var respData = {
//    				"Code": 401,
//    				"Content": "After concatenating the userid, filename, timestamp, and the content of the HL7 XML file and applying the HMAC-SHA256 with a secret key, the hash value is different than the value in the x-as2-authtoken"
//    			};
//    		return res.json(respData);    		
//    	}
    	if(req.get('Content-Type') =='application/xml'){
    		 	var writeStream = fs.createWriteStream(req.params.filename);
    	    	writeStream.write(rawBody);
    	    	var respData = {
    	    				"Code": 200,
    	    				"Content": { "message-id": req.get('message-id') }
    	    			};
    	    	return res.json(respData);
    	 } else {
    		 return res.json({error_code:403, err_desc:'Invalid Content Type.'});
    	 }
     });
    
    router.route('/responses')
    .get(function(req, res) {
	   	if(!req.headers['x-as2-userid']){
	   		return res.json({error_code:401, err_desc:'The user id is not found'});
	   	}
//   	if(!req.headers['x-as2-timestamp'] || !req.headers['x-as2-auth-token']){
//   		return res.json({error_code:403, err_desc:'Invalid request'});
//   	}
//		   	if(!authenticate(req, true)){
//		   		var respData = {
//						"Code": 401,
//						"Content": "After concatenating the userid, filename, timestamp, and the content of the HL7 XML file and applying the HMAC-SHA256 with a secret key, the hash value is different than the value in the x-as2-authtoken"
//					};
//				return res.json(respData);    		
//		   	}
//   	
			var path=require('path'); 
    		var fileList = [];
			var dir=path.resolve(""); // give path
			console.log(dir);
			var files = fs.readdirSync(dir);
			for (var i=0; i<files.length; i++) {
		        console.log(files[i]);
		        var temp = {"filename": files[i]};
		        fileList.push(temp);
		    }
			var respData = {
					"Code": 200,
					"Content": {"responses" : fileList}
			};
			console.log(respData);
   	    	return res.json(respData);

    });
    
    router.route('/responses/:filename')
    .get(function(req, res) {
	   	if(!req.headers['x-as2-userid']){
	   		return res.json({error_code:401, err_desc:'The user id is not found'});
	   	}
//   	if(!req.headers['x-as2-timestamp'] || !req.headers['x-as2-auth-token']){
//   		return res.json({error_code:403, err_desc:'Invalid request'});
//   	}
//		   	if(!authenticate(req, true)){
//		   		var respData = {
//						"Code": 401,
//						"Content": "After concatenating the userid, filename, timestamp, and the content of the HL7 XML file and applying the HMAC-SHA256 with a secret key, the hash value is different than the value in the x-as2-authtoken"
//					};
//				return res.json(respData);    		
//		   	}
//   	
			var path=require('path');
	        var file = req.params.filename;
	    	var fpath = path.resolve("")+"\\"+file;
			var data = fs.readFileSync(fpath);
			var sts = fs.statSync(fpath);

			
			var respData = {
					"Code": 200,
					"Content": {
								"content" : data.toString(),
								"created-date":sts.ctime
								}
			};
			console.log(respData);
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
    		requeststring = req.params.userID + req.params.fileName + req.query.timestamp;
    	} else {
    		requeststring = req.params.userID + req.params.fileName + req.query.timestamp;	
    	}
    	
    	console.log(requeststring);
    	var hmac = crypto.createHmac('sha256', 'Api Secret');
    	var token = decodeURIComponent(req.headers['x-as2-auth-token']);
    	var tempToken = hmac.update(requeststring).digest('base64');  
    	console.log(tempToken);
    	return token == tempToken;

    }