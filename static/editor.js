var tunes = [];
var buffers = [];
var instrument = 0;
var selectedTrack = -1;
var playing = false;

function load() {
  var playButton = document.getElementById("play");
  var stopButton = document.getElementById("stop");
  var instrumentPicker = document.getElementById("instrument-picker");
  var paper = document.getElementById("paper");
  var scores = [];
  var textarea = document.getElementById('abc');

  function renderTune(abc) {
    return ABCJS.renderAbc("paper", abc)[0];
  }
  
  function primeTune(visualObj, i) {
    var midi = new ABCJS.synth.CreateSynth();
    return midi.init({
      visualObj: visualObj,
      options: {
        program: instrument,
        chordsOff: true
      }
    }).then(function () {
      return midi.prime();
    }).then(function () {
      return midi;
    });
  }

  function updatePlaybackButtons() {
    playButton.classList.toggle("hidden", playing);
    stopButton.classList.toggle("hidden", !playing);
  }

  function updatePapers() {
    paper.classList.toggle("hidden", selectedTrack !== 0);
  }

  function stop() {
    playing = false;
    updatePlaybackButtons();
    return Promise.all(buffers.map(function (buff) {
      return buff.then(function (synth) {
        synth.stop();
        return synth;
      });
    }));
  }

  function play() {
    stop();
    scores = [textarea.value];
    tunes = scores.map(renderTune);
    buffers = tunes.map(primeTune);
    var buff = buffers[0];
    if (buff) buff.then(function (synth) {
      synth.start();
      playing = true;
      updatePlaybackButtons();
    });
    else alert("Please select a song first");
  }

  function setInstrument(n) {
    stop();
    instrument = n;
    buffers = tunes.map(primeTune);
  }

  stopButton.onclick = stop;
  playButton.onclick = play;
  instrumentPicker.onchange = function (event) {
            setInstrument(Number(event.target.value));
  };
}

window.onload = load;