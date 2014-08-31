// initialize models. models are intialized here because the
// only things that need to access models are controllers.
var models = require("../models/index.js");

// temporary code to create tables
// models.Init.dropAllTables();
models.Init.createTables();

module.exports = function(app){
    require("./auth.js") (app, models);
    require("./user.js") (app, models);
    require("./event.js") (app, models);
    require("./task.js") (app, models);
    require("./news.js") (app, models);
    require("./expense.js") (app, models);
}

