var express = require('express');
var router = express.Router();
var db = require('../connectDB');
var randomstring = require('randomstring');
var session = require('express-session');
/* GET home page. */
router.get('/', function(req, res, next) {
    var sess = req.session;
	console.log('session requested');
	console.log('session : '+req.session);
    if(sess.user_session){
	    console.log('Inside session');
        var sql = "select * from userdetails where sessionid='"+sess.user_session+"'";
        db.query(sql, function (err, results, fields) {
        	var name = 'level'+results[0].level;
            if (err) {
                // DB ERROR
                console.log('\n\nDB ERROR: ' + err);
            }
            else if(results.length>0){
            	if(results[0].level>3)
            		res.render('soon');
            	else{
                    res.render(name,{
                    name:results[0].uname
                    //q_no:results[0].level
            		});
               	}
	    }
            else{
                res.render('error');
            }
        
    });
    
}
  else{
        res.render('index', { title: 'Express' });
   }
});

router.post('/login',function(req,res){
    var sess = req.session;
    if(sess.user_session){
    var sql = "select * from userdetails where sessionid = '"+sess.user_session+"'";
        db.query(sql,function(err,result,field){
        var name = 'level'+result[0].level;
        if(err){
        console.log("Session error");

        }
        else if(result.length>0){
            if(result[0].level>3)
            	res.render('soon');
            else{
            	res.render(name,{
            	    name : result[0].uname
            	    //q_no : result[0].level
            	});
        	}
        }
        else{
            res.render('error');
        }
        });
    }
    else{
    var sql = "select * from userdetails where email ='"+req.body.email+"' and pass ='"+req.body.pass+"'";
  	db.query(sql, function (err, results, fields) {
            if (err) {
                // DB ERROR
                console.log('\n\nDB ERROR: ' + err);
            }
            else if(results.length>0){
                console.log('Login Successful');
                var name = 'level'+results[0].level;
                sess.user_session = randomstring.generate(20);
                db.query("update userdetails set sessionid='"+sess.user_session+"' where email='"+results[0].email+"' and pass='"+results[0].pass+"'",function(err1,results1){
                    if(err){console.log('DB ERROR!!!')}
                    else{
                    	if(results[0].level>3)
            				res.render('soon');
            			else{
                        	res.render(name,{
                        	name:results[0].uname
                        	//q_no:results[0].level
                			});
                        }
                    }
                });
                
            }
            else {
                //console.log("ERROR!!!");
                res.send('Invalid Username or password!!!');
            }
    });
  }
});

router.post('/check',function(req,res){
    var sess = req.session;
    var que = "select * from questionbank where level=";
    var que1 = "update userdetails set level=level+1, time=now(), date=now() where sessionid = '"+sess.user_session+"'";
    var que2 = "select * from userdetails where sessionid = '"+sess.user_session+"'";
    db.query(que2, function(err1,results1){
    	if(err1){
    		console.log(err1);
    	}
    	else{
    		db.query(que+results1[0].level, function(err,results){
        	if(err){
	    		console.log(que);
            	console.log('ERROR!!!'+err);
        	}
        	else if(results.length>0){
        	    if(results[0].answer == req.body.answer && results1[0].level==parseInt(req.body.q_no)){
        	        db.query(que1, function(err2,results2){
        	        	if(err){
        	        		res.send('Unauthorized access!!!');
        	        	}
        	        	else{
        	        		res.send('You have Won!!!');
        	        		//res.redirect('/');
        	        	}
        	        });
        	    }
	    		else{
	    			res.render('wrong',{
	    				name:results[0].uname
	    			});
	    		}
        		}
        	else{
        	    res.send('Unauthorized access!!!');
        	}
			});
		}
	});
});

router.get('/logout', function (req, res) {
	sess = req.session;
	sess.user_session = "";
	var temp_sess = sess.user_session;
	sess.user_session = "";
	req.session.destroy(function (err) {
		if (err) {
			console.log("Not destroyed "+err);
		}
		else{
			db.query("update userdetails set sessionid='' where sessionid='"+temp_sess+"'", function(err1){
				if (err1) {
					console.log("DB error "+err1);
					}
				else{
			 		res.redirect('/');
				}
			});
		}
	});
});

router.get('/leaderboard',function(req,res){
	var que = "select * from userdetails order by time,date asc,level desc";
	db.query(que,function(err,results){
		if(err){
			res.render('error');
		}
		else{
			res.render('leaderboard',{
				results:results
			});
		}
	});
});

router.get('/signup',function(req,res){
	db.query("insert into userdetails (email,pass,uname,level) values ("+req.body.email+','+req.body.pass+','+req.body.uname+','+"1"+")",function(err,result){
		if(err){
			res.render('error');
		}
		else{
			res.redirect('/');
		}
	});
});

module.exports = router;
