
// UI buttons
function enableUiControls() {

  $("#mic-btn").prop("disabled", false);
  $("#video-btn").prop("disabled", false);
  $("#exit-btn").prop("disabled", false);
  $("#add-rtmp-btn").prop("disabled", false);

  $("#mic-btn").click(function(){
    toggleMic();
  });

  $("#video-btn").click(function(){
    toggleVideo();
  });

  $("#exit-btn").click(function(){
    console.log("so sad to see you leave the channel");
    leaveChannel(); 
  });

  $("#start-RTMP-broadcast").click(function(){
    startLiveTranscoding();
    $('#addRtmpConfigModal').modal('toggle');
    $('#rtmp-url').val('');
  });

  $("#add-external-stream").click(function(){  
    addExternalSource();
    $('#add-external-source-modal').modal('toggle');
  });

  // keyboard listeners 
  $(document).keypress(function(e) {
    // ignore keyboard events when the modals are open
    if (($("#addRtmpUrlModal").data('bs.modal') || {})._isShown ||
        ($("#addRtmpConfigModal").data('bs.modal') || {})._isShown){
      return;
    }

    switch (e.key) {
      case "m":
        console.log("squick toggle the mic");
        toggleMic();
        break;
      case "v":
        console.log("quick toggle the video");
        toggleVideo();
        break; 
      case "q":
        console.log("so sad to see you quit the channel");
        leaveChannel(); 
        break;   
      default:  // do nothing
    }
  });
}

function toggleBtn(btn){
  btn.toggleClass('btn-dark').toggleClass('btn-danger');
}

function toggleVisibility(elementID, visible) {
  if (visible) {
    $(elementID).attr("style", "display:block");
  } else {
    $(elementID).attr("style", "display:none");
  }
}

function toggleMic() {
  toggleBtn($("#mic-btn")); // toggle button colors
  toggleBtn($("#mic-dropdown"));
  $("#mic-icon").toggleClass('fa-microphone').toggleClass('fa-microphone-slash'); // toggle the mic icon
  if ($("#mic-icon").hasClass('fa-microphone')) {
    localStreams.camera.stream.unmuteAudio(); // enable the local mic
  } else {
    localStreams.camera.stream.muteAudio(); // mute the local mic
  }
}

function toggleVideo() {
  toggleBtn($("#video-btn")); // toggle button colors
  toggleBtn($("#cam-dropdown"));
  if ($("#video-icon").hasClass('fa-video')) {
    localStreams.camera.stream.muteVideo(); // enable the local video
    console.log("muteVideo");
  } else {
    localStreams.camera.stream.unmuteVideo(); // disable the local video
    console.log("unMuteVideo");
  }
  $("#video-icon").toggleClass('fa-video').toggleClass('fa-video-slash'); // toggle the video icon
}

// keep the spinners honest
$("input[type='number']").change(event, function() {
  var maxValue = $(this).attr("max");
  var minValue = $(this).attr("min");
  if($(this).val() > maxValue) {
    $(this).val(maxValue);
  } else if($(this).val() < minValue) {
    $(this).val(minValue);
  }
});

// keep the background color as a proper hex
$("#background-color-picker").change(event, function() {
  // check the background color
  var backgroundColorPicker = $(this).val();
  if (backgroundColorPicker.split('#').length > 1){
    backgroundColorPicker = '0x' + backgroundColorPicker.split('#')[1];
    $('#background-color-picker').val(backgroundColorPicker);
  } 
});
