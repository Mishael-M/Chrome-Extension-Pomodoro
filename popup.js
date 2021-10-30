/*
TODO
FIX BUGS, THE POPUP IS SENDING MESSAGES TO BACKGROUND WHEN CLICKED, DOESN'T START AND PAUSE PROPERLY -- Is it fixed?, I didn't do anything but it's working for now
Add sound -- Add editor
Add boolean flags -- Might be completed, maybe more bugs?
Textbox to edit time -- Change html page to options
Block websites -- Look at webRequets API
Add notes? - Note taking for each session?
Add motivational quotes that popup after a set amount of sessions completed
*/

// Add and subtract timer for button functionality
var addMinuteTimer;
var subtractMinuteTimer;

addTime.addEventListener('click', () => {
  addMinute();
});

// Adds 1 minute to timer
addTime.addEventListener('mousedown', () => {
  addMinuteTimer = setInterval(function () {
    addMinute();
  }, 200);
});

//Adds 1 minute to timer
addTime.addEventListener('mouseup', () => {
  clearInterval(addMinuteTimer);
});

function addMinute() {
  chrome.storage.local.get('timerType', (result) => {
    distanceTimeGlobal += 60000;
    updateTimer(distanceTimeGlobal);
    updateLocalStorageTime(result);
  });
}

// Subtract 1 minute to timer
subtractTime.addEventListener('mousedown', () => {
  subtractMinuteTimer = setInterval(function () {
    subtractMinute();
  }, 200);
});

// Stops subtract time
subtractTime.addEventListener('mouseup', () => {
  clearInterval(subtractMinuteTimer);
});

// Substracts 1 minute from timer
subtractTime.addEventListener('click', () => {
  subtractMinute();
});

function subtractMinute() {
  chrome.storage.local.get('timerType', (result) => {
    if ((distanceTimeGlobal -= 60000) >= 0) {
      updateTimer(distanceTimeGlobal);
      updateLocalStorageTime(result);
    } else {
      distanceTimeGlobal = 0;
      updateTimer(distanceTimeGlobal);
      updateLocalStorageTime(result);
    }
  });
}

// Function that sets break and countdown timer to the correct time
function updateLocalStorageTime(result) {
  if (result.timerType == 'break') {
    chrome.storage.local.set({ breakTimer: distanceTimeGlobal }, function () {
      console.log('Distance time is set to ' + distanceTimeGlobal);
    });
  } else {
    chrome.storage.local.set({ distanceTime: distanceTimeGlobal }, function () {
      console.log('Distance time is set to ' + distanceTimeGlobal);
    });
  }
}

// Starts the countdown timer
buttonStart.addEventListener('click', () => {
  sendMessageStart();
});

// Pauses the countdown timer
buttonPause.addEventListener('click', () => {
  chrome.storage.local.get('timerType', (result) => {
    if (result.timerType == 'break') {
      chrome.storage.local.set({ breakTimer: distanceTimeGlobal }, () => {
        sendMessagePause();
      });
    } else {
      chrome.storage.local.set({ distanceTime: distanceTimeGlobal }, () => {
        sendMessagePause();
      });
    }
  });
});

// Changes the timer from countdown to break and vice versa
buttonTimerType.addEventListener('click', () => {
  chrome.storage.local.get('timerType', (result) => {
    if (result.timerType == 'break') {
      chrome.storage.local.set({ timerType: 'pomodoro' }, () => {
        updateTimerType('pomodoro');
        updateTimerPopup();
      });
    } else {
      chrome.storage.local.set({ timerType: 'break' }, () => {
        updateTimerType('break');
        updateTimerPopup();
      });
    }
  });
});

// Resets timers to original values
buttonReset.addEventListener('click', () => {
  resetTimer();
});

// Reset timer
// TODO, Allow users to edit to reset timer value
function resetTimer() {
  chrome.storage.local.get('timerType', (result) => {
    if (result.timerType == 'break') {
      chrome.storage.local.set({ breakTimer: 1000 * 5 * 60 }, () => {
        updateTimerPopup();
      });
    } else {
      chrome.storage.local.set({ distanceTime: 1000 * 25 * 60 }, () => {
        updateTimerPopup();
      });
    }
  });
}

// Changes html file to Notes
buttonNotes.addEventListener('click', () => {
  location.href = '/popupNotes/popupNotes.html';
  chrome.action.setTitle({ title: 'Notes' });
  chrome.action.setPopup({ popup: '/popupNotes/popupNotes.html' });
});

// Send messages to background
function sendMessageStart() {
  if (!port) {
    port = chrome.runtime.connect({ name: 'Pomodoro' });
    console.log('SENDING MESSAGE TO BACKGROUND START');
    port.postMessage({ cmd: 'start' });
  }
  console.log('SENDING MESSAGE TO BACKGROUND START');
  port.postMessage({ cmd: 'start' });
}
function sendMessagePause() {
  if (!port) {
    port = chrome.runtime.connect({ name: 'Pomodoro' });
  }
  console.log('SENDING MESSAGE TO BACKGROUND PAUSE');
  port.postMessage({ cmd: 'pause' });
}
function sendMessageOpen() {
  port.postMessage({ cmd: 'open' });
}

// Create connection
var port = chrome.runtime.connect({ name: 'Pomodoro' });

port.onMessage.addListener(function (msg) {
  if (msg.response === 'update') {
    console.log('RESPONSED RECEIVED');
    chrome.storage.local.get('timerType', (result) => {
      if (result.timerType == 'break') {
        chrome.storage.local.get('breakTimer', (result) => {
          console.log(
            'The saved distance time in extension is ' + result.breakTimer
          );
          updateTimer(result.breakTimer);
        });
      } else {
        chrome.storage.local.get('distanceTime', (result) => {
          console.log(
            'The saved distance time in extension is ' + result.distanceTime
          );
          updateTimer(result.distanceTime);
        });
      }
    });
  } else if (msg.response === 'expired') {
    playAudio();
    chrome.storage.local.get('timerType', (result) => {
      updateTimerType(result.timerType);
      updateTimerPopup();
    });
  }
});

// Global variables for timer update
var hours;
var minutes;
var seconds;

// Placeholder when popup is clicked
function printCountdownTimerPlaceholder() {
  chrome.storage.local.get('startFlag', function (result) {
    console.log('START FLAG IS ' + result.startFlag);
    if (result.startFlag == true) {
      chrome.storage.local.get('timerType', (result) => {
        console.log('TIMER TYPE IS ' + result.timerType);
        updateTimerType(result.timerType);
        startTimePopup();
      });
    } else {
      chrome.storage.local.get('distanceTime', function (result) {
        distanceTimeGlobal = result.distanceTime;
        chrome.storage.local.get('timerType', (result) => {
          console.log('TIMER TYPE IS ' + result.timerType);
          updateTimerType(result.timerType);
          updateTimerPopup();
        });
      });
    }
  });
}
printCountdownTimerPlaceholder();

// Updates global variables hours, minutes, seconds
function updateTimer(distanceTime) {
  // Time calculations for days, hours, minutes and seconds
  hours = Math.floor((distanceTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  minutes = Math.floor((distanceTime % (1000 * 60 * 60)) / (1000 * 60));
  seconds = Math.floor(((distanceTime + 100) % (1000 * 60)) / 1000);

  updateHTMLTime();
}

// Update Timer HTML
function updateHTMLTime() {
  document.getElementById('countdownTimer').innerHTML =
    hours + 'h ' + minutes + 'm ' + seconds + 's ';
  chrome.action.setTitle({
    title: hours + 'h ' + minutes + 'm ' + seconds + 's ',
  });
}

// Starts timer in popup
function startTimePopup() {
  chrome.storage.local.get('timerType', (result) => {
    if (result.timerType == 'break') {
      updateTimerType(result.timerType);
      chrome.storage.local.get('breakTimer', (result) => {
        distanceTimeGlobal = result.breakTimer;
        updateTimer(distanceTimeGlobal);
        sendMessagePause();
        sendMessageStart();
      });
    } else {
      updateTimerType(result.timerType);
      chrome.storage.local.get('distanceTime', function (result) {
        distanceTimeGlobal = result.distanceTime;
        updateTimer(distanceTimeGlobal);
        sendMessagePause();
        sendMessageStart();
      });
    }
  });
}

function updateTimerPopup() {
  chrome.storage.local.get('timerType', (result) => {
    if (result.timerType == 'break') {
      chrome.storage.local.get('breakTimer', (result) => {
        distanceTimeGlobal = result.breakTimer;
        updateTimer(distanceTimeGlobal);
      });
    } else {
      chrome.storage.local.get('distanceTime', function (result) {
        distanceTimeGlobal = result.distanceTime;
        updateTimer(distanceTimeGlobal);
      });
    }
  });
}

function updateTimerType(result) {
  if (result == 'pomodoro') {
    document.getElementById('timerType').innerHTML = 'Pomodoro Timer';
  } else {
    document.getElementById('timerType').innerHTML = 'Break Timer';
  }
}

// Play sound
function chooseAudio() {
  var soundURL = [
    'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
    'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
    'https://actions.google.com/sounds/v1/alarms/radiation_meter.ogg',
    'https://actions.google.com/sounds/v1/cartoon/concussive_guitar_hit.ogg',
    'https://actions.google.com/sounds/v1/household/window_close_series.ogg',
  ];
}
function playAudio() {
  var audioElement = new Audio(
    'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg'
  );

  audioElement.play();
}
