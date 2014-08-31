function Task(db){
    this.getTasksForEvent = function(eventId){
        return db.query({
            queryString: "SELECT task.*\
                          FROM event_to_task\
                                INNER JOIN task\
                                ON task.task_id = event_to_task.task_id\
                          WHERE event_to_task.event_id = $1;",
            argumentArray: [eventId]
        }).then(function(results){
            return results.rows;
        });
    };

    this.createTask = function(taskDetails, eventId){
        return db.query({
            queryString: "INSERT INTO task (name, num_people)\
                          VALUES ($1, $2)\
                          RETURNING task_id, name, num_people;",
            argumentArray: [taskDetails.name, taskDetails.numPeople]
        }).then(function(results){
            var taskId = results.rows[0].task_id;
            var taskObj = results.rows[0];
            return db.query({
                queryString: "INSERT INTO event_to_task (event_id, task_id)\
                              VALUES ($1, $2);",
                argumentArray: [eventId, taskId]
            }).then(function(){
                return taskObj;
            });
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

    this.deleteTask = function(taskId, eventId){
        return db.query({
            queryString: "DELETE FROM task\
                          WHERE task_id = $1;",
            argumentArray: [taskId]
        });
    };
};

module.exports = function(db){
    return new Task(db);
}