var Promise = require("es6-promise").Promise;

module.exports = function(app, models){
    var _imgBasePath = "image_store/event/";

    // Two things happen async in this function:
    // creation of the event followed writing image to disk
    var _createEvent = function(eventDetails, imgData){
        var eventPromise = models.Event.createEvent(eventDetails).then(function(eventId){
            var filePath = _imgBasePath + eventId;
            return models.Image.createImage(filePath, imgData).then(function(){
                return eventId;
            });
        });

        return eventPromise;

        // if (tasks.length === 0){
        //     console.log("no tasks, returning event promise");
        //     return eventPromise;
        // } else{
        //     // build query string for tasks async while event query is being made
        //     var taskPromise = models.Task.createMultipleTasks(tasks);

        //     // associate each task_id with the event_id of the newly created event
        //     // then add it to the db
        //     return Promise.all([eventPromise, taskPromise]).then(function(values){
        //         var eventId = values[0];
        //         var task_idArr = values[1];
        //         return models.Event.addTasksToEvent(eventId, task_idArr);
        //     });
        // }
    };

        
    app.post("/event/create", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to create events"});
            return;
        }
        var eventDetails = req.body.eventDetails;
        eventDetails.createdBy = req.session.user.user_id;
        
        _createEvent(eventDetails, req.body.imgData).then(function(results){
            res.send({status: "success"});
        }, function(err){
            console.error(err);
            res.send({status: "error"});
        });
    });

    app.get("/event", function(req, res){
        models.Event.getEvents().then(function(eventObjArr){
            eventObjArr.map(function(eventObj){
                var dateObj = eventObj.date;
                eventObj.date = (dateObj.getUTCMonth() + 1) + "/" +
                                dateObj.getUTCDate() + "/" + 
                                dateObj.getUTCFullYear();
            });
            res.send({status: "success", results: eventObjArr});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });

    app.get("/event/image", function(req, res){
        var eventId = req.query.eventId;
        if (eventId === undefined){
            res.send({status: "error", error: "Event id not defined"});
        }
        var filePath = _imgBasePath + eventId;
        models.Image.getImage(filePath).then(function(imgData){
            res.send({status: "success", results: imgData});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });

    app.post("/event/update_description", function(req,res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to update the description"});
            return;
        }
        models.Event.updateDescription(req.body.eventId, req.body.description)
        .then(function(){
            res.send({status: "success"});
        }, function(err){
            res.send({status: "error", error: err});
        });
    });

    app.post("/event/update_budget", function(req,res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to update the budget"});
            return;
        }
        models.Event.updateBudget(req.body.eventId, req.body.budget)
        .then(function(){
            res.send({status: "success"});
        }, function(err){
            res.send({status: "error", error: err});
        });
    });
}