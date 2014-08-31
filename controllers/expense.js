module.exports = function(app, models){
    app.get("/expense", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to access expenses"});
            return;
        }
        var eventId = req.query.eventId;
        models.Expense.getExpensesForEvent(eventId)
        .then(function(expenseObjArr){
            res.send({status: "success", results: expenseObjArr});
        }, function(err){
            res.send({status: "error", error: err});
        });
    });
    app.post("/expense/create", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to create expenses"});
            return;
        }
        console.log("Creating expense...");
        var expenseDetails = req.body.expenseDetails;
        var eventId = req.body.eventId;
        var userId = req.session.user.user_id;
        var _expenseObj; //used to save the expense object to return later
        models.Expense.createExpense(expenseDetails, userId)
        .then(function(expenseObj){
            _expenseObj = expenseObj;
            var expenseId = expenseObj.expense_id;
            console.log("Expense created. expenseId: " + expenseId);
            return models.Event.addExpenseToEvent(eventId, expenseId);
        }).then(function(){
            res.send({status: "success", results: _expenseObj});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });

    app.post("/expense/delete", function(req, res){
        if (req.session.user === undefined || req.session.user.is_admin !== true){
            res.send({status: "error", error: "User does not have the rights to delete expenses"});
            return;
        }
        models.Expense.deleteExpense(req.body.expenseId, req.body.eventId)
        .then(function(){
            res.send({status: "success"});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });
};