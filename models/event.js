var Promise = require("es6-promise").Promise;

function Event(db){
    this.createEvent = function(eventDetails, tasks){
        return db.query({
            queryString: "INSERT INTO event (name, description, date, location, budget, created_by)\
                          VALUES ($1, $2, $3, $4, $5, $6)\
                          RETURNING event_id;",
            argumentArray: [eventDetails.name,
                            eventDetails.description,
                            eventDetails.date,
                            eventDetails.location,
                            eventDetails.budget,
                            eventDetails.createdBy]
        }).then(function(results){
            return results.rows[0].event_id;
        });
    };

    this.getEvents = function(){
        return db.query({
            queryString: "SELECT event.event_id, event.name, event.description, event.date, event.location, event.budget, users.name AS created_by\
                          FROM event\
                              INNER JOIN users\
                              ON event.created_by = users.user_id;",
            argumentArray: []
        }).then(function(results){
            return results.rows;
        });
    };

    this.addTasksToEvent = function(eventId, taskIdArr){
        var eventToTaskQueryStr = "INSERT INTO event_to_task (event_id, task_id) VALUES ";
        for (var i = 0; i < taskIdArr.length; i++){
            eventToTaskQueryStr += "($1,$" + (i+2) + ")";
            if (i != taskIdArr.length - 1){
                eventToTaskQueryStr += ",";
            }
        }

        var argArr = taskIdArr;
        argArr.unshift(eventId);

        return db.query({
            queryString: eventToTaskQueryStr,
            argumentArray: argArr
        });
    };

    this.addExpenseToEvent = function(eventId, expenseId){
        return db.query({
            queryString: "INSERT INTO event_to_expense (event_id, expense_id)\
                          VALUES ($1, $2);",
            argumentArray: [eventId, expenseId]
        });
    };

    this.updateDescription = function(eventId, description){
        return db.query({
            queryString: "UPDATE event\
                          SET description = $1\
                          WHERE event_id = $2;",
            argumentArray: [description, eventId]
        });
    };

    this.updateBudget = function(eventId, budget){
        return db.query({
            queryString: "UPDATE event\
                          SET budget = $1\
                          WHERE event_id = $2;",
            argumentArray: [budget, eventId]
        });
    };
}


module.exports = function(db){
    return new Event(db);
}