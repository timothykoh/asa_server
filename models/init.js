function Init(db){
    var _createUserQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS users (\
                          user_id           serial primary key,\
                          fb_id             bigint unique not null,\
                          fb_access_token   varchar(255) not null,\
                          date_created      timestamp default current_timestamp,\
                          name              varchar(50) not null,\
                          email             varchar(50),\
                          phone_num         varchar(20),\
                          andrew_id         varchar(10),\
                          class             varchar(20),\
                          age               int,\
                          gender            varchar(10)\
                      );",
        argumentArray: []
    };

    var _createEventsQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS event(\
                            event_id        serial primary key,\
                            name            varchar(50) not null,\
                            description     text,\
                            date            date,\
                            location        varchar(50),\
                            budget          numeric,\
                            created_by      int,\
                            date_created    timestamp default current_timestamp,\
                            FOREIGN KEY(created_by) REFERENCES users(user_id) ON DELETE CASCADE\
                        );",
        argumentArray: []
    };

    var _createTasksQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS task(\
                            task_id         serial primary key,\
                            name            varchar(50) not null,\
                            created_by      int,\
                            date_created    timestamp default current_timestamp,\
                            FOREIGN KEY(created_by) REFERENCES users(user_id) ON DELETE CASCADE\
                        );",
        argumentArray: []
    };

    var _createTaskTimeslotQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS task_timeslot(\
                            task_timeslot_id        serial primary key,\
                            date                    date,\
                            timeslot                int,\
                            num_people              int\
                        );",
        argumentArray: []
    };

    var _createTaskToTimeslotQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS task_to_timeslot(\
                            task_id             int,\
                            task_timeslot_id    int,\
                            FOREIGN KEY(task_id) REFERENCES task(task_id) ON DELETE CASCADE,\
                            FOREIGN KEY(task_timeslot_id) REFERENCES task_timeslot(task_timeslot_id) ON DELETE CASCADE,\
                            PRIMARY KEY(task_id, task_timeslot_id)\
                        );",
        argumentArray: []
    };

    var _createTimeslotToUserQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS timeslot_to_user(\
                            task_timeslot_id        int,\
                            user_id                 int,\
                            FOREIGN KEY(task_timeslot_id) REFERENCES task_timeslot(task_timeslot_id) ON DELETE CASCADE,\
                            FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,\
                            PRIMARY KEY(task_timeslot_id, user_id)\
                        );",
        argumentArray: []
    };

    var _createEventToTaskQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS event_to_task(\
                            event_id            int,\
                            task_id             int,\
                            FOREIGN KEY(event_id) REFERENCES event(event_id) ON DELETE CASCADE,\
                            FOREIGN KEY(task_id) REFERENCES task(task_id) ON DELETE CASCADE,\
                            PRIMARY KEY(event_id, task_id)\
                        );",
        argumentArray: []
    };

    var _createEventToAttendanceQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS event_to_attendance(\
                            event_id            int,\
                            user_id             int,\
                            is_going            boolean,\
                            FOREIGN KEY(event_id) REFERENCES event(event_id) ON DELETE CASCADE,\
                            FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,\
                            PRIMARY KEY(event_id, user_id)\
                    );",
        argumentArray: []
    };

    var _createNewsQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS news(\
                            news_id         serial primary key,\
                            title           varchar(50) not null,\
                            description     text,\
                            created_by      int,\
                            date_created    timestamp default current_timestamp,\
                            FOREIGN KEY(created_by) REFERENCES users(user_id) ON DELETE CASCADE\
                        );",
        argumentArray: []
    };

    var _createExpenseQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS expense(\
                            expense_id      serial primary key,\
                            name            varchar(50),\
                            description     text,\
                            amount          numeric,\
                            created_by      int,\
                            date_created    timestamp default current_timestamp,\
                            FOREIGN KEY(created_by) REFERENCES users(user_id) ON DELETE CASCADE\
                        );",
        argumentArray: []
    };

    var _createEventToExpenseQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS event_to_expense(\
                            event_id        int,\
                            expense_id      int,\
                            FOREIGN KEY(event_id) REFERENCES event(event_id) ON DELETE CASCADE,\
                            FOREIGN KEY(expense_id) REFERENCES expense(expense_id) ON DELETE CASCADE\
                        );",
        argumentArray: []
    };
    
    var _createAdminQuery = {
        queryString: "CREATE TABLE IF NOT EXISTS admin(\
                            user_id         int,\
                            FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE\
                        );",
        argumentArray: []
    };

    this.dropAllTables = function(){
        db.query({
            queryString: "" +
                // "DROP TABLE users cascade;" +
                "DROP TABLE event cascade;" +
                "DROP TABLE task cascade;" +
                "DROP TABLE task_timeslot cascade;" +
                "DROP TABLE task_to_timeslot cascade;" +
                "DROP TABLE timeslot_to_user cascade;" +
                "DROP TABLE event_to_task cascade;" +
                "DROP TABLE event_to_attendance cascade;" +
                "DROP TABLE news cascade;" +
                "DROP TABLE expense cascade;" +
                "DROP TABLE event_to_expense cascade;" +
                // "DROP TABLE admin cascade;" +
                "",
            argumentArray: []
        }).then(function (results){
            console.log("Dropped all tables");
        });
    };

    this.createTables = function(){
        var queryObjArr = [_createUserQuery,
                           _createEventsQuery,
                           _createTasksQuery,
                           _createTaskTimeslotQuery,
                           _createTaskToTimeslotQuery,
                           _createTimeslotToUserQuery,
                           _createEventToTaskQuery,
                           _createEventToAttendanceQuery,
                           _createNewsQuery,
                           _createExpenseQuery,
                           _createEventToExpenseQuery,
                           _createAdminQuery];
        db.seriesQueries(queryObjArr, function (results){
            console.log("Created tables");
        });
    };

}

module.exports = function(db){
    return new Init(db);
};