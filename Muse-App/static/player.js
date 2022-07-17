import promise, {songs} from './server-query.js';
// set variables
let currentSong = 0, maxSong, playing = false, downloading = false, position = 0, maxPosition = 180, pause = false, newSongs=false;
var audio;

const elements = {
  images: document.getElementsByClassName("album-art"),
  play: document.getElementById("play-button"),
  previous: document.getElementById("previous-button"),
  next: document.getElementById("next-button"),
  currentSong: document.getElementById("current-song"),
  totalSongs: document.getElementById("total-songs"),
  download: document.getElementsByClassName('ms-line-point')[0],
  instrumentPicker: document.getElementById("instrument-picker"),
  instrument:0,
  songsList: [],
  durations: [],
  tunes: [],
  buffers: []
}

// controlling the DOM
function next() {
  updateDOM('remove');
  currentSong++;
  if (playing){
    stop();
  }
  if (currentSong > maxSong) {
    currentSong = 0;
  }
  updateDOM('add');
  playing = false;
}


function previous() {
  updateDOM('remove');
  currentSong--;
  if (playing){
    stop();
  }
  if (currentSong < 0) {
    currentSong = maxSong;
  }
  updateDOM('add');
  playing=false;
}

function updateDOM(action) {
  elements.currentSong.innerHTML = currentSong + 1;
  if (currentSong == 0)
    document.getElementsByClassName('song')[0].innerHTML = "Original";
  else
  document.getElementsByClassName('song')[0].innerHTML = "Composition "+(currentSong+1);
  if (action === 'add') {
    elements.images[currentSong%4].classList.add("active");
  } else {
    elements.images[currentSong%4].classList.remove("active");
  }
}
// var step = 0;
// function playBar(dur) {
//   if (!pause) {
//     setTimeout(function() {
//       console.log(step);
//       if (position > maxPosition) {
//         position = 0;
//         next();
//       }
//       playBar(dur);
//     }, 100);
//   }
// }

function renderTune(abc) {
  return ABCJS.renderAbc("*", abc, {
    responsive: "resize" })[0];
}

function primeTune(visualObj) {
  var midi = new ABCJS.synth.CreateSynth();
  return midi.init({
    visualObj: visualObj,
    options: {
      program: elements.instrument,
      chordsOff: true
    },
  }).then(function () {
    return midi.prime().then(function(response){
      elements.durations.push(response.duration*1000);
    });
  }).then(function () {
    return midi;
  });
}

function play() {
  if(newSongs){
    elements.durations = [];
    window.AudioContext = window.AudioContext || window.webkitAudioContext || navigator.mozAudioContext || navigator.msAudioContext;
    elements.tunes = elements.songsList.map(renderTune);
    elements.buffers = elements.tunes.map(primeTune);
    console.log(elements.durations);
    newSongs = false;
  }
  if (!playing) {
    if (typeof elements.songsList[currentSong] == 'undefined'){
      console.log("undefined songs")
      return;
    }
    console.log(elements.songsList[currentSong]);
    pause = false;
    var buff = elements.buffers[currentSong];
    if (buff) buff.then(function (synth) {
      synth.start();
    });
    elements.play.classList.add("pause");
  } else {
    pause = true;
    elements.play.classList.remove("pause");
    playing = !playing;
    return Promise.all(elements.buffers.map(function (buff) {
      return buff.then(function (synth) {
        synth.stop();
        return synth;
      });
    }));
  }
  playing = !playing;
}

function stop(){
  pause = true;
  elements.play.classList.remove("pause");
  return Promise.all(elements.buffers.map(function (buff) {
    return buff.then(function (synth) {
      synth.stop();
      return synth;
    });
  }));
}


function setInstrument(n) {
  previous();
  next();
  elements.instrument = n;
  newSongs = true;
}

function download(){
  if (!downloading){
    stop();
    var buff = elements.buffers[currentSong];
    if (buff) buff.then(function (synth) {
      audio = synth.download("tune.wav");
      //creating an invisible element
      var element = document.createElement('a');
      element.href = audio;
      element.setAttribute('download', 'tune.wav');
      document.body.appendChild(element);
      //onClick property
      element.click();
      document.body.removeChild(element);
    });
    playing=!playing;
  }
  downloading=!downloading;
}

// initial setup
function init() {
  // setup first image
  elements.images[currentSong].classList.toggle("active");
  if (currentSong == 0)
    document.getElementsByClassName('song')[0].innerHTML = "Original";
  else
  document.getElementsByClassName('song')[0].innerHTML = "Composition "+(currentSong+1);

  elements.next.addEventListener("click", function() {
    next();
  });
  elements.previous.addEventListener("click", function() {
    previous();
  });
  elements.play.addEventListener("click", function(){
    play();
  });
  elements.instrumentPicker.onchange = function (event) {
    setInstrument(Number(event.target.value));
  };
  elements.download.addEventListener("animationend", function(){
    download();
  })
}

function onPageLoad() {
  promise.then(()=>{
    try{
      init();
      elements.songsList.push(songs.original);
      elements.songsList.push(...songs.predictions);
      maxSong = elements.songsList.length-1;
      elements.totalSongs.innerHTML = maxSong+1;
      newSongs = true;
      document.getElementsByClassName('loader')[0].style.display = 'none';
      document.getElementById('showPlayer').style.display = 'block';
    }catch(error){
      console.log('mera error')
      throw new HttpException(404, 'Page not found');
    }
  }).catch(()=>{
    console.log('error page')
    window.location.replace("{{url_for('error')}}");
  })
}
  
window.onload = onPageLoad;