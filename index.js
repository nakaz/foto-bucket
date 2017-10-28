const http = require('http');
const url = require('url');
const express = require('express');
const multer = require('multer');
const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;


const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const fotoBucket = require('./helpers/aws-foto-bucket.js');

const app = express();
const upload = multer();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname + '/public'));

let cachedImages = [];

function broadcast(newImage){
  wss.clients.forEach(client => {
    console.log('sending stuff')
    client.send(JSON.stringify({images: newImage}))
  });
}

function newImageUpload(imageURL){
  cachedImages.push(imageURL);
  broadcast(imageURL)
}

function loadImages(err, data){
  data.Contents
    .map(image => {
      return Object.assign(image, {LastModified: image.LastModified.toString()});
    })
    .sort((a, b) => {
      return new Date(a.LastModified) - new Date(b.LastModified);
    })
    .forEach((image) => {
    cachedImages.push(s3.getSignedUrl('getObject', {Bucket: 'nakaz-bucket-dakine', Key: image.Key}));
  })
}

wss.on('connection', (ws, req) => {
  ws.on('close', () => {
    console.log('socket closed')
  })

  console.log(cachedImages)
  ws.send(JSON.stringify({ images: cachedImages }));
});

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
      newImageUpload(url)
      // res.send(`<html><body><img src=${url}></body></html>`)
      res.redirect('/upload');
    }
  })
})

server.listen(PORT, () =>  {
  console.log('Listening on %d', server.address().port);
  fotoBucket.getAll(loadImages)
});
