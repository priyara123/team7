var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
var bcrypt = require ('bcrypt');
var ses;
var mongojs = require('mongojs');
var db = mongojs('multitenant' , ['resource', 'task', 'project', 'Sprints']);
var tenantid;
var count = 1;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('signup');
});

router.get('/kanban', function(req, res, next) {
  res.render('Kanban');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.get('/waterfall', function(req, res) {
  res.render('waterfall');
});

router.get('/resource', function(req, res) {
  res.render('resource');
});

router.get('/kanbanrsc', function(req, res) {
  res.render('kanbanrsc');
});

router.get('/story', function(req, res) {
  //res.render('story');//edited
  res.render('story');
});

router.get('/sprint', function(req, res) {
  res.render('sprint');
});
router.get('/previousCardAdd', function(req, res) {
	db.task.find({tenantid : parseInt(tenantid) },function(err, docs){
		if(err){
			throw err;
		}
		else{
			res.send({'doc':docs,'tenantid' : tenantid});
		}
	});
});


router.get('/fetchCardNo', function(req, res) {
	db.task.count({tenantid : parseInt(tenantid) },function(err, count){
		if(err){
			//console.log("error");
			throw err;
		}
		else{
			//console.log(count);
			//console.log("There are " + count + " records.");
			res.json(count);
		}
	});
});

router.post('/cardDetails', function(req, res) {
	db.task.insert(req.body , function (err, doc) {
		if(err){
			//console.log("error");
			throw err;
		}
		else{
			//console.log(doc);		
			res.json({"docs":doc});
		}
	});
});
router.get('/getResourceList', function(req, res) {
	db.resource.find({tenantid : parseInt(tenantid) },function(err, docs){
		if(err){
			//console.log("error");
			throw err;
		}
		else{
			res.send({'doc':docs,'tenantid' : tenantid});
		}
	});
});

router.get('/getTaskList', function(req, res) {
	db.task.find({tenantid : parseInt(tenantid) },function(err, docs){
		if(err){
			//console.log("error");
			throw err;
		}
		else{
			//console.log(docs);
			res.send({'doc':docs,'tenantid' : tenantid});
		}
	});
});

router.get('/getSumOfPlanned', function(req, res) {
		db.task.aggregate([
                     { $match: { tenantid: tenantid } },
                     { $group: { _id: "$projectid", total: { $sum: "$plannedHours" } } },
                     { $sort: { total: -1 } }
                   ],function(err, docs){
		if(err){
			//console.log("error");
			throw err;
		}
		else{
			console.log(docs);
			res.json(docs);
		}
	});
});

router.get('/getSumOfActual', function(req, res) {
		db.task.aggregate([
                     { $match: { tenantid: tenantid } },
                     { $group: { _id: "$projectid", total: { $sum: "$actualHours" } } },
                     { $sort: { total: -1 } }
                   ],function(err, docs){
		if(err){
			console.log("error");
			throw err;
		}
		else{
			console.log(docs);
			res.json(docs);
		}
	});
});

router.post('/checkResource', function(req, res) {
	console.log('check');
	db.resource.find( { tenantid: parseInt(tenantid) , projectid : parseInt(req.body.projectid) , email: { $regex: req.body.email, $options: 'i' }} ,function(err, docs){
		if(err){
			console.log("error");
			throw err;
		}
		else{
			console.log('inside check'+docs);
			res.json(docs);
		}
	});
});

router.get('/getProjectDetails', function(req, res) {
	db.project.find({tenantid : parseInt(tenantid) },function(err, docs){
		if(err){
			console.log("error");
			throw err;
		}
		else{
			console.log(docs);
			res.json(docs);
		}
	});
});


router.get('/logout', function(req, res){
	console.log(req.session.username);
	  req.session.destroy(function(err){
		  if(err){
			  //console.log(err);
			  throw err;
		  }
		  else{
			  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'); 
			  res.redirect('/signup');
		  }
	  });
});

router.get('/getTechnology', function(req, res) {
  var sqlGetTechnology = "select distinct technologyName from TECHNOLOGY"; 
	//console.log(sqlGetTechnology);
	mysql.handle_database(function(err,results){
		if(err){
			//console.log("error");
			throw err;
		}
		else 
		{
			if(results.length > 0){
				//console.log(JSON.stringify(results));
					res.send({"data":results});
				}
		}
	},sqlGetTechnology);
});


router.post('/saversc', function(req, res) {
	db.resource.insert(req.body , function (err, doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			res.json(doc);
		}
	});
});

router.post('/saveProject', function(req, res) {
	db.project.insert(req.body, function (err, doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			res.json(doc);
		}
	});
});

router.post('/savetask', function(req, res) {
	db.task.insert(req.body , function (err, doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			res.json(doc);
		}
	});
});

router.get('/deletersc/:id', function(req, res) {
	var id = req.params.id;
	db.resource.remove({_id: mongojs.ObjectId(id)},function (err,doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			res.json(doc);
		}
	});
});

router.get('/deletetask/:id', function(req, res) {
	var id = req.params.id;
	db.task.remove({_id: mongojs.ObjectId(id)},function (err,doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			res.json(doc);
		}
	});
});

router.get('/editrsc/:id', function(req, res) {
	var id = req.params.id;
	db.resource.findOne({_id: mongojs.ObjectId(id)},function (err,doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			res.json(doc);
		}
	});
});

router.get('/edittask/:id', function(req, res) {
	var id = req.params.id;
	db.task.findOne({_id: mongojs.ObjectId(id)},function (err,doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			console.log(doc);
			res.json(doc);
		}
	});
});

router.post('/updatersc/:id', function(req, res) {
	var id = req.params.id;
	db.resource.findAndModify({query: {_id: mongojs.ObjectId(id)},
		update:{$set : {name : req.body.name, email : req.body.email}},
		new : true},function (err,doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			res.json(doc);
		}
	});
});

router.post('/updateProjectDetails/:tenantid', function(req, res) {
	var id = parseInt(req.params.tenantid);
	console.log(id);
	db.project.findAndModify({query: {tenantid: id},
		update:{$set : {projectname : req.body.projectname, projectstart : req.body.projectstart, projectend : req.body.projectend}},
		new : true},function (err,doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			console.log(doc);
			res.json(doc);
		}
	});
});

router.post('/updatetask/:id', function(req, res) {
	var id = req.params.id;
	db.task.findAndModify({query: {_id: mongojs.ObjectId(id)},
		update:{$set : {name : req.body.name, plannedHours : req.body.plannedHours, startDate : req.body.startDate, endDate : req.body.endDate, resource : req.body.resource, comments : req.body.comments, actualHours : req.body.actualHours}},
		new : true},function (err,doc) {
		if(err){
			console.log("error");
			throw err;
		}
		else{
			console.log(doc);
			res.json(doc);
		}
	});
});

router.post('/aftersignup', function(req, res) {

	var sqlFindUser = "select username from TENANT where username='"+req.body.username+"'";
	console.log("Request body after signn up");
	console.log(req.body);
	
	mysql.handle_database(function(err,results){
		console.log("response after sign up...");
		console.log(results);
		if(err){
			console.log("error");
			throw err;
		}
		else 
		{
			if(results.length > 0){
				//console.log("User alreasy exists");
				res.send({"signup":"Fail"});
			}
			else{    
				//console.log("New user");
				bcrypt.genSalt(10, function(err, salt) {
				    bcrypt.hash(req.body.password, salt, function(err, hash) {
				    	var sqlNewUser = "insert into TENANT (firstName,lastName,username,password,type) values ('"+req.body.firstname+"','"+req.body.lastname+"','"+req.body.username+"','"+hash+"','"+req.body.type+"')";
							//console.log("Query is:"+sqlNewUser);
							
							mysql.handle_database(function(err,results){
							//console.log("inside");
							if(err){
								console.log("error");
								throw err;
							}
								ses=req.session;
				    		ses.username=req.body.username;
				    		tenantid = results.insertId;
				    		//console.log('signup tenant'+ tenantid);
				    		//console.log(ses.username + "is session username");
				    		if(req.body.type == 'Waterfall'){
				    			res.send({"signup":"Waterfall"});
				    		}
				    		else if(req.body.type == 'Scrum'){
				    			res.send({"signup":"Scrum"});
				    		}
				    		else if(req.body.type == 'Kanban'){
				    			res.send({"signup":"Kanban"});
				    		}
							},sqlNewUser);
				    });
					});
				//console.log("User added");
				}
		}
	},sqlFindUser);
});

router.post('/afterlogin', function(req, res) {
	var sqlFindUser = "select username,tenantId from TENANT where username='" + req.body.username + "'";
	console.log("req body is ***********************:");
	console.log(req.body);
	mysql.handle_database(function(err,results){
		if(err){
			console.log("error");
			throw err;
		}
		else{
			if(results.length > 0){
				tenantid = results[0].tenantId;
				var sqlGetPassword = "select password from TENANT where username='"+req.body.username+"'";
				
				mysql.handle_database(function(err,results){
					if(err){
						console.log("error");
						throw err;
					}
					else{
						//console.log("results"+results);
						 bcrypt.compare(req.body.password, results[0].password, function(err, response) {
						    	console.log("request's pwd: "+req.body.password+"sql pwd is: "+results[0].password);
						    	console.log("output of bcrypt compare is************************** " +response);
						    	if(response){
						    		ses=req.session;
						    		ses.username=req.body.username;
						    		//console.log(ses.username + "is session username");
						    		if(req.body.type == 'Waterfall'){
						    			res.send({"login":"Waterfall"});
						    		}
						    		else if(req.body.type == 'Scrum'){
						    			res.send({"login":"Scrum"});
						    		}
						    		else if(req.body.type == 'Kanban'){
						    			res.send({"login":"Kanban"});
						    		}
						    	}
						    	else{
						    			console.log("InValid user*********************************************");
										res.send({"login":"Fail"});
						    	}
						    });
					}
				},sqlGetPassword);		
			}
			else {  
			//	console.log("InValid user");
				res.send({"login":"Fail"});
			}
		}
	},sqlFindUser);
});

router.get('/scrumColumnList', function(req, res) {
	console.log("*******************************ENTERED SCRUM COL LIST***********************************");
	console.log("tenantid " + tenantid);
  	var sqlGetTechnology = "select * from TECHNOLOGY where technologyId = 2 and tenantId = " + "'"+ tenantid + "'"; 
	mysql.handle_database(function(err,results) {
		if(err){
			res.status(404).send('Failed to fetch scrum col list, error: ' + err);
		}
		else 
			res.send(results);
	},sqlGetTechnology);
});

//get all user stories
router.get('/userStoryList', function (req, res) {
	db.task.find({tenantId : parseInt(tenantid) }, function(err, docs){
    res.json(docs);
	});	
});

//get the distinct sprintIds
router.get('/sprintIdList', function (req, res) {
	db.Sprints.find({tenantId: tenantid},function(err, docs) {
		res.json(docs);
	});	
});

//add new Sprint
router.post('/sprintIdList', function (req, res) {
	//add the sprinId, sprintStatus and expectedPoints for the sprint dynamically.
	req.body.sprintId = 'Sprint ' + (count);
	req.body.sprintExpectedPoints = (req.body["days"]) * (req.body["teamSize"] * 3);
	req.body.sprintStatus = 0; 
    req.body.tenantId = parseInt(tenantid);
	//console.log("sprintId: " + req.body.sprintId + "; count: " + count + "; sprintStatus: " + req.body.sprintStatus + "; expectedPoints: " + req.body.sprintExpectedPoints);
	count++;
	if(req.body.teamSize > 0) {
			//using standard velocity per person per day = 3
			db.Sprints.insert(req.body, function(err, doc) {
				res.json(doc);
			});
	}
});

//to get the user stories based on sprintId
router.get('/sprintStoryList/:sprintId', function (req, res) {
	db.task.find({tenantId : parseInt(tenantid),"sprintId": req.params.sprintId}, function(err, docs){
		res.json(docs);
	});	
});

//add story
router.post('/userStoryList', function (req, res) {	
	console.log("entered add story*****************************");
	console.log(req.body);
	req.body.userStoryStatus = 0;
	req.body.technology = "Scrum";
  	req.body.tenantId = parseInt(tenantid);
	db.task.insert(req.body, function(err, doc) {
		res.json(doc);
		console.log("my add stry repsonse************")
		console.log(doc);
	});
});

//delete story
router.delete('/userStoryList/:id', function(req, res) {
	var id = req.params.id;
	db.task.remove({_id: mongojs.ObjectId(id)}, function(err, doc) {
		res.json(doc);
	});
});

//edit story
router.get('/userStoryList/:id', function(req,res) {
	var id = req.params.id;
	db.task.findOne({_id: mongojs.ObjectId(id)}, function(err, doc) {
		res.json(doc);
	});
});

//update user story
router.put('/userStoryList/:id', function(req,res) {
	var columnList = new Object();
	var id = req.params.id;
  	var sqlGetTechnology = "select * from TECHNOLOGY where technologyId = 2 and tenantId = " + "'"+ tenantid + "'"; 
	mysql.handle_database(function(err,results) {
		if(err){
			throw err;
		}
		else 
		{
			if(results.length > 0){
					columnList = results[0].columnList;
				}
		}
	},sqlGetTechnology);
	
	var updatedObject = new Object();
    for (var attrName in req.body) {
    	if(attrName != '_id')
    		updatedObject[attrName] = req.body[attrName];
    }
	
	db.task.findAndModify({query: {_id: mongojs.ObjectId(id)}, 
		update: {$set: updatedObject}},
		function(err, doc) {
			if(err) {
				console.log("*******error in update story!!!********" + err);
				throw err;
			}
			res.json(doc);
		});
});

//mark sprint complete -->update corresponding userStories to completed; i.e. userStoryStatus = 2; and corresponding sprintStatus = 2.
router.put('/:sprintId', function(req,res) {
	var errStep1 = null;
	db.task.update({"sprintId": req.params.sprintId}, { $set: {userStoryStatus: 2}},{multi: true}, 
		function(err, doc) {
			errStep1 = err;
			if (err)
				res.status(404).send('Failed to update task, error: ' + err);
		});
	if (!errStep1)
		db.Sprints.update({"sprintId": req.params.sprintId}, { $set: {sprintStatus: 2}},{multi: true}, 
			function(err,doc) {
				if (err)
					res.status(404).send('Failed to update Sprints, error: ' + err);
				else
					res.json(doc);
			});
});

//calculate the actual points of a sprint.
router.get('/actualPoints', function(req,res) {
	var errStep1 = null;
	var pts = {"foo": 1};
	db.task.aggregate(
   [
        { $match: { $and: [{tenantId: parseInt(tenantid)}, {userStoryStatus: 2}]}},
        { $group: {
           _id: null,
           total: { $sum:  "$points"  }
        }}
   ], function(err, doc) {
   		errStep1 = err;
   		if(!err) {
   			pts = doc;
   			if(doc[0]) {
   				pts[0].actualPoints = doc[0].total;
   			}
   			//else executes when there is no doc[0]--> meaning, there are no records in task collection.
   			else { 
   				pts.actualPoints = 0; 
   			}
	   	}
	   	else {
	   		res.status(404).send('Failed to fetch actual points, error: ' + err);
	   	}
   });
	if(!errStep1) {
		db.Sprints.aggregate(
   		[
            {$match: {tenantId: parseInt(tenantid)}},
        		{$group: {
           			_id: null,
           			total: { $sum:  "$sprintExpectedPoints"  }
      		}}
   		], function(err, doc) {
   			if(!err) {
   				//this if condition handles pts[0] undefined error. This error occurs because of the async nature of nodejs. To repro the error, remove if condition.
   				if(!pts[0]) { 
   					pts = doc;
   				} 
   				//this if-else block handles doc[0] undefined error
   				if(doc[0]) {
   					pts[0].expectedPoints = doc[0].total;
   					res.json(pts);
   				}
   				//else executes when there is no doc[0]--> meaning, there are no records in Sprints collection.
   				else { 
   					pts.expectedPoints = 0; 
   					res.json(pts); 
   				}
   			}
   			else {
   				res.status(404).send('Failed to fetch expected points, error: ' + err);
   			}
   		});
	}
});

module.exports = router;
