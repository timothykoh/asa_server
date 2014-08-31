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
                            num_people      int\
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
                "DROP TABLE users cascade;" +
                "DROP TABLE event cascade;" +
                "DROP TABLE task cascade;" +
                "DROP TABLE event_to_task cascade;" +
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
                           _createEventToTaskQuery,
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