var NOT_STARTED = 0;
var STARTED = 1;
var PAUSED = 2;
var FINISHED = 3;

var startTime; // The time-stamp representing when the user last clicked the Start button.
var serverTime; // The time-stamp representing the current time. 
var duration; // The initial duration of the timer.
var timeRemaining; // The remaining duration of the timer.
var timer; // Updates and displays the timeRemaining.
var timerState; // The current state of the timer. 
var pauseTime; // The time-stamp representing when the user last clicked the Pause button or refreshed while paused.
var startTimer; // Flag used with pause to display current timer info to a <div> after a page refresh while paused (without restarting the timer).
var today; // The time-stamp representing current date at 00h 00m 00s. Used to test if timer has completed. 

//
// initialize() loads initial values from db into global variables at body.onLoad();
// 
function initialize() {
  // Get local copy of the current timerState from db.
  timerState = $.ajax({
    type: "POST",
    url: "getTimerState.php",
    async: false
  }).responseText;
  // Get local copy of the instance's initial duration from db.
  duration = $.ajax({
    type: "POST",
    url: "getDuration.php",
    async: false
  }).responseText;

  // Perform timerState specific initialization.
  if (timerState == STARTED) {
    startTimer = true;
    start();
  } else if (timerState == PAUSED) {
    // Get local copy of the latest pause time-stamp from db.
    pauseTime = $.ajax({
      type: "POST",
      url: "getPauseTime.php",
      async: false
    }).responseText;
    // Set startTimer to false before running start() to display the current time left without restarting the timer.
    startTimer = false;
    start();
  } else if (timerState == NOT_STARTED) {
    startTimer = true;
  } else if (timerState == FINISHED) {
    // Display "Finished" in timer output <div>.
    document.getElementById("output").innerHTML = " Finished ";
    // *remove ability for user to click start, pause.
    // ...
  }
}

//
// start() begins timer.
//
function start() {
  // Use current time for initial local startTime value.
  startTime = serverTime;
  // Format the startTime into milliseconds to create a JS Date().
  var startTimeJSFormat = new Date((startTime * 1000));
  // Use startTimeJSFormat to create an SQL formatted date.
  var startTimeSQLFormat = startTimeJSFormat.getFullYear() + '-' + (startTimeJSFormat.getMonth() + 1) + '-' +
    startTimeJSFormat.getDate() + ' ' + startTimeJSFormat.getHours() + ':' + startTimeJSFormat.getMinutes() +
    ':' + startTimeJSFormat.getSeconds();
  // Save the latest SQL formatted serverTime to the db as the new start time.
  $.ajax({
    type: "POST",
    url: "setStartTime.php",
    data: {
      "startTime": startTimeSQLFormat
    },
    async: false
  }).responseText;
  // Set timeRemaining to be the initial duration of the simulation, retrieved from the db.
  timeRemaining = new Date(duration * 1000);
  // Update local timerState to reflect that the simulation has now started.
  timerState = STARTED;
  // Save updated timerState to db.   
  $.ajax({
    type: "POST",
    url: "setTimerState.php",
    data: {
      "timerState": timerState
    },
    async: false
  }).responseText;
}

//
// unpause() updates the startTime to compensate for how much time has passed while paused.
//
function unpause() {
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
  var startTimeSQLFormat = startTimeJSFormat.getFullYear() + '-' + (startTimeJSFormat.getMonth() + 1) + '-' +
    startTimeJSFormat.getDate() + ' ' + startTimeJSFormat.getHours() + ':' + startTimeJSFormat.getMinutes() +
    ':' + startTimeJSFormat.getSeconds();
  // Save SQL formatted updated startTime to db.   
  $.ajax({
    type: "POST",
    url: "setStartTime.php",
    data: {
      "startTime": startTimeSQLFormat
    },
    async: false
  }).responseText;

  // Update the remaining play time to be in sync with the server.
  timeRemaining = new Date((duration - (serverTime - startTime)) * 1000);
  // Immediately update <div> time display.
  updateTimeRemaining();

  // If startTimer is true, set the variables required to start the timer again.
  if (startTimer) {
    // Clear local pauseTime now that it's been used to adjust timeRemaining.
    pauseTime = 0;
    // Clear PauseTime date from db.   
    $.ajax({
      type: "POST",
      url: "setPauseTime.php",
      data: {
        "pauseTime": 0
      },
      async: false
    }).responseText;
    // Update local timerState.
    timerState = STARTED;
    // Save updated timerState to db.
    $.ajax({
      type: "POST",
      url: "setTimerState.php",
      data: {
        "timerState": timerState
      },
      async: false
    }).responseText;
  }
  // Otherwise timer is still paused. timeRemaining needed to be displayed due to page refresh. pause() again to capture a new pauseTime.
  else {
    pause();
  }
}

//
// resume() restarts the timer.
//
function resume() {
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


//
// startButton() will initiate timer.
//
function startButton() {
  // Update current time from server.
  serverTime = $.ajax({
    type: "POST",
    url: "getServerTime.php",
    async: false
  }).responseText;

  // loads the correct timer information based on the current timerState.
  if (timerState == NOT_STARTED) {
    start();
  } else if (timerState == PAUSED) {
    unpause();
  } else if (timerState == STARTED) {
    resume();
  }

  // If the page has been refreshed while paused, display the current timeRemaining, but don't start the timer yet.
  if (startTimer) {
    // Set local timer to update the timeRemaining every second.
    timer = setInterval('updateTimeRemaining();', 1000);
  } else {
    // Reset startTimer to true now that the pause data has been used to display the timeRemaining after a page refresh.
    startTimer = true;
  }

  // *set another timer to periodically sync server time asynchronously...
  // ...

  // Update the today at midnight time-stamp.
  today = new Date();
  today.setHours(0, 0, 0, 0);
}

//
// updateTimeRemaining() updates local timeRemaining & the output <div> accordingly.
//
function updateTimeRemaining() {
  // Calculate the milliseconds remaining by eliminating the YYYY-MM-DD portion of the timeRemaining time-stamp.
  var tRTotalms = (timeRemaining.getTime() - today);
  // Split timeRemaining into hours, minutes, seconds.
  var hoursRemaining = timeRemaining.getHours();
  var minutesRemaining = timeRemaining.getMinutes();
  var secondsRemaining = timeRemaining.getSeconds();
  // Calculate the total elapsed time since the initial start of the timer.
  var totalSecondsPlayed = (serverTime - startTime);

  // Update the "output" <div> to display (total elapsed time) and (time remaining).
  document.getElementById("output").innerHTML = "|: " + totalSecondsPlayed + "<br>" +
    "H: " + hoursRemaining + "<br>M: " + minutesRemaining + "<br>S: " + secondsRemaining +
    "<br>tRTotalms: " + tRTotalms;

  // Update the local timeRemaining.
  timeRemaining.setSeconds(timeRemaining.getSeconds() - 1);
  // Update the local serverTime.
  serverTime++;

  // Check to see if timer is finished.
  if (tRTotalms <= 0) {
    // Stop the timer that updates the display time.
    clearInterval(timer);
    // Update local timerState.
    timerState = FINISHED;
    // Save updated timerState to db.   
    $.ajax({
      type: "POST",
      url: "setTimerState.php",
      data: {
        "timerState": timerState
      },
      async: false
    }).responseText;
    // Display "Finished" in timer output <div>
    document.getElementById("output").innerHTML = " Finished ";
  }
}

//
// pause() stops the timer and saves the current state of play.
//
function pause() {
  // Stop the timer that updates the display time.
  clearInterval(timer);
  // Generate and save the new pause time-stamp.
  pauseTime = $.ajax({
    type: "POST",
    url: "getServerTime.php",
    async: false
  }).responseText;
  // Update local timerState to reflect that the simulation is now paused.
  timerState = PAUSED;
  // Update timerState in db.   
  $.ajax({
    type: "POST",
    url: "setTimerState.php",
    data: {
      "timerState": timerState
    },
    async: false
  }).responseText;

  // Format the pauseTime into milliseconds to create a JS Date().
  var pauseTimeJSFormat = new Date((pauseTime * 1000));
  // Use pauseTimeJSFormat to create an SQL formatted date.
  var pauseTimeSQLFormat = pauseTimeJSFormat.getFullYear() + '-' + (pauseTimeJSFormat.getMonth() + 1) + '-' +
    pauseTimeJSFormat.getDate() + ' ' + pauseTimeJSFormat.getHours() + ':' + pauseTimeJSFormat.getMinutes() +
    ':' + pauseTimeJSFormat.getSeconds();
  // Save SQL formatted date to db.   
  $.ajax({
    type: "POST",
    url: "setPauseTime.php",
    data: {
      "pauseTime": pauseTimeSQLFormat
    },
    async: false
  }).responseText;
}

//
// reset() updates all necessary variables to default values.
//
function reset() {
  // Update local timerState.
  timerState = NOT_STARTED;
  // Save updated timerState to db.   
  $.ajax({
    type: "POST",
    url: "setTimerState.php",
    data: {
      "timerState": timerState
    },
    async: false
  }).responseText;
  // Clear local pauseTime.
  pauseTime = 0;
  // Clear PauseTime date from db.   
  $.ajax({
    type: "POST",
    url: "setPauseTime.php",
    data: {
      "pauseTime": 0
    },
    async: false
  }).responseText;
}