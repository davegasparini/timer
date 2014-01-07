// Global Constants
var NOT_STARTED = 0;
var IN_PLAY = 1;
var PAUSED = 2;

// Global Variables
var startTime; // The time-stamp representing when the user last clicked the Start button.
var serverTime; // The time-stamp representing the current time. 
var duration; // The initial duration of the timer.
var timeRemaining; // The remaining duration of the timer.
var timer; // Updates and displays the timer. 
var gameState; // The current state of the timer. 
var pauseTime; // The time-stamp representing when the user last clicked the Pause button or refreshed while paused.
var restartTimer; // Flag used to display current timer info after a paused refresh without restarting the timer.
 
//
// initialize() loads initial values from db into global variables at body.onLoad();
// 
function initialize()
 {
// Get local copy of the current gameState from db.
  gameState = $.ajax({
      type: "POST",
      url: "getGameState.php",
      async: false
  }).responseText; 
// Get local copy of the instance's initial duration from db.
  duration = $.ajax({
      type: "POST",
      url: "getDuration.php",
      async: false
  }).responseText; 
// Perform gameState specific initialization.
  if (gameState == IN_PLAY)
  {
   restartTimer = true;
   start();
  }
  else if (gameState == PAUSED)
  {
// Get local copy of the latest pause time-stamp from db.
   pauseTime = $.ajax({
       type: "POST",
       url: "getPauseTime.php",
       async: false
   }).responseText;
// Set restartTimer to false before running start() to display the current time left without restarting the timer.
   restartTimer = false;
   start();
  }
  else // (gameState == NOT_STARTED)
  {
   restartTimer = true;
  }
 }

//
// Start simulation.
//
function start()
 {
// Update current time from server.
  serverTime = $.ajax({
      type: "POST",
      url: "getServerTime.php",
      async: false
  }).responseText;
// If the timer state is NOT_STARTED, create and sync a new startTime with the server.
  if (gameState == NOT_STARTED)
   {
// Use current time for initial local startTime value.
    startTime = serverTime;
// Format the startTime into milliseconds to create a JS Date().
    var startTimeJSFormat = new Date( (startTime * 1000) );		
// Use startTimeJSFormat to create an SQL formatted date.
    var startTimeSQLFormat = startTimeJSFormat.getFullYear()
        + '-' + (startTimeJSFormat.getMonth()+1)
        + '-' + startTimeJSFormat.getDate()
        + ' ' + startTimeJSFormat.getHours()
        + ':' + startTimeJSFormat.getMinutes()
        + ':' + startTimeJSFormat.getSeconds();
// Save the latest SQL formatted serverTime to the db as the new start time.
    $.ajax({
        type: "POST",
        url: "setStartTime.php",
	    data: {"startTime" : startTimeSQLFormat},
        async: false
    }).responseText;
// Set timeRemaining to be the initial duration of the simulation, retrieved from the db.
    timeRemaining = new Date(duration*1000);
// Update local gameState to reflect that the simulation has now started.
    gameState = IN_PLAY;
// Save updated gameState to db.   
    $.ajax({
       type: "POST",
       url: "setGameState.php",
	   data: {"gameState" : gameState},
       async: false
    }).responseText;
   }
// If the timer state is PAUSED, update the startTime to compensate for how much time has passed while paused.
  else if (gameState == PAUSED)
  {
// Get local copy of startTime from db.
   startTime = $.ajax({
       type: "POST",
       url: "getStartTime.php",
       async: false
   }).responseText;	
// Update local startTime to reflect the time elapsed since the simulation was paused.
   startTime = (parseInt(startTime) + (serverTime - pauseTime));
// Format the startTime into milliseconds to create a JS Date().
   var startTimeJSFormat = new Date((startTime * 1000));		
// Use startTimeJSFormat to create an SQL formatted date.
   var startTimeSQLFormat = startTimeJSFormat.getFullYear()
       + '-' + (startTimeJSFormat.getMonth()+1)
       + '-' + startTimeJSFormat.getDate()
       + ' ' + startTimeJSFormat.getHours()
       + ':' + startTimeJSFormat.getMinutes()
       + ':' + startTimeJSFormat.getSeconds();
// Save SQL formatted updated startTime to db.   
   $.ajax({
      type: "POST",
      url: "setStartTime.php",
	  data: {"startTime" : startTimeSQLFormat},
      async: false
   }).responseText;  
// Update the remaining play time to be in sync with the server.
   timeRemaining = new Date( (duration - (serverTime - startTime)) * 1000 );  
// Immediately update <div> time display.
   updateTimeRemaining();  
// If restartTimer is true, set the variables required to restart the timer.
   if (restartTimer)
    {	
// Clear local pauseTime now that it has been used 
     pauseTime = 0;
// Clear PauseTime date from db.   
     $.ajax({
        type: "POST",
        url: "setPauseTime.php",
	    data: {"pauseTime" : 0},
        async: false
     }).responseText;  
// Update local gameState.
     gameState = IN_PLAY;
// Save updated gameState to db.
     $.ajax({
        type: "POST",
        url: "setGameState.php",
        data: {"gameState" : gameState},
        async: false
     }).responseText;
    }
// Timer is still paused, but time remaining has been updated due to page refresh, so run pause() to capture new pauseTime.
   else 
    {
     pause();
    }
   }
// If the timer state is IN_PLAY, restart the timer.
  else if (gameState == IN_PLAY)
  {
// Load startTime from db.
   startTime = $.ajax({
       type: "POST",
       url: "getStartTime.php",
       async: false
   }).responseText;
// Update the remaining time to be in sync with the server.
   timeRemaining = new Date((duration - (serverTime - startTime)) * 1000);
// Update <div> time display immediately after calculating timeRemaining.
   updateTimeRemaining();
  }
// If the page has been refreshed while paused, display the current time remaining, but don't restart the timer yet.
  if (restartTimer)
  { 
// Set local timer to update the time remaining every second.
   timer = setInterval('updateTimeRemaining();',1000);
  }
  else
  {
// Reset restartTimer to true now that the pause data has been used to display the current time left after a paused page refresh.
   restartTimer = true;
  }
// ...Set another interval to periodically sync server time...
// ...do logic...
 }

//
// Update local countdown display showing remaining play time.
//
function updateTimeRemaining() 
 {
// Split timeRemaining into hours, minutes, seconds.
  var hoursRemaining = timeRemaining.getHours();
  var minutesRemaining = timeRemaining.getMinutes();
  var secondsRemaining = timeRemaining.getSeconds();
// Calculate the total elapsed time since the initial start of the timer.
  var totalSecondsPlayed = (serverTime - startTime);
// Update the "output" <div> to display (total elapsed time) and (time remaining).
  document.getElementById("output").innerHTML = "|: " + totalSecondsPlayed + "<br>" + 
  "H: " + hoursRemaining + "<br>M: " + minutesRemaining + "<br>S: " + secondsRemaining;
// Update the local timeRemaining and serverTime accordingly.
  timeRemaining.setSeconds(timeRemaining.getSeconds() -1);
  serverTime++;
 }

//
// pause() stops the timer and saves the current state of play.
//
function pause()
 {
// Stop the timer that updates the display time.
  clearInterval(timer);
// Generate and save the new pause time-stamp.
  pauseTime = $.ajax({
      type: "POST",
      url: "getServerTime.php",
      async: false
  }).responseText;   
// Update local gameState to reflect that the simulation is now paused.
  gameState = PAUSED;
// Update gameState in db.   
  $.ajax({
     type: "POST",
     url: "setGameState.php",
	 data: {"gameState" : gameState},
     async: false
  }).responseText;  
// Format the pauseTime into milliseconds to create a JS Date().
  var pauseTimeJSFormat = new Date( (pauseTime * 1000) );		
// Use pauseTimeJSFormat to create an SQL formatted date.
  var pauseTimeSQLFormat = pauseTimeJSFormat.getFullYear()
      + '-' + (pauseTimeJSFormat.getMonth()+1)
      + '-' + pauseTimeJSFormat.getDate()
      + ' ' + pauseTimeJSFormat.getHours()
      + ':' + pauseTimeJSFormat.getMinutes()
      + ':' + pauseTimeJSFormat.getSeconds();
// Save SQL formatted date to db.   
   $.ajax({
      type: "POST",
      url: "setPauseTime.php",
	  data: {"pauseTime" : pauseTimeSQLFormat},
      async: false
  }).responseText;
 }

//
// reset() updates all necessary variables to default values.
//
function reset()
 {
// Update local gameState.
  gameState = NOT_STARTED;
// Save updated gameState to db.   
   $.ajax({
      type: "POST",
      url: "setGameState.php",
	  data: {"gameState" : gameState},
      async: false
  }).responseText;
// Clear local pauseTime.
    pauseTime = 0; 
// Clear PauseTime date from db.   
   $.ajax({
      type: "POST",
      url: "setPauseTime.php",
	  data: {"pauseTime" : 0},
      async: false
  }).responseText;
}