var db = require("../utils/db.js")();

exports.Init = require("./init.js")(db);
exports.User = require("./user.js")(db);
exports.Event = require("./event.js")(db);
exports.Task = require("./task.js")(db);
exports.News = require("./news.js")(db);
exports.Expense = require("./expense.js")(db);
exports.Image = require("./image.js")();