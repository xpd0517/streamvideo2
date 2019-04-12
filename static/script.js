let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let logElement = document.getElementById("log");

let recordingTimeMS = 30000;
function log(msg) {
  logElement.innerHTML += msg + "\n";
}
function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}
function startRecording(stream, lengthInMS) {
  
  let recorder = new MediaRecorder(stream);
  let data = [];
 
  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  //log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");
 
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );
 
  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}

function cameraStop(stream) {
  stream.getTracks().forEach(track => track.stop());
}

startButton.addEventListener("click", function() {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })
  
  .then(stream => {
    $("#start").click();
    preview.srcObject = stream;
    downloadButton.href = stream;
    preview.captureStream = preview.captureStream || preview.mozCaptureStream;
    return new Promise(resolve => preview.onplaying = resolve);
  }).then(() => startRecording(preview.captureStream(), recordingTimeMS))
  .then (recordedChunks => {
    let recordedBlob = new Blob(recordedChunks, { type: "video/mp4" });
    recording.src = URL.createObjectURL(recordedBlob);
    //recording.srcObject=recordedBlob;
    downloadButton.href = recording.src;
    downloadButton.download = "RecordedVideo.mp4";
   

    var formData= new FormData();
   
    formData.append('video',recordedBlob);
        // Execute the ajax request, in this case we have a very simple PHP script
    // that accepts and save the uploaded "video" file
    xhr('http://localhost:5000/video', formData, function (fName) {
        console.log("Video succesfully uploaded !");
    });
// Helper function to send 
    function xhr(url, data, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                callback(location.href + request.responseText);
            }
        };
        request.open('POST', url);
        request.send(data);
    }

    
    log("Successfully recorded " + recordedBlob.size + " bytes of " +
        recordedBlob.type + " media.");
    log("Uploaded to server!");
  })
  .catch(log);
}, false);

stopButton.addEventListener("click", function() {
  cameraStop(preview.srcObject);
}, false);