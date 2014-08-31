var https = require("https");

module.exports = function(app, models){
    app.post("/auth/login", function (req, res){
        console.log("User logging in with access token: " + fbAccessToken);
        // fbAccessToken for make facebook api calls on client's behalf
        var fbAccessToken = req.body.fbAccessToken;

        console.log("Client attempting to login with fb access token: " + fbAccessToken);
        https.get("https://graph.facebook.com/me?access_token=" + fbAccessToken, function(response){
            response.on("data", function(d){
                var userData = JSON.parse(d);
                console.log(userData);
                var fbId = userData.id;

                // attempt to retrieve user data from the database
                models.User.getUserByFacebookId(fbId).then(function (userObj){
                    if (userObj !== undefined){
                        req.session.user = userObj;
                        console.log(userObj);
                        res.send(userObj);
                    } else{
                        // if userObj is undefined, it means the user doesn't exist in
                        // the database. so add the user to the database.
                        models.User.addUser({
                            name: userData.name,
                            fbId: userData.id,
                            fbAccessToken: fbAccessToken,
                            email: userData.email,
                            gender: userData.gender,
                        }).then(function (userObj){
                            req.session.user = userObj;
                            res.send(userObj);
                        });
                    } 
                });
            });
        }).on("error", function(err){
            // error for https.get
            console.error(err);
        });
    });

    app.post("/auth/logout", function(req, res){
        delete req.session;
        res.send({status: "success"});
    });
}