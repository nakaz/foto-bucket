console.log('homepage')

const fotostream = document.getElementById('fotostream');

const socket = new WebSocket('ws://localhost:3000');

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
  console.log('recieving some data')
  var photos = JSON.parse(event.data).images;

  if (typeof photos === 'object' && photos.length > 1){
    photos.forEach((photo) => {
      updateFotoContainer(createImageBox(photo))
    })
  }else{
      updateFotoContainer(createImageBox(photos))
  }

});

function updateFotoContainer(item){
  fotostream.innerHTML = item + fotostream.innerHTML;
}

function createImageBox(imageURL){
  return `<div class="foto"><img src=${imageURL}></div>`
}
