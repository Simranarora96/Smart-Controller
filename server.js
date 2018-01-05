var express=require('express');
var async = require("async");
var app=express();
var session = require('express-session');
var redirect = require("express-redirect");
var mongoose=require('mongoose');
var connect=mongoose.connect('mongodb://localhost/project');
var assert=require('assert');
var bodyParser=require('body-parser');
var params = require('express-params');
var mqtt = require('mqtt')
app.use(bodyParser.json());
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, POST","PUT","DELETE");
  next();
});
app.use(express.static(__dirname + '/public'));
app.use(session({secret: 'sshh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var PeopleSchema = mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    productId: [{ uid : {type:String}, status : {type:String}}],
     //product : [{ type: Schema.Types.ObjectId, ref: 'Product' }]
    }
);

var People = mongoose.model("Final", PeopleSchema);
var user=[];                                        

//-----------------------------------------------fetch user list-------------------------------------
app.get('/user', function(req, res){
   People.find(function(err, response){
      res.json(response);

   });
});

//---------------------------------------------------fetch user--------------------------------------
app.get('/user/:username', function(req, res){
   People.findOne({username:req.params.username},function(err, response){
      console.log(response.productId);
      //console.log(response.productId);

      res.json(response);
   });
});
//-------------------------------------------------- adding new user----------------------------------
app.post('/user', function(req, res){
   var user = req.body;
   var array=[];
   console.log(req.body);
   People.findOne({username:user[0].username},function(err, response){
    if(response==null)
    {
var newPeople = new People({
           username: user[0].username, password: user[0].password}
        );
      
      newPeople.save(function(err, Movie){
         if(err) 
          { console.log("error:   "+err)
            res.send("server error")
          }
          else
          {
          	console.log("entry saved successfully")
          	People.findOne({username:user[0].username},function(err, response){
          		console.log(response)
              res.send(response)
          	});
          	
          }

      });
  	}
 	 else
	  {
	  	console.log("Entry exists!")
	  	res.json({"message":"Entry exists"});
	  }
	});
});
//-------------------------------------user login-----------------------------------------------------
app.post('/userlogin', function(req, res){
	 var var1 = req.body;
   console.log(req.body[0].username);
   People.findOne({username: var1[0].username , password: var1[0].password}, function(err,response) {
    if (err) 
    	{
    		res.json({"message":"server error"});
	}
    if (response) {
    	console.log(response);
    	res.json(response);

    }
    else
{
	
	res.json({"message":"No data found"});
}
});
});

//---------------------------------------------------adding device id-----------------------------------
app.post('/user/:username', function(req, res){
   var var_2=req.body;
   var person=req.params.username;
   var id=var_2[0].productId;
   console.log(id);
    People.findOne({username:person, "productId.uid":id } ,function(err, response){
    		if(response==null){
    			console.log("New product entry")
    			People.findOneAndUpdate({ username: person },{$addToSet:{ productId: { "uid": id, "status":var_2[0].status}}}, function(err,response){
      				if (err) {
        			console.log(err);
        			console.log("Error in updating id")
        			res.json({"message":"error in updating"})

      				};
    			//res.json({"value":"Null"}); we can't use res.json because it will send the res in first iteration & server shuts 
    				if(response){

    					//console.log(response)
              People.findOne({username:person, "productId.uid":id } ,function(err, response){
                console.log(response);
              });
    				res.json({"message":"pushed"})

    				};
    			});
    		}

    		else{
    			console.log("Product Already exists")
    			console.log(response) //comment this later
res.json({"message":"okay"})

    		}
    });
});
    	
//------------------------------------------test----------------------------------------------
app.post('/hello/:username',function(req,res){
	var box=req.body;
	console.log(box[0].productId);
	People.findOne({productId:{ "uid": var_3[0].productId }},function(err, response){
		res.send(response);
	})
});
//------------------------------------user verification/command from web-----------------------
app.post('/userid/:username',function(req,res){
	var var_3=req.body;
	var sub=var_3[0].username;
	var pub=var_3[0].productId;
	var cmd=var_3[0].cmd;
  var myid = var_3[0].id;
	console.log(sub)
	console.log(pub)
	People.findOne({username:sub, "productId.uid":pub },function(err, response){
    if(response==null){
    	res.json({message:"User not found"})
    }
    else{
    	console.log('in else')
    	//var mqtt = require('mqtt')
      var client  = mqtt.connect('mqtt://test.mosquitto.org')
 
      client.on('connect', function () {
       // client.subscribe('mnb')
      var  payload = JSON.stringify({pub:sub,cmd:cmd})
        client.publish(pub, payload)
        client.subscribe(sub)
      })
       
      client.on('message', function (topic, message) {
        // message is Buffer
        console.log(message.toString())
            People.findOneAndUpdate({ 'productId._id': myid}, {$set: {
                   'productId.$.status':message.toString(), }}, function(err,response){
                    if (err) {
                    console.log(err);
                    console.log("Error in updating id")
                    client.end()

                    res.json({"message":"error in updating"})
                    };
                //res.json({"value":"Null"}); we can't use res.json because it will send the res in first iteration & server shuts 
                  if(response){

                    console.log(response)
                    client.end()
                    res.json({message:message.toString()})

                  };
            });
        
      })
    }
	
	});
});

app.get('*', function(req, res) {
            res.sendfile('./public/login.html'); // load our public/index.html file
        });
  app.listen(3000,'127.0.0.1',function(req,res){
   console.log("Server started..");
});

  //-------------------------define function-------------------------
/*function hey(){
    client.on('connect', function () {
  client.subscribe('presence')
  client.publish('presence', 'Hello mqtt')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})
};
    //console.log(details);
    //console.log(details[0].username)
    //topic= details[0].productId//user
    /*username=details[0].username
    client.subscribe('101')
    client.publish({ "topic": "101", "payload": { "username": username, "cmd": "forward" } })
});
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})
};*/