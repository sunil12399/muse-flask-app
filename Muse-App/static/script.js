// set variables
let currentSong = 0, maxSong, playing = false, downloading = false, position = 0, maxPosition = 1800, pause = false;
var abc = `T: Cooley's
M: 4/4
L: 1/8
R: reel
K: Emin
|:D2|EB {c} BA B2 EB|B2 AB dBAG|FDAD BDAD|FDAD dAFD|
EBBA B2 EB|B2 AB defg|afe^c dBAF|DEFD E2:|
|:gf|eB B2 efge|eB B2 gedB|A2 FA DAFA|A2 FA defg|
eB B2 eBgB|eB B2 defg|afe^c dBAF|DEFD E2:|`;

var midiBuffer = NaN;

const elements = {
  // images: document.getElementsByClassName("album-art"),
  // songs: document.getElementsByClassName("song"),
  // artists: document.getElementsByClassName("artist"),
  // play: document.getElementById("play-button"),
  // previous: document.getElementById("previous-button"),
  // next: document.getElementById("next-button"),
  // currentSong: document.getElementById("current-song"),
  // totalSongs: document.getElementById("total-songs"),
  // slider: document.getElementById("slider"),
  // textarea: document.querySelector('#source'),
  // generateButton: document.getElementById("generate"),
  download: document.getElementById('top-right'),
  download1: document.getElementById('ms-download'),
  download2: document.getElementsByClassName('ms-line-point')[0],
  // loader : document.querySelector('.loading'),
  songsList: []
}

// controlling the DOM
function next() {
  updateDOM('remove');
  currentSong++;
  if (playing){
    stop();
  }
  if (currentSong >= maxSong) {
    currentSong = 0;
  }
  updateDOM('add');
  elements.slider.value = 0;
  position = 0;
  playing = false;
}


function previous() {
  updateDOM('remove');
  currentSong--;
  if (playing){
    stop();
  }
  if (currentSong < 1) {
    currentSong = maxSong;
  }
  updateDOM('add');
  elements.slider.value = 0;
}

function updateDOM(action) {
  elements.currentSong.innerHTML = currentSong + 1;
  if (action === 'add') {
    elements.images[currentSong%4].classList.add("active");
    elements.songs[currentSong%4].classList.add("active");
    elements.artists[currentSong%4].classList.add("active");
  } else {
    elements.images[currentSong%4].classList.remove("active");
    elements.songs[currentSong%4].classList.remove("active");
    elements.artists[currentSong%4].classList.remove("active");
  }
}

function playBar() {
  if (!pause) {
    setTimeout(function() {
      elements.slider.value = position++;
      if (position > maxPosition) {
        position = 0;
        next();
      }
      playBar();
    }, 10);
  }
}

function play() {
  if (!playing) {
    if (typeof elements.songsList[currentSong] == 'undefined'){
      console.log("undefined songs")
      return;
    }
    pause = false;
    playBar();
    var visualObj = ABCJS.renderAbc("*", elements.songsList[currentSong], {
      responsive: "resize" })[0];

    if (ABCJS.synth.supportsAudio()) {
      window.AudioContext = window.AudioContext ||
          window.webkitAudioContext ||
          navigator.mozAudioContext ||
          navigator.msAudioContext;
      var audioContext = new window.AudioContext();
      audioContext.resume().then(function () {
          midiBuffer = new ABCJS.synth.CreateSynth();
          return midiBuffer.init({
              visualObj: visualObj,
              audioContext: audioContext,
              millisecondsPerMeasure: visualObj.millisecondsPerMeasure()
          }).then(function (response) {
              console.log("Notes loaded: ", response)
              console.log(response); // this contains the list of notes that were loaded.
              return midiBuffer.prime();
          }).then(function (response) {
              midiBuffer.start();
              return Promise.resolve();
          }).catch(function (error) {
              if (error.status === "NotSupported") {
                console.log("Not Supported");
              } else
                  console.warn("synth error", error);
          });
        });
    } else {
        console.log("KKkoochh nhi")
    }
    elements.play.classList.add("pause");
  } else {
    pause = true;
    elements.play.classList.remove("pause");
    if (midiBuffer)
      midiBuffer.stop();
  }
  playing = !playing;
}

function stop(){
  pause = true;
  elements.play.classList.remove("pause");
  position = maxPosition;
  if (midiBuffer)
    midiBuffer.stop();
}

function sliderChange() {
  position = elements.slider.value;
}

async function getsongs(){
  var post_data = {
    string: elements.textarea.value
  };
  var url = "http://127.0.0.1:3000/predict_music";
  $.post(url, post_data, function(data, status){
    elements.songsList.push(...data.predictions);
    maxSong = elements.songsList.length;
    elements.totalSongs.innerHTML = maxSong;
    document.querySelector('.controls__round-button').style.pointerEvents = 'auto';
    if(status === "success"){
      // elements.loader.style.display = "none";
      console.log("stopped Loading")
      showOtherContent(1);
    }
    else{
      alert("Something went Wrong");
    }
    });

  return false;
}

function getLoading(){
  console.log('get loading')
  var x = document.getElementById("showEditor");
  var y = document.getElementById("showPlayer");
  x.style.display = "none";
  y.style.display = "none";
  document.getElementsByClassName('muzieknootjes')[0].style.display = "block";
  getsongs();
  document.getElementsByClassName('muzieknootjes')[0].style.display = "none";
  showOtherContent(1);
}

function showOtherContent(player = 0){
  var x = document.getElementById("showEditor");
  var y = document.getElementById("showPlayer");
  if (x.style.display === "none" && player == 0) {
    x.style.display = "block";
    y.style.display = "none";
  } else {
    x.style.display = "none";
    y.style.display = "block";
  }
}  

// initial setup
function init() {
  // setup first image
  // elements.images[currentSong].classList.toggle("active");
  // elements.songs[currentSong].classList.toggle("active");
  // elements.artists[currentSong].classList.toggle("active");
  // elements.textarea.value = abc;
  // elements.songsList = [abc];
  // maxSong = 1;
  // // event listeners for controls
  // elements.next.addEventListener("click", function() {
  //   next();
  // });
  // elements.previous.addEventListener("click", function() {
  //   previous();
  // });
  // elements.play.addEventListener("click", function(){
  //   play();
  // });
  // elements.generateButton.addEventListener("click", function(){
  //   elements.songsList = [elements.textarea.value];
  //   console.log('generate button')
  //   getLoading();
  // });
  // elements.download2.addEventListener("animationend", function(){
  //   console.log("ended");
  // });
  elements.download2.addEventListener("animationend", function(){
    console.log("ended");
    // if (!downloading){
    //   if (midiBuffer){
    //     audio = midiBuffer.download("tune.wav");
    //     //creating an invisible element
    //     var element = document.createElement('a');
    //     element.href = audio;
    //     element.setAttribute('download', 'tune.wav');
      
    //     document.body.appendChild(element);
      
    //     //onClick property
    //     element.click();
      
    //     document.body.removeChild(element);
    //   }
    // }
    // downloading=!downloading;
  })
  // elements.slider.oninput = sliderChange;
}

init();