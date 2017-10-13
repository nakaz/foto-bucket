const express = require('express');
const multer = require('multer');
const PORT = process.env.PORT || 3000;


const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const fotoBucket = require('./helpers/aws-foto-bucket.js');

const app = express();
const upload = multer();

app.use(express.static(__dirname + '/public'))

app.get('/upload', (req, res) => {
  res.sendFile(__dirname + '/public/upload.html');
})

app.post('/upload', upload.single('image'), (req, res) => {
  fotoBucket.upload(req.file, function(err, data){
    if (err) {
      console.log(err)
      res.send('Something went wrong');
    }else{
      console.log(data)
      var url = s3.getSignedUrl('getObject', {Bucket: 'nakaz-bucket-dakine', Key: data.Key});
      console.log('signed url', url)
      res.send(`<html><body><img src=${url}></body></html>`)
    }
  })
})

app.listen(PORT, () => {
  console.log('Server ON');
})

