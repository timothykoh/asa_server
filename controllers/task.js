module.exports = function(app, models){
    app.get("/task", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to access tasks"});
            return;
        }
        var taskId = req.query.taskId;
        var userId = req.session.user.user_id;
        models.Task.getTask(taskId, userId)
        .then(function(taskObj){
            res.send({status: "success", results: taskObj});
        }, function(err){
            res.send({status: "error", error: err});
        });
    });
    app.get("/task/by_event", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to access tasks"});
            return;
        }
        var eventId = req.query.eventId;
        var userId = req.session.user.user_id;
        models.Task.getTasksForEvent(eventId, userId)
        .then(function(taskObjArr){
            res.send({status: "success", results: taskObjArr});
        }, function(err){
            res.send({status: "error", error: err});
        });
    });

    app.get("/task/by_event/for_user", function(req,res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to access tasks"});
            return;
        }
        var eventId = req.query.eventId;
        var userId = req.session.user.user_id;
        models.Task.getUserTasksForEvent(eventId, userId)
        .then(function(taskObjArr){
            res.send({status: "success", results: taskObjArr});
        }, function(err){
            res.send({status: "error", error: err});
        });
    });

    app.post("/task/create", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to create tasks"});
            return;
        }
        var taskDetails = req.body.taskDetails;
        taskDetails.createdBy = req.session.user.user_id;

        models.Task.createTask(taskDetails, req.body.eventId)
        .then(function(){
            res.send({status: "success"});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });

    app.post("/task/delete", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to delete tasks"});
            return;
        }
        models.Task.deleteTask(req.body.taskId)
        .then(function(results){
            res.send({status: "success"});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });

    app.post("/task/timeslot/signup", function(req, res){
        if (req.session.user === undefined){
            res.send({status: "error", error: "User is not logged in."});
            return;
        }
        models.Task.addUserToTimeSlot(req.body.timeSlotId, req.session.user.user_id)
        .then(function(){
            res.send({status: "success"});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });

    app.post("/task/timeslot/cancel", function(req, res){
        if (req.session.user === undefined){
            res.send({status: "error", error: "User is not logged in."});
            return;
        }
        models.Task.cancelTimeSlot(req.body.timeSlotId, req.session.user.user_id)
        .then(function(){
            res.send({status: "success"});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });
}