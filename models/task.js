var Promise = require("es6-promise").Promise;

function Task(db){
    var _createTaskTimeSlots = function(timeSlotMap){
        return new Promise(function(resolve, response){
            resolve();
        }).then(function(){
            var timeSlotQueryString = "INSERT INTO task_timeslot (date, timeslot, num_people) VALUES ";
            var timeSlotArgArr = [];
            var i = 1;
            for (var date in timeSlotMap){
                for (var timeSlot in timeSlotMap[date]){
                    var numPeople = timeSlotMap[date][timeSlot];
                    if (numPeople === 0){
                        continue;
                    }
                    timeSlotQueryString += "($" + i + ",$" + (i+1) + ",$" + (i+2) + "),";
                    timeSlotArgArr.push(date, timeSlot, numPeople);
                    i += 3;
                }
            }

            timeSlotQueryString = timeSlotQueryString.replace(/,$/g, "");
            timeSlotQueryString += "RETURNING task_timeslot_id;"
            return db.query({
                queryString: timeSlotQueryString,
                argumentArray: timeSlotArgArr
            }).then(function(results){
                var timeSlotIdArr = results.rows.map(function(elem){
                    return elem.task_timeslot_id;
                });
                return timeSlotIdArr;
            });
        });
    };

    var _createTask = function(taskDetails, eventId){
        return db.query({
            queryString: "INSERT INTO task (name, created_by)\
                          VALUES ($1, $2)\
                          RETURNING task_id;",
            argumentArray: [taskDetails.name, taskDetails.createdBy]
        }).then(function(results){
            var taskId = results.rows[0].task_id;
            return db.query({
                queryString: "INSERT INTO event_to_task (event_id, task_id)\
                              VALUES ($1, $2);",
                argumentArray: [eventId, taskId]
            }).then(function(){
                return taskId;
            });
        });
    };

    var _addTimeSlotsToTask = function(taskId, timeSlotIdArr){
        var queryStr = "INSERT INTO task_to_timeslot (task_id, task_timeslot_id) VALUES ";
        for (var i = 0; i < timeSlotIdArr.length; i++){
            queryStr += "($1,$" + (i+2) + "),";
        }
        queryStr = queryStr.replace(/,$/g, ";");
        var argArr = timeSlotIdArr;
        argArr.unshift(taskId);
        return db.query({
            queryString: queryStr,
            argumentArray: argArr
        });
    };

    this.createTask = function(taskDetails, eventId){
        var taskPromise = _createTask(taskDetails, eventId);
        var timeSlotPromise = _createTaskTimeSlots(taskDetails.timeSlotMap);
        return Promise.all([taskPromise, timeSlotPromise]).then(function(values){
            var taskId = values[0];
            var timeSlotIdArr = values[1];
            return _addTimeSlotsToTask(taskId, timeSlotIdArr);
        });
    };

    // @requires fieldsToConcat is an array of arrays
    // @requires fieldsToSum is an array of numeric types
    var _objectGroupBy = function(objArr, properties){
        var primaryKeyArr = properties.primaryKeyArr ? properties.primaryKeyArr : [];
        var fieldsToConcat = properties.fieldsToConcat ? properties.fieldsToConcat : [];
        var fieldsToSum = properties.fieldsToSum ? properties.fieldsToSum : [];

        var currObj;
        var groupedObjArr = [];
        var primaryKeysMatch;
        for (var i = 0; i < objArr.length; i++){
            var obj = objArr[i];
            if (currObj === undefined){
                currObj = obj;
                groupedObjArr.push(currObj);
                continue;
            }
            primaryKeysMatch = true;
            for (var j = 0; j < primaryKeyArr.length; j++){
                // if any of the primary keys don't match, push a new obj on and
                // start working on that
                var primaryKey = primaryKeyArr[j];
                if (currObj[primaryKey] != obj[primaryKey]){
                    currObj = obj;
                    groupedObjArr.push(currObj);
                    primaryKeysMatch = false;
                    break;
                }

            }
            if (primaryKeysMatch){
                // when the keys are the same, execute all the grouping operations
                for (var j = 0; j < fieldsToConcat.length; j++){
                    var concatField = fieldsToConcat[j];
                    currObj[concatField] = currObj[concatField].concat(obj[concatField]);
                }
                for (var j = 0; j < fieldsToSum.length; j++){
                    var sumField = fieldsToSum[j];
                    currObj[sumField] += obj[sumField];
                }
            }
        }
        return groupedObjArr;
    };

    function groupTasks(taskObjArr){
        // group assignees together for each time slot
        var taskObjArr = taskObjArr.map(function(elem){
            var assigneeArr, numAssignees;
            if (elem.assigned_to_user_id === null){
                numAssignees = 0;
                assigneeArr = [];
            } else{
                numAssignees = 1;
                assigneeArr = [{
                    userId: elem.assigned_to_user_id,
                    name: elem.assigned_to_name,
                    isSelf: elem.assigned_to_self
                }];
            }
            var dateObj = elem.date;
            var dateStr = (dateObj.getUTCMonth() + 1) + "/" +
                          dateObj.getUTCDate() + "/" + 
                          dateObj.getUTCFullYear();
            return {
                taskId: elem.task_id,
                name: elem.name,
                createdBy: elem.created_by,
                timeSlotId: elem.task_timeslot_id,
                date: dateStr,
                timeSlot: elem.timeslot,
                numPeople: elem.num_people,
                numAssignees: numAssignees,
                assigneeArr: assigneeArr
            };
        });
        taskObjArr = _objectGroupBy(taskObjArr, {
            primaryKeyArr: ["date", "timeSlot"],
            fieldsToConcat: ["assigneeArr"],
            fieldsToSum: ["numAssignees"]
        });

        // group timeslots together for each task
        taskObjArr = taskObjArr.map(function(elem){
            
            return {
                taskId: elem.taskId,
                name: elem.name,
                createdBy: elem.createdBy,
                totalNumPeople: elem.numPeople,
                totalNumAssignees: elem.numAssignees,
                timeSlotObjArr: [{
                    timeSlotId: elem.timeSlotId,
                    date: elem.date,
                    timeSlot: elem.timeSlot,
                    numPeople: elem.numPeople,
                    numAssignees: elem.numAssignees,
                    assigneeArr: elem.assigneeArr
                }]
            };
        });

        taskObjArr = _objectGroupBy(taskObjArr, {
            primaryKeyArr: ["taskId"],
            fieldsToConcat: ["timeSlotObjArr"],
            fieldsToSum: ["totalNumPeople", "totalNumAssignees"]
        });
        return taskObjArr;
    }

    this.getTask = function(taskId, userId){
        return db.query({
            queryString: "SELECT task.task_id, task.name, created_by_user.name AS created_by,\
                                 task_timeslot.task_timeslot_id, task_timeslot.date,\
                                 task_timeslot.timeslot, task_timeslot.num_people,\
                                 assigned_to_users.user_id AS assigned_to_user_id, assigned_to_users.name AS assigned_to_name,\
                                 (assigned_to_users.user_id = $1) AS assigned_to_self\
                          FROM task\
                                INNER JOIN users AS created_by_user\
                                ON created_by_user.user_id = task.created_by\
                                LEFT OUTER JOIN task_to_timeslot\
                                ON task_to_timeslot.task_id = task.task_id\
                                LEFT OUTER JOIN task_timeslot\
                                ON task_to_timeslot.task_timeslot_id = task_timeslot.task_timeslot_id\
                                LEFT OUTER JOIN timeslot_to_user\
                                ON timeslot_to_user.task_timeslot_id = task_timeslot.task_timeslot_id\
                                LEFT OUTER JOIN users AS assigned_to_users\
                                ON assigned_to_users.user_id = timeslot_to_user.user_id\
                          WHERE task.task_id = $2;",
            argumentArray: [userId, taskId]
        }).then(function(results){
            var taskObjArr = groupTasks(results.rows);
            return taskObjArr[0];
        });
    }

    this.getTasksForEvent = function(eventId, userId){
        return db.query({
            queryString: "SELECT task.task_id, task.name, created_by_user.name AS created_by,\
                                 task_timeslot.task_timeslot_id, task_timeslot.date,\
                                 task_timeslot.timeslot, task_timeslot.num_people,\
                                 assigned_to_users.user_id AS assigned_to_user_id, assigned_to_users.name AS assigned_to_name,\
                                 (assigned_to_users.user_id = $1) AS assigned_to_self\
                          FROM event_to_task\
                                INNER JOIN task\
                                ON task.task_id = event_to_task.task_id\
                                INNER JOIN users AS created_by_user\
                                ON created_by_user.user_id = task.created_by\
                                LEFT OUTER JOIN task_to_timeslot\
                                ON task_to_timeslot.task_id = task.task_id\
                                LEFT OUTER JOIN task_timeslot\
                                ON task_to_timeslot.task_timeslot_id = task_timeslot.task_timeslot_id\
                                LEFT OUTER JOIN timeslot_to_user\
                                ON timeslot_to_user.task_timeslot_id = task_timeslot.task_timeslot_id\
                                LEFT OUTER JOIN users AS assigned_to_users\
                                ON assigned_to_users.user_id = timeslot_to_user.user_id\
                          WHERE event_to_task.event_id = $2;",
            argumentArray: [userId, eventId]
        }).then(function(results){
            return groupTasks(results.rows);
        });
    };

    this.createMultipleTasks = function(tasks){
        // build query string for tasks
        var taskQueryStr = "INSERT INTO task (name, num_people) VALUES ";
        var taskArgArr = new Array(tasks.length * 2);
        for (var i = 0; i < tasks.length; i++){
            var task = tasks[i];
            taskQueryStr += "($" + (2*i + 1) + ",$" + (2*i+2) + ")";
            if (i != tasks.length - 1){
                taskQueryStr += ",";
            }
            taskArgArr[2*i] = task.name;
            taskArgArr[2*i+1] = task.numPeople;
        }
        taskQueryStr += " RETURNING task_id;";

        // create db entry for each task
        return db.query({
            queryString: taskQueryStr,
            argumentArray: taskArgArr
        }).then(function(results){
            var task_idArr = results.rows.map(function(rowObj){
                return rowObj.task_id;
            });
            return task_idArr;
        });
    };

    this.deleteTask = function(taskId){
        return db.query({
            queryString: "DELETE FROM task\
                          WHERE task_id = $1;",
            argumentArray: [taskId]
        });
    };

    this.addUserToTimeSlot = function(timeSlotId, userId){
        return db.query({
            queryString: "INSERT INTO timeslot_to_user (task_timeslot_id, user_id)\
                         VALUES ($1, $2);",
            argumentArray: [timeSlotId, userId]
        });
    };

    this.cancelTimeSlot = function(timeSlotId, userId){
        return db.query({
            queryString: "DELETE FROM timeslot_to_user\
                          WHERE task_timeslot_id = $1\
                          AND user_id = $2;",
            argumentArray: [timeSlotId, userId]
        });
    };
};

module.exports = function(db){
    return new Task(db);
}
