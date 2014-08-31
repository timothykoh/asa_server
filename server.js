var express = require("express");
var app = express();
var https = require("https");
var cors = require("cors");

// init middleware

app.use(express.cookieParser("AFDS"));
app.use(express.cookieSession({
    secret: "t1h2i3s4s5e6c7r8e9t8i7s6p5r4i3v2a1te"
}));
app.use(express.json({limit: "50mb"}));
app.use(cors({origin:"http://asa.timothykoh.com:8000", credentials: true}));
// app.use(cors({origin:"http://localhost:8000", credentials: true}));
// app.use(cors({origin:"http://192.168.1.132:8000", credentials: true}));
// app.use(cors({origin:"http://128.237.205.212:8000", credentials: true}));

// init controllers
// models are initialized inside controllers/index.js because
// the only things that access models are controllers
require("./controllers/index.js") (app);

var server = app.listen(3000, function(){
    console.log("Listening on port %d", server.address().port);
});