/*
TODO
Remember to use Chrome Storage API -- FIX THIS, ENSURE IT WORKS, USE MESSAGES?
Add sound
Add boolean flags
Textbox to edit time
Block websites
Add notes? - Note taking for each session?
*/

// Global variables found for popup
var distanceTimeGlobal;
var countdownTimer;
var hours;
var minutes;
var seconds;
var intervalTimer;

// Output the result in an element with id="countdownTimer"
function printCountdownTimer() {
  document.getElementById('countdownTimer').innerHTML =
    hours + 'h ' + minutes + 'm ' + seconds + 's ';
}

// Placeholder when popup is clicked
function printCountdownTimerPlaceholder() {
  chrome.storage.sync.get('startFlag', function (result) {
    if (result.startFlag == true) {
      countdownDriver();
    } else {
      chrome.storage.sync.get('distanceTime', function (result) {
        distanceTimeGlobal = result.distanceTime;
        updateTimer(distanceTimeGlobal);
        document.getElementById('countdownTimer').innerHTML =
          hours + 'h ' + minutes + 'm ' + seconds + 's ';
      });
    }
  });
}
printCountdownTimerPlaceholder();

// Countdown function driver
function countdownDriver() {
  chrome.storage.sync.get('distanceTime', (result) => {
    distanceTimeGlobal = result.distanceTime;
    console.log('The saved distance time outside is ' + distanceTimeGlobal);
    if (distanceTimeGlobal >= 0) {
      countdownTimer = new Date().getTime() + distanceTimeGlobal;
      console.log('Countdown timer' + countdownTimer);
    }
    countdownStart(countdownTimer);
  });
}

// Starts the countdown function
function countdownStart(countdown) {
  intervalTimer = setInterval(() => {
    // Find distanceTime between now and countdown date
    var timeNow = new Date().getTime();

    distanceTimeGlobal = countdown - timeNow;

    console.log('the time is ' + distanceTimeGlobal);

    // Time calculations for days, hours, minutes and seconds
    updateTimer(distanceTimeGlobal);

    // Output the result in an element with id="countdownTimer"
    printCountdownTimer();

    // Update distance time in local storage
    chrome.storage.sync.set({ distanceTime: distanceTimeGlobal }, function () {
      console.log('Distance time is set to ' + distanceTimeGlobal);
    });

    // If the count down is over, write some text
    if (distanceTimeGlobal < 0) {
      clearInterval(intervalTimer);
      document.getElementById('countdownTimer').innerHTML = 'EXPIRED';
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

// Adds 1 minute to timer
addTime.addEventListener('click', () => {
  distanceTimeGlobal += 60000;
  updateTimer(distanceTimeGlobal);
  document.getElementById('countdownTimer').innerHTML =
    hours + 'h ' + minutes + 'm ' + seconds + 's ';
  chrome.storage.sync.set({ distanceTime: distanceTimeGlobal }, function () {
    console.log('Distance time is set to ' + distanceTimeGlobal);
  });
});

// Substracts 1 minute from timer
subtractTime.addEventListener('click', () => {
  if ((distanceTimeGlobal -= 60000) >= 0) {
    updateTimer(distanceTimeGlobal);
    document.getElementById('countdownTimer').innerHTML =
      hours + 'h ' + minutes + 'm ' + seconds + 's ';
    chrome.storage.sync.set({ distanceTime: distanceTimeGlobal }, function () {
      console.log('Distance time is set to ' + distanceTimeGlobal);
    });
  }
});

// Starts the countdown timer
buttonStart.addEventListener('click', () => {
  chrome.storage.sync.set({ startFlag: true }, function () {
    countdownDriver();
  });
});

// Pauses the countdown timer
buttonPause.addEventListener('click', () => {
  chrome.storage.sync.set({ startFlag: false }, function () {
    chrome.storage.sync.set({ distanceTime: distanceTimeGlobal }, function () {
      console.log('Distance time is set to ' + distanceTimeGlobal);
    });
  });

  clearInterval(intervalTimer);
});
