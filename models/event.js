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
                              ON event.created_by = users.user_id\
                          ORDER BY event.date DESC;",
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

    this.selectGoing = function(eventId, userId){
        return db.query({
            queryString: "INSERT INTO event_to_attendance (event_id, user_id)\
                          VALUES ($1, $2);",
            argumentArray: [eventId, userId]
        });
    };

    this.selectNotGoing = function(eventId, userId){
        return db.query({
            queryString: "DELETE FROM event_to_attendance\
                          WHERE event_id = $1\
                          AND user_id = $2;",
            argumentArray: [eventId, userId]
        });
    };

    this.getAttendance = function(eventId, userId){
        return db.query({
            queryString: "SELECT is_going\
                          FROM event_to_attendance\
                          WHERE event_id = $1\
                          AND user_id = $2;",
            argumentArray: [eventId, userId]
        }).then(function(results){
            if (results.rows.length === 0){
                return undefined;
            }
            return results.rows[0].is_going;
        });
    };

    this.updateAttendance = function(eventId, userId, isGoing){
        return db.query({
            queryString: "UPDATE event_to_attendance\
                          SET is_going = $1\
                          WHERE event_id = $2\
                          AND user_id = $3\
                          RETURNING 1;",
            argumentArray: [isGoing, eventId, userId]
        }).then(function(results){
            if (results.rows.length === 0){
                return db.query({
                    queryString: "INSERT INTO event_to_attendance (event_id, user_id, is_going)\
                                  VALUES ($1, $2, $3);",
                    argumentArray: [eventId, userId, isGoing]
                });
            }
        });
    };

    this.getAllAttendance = function(eventId){
        return db.query({
            queryString: "SELECT users.user_id, users.name, users.fb_id, event_to_attendance.is_going\
                          FROM event_to_attendance\
                                INNER JOIN users\
                                ON users.user_id = event_to_attendance.user_id\
                          WHERE event_id = $1;",
            argumentArray: [eventId]
        }).then(function(results){
            var rows = results.rows;
            var goingArr = new Array(rows.length);
            var j = 0;
            var notGoingArr = new Array(rows.length);
            var k = 0;
            for (var i = 0; i < rows.length; i++){
                var row = rows[i];
                if (row.is_going){
                    goingArr[j] = row;
                    j++;
                } else{
                    notGoingArr[k] = row;
                    k++;
                }
            }
            return {
                goingArr: goingArr.slice(0,j),
                notGoingArr: notGoingArr.slice(0, k)
            };
        });
    };
}


module.exports = function(db){
    return new Event(db);
}