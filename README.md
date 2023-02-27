# agora-web-broadcast-demo
A simple implementation of a live broadcast web-app using the [Agora.io](https://www.agora.io) [Web SDK](https://docs.agora.io/en/Video/API%20Reference/web/index.html). This code implements a "one to many" live broadcasting web-app similar to Facebook, and Youtube Live. The web-app will allow a single broadcaster to stream their video feed to a multi-person audience. This project can be extended to support "many to many" broadcasting, where multiple broadcasters are streaming to the same audience.

# How To: Build a Live Broadcasting Web App
![](https://miro.medium.com/max/2000/1*WOGbS208nSRrtZxcgEz4RA.png)
In a [previous project](https://github.com/digitallysavvy/group-video-chat) we built a group video chat app similar to a Google Hangouts/Meet. Now we want to build something more akin to Instagram Live. When building a live broadcasting web-app, the architecture is similar to that of a communication web-app, except with a slight twist.


## Pre Requisites for the web server ##
- A [simple web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server) — I like to use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- An SSL cert or way to have an https connection (I use [ngrok](https://ngrok.com))
- A developer account with [Agora.io](https://console.agora.io)
- An understanding of HTML/CSS/JS
- An understanding of how Bootstrap and JQuery function *(minimal knowledge needed)*
- Read: [Building a group video chat web-app](https://github.com/digitallysavvy/group-video-chat)

## Architecture and Structure Design ##
In [“Building a Group Video Chat Web-App,”](https://github.com/digitallysavvy/group-video-chat) the build conformed to the communication scenario, where every user in the channel has the ability to broadcast their audio and video streams.

In this project we will be implementing a broadcasting scenario, where there is a mix of users. Some users in the channel are broadcasting _(Broadcasters)_ their camera _Broadcasters_ _(Audience)_.

In this case we need to limit the broadcasting capability to specific users while allowing all other users are in the _Audience_ they will only consume the _Broadcaster_ stream(s).

![Simple flow chart](https://miro.medium.com/max/1400/1*iNNh5ueUD0l0_cff5SUQww.jpeg)

The graphic above helps us to visualize the flow of our _Broadcaster_ web-app. We can see we have to implement two different clients, one for _Broadcasters_ and one for the _Audience_. Each client will have a unique interface for each of the user roles (_Broadcaster_/_Audience_) and both will connect to the [Agora.io Software Defined Real-Time Network (SD-RTN)](https://www.agora.io/en/agora-network/).

## Core Structure (HTML) ##
n our live broadcast web-app we will have two clients (_Broadcaster_/_Audience_), each with their own UI.

The _Broadcaster_ client is almost identical to the client we built for our communication web app. The main difference being we won’t need to account for other _Broadcasters_, since we’re building this as a one-to-many broadcast.

```HTML
<html lang="en">
    <head>
		<title>Agora.io [HOST] - AllThingsRTC Live Stream</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<script src="https://cdn.agora.io/sdk/web/AgoraRTCSDK-2.6.1.js"></script>
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
		<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet">
		<link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.min.css" rel="stylesheet">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
		<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
		<!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.8.2/css/mdb.min.css" rel="stylesheet"> -->
		<link rel="stylesheet" type="text/css" href="css/style.css"/>
    </head>
    <body>
			<div class="container-fluid p-0">
				<div id="main-container">
					<div id="screen-share-btn-container" class="col-2 float-right text-right mt-2">
						<button id="screen-share-btn"  type="button" class="btn btn-lg">
							<i id="screen-share-icon" class="fab fa-slideshare"></i>
						</button>
					</div>
					<div id="buttons-container" class="row justify-content-center mt-3">
						<div id="audio-controls" class="col-md-2 text-center btn-group">
							<button id="mic-btn" type="button" class="btn btn-block btn-dark btn-lg">
								<i id="mic-icon" class="fas fa-microphone"></i>
              </button>
              <!-- insert mic selection drop-down -->
						</div>
						<div id="video-controls" class="col-md-2 text-center btn-group">
							<button id="video-btn"  type="button" class="btn btn-block btn-dark btn-lg">
								<i id="video-icon" class="fas fa-video"></i>
              </button>
              <!-- insert camera selection drop-down -->
						</div>
						<div class="col-md-2 text-center">
							<button id="exit-btn"  type="button" class="btn btn-block btn-danger btn-lg">
								<i id="exit-icon" class="fas fa-phone-slash"></i>
							</button>
						</div>
					</div>
					<div id="full-screen-video"></div>
					<div id="lower-ui-bar" class="row fixed-bottom mb-1">
						<div id="rtmp-btn-container" class="col ml-3 mb-2">
							<button id="rtmp-config-btn"  type="button" class="btn btn-primary btn-lg row rtmp-btn" data-toggle="modal" data-target="#addRtmpConfigModal">
								<i id="rtmp-config-icon" class="fas fa-rotate-270 fa-sign-out-alt"></i>
							</button>
							<button id="add-rtmp-btn"  type="button" class="btn btn-secondary btn-lg row rtmp-btn" data-toggle="modal" data-target="#add-external-source-modal">
								<i id="add-rtmp-icon" class="fas fa-plug"></i>
							</button>
						</div>
						<div id="external-broadcasts-container" class="container col-flex">
							<div id="rtmp-controlers" class="col">
								<!-- insert rtmp  controls -->
							</div>
						</div>
					</div>
				</div>
				<!-- insert RTMP Config Modal -->
				<!-- insert External Injest Url Modal -->
			</div>
		</div>
	</body>
	<script>
		$("#mic-btn").prop("disabled", true);
		$("#video-btn").prop("disabled", true);
		$("#screen-share-btn").prop("disabled", true);
		$("#exit-btn").prop("disabled", true);
	</script>
	<script src="js/agora-interface.js"></script>
	<script src="js/agoraBroadcastClient.js"></script>
	<script src="js/ui.js"></script>
</html>
```
The above code should look very familiar with a few minor differences — we’ve added some comments to add drop down selectors for the camera and microphone buttons. Along with the button comments there are also two rows of comments for some modal windows that we need to add in.
```HTML
<!-- insert RTMP Config Modal -->
<!-- insert External Injest Url Modal -->
```

Let’s start with the camera/mic buttons. We can use button groups to create simple containers for each and we’ll use Agora.io’s SDK to get the input devices and populate these containers. This will give the broadcaster the ability to switch their camera and microphone to any media device connected to their computer/tablet/phone.
```HTML
<div id="buttons-container" class="row justify-content-center mt-3">
	<div id="audio-controls" class="col-md-2 text-center btn-group">
	<button id="mic-btn" type="button" class="btn btn-block btn-dark btn-lg">
		<i id="mic-icon" class="fas fa-microphone"></i>
	</button>
	<!-- insert mic selection drop-down -->
	</div>
	<div id="video-controls" class="col-md-2 text-center btn-group">
	<button id="video-btn"  type="button" class="btn btn-block btn-dark btn-lg">
		<i id="video-icon" class="fas fa-video"></i>
	</button>
	<!-- insert camera selection drop-down -->
	</div>
	<div class="col-md-2 text-center">
	<button id="exit-btn"  type="button" class="btn btn-block btn-danger btn-lg">
		<i id="exit-icon" class="fas fa-phone-slash"></i>
	</button>
	</div>
</div>
```

Now we are ready to add in our models for configuring the settings for pushing our broadcast stream to RTMP servers. I’ll dive into pushing the stream to external servers a little later in the article, for now lets add the modals and input elements.
```HTML
<!-- RTMP Config Modal -->
<div class="modal fade slideInLeft animated" id="addRtmpConfigModal" tabindex="-1" role="dialog" aria-labelledby="rtmpConfigLabel" aria-hidden="true" data-keyboard=true>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="rtmpConfigLabel"><i class="fas fa-sliders-h"></i></h5>
        <button type="button" class="close" data-dismiss="modal" data-reset="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form id="rtmp-config">
            <div class="form-group">
              <input id="rtmp-url" type="text" class="form-control" placeholder="URL *"/>
            </div>
            <div class="form-group">
                <label for="window-scale">Video Scale</label>
                <input id="window-scale-width" type="number" value="640" min="1" max="1000" step="1"/> (w)&nbsp;
                <input id="window-scale-height" type="number" value="360" min="1" max="1000" step="1"/> (h) 
            </div>
            <div class="form-group row">
                <div class="col-flex">
                  <label for="audio-bitrate">Audio Bitrate</label>	
                  <input id="audio-bitrate" type="number" value="48" min="1" max="128" step="2"/>	
                </div>
                <div class="col-flex ml-3">
                    <label for="video-bitrate">Video Bitrate</label>
                    <input id="video-bitrate" type="number" value="400" min="1" max="1000000" step="2"/>
                </div>
            </div>
            <div class="form-group row">
              <div class="col-flex">
                  <label for="framerate">Frame Rate</label>
                  <input id="framerate" type="number" value="15" min="1" max="10000" step="1"/>
              </div>
              <div class="col-flex ml-3">
                <label for="video-gop">Video GOP</label>
                <input id="video-gop" type="number" value="30" min="1" max="10000" step="1"/>
              </div>
            </div>
            <div class="form-group">
                <label for="video-codec-profile">Video Codec Profile </label>
                <select id="video-codec-profile" class="form-control drop-mini">
                  <option value="66">Baseline</option>
                  <option value="77">Main</option>
                  <option value="100" selected>High (default)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="audio-channels">Audio Channels </label>
                <select id="audio-channels" class="form-control drop-mini">
                  <option value="1" selected>Mono (default)</option>
                  <option value="2">Dual sound channels</option>
                  <option value="3" disabled>Three sound channels</option>
                  <option value="4" disabled>Four sound channels</option>
                  <option value="5" disabled>Five sound channels</option>
                </select>
            </div>
            <div class="form-group">
                <label for="audio-sample-rate">Audio Sample Rate </label>
                <select id="audio-sample-rate" class="form-control drop-mini">
                  <option value="32000">32 kHz</option>
                  <option value="44100" selected>44.1 kHz (default)</option>
                  <option value="48000">48 kHz</option>
                </select>
            </div>
            <div class="form-group">
                <label for="background-color-picker">Background Color </label>
                <input id="background-color-picker" type="text" class="form-control drop-mini" placeholder="(optional)" value="0xFFFFFF" />
            </div>
            <div class="form-group">
                <label for="low-latancy">Low Latency </label>
                <select id="low-latancy" class="form-control drop-mini">
                  <option value="true">Low latency with unassured quality</option>
                  <option value="false" selected>High latency with assured quality (default)</option>
                </select>
            </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" id="start-RTMP-broadcast" class="btn btn-primary">
            <i class="fas fa-satellite-dish"></i>
        </button>
      </div>
    </div>
  </div>
</div>
<!-- end Modal -->
<!-- External Injest Url Modal -->
<div class="modal fade slideInLeft animated" id="add-external-source-modal" tabindex="-1" role="dialog" aria-labelledby="add-external-source-url-label" aria-hidden="true" data-keyboard=true>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="add-external-source-url-label"><i class="fas fa-broadcast-tower"></i> [add external url]</i></h5>
          <button id="hide-external-url-modal" type="button" class="close" data-dismiss="modal" data-reset="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
            <form id="external-injest-config">
                <div class="form-group">
                  <input id="external-url" type="text" class="form-control" placeholder="URL *"/>
                </div>
                <div class="form-group">
                    <label for="external-window-scale">Video Scale</label>
                    <input id="external-window-scale-width" type="number" value="640" min="1" max="1000" step="1"/> (w)&nbsp;
                    <input id="external-window-scale-height" type="number" value="360" min="1" max="1000" step="1"/> (h) 
                </div>
                <div class="form-group row">
                    <div class="col-flex">
                      <label for="external-audio-bitrate">Audio Bitrate</label>	
                      <input id="external-audio-bitrate" type="number" value="48" min="1" max="128" step="2"/>	
                    </div>
                    <div class="col-flex ml-3">
                        <label for="external-video-bitrate">Video Bitrate</label>
                        <input id="external-video-bitrate" type="number" value="400" min="1" max="1000000" step="2"/>
                    </div>
                </div>
                <div class="form-group row">
                  <div class="col-flex">
                      <label for="external-framerate">Frame Rate</label>
                      <input id="external-framerate" type="number" value="15" min="1" max="10000" step="1"/>
                  </div>
                  <div class="col-flex ml-3">
                    <label for="external-video-gop">Video GOP</label>
                    <input id="external-video-gop" type="number" value="30" min="1" max="10000" step="1"/>
                  </div>
                </div>
                <div class="form-group">
                    <label for="external-audio-channels">Audio Channels </label>
                    <select id="external-audio-channels" class="form-control drop-mini">
                      <option value="1" selected>Mono (default)</option>
                      <option value="2">Dual sound channels</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="external-audio-sample-rate">Audio Sample Rate </label>
                    <select id="external-audio-sample-rate" class="form-control drop-mini">
                      <option value="32000">32 kHz</option>
                      <option value="44100" selected>44.1 kHz (default)</option>
                      <option value="48000">48 kHz</option>
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
          <button type="button" id="add-external-stream" class="btn btn-primary">
              <i id="add-rtmp-icon" class="fas fa-plug"></i>	
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- end Modal -->
```

Now that we have our _Broadcaster_ client we need our _Audience_ client. The _Audience_ client is very straight-forward. We have some _wrapper_ `div` along with the _fullscreen_ `div` that we can set to 100% of the browser window `height` and `width` to play the broadcast video stream.

```HTML
<html lang="en">
    <head>
        <title>Agora.io - AllThingsRTC Live Stream</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="js/AgoraRTCSDK-3.1.1.js"></script>
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
        <link rel="stylesheet" type="text/css" href="css/style.css"/>
    </head>
    <body>
        <div class="container-fluid p-0">
            <div id="full-screen-video"></div>
            <div id="watch-live-overlay">
                <div id="overlay-container">
                    <div class="col-md text-center">
                        <button id="watch-live-btn" type="button" class="btn btn-block btn-primary btn-xlg">
                        <i id="watch-live-icon" class="fas fa-broadcast-tower"></i><span>Watch the Live Stream</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </body>
    <script src="js/agoraAudienceClient.js"></script>
</html>
```

## Giving it some style with CSS ##
As with our last project, we’ll use a mix of Bootstrap and some custom CSS. For both clients we’ll use the same css file. The broadcaster client we can re-use most of the CSS from our communications web-app, with some adjustments/updates. For the audience, we can keep the CSS very simple.
```CSS

body {
  margin: 0;
  padding: 0;
  background-image: url('../images/rtc-logo.png');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}

body .btn:focus{ 
  outline: none !important;
  box-shadow:none !important;
}

#buttons-container {
  position: absolute;
  z-index: 2;  
  width: 100vw;
}

#buttons-container div {
  max-width: 250px;
  min-width: 150px;
  margin-bottom: 10px;
}

.btn-group button i {
  padding-left: 25px;
}

#full-screen-video {
  position: absolute;
  width: 100vw;
  height: 100vh;
}

#full-screen-video-iframe {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-image: url('../images/AllThingsRTC_Live-bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

#rtmp-btn-container { 
  position: relative; 
  display: inline-block;
  margin-top: auto;
  z-index: 99;
}

.rtmp-btn {
  bottom: 5vh;
  right: 5vw;
  display: block;
  margin: 0 0 5px 0;
}

#add-rtmp-btn {
  padding: 0.5rem 1.15rem;
}

.remote-stream-container { 
  display: inline-block;
}

#rtmp-controlers {
  height: 100%;
  margin: 0;
}

#local-video {
  position: absolute;
  z-index: 1;
  height: 20vh;
  max-width: 100%;
}

.remote-video {
  position: absolute;
  z-index: 1;
  height: 100% !important;
  width: 80%;
  max-width: 500px;
}

#mute-overlay {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  color: #d9d9d9;
  font-size: 2em;
  padding: 0 0 3px 3px;
  display: none;
} 

.mute-overlay {
  position: absolute;
  z-index: 2;
  top: 2px;
  color: #d9d9d9;
  font-size: 1.5em;
  padding: 2px 0 0 2px;
  display: none;
}

#no-local-video, .no-video-overlay {
  position: absolute;
  z-index: 3;
  width: 100%;
  top: 40%;
  color: #cccccc;
  font-size: 2.5em;
  margin: 0 auto;
  display: none;
}

.no-video-overlay {
  width: 80%;
}

#screen-share-btn-container {
  z-index: 99;
}

#watch-live-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  background-image: url('../images/AllThingsRTC_Live-bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

#external-broadcasts-container {
  max-width: 70%;
  margin: auto 0 5px;
}

#external-broadcasts-container input {
  width: 50%;
}

#external-broadcasts-container button {
  color: #fff;
}

#watch-live-overlay #overlay-container {
  padding: 25px;
  border-radius: 5px;
  position:relative;
  margin: 0 auto;
  top: 65%;
  width: 70%;
}

#watch-live-overlay button {
  display: block;
  /* margin: -50px auto; */
  color: #0096e6;
  background: #fff;
}

#watch-live-overlay img {
  height: auto;
  width: 100%;
  object-fit: cover;
  object-position: center;
}

#watch-live-overlay button i {
  padding: 0 10px;
}

.btn-xlg {
  padding: 20px 35px;
  font-size: 30px;
  line-height: normal;
  -webkit-border-radius: 8px;
     -moz-border-radius: 8px;
          border-radius: 8px;
}

.drop-mini {
  width: inherit;
  display: inline-block;
}

#external-injest-config label, #rtmp-config label {
  margin: 0 .5rem .5rem 0;
}

#external-injest-config .row,#rtmp-config .row {
  margin-left: inherit;
  margin-right: inherit;
}


#addRtmpConfigModal .modal-header, 
#external-injest-config .modal-header {
  padding: 0.5rem 1rem 0;
  border-bottom: none;
}

#addRtmpConfigModal .modal-header .close, 
#external-injest-config .modal-header .close {
  padding: 0.5rem;
  margin: -.025rem;
}

#addRtmpConfigModal .modal-body, 
#external-injest-config .modal-body {
  padding: 1rem 1rem 0.25rem;
}

#addRtmpConfigModal .modal-footer, 
#external-injest-config .modal-footer {
  padding: 0 1rem 0.5rem;
  border-top: none;
}

#pushToRtmpBtn {
  padding: 10px 15px;
}

.close .fa-xs {
  font-size: .65em;
}

/* pulsating broadcast button */
.pulse-container {
  height: 100%;
  margin: 5px 10px 0;
}

.pulse-button {
  position: relative;
  /* width: 32px; */
  /* height: 32px; */
  border: none;
  box-shadow: 0 0 0 0 rgba(232, 76, 61, 0.7);
  /* border-radius: 50%; */
  background-color: #e84c3d;
  background-size:cover;
  background-repeat: no-repeat;
  cursor: pointer;
}

.pulse-anim {
  -webkit-animation: pulse 2.25s infinite cubic-bezier(0.66, 0, 0, 1);
  -moz-animation: pulse 2.25s infinite cubic-bezier(0.66, 0, 0, 1);
  -ms-animation: pulse 2.25s infinite cubic-bezier(0.66, 0, 0, 1);
  animation: pulse 2.25s infinite cubic-bezier(0.66, 0, 0, 1); 
}

@-webkit-keyframes pulse {to {box-shadow: 0 0 0 15px rgba(232, 76, 61, 0);}}
@-moz-keyframes pulse {to {box-shadow: 0 0 0 15px rgba(232, 76, 61, 0);}}
@-ms-keyframes pulse {to {box-shadow: 0 0 0 15px rgba(232, 76, 61, 0);}}
@keyframes pulse {to {box-shadow: 0 0 0 15px rgba(232, 76, 61, 0);}}

/* Respomnsive design */

@media only screen and (max-width: 795px) {
  #watch-live-overlay #overlay-container {
    width: 100%;
  }
}

@media only screen and (max-height: 350px) {
  #watch-live-overlay img {
    height: auto;
    width: 80%;
  }
  #watch-live-overlay #overlay-container {
    top: 60%;
  }
  .btn-xlg {
    font-size: 1rem;
  }
}

@media only screen and (max-height: 400px){
  .btn-xlg {
    font-size: 1.25rem;
  }
}

@media only screen and (max-width: 400px) {
  .btn-xlg {
    padding: 10px 17px;
  }
}
```

## Building the Javascript Clients ##
Let’s start with our _Broadcaster_. I chose to use Agora.io’s WebSDK to simplify the heavy lifting generally associated with writing a WebRTC interface. I wrote a [short guide on how to get setup with Agora.io](https://medium.com/@hermes_11327/how-to-get-started-with-agora-io-c73934bcab2b) for anyone new to the Agora.io platform.

In our JS code for both clients we start by declaring and initializing the *Client* object. Once we create the *Client* object we can `join` or `leave` the channel.
```Javascript
var client = AgoraRTC.createClient({mode: 'live', codec: 'vp8'});
```

Prior to joining the channel we need to set our client’s role. Within Agora’s SDK, any user publishing a stream is by default a broadcaster, but I’d recommend being explicit about the client’s role within the stream to avoid any unwanted streams.

```Javascript
// create broadcaster client and set the client role
var broadcastClient = AgoraRTC.createClient({mode: 'live', codec: 'vp8'}); 
  
broadcastClient.setClientRole('host', function() {
  console.log('Client role set as host.');
}, function(e) {
  console.log('setClientRole failed', e);
});
```

It shouldn’t be assumed that a broadcaster will always have a published stream. In that same breath it can’t be assumed that an audience member will never try to publish a stream _(consider someone trying to hack and inject their stream into the broadcast)_.
```Javascript
// create audience client and set the client role
var audienceClient = AgoraRTC.createClient({mode: 'live', codec: 'vp8'}); 

audienceClient.setClientRole('audience', function() {
  console.log('Client role set to audience');
}, function(e) {
  console.log('setClientRole failed', e);
});
```

We’ll also need to add event listeners for the various engine events that Agora’s SDK provides. Most of the events should look familiar, as the broadcaster has all of the same controls as a video chat web-app, plus a few extras. We have `liveStreamingStarted`, `liveStreamingFailed`, `liveStreamingStopped`, `liveTranscodingUpdated`, and `streamInjectedStatus` as the new events. These events are related to the Agora’s ability to push out to external RTMP server or to pull in an external RTMP stream.
```Javascript
client.on('stream-published', function (evt) {
  console.log('Publish local stream successfully');
});

// when a remote stream is added
client.on('stream-added', function (evt) {
  console.log('new stream added: ' + evt.stream.getId());
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
```

The RTMP Push/Pull features will allow us to push the video broadcast out to third party RTMP servers such as Facebook, YouTube, Vimeo, or any other service that accepts an RTMP stream and similarly pull streams from these same sources into our live stream.

Since RTMP Push/Pull is one of the more important additions to our broadcaster UI, let’s first take a closer look at the methods needed to push our stream out to an external service and then we’ll dive into how to pull an external stream into our broadcast.

The two main methods that enable us to push out are `setLiveTranscoding` and `startLiveStreaming`. Before we can push our stream to an RTMP server, we first need to set the transcoding configuration using client.`setLiveTranscoding(config)` passing an object with the various settings. Then, once we have our configuration set, we can call client.`startLiveStreaming(url)` passing the url we wish to push out to.
```Javascript
function setTranscodingConfig() {
  console.log("save rtmp config"); 
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
  
}
```
We are using the form elements to allow the _Broadcaster_ to control their settings, but since we are building an object for the configuration we need to ensure that we are pulling the values with the correct types.

One area to take note, is the `userCount` and `transcodingUser`. In our example, the user count is hardcoded in because we are only broadcasting with a single user, but if you intend to have more than a single _Broadcaster_ in each channel you need to make this number dynamic to the number of streams you want to push to the external server. Along with userCount, the transcodingUser array in our example is a single element array, but you can make that dynamic if you wish to have more _Broadcasters_ in the external stream.

Another point worth mentioning: if you are broadcasting more than one stream to a 3rd party service using RTMP, the streams will be merged into a single stream. To allow developers to control the layout when the videos are merged into a single video stream. The configuration object allows us to set the overall width and height of the stream and then within the transcodingUser array we can also specify the scale and position of the individual streams within the merged video stream.

Earlier we added some dropdown UI elements to our microphone and camera buttons. Let’s now take the time to add in the Agora method to load the list of our devices.

Its best to wait until the user has granted permission to use the devices before we ask for the list of permissions because each browser has varying support as to how much information they return. For example, in Safari the browser will return an empty array but in Chrome the browser returns an array of devices but without any identifiable information. On the other hand, every browser gives consistent access once the user has granted permission.
```Javascript
// The user has granted access to the camera and mic.
localStream.on("accessAllowed", function() {
  if(devices.cameras.length === 0 && devices.mics.length === 0) {
    console.log('[DEBUG] : checking for cameras & mics');
    getCameraDevices();
    getMicDevices();
  }
  console.log("accessAllowed");
});

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
      changeStreamSource ({camIndex: index});
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
      changeStreamSource ({micIndex: index});
    });
  });
}
```
In the snippet above we store the devices in arrays to quickly switch whenever the user selects a different device. The `stream.switchDevice()` method allows us to pass in the `deviceId` and quickly switch the input device on our broadcast stream.
```Javascript
// user clicks on an element within the camera list
$('#camera-list a').click(function(event) {
  var index = event.target.id.split('_')[1];
  changeStreamSource (index, "video");
});

// user clicks on an element within the mic list
$('#mic-list a').click(function(event) {
  var index = event.target.id.split('_')[1];
  changeStreamSource (index, "audio");
});

// switch the input device
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
    } else {
      console.log("unable to determine deviceType: " + deviceType);
    }
  }, function(){
    console.log('failed to switch to new device with id: ' + JSON.stringify(deviceId));
  });
}
```

When we are done, our agora-broadcast-client.js should look like the code below.
```Javascript
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
var cameraVideoProfile = '720p_6'; // 960 × 720 @ 30fps  & 750kbs

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
});

// when a remote stream is added
client.on('stream-added', function (evt) {
  console.log('new stream added: ' + evt.stream.getId());
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
```

The _Audience_ client is much simpler. We have most of the same event listeners but in our use-case we will only need a handful of them. We’ll include the extra ones in the even that we want to extend the demo at a later date. Below is the full implementation of our `agora-audience-client.js`.
```Javascript
/**
 * Agora Broadcast Client 
 */

var agoraAppId = ''; // set app id
var channelName = 'AgoraBroadcastDemo'; // set channel name

// create client 
var client = AgoraRTC.createClient({mode: 'live', codec: 'vp8'}); // vp8 to work across mobile devices

// set log level:
// -- .DEBUG for dev 
// -- .NONE for prod
AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.DEBUG); 

// Due to broswer restrictions on auto-playing video, 
// user must click to init and join channel
$("#watch-live-btn").click(function(){
  // init Agora SDK
  client.init(agoraAppId, function () {
    $("#watch-live-overlay").remove();
    console.log('AgoraRTC client initialized');
    joinChannel(); // join channel upon successfull init
  }, function (err) {
    console.log('[ERROR] : AgoraRTC client init failed', err);
  });
});

client.on('stream-published', function (evt) {
  console.log('Publish local stream successfully');
});

// connect remote streams
client.on('stream-added', function (evt) {
  var stream = evt.stream;
  var streamId = stream.getId();
  console.log('New stream added: ' + streamId);
  console.log('Subscribing to remote stream:' + streamId);
  // Subscribe to the stream.
  client.subscribe(stream, function (err) {
    console.log('[ERROR] : subscribe stream failed', err);
  });
});

client.on('stream-removed', function (evt) {
  var stream = evt.stream;
  stream.stop(); // stop the stream
  stream.close(); // clean up and close the camera stream
  console.log("Remote stream is removed " + stream.getId());
});

client.on('stream-subscribed', function (evt) {
  var remoteStream = evt.stream;
  remoteStream.play('full-screen-video');
  console.log('Successfully subscribed to remote stream: ' + remoteStream.getId());
});

// remove the remote-container when a user leaves the channel
client.on('peer-leave', function(evt) {
  console.log('Remote stream has left the channel: ' + evt.uid);
  evt.stream.stop(); // stop the stream
});

// show mute icon whenever a remote has muted their mic
client.on('mute-audio', function (evt) {
  var remoteId = evt.uid;
});

client.on('unmute-audio', function (evt) {
  var remoteId = evt.uid;
});

// show user icon whenever a remote has disabled their video
client.on('mute-video', function (evt) {
  var remoteId = evt.uid;
});

client.on('unmute-video', function (evt) {
  var remoteId = evt.uid;
});

// ingested live stream 
client.on('streamInjectedStatus', function (evt) {
  console.log("Injected Steram Status Updated");
  // evt.stream.play('full-screen-video');
  console.log(JSON.stringify(evt));
}); 

// join a channel
function joinChannel() {
  var token = generateToken();

  // set the role
  client.setClientRole('audience', function() {
    console.log('Client role set to audience');
  }, function(e) {
    console.log('setClientRole failed', e);
  });
  
  client.join(token, channelName, 0, function(uid) {
      console.log('User ' + uid + ' join channel successfully');
  }, function(err) {
      console.log('[ERROR] : join channel failed', err);
  });
}

function leaveChannel() {
  client.leave(function() {
    console.log('client leaves channel');
  }, function(err) {
    console.log('client leave failed ', err); //error handling
  });
}

// use tokens for added security
function generateToken() {
  return null; // TODO: add a token generation
}
```

The last piece of Javascript that we need to implement is the `Ui.js` to add enable the UI elements to interact with the `agora-broadcast-client.js`.
```Javascript

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
```

## Testing Setup (webserver/https) ##
There are a few different ways to test and deploy our broadcast web-app. We can use localhost but if we want to share with our friends we must spin up a simple web server with a _https_ connection. This is due to browser restricts when accessing `userMedia` resources like the camera and microphone.

To keep things simple, I like to use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to enable [simple web server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server) locally in conjunction with [ngrok](https://ngrok.com), a service that creates a tunnel out from your local machine and provides an _https_ url for use. In my experience, this is one of the simplest ways to run an _https_ secured web server on your local machine.

![ngrok server](https://miro.medium.com/max/1400/1*TyhGPyccOHAy5Shsll6eZg.png)

Once the server is ready we can share our ngrok link with a friend or two and run our test broadcast.

>*NOTE:* For testing I am using an iPad and iPhone as the audience, and my laptop is the broadcaster.

## Thats a wrap ##
Thanks for following along. Now it’s your turn to go and build something amazing!

Thanks for taking the time to read my tutorial and if you have any questions please let me know with a comment. If you see any room for improvement feel free to fork the repo and make a pull request!
