var Promise = require("es6-promise").Promise;

function News(db){
    this.createNews = function(newsDetails, userId){
        return db.query({
            queryString: "INSERT INTO news (title, description, created_by)\
                          VALUES ($1, $2, $3)\
                          RETURNING news_id;",
            argumentArray: [newsDetails.title, newsDetails.description, userId]
        }).then(function(results){
            return results.rows[0].news_id;
        });
    };

    this.getNews = function(){
        return db.query({
            queryString: "SELECT news.*, users.fb_id AS creator_fb_id\
                          FROM news\
                                INNER JOIN users\
                                ON users.user_id = news.created_by\
                          ORDER BY date_created DESC\
                          LIMIT 10;",
            argumentArray: []
        }).then(function(results){
            return results.rows;
        });
    };
};

module.exports = function(db){
    return new News(db);
}