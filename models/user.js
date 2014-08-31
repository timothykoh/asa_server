function User(db){
    this.getUserByFacebookId = function(fbId){
        return db.query({
            queryString: "SELECT users.*, (admin.user_id IS NOT NULL) AS is_admin\
                          FROM users\
                                LEFT OUTER JOIN admin\
                                ON admin.user_id = users.user_id\
                          WHERE fb_id = $1\
                          LIMIT 1;",
            argumentArray: [fbId]
        }).then(function (results){
            if (results.rowCount === 0){
                return undefined;
            } else{
                return results.rows[0];
            }
        });
    };

    /*
     * add user, then return some columns of the newly added row
     */
    this.addUser = function(userObj, callback){
        console.log(userObj);
        return db.query({
            queryString: "INSERT INTO users (name, fb_id, fb_access_token, email, gender)\
                          VALUES ($1, $2, $3, $4, $5)\
                          RETURNING user_id, name, fb_id, email, phone_num, andrew_id, class, age, gender;",
            argumentArray: [userObj.name,
                            userObj.fbId,
                            userObj.fbAccessToken,
                            userObj.email,
                            userObj.gender]
        }).then(function (results){
            return results.rows[0];
        });
    }
}

module.exports = function(db){
    return new User(db);
}