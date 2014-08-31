var async = require("async");

module.exports = function(app, models){
    var _imgBasePath = "image_store/news/";

    app.post("/news/create", function(req, res){
        if (req.session.user === undefined){
            res.send({status: "error", error: "User is not logged in."});
            return;
        }
        var newsDetails = req.body.newsDetails;
        models.News.createNews(newsDetails, req.session.user.user_id)
        .then(function(newsId){
            var filePath = _imgBasePath + newsId;
            return models.Image.createImage(filePath, req.body.imgData);
        }).then(function(){
            res.send({status: "success"});
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });

    app.get("/news", function(req, res){
        models.News.getNews().then(function(newsObjArr){
            function mapIterator(newsObj, mapCallback){
                // format date
                var dateObj = newsObj.date_created;
                newsObj.date_created = dateObj.getMonth() + "/" +
                                       dateObj.getDate() + "/" + 
                                       dateObj.getFullYear();

                // fetch image
                var filePath = _imgBasePath + newsObj.news_id;
                models.Image.getImage(filePath).then(function(imgData){
                    newsObj.img_src = imgData;
                    mapCallback(null, newsObj);
                });
            }

            async.map(newsObjArr, mapIterator, function(err, newsObjArr){
                res.send({status: "success", results: newsObjArr});
            });
        }, function(err){
            console.error(err);
            res.send({status: "error", error: err});
        });
    });
};
