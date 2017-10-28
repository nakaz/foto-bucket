const AWS = require('aws-sdk');
const fs = require('fs');
const { BUCKET_NAME } = require('../config/config.json');
AWS.config.loadFromPath('config/aws-config.json');

var fotoBucket = new AWS.S3( { params: { Bucket: BUCKET_NAME } } )

function uploadToS3(file, callback) {
  console.log(file)
  fotoBucket
    .upload({
      ACL: 'public-read',
      Body: file.buffer,
      Key: file.originalname,
      ContentType: file.mimetype ? file.mimetype : 'application/octet-stream' // force download if it's accessed as a top location
    })
    .send(callback);
}

function getAllImages(cb){
  fotoBucket
    .listObjects().send(cb);
}

module.exports = {
  upload: uploadToS3,
  getAll: getAllImages
}

