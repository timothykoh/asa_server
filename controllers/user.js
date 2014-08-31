module.exports = function(app, models){
    app.get("/user", function(req, res){
        if (req.session.user === undefined){
            res.send({status: "error", error:"User is not logged in."});
            return;
        }
        res.send({status: "success", results: req.session.user});
    });
}