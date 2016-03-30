    var express = require('express'); 
    var app = express(); 
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var fs = require('fs');

    app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    /** Serving from the same express Server
    No cors required */
    app.use(express.static('../client'));
    app.use(bodyParser.json());  

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
        }
    });

    var upload = multer({ //multer settings
                    storage: storage
                }).single('file');

    /** API path that will upload the files */
    app.post('/upload/:fileName/:userID/', function(req, res) {
//    	console.log(req.query.timestamp);
    	console.log(authenticate(req));
    	if(!authenticate(req)){
    		return res.json({error_code:500,err_desc:'Authentication Failed'});    		
    	}
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
             res.json({error_code:0,err_desc:null});
        });
    });

    /** API path that will fetch list of files */
    app.get('/download', function(req, res) { // create download route
    	  var path=require('path'); // get path
    	  var dir=path.resolve(".")+'/uploads/'; // give path
    	    fs.readdir(dir, function(err, list) { // read directory return  error or list
    	    if (err) 
    	    	return res.json(err);
    	    else
    	         res.json(list);
 	        });

    	});
    
    /** API path that will download file */
    app.get('/download/:file(*)', function(req, res, next){ // this routes all types of file
    	  var path=require('path');
    	  var file = req.params.file;
    	  var path = path.resolve(".")+'/uploads/'+file;
    	  res.download(path); // magic of download fuction

    	});
    
    app.listen('3000', function(){
        console.log('running on 3000...');
    });
    
    authenticate = function(req){
//    	console.log(process.env.API_SECRET);
    	var crypto = require('crypto');    	 
    	var requeststring = req.params.userID + req.params.fileName + req.query.timestamp;
    	console.log(requeststring);
    	var hmac = crypto.createHmac('sha256', 'Api Secret');
    	var token = decodeURIComponent(req.query.token);
    	var tempToken = hmac.update(requeststring).digest('base64');  
    	console.log(tempToken);
    	return token == tempToken;
    	
    	/*if (token != tempToken) {
    		return false;
//    	       return res.json({ success: false, message: 'Failed to authenticate token.' });    
    	} else{
    		return true;
    	}*/
    }