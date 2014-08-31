module.exports = function(app, models){
    app.get("/task", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to access tasks"});
            return;
        }
        var eventId = req.query.eventId;
        models.Task.getTasksForEvent(eventId)
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
        models.Task.createTask(req.body.taskDetails, req.body.eventId)
        .then(function(taskObj){
            res.send({status: "success", results: taskObj});
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
        models.Task.deleteTask(req.body.taskId, req.body.eventId)
        .then(function(){
            res.send({status: "success"});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });
}