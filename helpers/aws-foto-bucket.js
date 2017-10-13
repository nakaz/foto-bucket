const AWS = require('aws-sdk');
const fs = require('fs');
AWS.config.loadFromPath('./config/config.json');

var fotoBucket = new AWS.S3( { params: {Bucket: 'nakaz-bucket-dakine'} } )

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

module.exports = {
  upload: uploadToS3
}

