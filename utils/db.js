var pg = require("pg");
var conString = "postgres://tim:persuasiveinaction@localhost/asa_db";
var async = require("async");
var Promise = require("es6-promise").Promise;


function db(){
    var _rollback = function(client, done){
        client.query("ROLLBACK", function(err){
            return done(err);
        });
    };

    /**
     * Executes a single database query.
     * @param queryObj - object in the form:
     *      {
     *        queryString: "",
     *        argumentArray: ""
     *       }
     */
    this.query = function(queryObj){
        return new Promise(function(resolve, reject){
            pg.connect(conString, function (err, client, done){
                if (err){
                    console.error("ERROR: fetching from client pool", err);
                }
                client.query(queryObj.queryString, queryObj.argumentArray, function (err, results){
                    done();

                    if (err){
                        console.error("ERROR: running query", err);
                        reject();
                    }
                    resolve(results);
                });
            });
        });
    };

    this.seriesQueriesWithTransaction = function(queryObjArr){
        return new Promise(function(resolve, reject){
            pg.connect(conString, function(err, client, done){
                if (err){
                    console.error("ERROR: fetching from client pool", err);
                }
                client.query("BEGIN", function(err){
                    if (err){
                        _rollback(client, done);
                        reject(err);
                    }
                    var mapIterator = function(queryObj, mapCallback){
                        client.query(queryObj.queryString, queryObj.argumentArray, mapCallback);
                    };
                    async.mapSeries(queryObjArr, mapIterator, function(err, results){
                        if (err){
                            _rollback(client, done);
                            reject(err);
                        }
                        client.query("COMMIT", function(err){
                            if (err){
                                _rollback(client, done);
                                reject(err);       
                            }
                        });
                        done();
                        resolve(results);
                    });
                });
            });
        });
    };

    /**
     * Executes multiple database queries in sequentially.
     * @param queryObjArr - array of query objects. Database queries will be made
     *                      on each queryObj in series.
     * @param callback - called in the following way, callback(resultArr),
     *                   where each result corresponds to the index of the queryObj
     *                   in the input queryObjArr.
     */
    this.seriesQueries = function (queryObjArr, callback){
        pg.connect(conString, function(err, client, done){
            if (err){
                console.error("ERROR: fetching from client pool", err);
            }
            var mapIterator = function(queryObj, mapCallback){
                client.query(queryObj.queryString, queryObj.argumentArray, mapCallback);
            };
            async.mapSeries(queryObjArr, mapIterator, function (err, results){
                if (err){
                    console.error("ERROR: multiSeriesQueries", err);
                }
                done();
                callback(results);
            });
        });

    };

}

module.exports = function(){
    return new db();
}