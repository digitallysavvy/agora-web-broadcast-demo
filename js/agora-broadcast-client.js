/**
 * Agora Broadcast Client 
 */

var agoraAppId = ''; // set app id
var channelName = 'AgoraBroadcastDemo'; // set channel name

// create client instance
var client = AgoraRTC.createClient({mode: 'live', codec: 'vp8'}); // h264 better detail at a higher motion
var mainStreamId; // reference to main stream

// set video profile 
// [full list: https://docs.agora.io/en/Interactive%20Broadcast/videoProfile_web?platform=Web#video-profile-table]
var cameraVideoProfile = '1080p_5'; // 960 × 720 @ 30fps  & 750kbs

// keep track of streams
var localStreams = {
  uid: '',
  camera: {
    camId: '',
    micId: '',
    stream: {}
  }
};

// keep track of devices
var devices = {
  cameras: [],
  mics: []
}

var externalBroadcastUrl = '';
var injectedStreamURL = '';

// default config for rtmp
var defaultConfigRTMP = {
  width: 640,
  height: 360,
  videoBitrate: 400,
  videoFramerate: 15,
  lowLatency: false,
  audioSampleRate: 48000,
  audioBitrate: 48,
  audioChannels: 1,
  videoGop: 30,
  videoCodecProfile: 100,
  userCount: 0,
  userConfigExtraInfo: {},
  backgroundColor: 0x000000,
  transcodingUsers: [],
};

// set log level:
// -- .DEBUG for dev 
// -- .NONE for prod
AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.DEBUG); 

// init Agora SDK
client.init(agoraAppId, function () {
  console.log('AgoraRTC client initialized');
  joinChannel(); // join channel upon successfull init
}, function (err) {
  console.log('[ERROR] : AgoraRTC client init failed', err);
});

// client callbacks
client.on('stream-published', function (evt) {
  console.log('Publish local stream successfully');
  evt.stream.setBeautyEffectOptions(true, {
    lighteningContrastLevel: 2,
    lighteningLevel: 0.5,
    smoothnessLevel: 0.8,
    rednessLevel: 0.5
  });
});

// when a remote stream is added
client.on('stream-added', function (evt) {
  var stream = evt.stream;
  var streamId = stream.getId();
  console.log("new stream added: " + streamId);
  // Subscribe to the stream.
  client.subscribe(stream, function (err) {
    console.log("[ERROR] : subscribe stream failed", err);
  });
});

client.on('stream-subscribed', function (evt) {
  var remoteStream = evt.stream;
  var remoteId = remoteStream.getId();
  console.log("Subscribe remote stream successfully: " + remoteId);
  if( $('#full-screen-video').is(':empty') ) { 
    mainStreamId = remoteId;
    remoteStream.play('full-screen-video');
  } else {
    addRemoteStreamMiniView(remoteStream);
  }
});

client.on('stream-removed', function (evt) {
  var stream = evt.stream;
  stream.stop(); // stop the stream
  stream.close(); // clean up and close the camera stream
  console.log("Remote stream is removed " + stream.getId());
});

//live transcoding events..
client.on('liveStreamingStarted', function (evt) {
  console.log("Live streaming started");
}); 

client.on('liveStreamingFailed', function (evt) {
  console.log("Live streaming failed");
}); 

client.on('liveStreamingStopped', function (evt) {
  console.log("Live streaming stopped");
});

client.on('liveTranscodingUpdated', function (evt) {
  console.log("Live streaming updated");
}); 

// ingested live stream 
client.on('streamInjectedStatus', function (evt) {
  console.log("Injected Steram Status Updated");
  console.log(JSON.stringify(evt));
}); 

// when a remote stream leaves the channel
client.on('peer-leave', function(evt) {
  console.log('Remote stream has left the channel: ' + evt.stream.getId());
});

// show mute icon whenever a remote has muted their mic
client.on('mute-audio', function (evt) {
  console.log('Mute Audio for: ' + evt.uid);
});

client.on('unmute-audio', function (evt) {
  console.log('Unmute Audio for: ' + evt.uid);
});

// show user icon whenever a remote has disabled their video
client.on('mute-video', function (evt) {
  console.log('Mute Video for: ' + evt.uid);
});

client.on('unmute-video', function (evt) {
  console.log('Unmute Video for: ' + evt.uid);
});

// join a channel
function joinChannel() {
  var token = generateToken();
  var userID = 0; // set to null to auto generate uid on successfull connection

  // set the role
  client.setClientRole('host', function() {
    console.log('Client role set as host.');
  }, function(e) {
    console.log('setClientRole failed', e);
  });
  
  // client.join(token, 'allThingsRTCLiveStream', 0, function(uid) {
  client.join(token, channelName, userID, function(uid) {
      createCameraStream(uid, {});
      localStreams.uid = uid; // keep track of the stream uid  
      console.log('User ' + uid + ' joined channel successfully');
  }, function(err) {
      console.log('[ERROR] : join channel failed', err);
  });
}

// video streams for channel
function createCameraStream(uid, deviceIds) {
  console.log('Creating stream with sources: ' + JSON.stringify(deviceIds));

  var localStream = AgoraRTC.createStream({
    streamID: uid,
    audio: true,
    video: true,
    screen: false
  });
  localStream.setVideoProfile(cameraVideoProfile);

  // The user has granted access to the camera and mic.
  localStream.on("accessAllowed", function() {
    if(devices.cameras.length === 0 && devices.mics.length === 0) {
      console.log('[DEBUG] : checking for cameras & mics');
      getCameraDevices();
      getMicDevices();
    }
    console.log("accessAllowed");
  });
  // The user has denied access to the camera and mic.
  localStream.on("accessDenied", function() {
    console.log("accessDenied");
  });

  localStream.init(function() {
    console.log('getUserMedia successfully');
    localStream.play('full-screen-video'); // play the local stream on the main div
    // publish local stream

    if($.isEmptyObject(localStreams.camera.stream)) {
      enableUiControls(localStream); // move after testing
    } else {
      //reset controls
      $("#mic-btn").prop("disabled", false);
      $("#video-btn").prop("disabled", false);
      $("#exit-btn").prop("disabled", false);
    }

    client.publish(localStream, function (err) {
      console.log('[ERROR] : publish local stream error: ' + err);
    });

    localStreams.camera.stream = localStream; // keep track of the camera stream for later
  }, function (err) {
    console.log('[ERROR] : getUserMedia failed', err);
  });
}

function leaveChannel() {

  client.leave(function() {
    console.log('client leaves channel');
    localStreams.camera.stream.stop() // stop the camera stream playback
    localStreams.camera.stream.close(); // clean up and close the camera stream
    client.unpublish(localStreams.camera.stream); // unpublish the camera stream
    //disable the UI elements
    $('#mic-btn').prop('disabled', true);
    $('#video-btn').prop('disabled', true);
    $('#exit-btn').prop('disabled', true);
    $("#add-rtmp-btn").prop("disabled", true);
    $("#rtmp-config-btn").prop("disabled", true);
  }, function(err) {
    console.log('client leave failed ', err); //error handling
  });
}

// use tokens for added security
function generateToken() {
  return null; // TODO: add a token generation
}

function changeStreamSource (deviceIndex, deviceType) {
  console.log('Switching stream sources for: ' + deviceType);
  var deviceId;
  var existingStream = false;
  
  if (deviceType === "video") {
    deviceId = devices.cameras[deviceIndex].deviceId
  }

  if(deviceType === "audio") {
    deviceId = devices.mics[deviceIndex].deviceId;
  }

  localStreams.camera.stream.switchDevice(deviceType, deviceId, function(){
    console.log('successfully switched to new device with id: ' + JSON.stringify(deviceId));
    // set the active device ids
    if(deviceType === "audio") {
      localStreams.camera.micId = deviceId;
    } else if (deviceType === "video") {
      localStreams.camera.camId = deviceId;
      localStreams.camera.stream.setVideoProfile(cameraVideoProfile);
    } else {
      console.log("unable to determine deviceType: " + deviceType);
    }
  }, function(){
    console.log('failed to switch to new device with id: ' + JSON.stringify(deviceId));
  });
}

// helper methods
function getCameraDevices() {
  console.log("Checking for Camera Devices.....")
  client.getCameras (function(cameras) {
    devices.cameras = cameras; // store cameras array
    cameras.forEach(function(camera, i){
      var name = camera.label.split('(')[0];
      var optionId = 'camera_' + i;
      var deviceId = camera.deviceId;
      if(i === 0 && localStreams.camera.camId === ''){
        localStreams.camera.camId = deviceId;
      }
      $('#camera-list').append('<a class="dropdown-item" id="' + optionId + '">' + name + '</a>');
    });
    $('#camera-list a').click(function(event) {
      var index = event.target.id.split('_')[1];
      changeStreamSource (index, "video");
    });
  });
}

function getMicDevices() {
  console.log("Checking for Mic Devices.....")
  client.getRecordingDevices(function(mics) {
    devices.mics = mics; // store mics array
    mics.forEach(function(mic, i){
      var name = mic.label.split('(')[0];
      var optionId = 'mic_' + i;
      var deviceId = mic.deviceId;
      if(i === 0 && localStreams.camera.micId === ''){
        localStreams.camera.micId = deviceId;
      }
      if(name.split('Default - ')[1] != undefined) {
        name = '[Default Device]' // rename the default mic - only appears on Chrome & Opera
      }
      $('#mic-list').append('<a class="dropdown-item" id="' + optionId + '">' + name + '</a>');
    }); 
    $('#mic-list a').click(function(event) {
      var index = event.target.id.split('_')[1];
      changeStreamSource (index, "audio");
    });
  });
}

function startLiveTranscoding() {
  console.log("start live transcoding"); 
  var rtmpUrl = $('#rtmp-url').val();
  var width = parseInt($('#window-scale-width').val(), 10);
  var height = parseInt($('#window-scale-height').val(), 10);

  var configRtmp = {
    width: width,
    height: height,
    videoBitrate: parseInt($('#video-bitrate').val(), 10),
    videoFramerate: parseInt($('#framerate').val(), 10),
    lowLatency: ($('#low-latancy').val() === 'true'),
    audioSampleRate: parseInt($('#audio-sample-rate').val(), 10),
    audioBitrate: parseInt($('#audio-bitrate').val(), 10),
    audioChannels: parseInt($('#audio-channels').val(), 10),
    videoGop: parseInt($('#video-gop').val(), 10),
    videoCodecProfile: parseInt($('#video-codec-profile').val(), 10),
    userCount: 1,
    userConfigExtraInfo: {},
    backgroundColor: parseInt($('#background-color-picker').val(), 16),
    transcodingUsers: [{
      uid: localStreams.uid,
      alpha: 1,
      width: width,
      height: height,
      x: 0,
      y: 0,
      zOrder: 0
    }],
  };

  // set live transcoding config
  client.setLiveTranscoding(configRtmp);
  if(rtmpUrl !== '') {
    client.startLiveStreaming(rtmpUrl, true)
    externalBroadcastUrl = rtmpUrl;
    addExternalTransmitionMiniView(rtmpUrl)
  }
}

function addExternalSource() {
  var externalUrl = $('#external-url').val();
  var width = parseInt($('#external-window-scale-width').val(), 10);
  var height = parseInt($('#external-window-scale-height').val(), 10);

  var injectStreamConfig = {
    width: width,
    height: height,
    videoBitrate: parseInt($('#external-video-bitrate').val(), 10),
    videoFramerate: parseInt($('#external-framerate').val(), 10),
    audioSampleRate: parseInt($('#external-audio-sample-rate').val(), 10),
    audioBitrate: parseInt($('#external-audio-bitrate').val(), 10),
    audioChannels: parseInt($('#external-audio-channels').val(), 10),
    videoGop: parseInt($('#external-video-gop').val(), 10)
  };

  // set live transcoding config
  client.addInjectStreamUrl(externalUrl, injectStreamConfig)
  injectedStreamURL = externalUrl;
  // TODO: ADD view for external url (similar to rtmp url)
}

// RTMP Connection (UI Component)
function addExternalTransmitionMiniView(rtmpUrl){
  var container = $('#rtmp-controlers');
  // append the remote stream template to #remote-streams
  container.append(
    $('<div/>', {'id': 'rtmp-container',  'class': 'container row justify-content-end mb-2'}).append(
      $('<div/>', {'class': 'pulse-container'}).append(
          $('<button/>', {'id': 'rtmp-toggle', 'class': 'btn btn-lg col-flex pulse-button pulse-anim mt-2'})
      ),
      $('<input/>', {'id': 'rtmp-url', 'val': rtmpUrl, 'class': 'form-control col-flex" value="rtmps://live.facebook.com', 'type': 'text', 'disabled': true}),
      $('<button/>', {'id': 'removeRtmpUrl', 'class': 'btn btn-lg col-flex close-btn'}).append(
        $('<i/>', {'class': 'fas fa-xs fa-trash'})
      )
    )
  );
  
  $('#rtmp-toggle').click(function() {
    if ($(this).hasClass('pulse-anim')) {
      client.stopLiveStreaming(externalBroadcastUrl)
    } else {
      client.startLiveStreaming(externalBroadcastUrl, true)
    }
    $(this).toggleClass('pulse-anim');
    $(this).blur();
  });

  $('#removeRtmpUrl').click(function() { 
    client.stopLiveStreaming(externalBroadcastUrl);
    externalBroadcastUrl = '';
    $('#rtmp-container').remove();
  });

}

// REMOTE STREAMS UI
function addRemoteStreamMiniView(remoteStream){
  var streamId = remoteStream.getId();
  // append the remote stream template to #remote-streams
  $('#external-broadcasts-container').append(
    $('<div/>', {'id': streamId + '_container',  'class': 'remote-stream-container col'}).append(
      $('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
          $('<i/>', {'class': 'fas fa-microphone-slash'})
      ),
      $('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
        $('<i/>', {'class': 'fas fa-user'})
      ),
      $('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
    )
  );
  remoteStream.play('agora_remote_' + streamId); 

  var containerId = '#' + streamId + '_container';
  $(containerId).dblclick(function() {
    client.removeInjectStreamUrl(injectedStreamURL);
    $(containerId).remove();
  });
  window.client = client

}
