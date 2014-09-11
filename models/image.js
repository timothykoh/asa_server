var Promise = require("es6-promise").Promise;
var fs = require("fs");
var im = require("imagemagick");

function Image(){
    var _eventImgBasePath = "image_store/event/";

    this.createImage = function(filePath, imgData){
        return new Promise(function(resolve, reject){
            fs.writeFile(filePath, imgData, function(err){
                if (err){
                    console.error(err);
                    reject(err);
                } else{
                    console.log("image written to: " + filePath);
                    resolve();
                }
            });
            // im.resize({
            //     srcData: imgData,
            //     dstPath: filePath,
            //     width: 1024,
            //     format: "jpg"
            // }, function(err, stdout, stderr){
            //     if (err){
            //         reject(err);
            //     } else{
            //         console.log("image written to: " + filePath);
            //         resolve();
            //     }
            // });
        });
    };

    this.getImage = function(filePath){
        return new Promise(function(resolve, reject){
            fs.readFile(filePath, {encoding:"utf-8"}, function(err, data){
                if (err){
                    console.error(err);
                    reject(err);
                }
                resolve(data);
                // resolve("data:image/*;base64," + data);
            });
        });
    }
}

module.exports = function(){
    return new Image();
}
