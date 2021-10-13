// background.js

chrome.runtime.onInstalled.addListener(() => {
  // Global variables that save the state of the timer
  var countdownTimer;
  var intervalTimer;
  // Starts at 25 minutes
  var distanceTime = 1000 * 25 * 60;

  // Bool flag
  var startFlag = false;

  // Sets background state of values
  chrome.storage.local.set({ countdownTimer });
  chrome.storage.local.set({ intervalTimer });
  chrome.storage.local.set({ distanceTime });
  chrome.storage.local.set({ startFlag });
});

// Listens for connection
chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name === 'Pomodoro');
  port.onMessage.addListener(function (msg) {
    // Starts the timer as the start button was pressed
    if (msg.cmd === 'start') {
      console.log('STARTING SOON');
      if (++timesStarted > 1) {
        console.log('Too many times started');
        timesStarted = 1;
      } else {
        if (timesPaused == 1) {
          --timesPaused;
        }
        console.log('Time started = ' + timesStarted);
        chrome.storage.local.set({ startFlag: true }, function () {
          countdownDriver(port);
        });
      }
      // Pauses the timer as the pause button was pressed
    } else if (msg.cmd === 'pause') {
      console.log('PAUSED!');
      if (++timesPaused > 1) {
        console.log('TOO MANY TIMES PAUSED');
        timesPaused = 1;
      } else {
        if (timesStarted == 1) {
          --timesStarted;
        }
        console.log('Time paused = ' + timesPaused);
        chrome.storage.local.set({ startFlag: false }, function () {
          chrome.storage.local.set(
            { distanceTime: distanceTimeGlobal },
            function () {
              console.log('Distance time is set to ' + distanceTimeGlobal);
            }
          );
          clearInterval(intervalTimer);
        });
      }
    }
  });
});

/*
Start of application logic for pomodoro
*/
// Global variables found for popup
var distanceTimeGlobal;
var countdownTimer;
var hours;
var minutes;
var seconds;
var intervalTimer;
var timesPaused = 0,
  timesStarted = 0;

// Output the result in an element with id="countdownTimer"
function printCountdownTimer() {
  document.getElementById('countdownTimer').innerHTML =
    hours + 'h ' + minutes + 'm ' + seconds + 's ';
}

// Countdown function driver
function countdownDriver(port) {
  chrome.storage.local.get('distanceTime', (result) => {
    distanceTimeGlobal = result.distanceTime;
    if (distanceTimeGlobal >= 0) {
      countdownTimer = new Date().getTime() + distanceTimeGlobal;
      console.log('Countdown timer' + countdownTimer);
    }
    countdownStart(countdownTimer, port);
  });
}

// Starts the countdown function
function countdownStart(countdown, port) {
  intervalTimer = setInterval(() => {
    // Find distanceTime between now and countdown date
    var timeNow = new Date().getTime();

    distanceTimeGlobal = countdown - timeNow;

    console.log('the time is ' + distanceTimeGlobal);

    // Time calculations for days, hours, minutes and seconds
    updateTimer(distanceTimeGlobal);

    // Update distance time in local storage
    chrome.storage.local.set({ distanceTime: distanceTimeGlobal }, function () {
      console.log('Distance time is set to ' + distanceTimeGlobal);
    });

    // Output the result in an element with id="countdownTimer"
    port.postMessage({ response: 'update' });

    // If the count down is over, write some text
    if (distanceTimeGlobal < 0) {
      clearInterval(intervalTimer);
      port.postMessage({ response: 'expired' });
    }
  }, 500);
}

// Updates hours, minutes, seconds
function updateTimer(distanceTime) {
  // Time calculations for days, hours, minutes and seconds
  hours = Math.floor((distanceTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  minutes = Math.floor((distanceTime % (1000 * 60 * 60)) / (1000 * 60));
  seconds = Math.floor((distanceTime % (1000 * 60)) / 1000);
}
