/*
TODO
FIX BUGS, THE POPUP IS SENDING MESSAGES TO BACKGROUND WHEN CLICKED, DOESN'T START AND PAUSE PROPERLY
PORT DISCONNECT ON BREAK TIMER
Remember to use Chrome Storage API -- FIX THIS, ENSURE IT WORKS, USE MESSAGES?
Add sound
Add boolean flags
Textbox to edit time
Block websites
Add notes? - Note taking for each session?
*/

// Adds 1 minute to timer
addTime.addEventListener('click', () => {
  distanceTimeGlobal += 60000;
  updateTimer(distanceTimeGlobal);
  document.getElementById('countdownTimer').innerHTML =
    hours + 'h ' + minutes + 'm ' + seconds + 's ';
  chrome.storage.local.set({ distanceTime: distanceTimeGlobal }, function () {
    console.log('Distance time is set to ' + distanceTimeGlobal);
  });
});

// Substracts 1 minute from timer
subtractTime.addEventListener('click', () => {
  if ((distanceTimeGlobal -= 60000) >= 0) {
    updateTimer(distanceTimeGlobal);
    document.getElementById('countdownTimer').innerHTML =
      hours + 'h ' + minutes + 'm ' + seconds + 's ';
    chrome.storage.local.set({ distanceTime: distanceTimeGlobal }, function () {
      console.log('Distance time is set to ' + distanceTimeGlobal);
    });
  } else {
    distanceTimeGlobal = 0;
    chrome.storage.local.set({ distanceTime: distanceTimeGlobal }, function () {
      console.log('Distance time is set to ' + distanceTimeGlobal);
    });
  }
});

// Starts the countdown timer
buttonStart.addEventListener('click', () => {
  console.log('PRESSSING START');
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

// Send messages to background
function sendMessageStart() {
  console.log('SENDING MESSAGE TO BACKGROUND START');
  port.postMessage({ cmd: 'start' });
}
function sendMessagePause() {
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
          updateHTMLTime();
        });
      } else {
        chrome.storage.local.get('distanceTime', (result) => {
          console.log(
            'The saved distance time in extension is ' + result.distanceTime
          );
          updateTimer(result.distanceTime);
          updateHTMLTime();
        });
      }
    });
  } else if (msg.response === 'expired') {
    playAudio();
    document.getElementById('countdownTimer').innerHTML = 'expired';
    chrome.storage.local.get('timerType', (result) => {
      if (result.timerType == 'break') {
        document.getElementById('timerType').innerHTML = 'Break Timer';
      }
    });
  }
});

// Global variables for timer update
var hours;
var minutes;
var seconds;

// Update Timer HTML
function updateHTMLTime() {
  document.getElementById('countdownTimer').innerHTML =
    hours + 'h ' + minutes + 'm ' + seconds + 's ';
}

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

// Updates hours, minutes, seconds
function updateTimer(distanceTime) {
  // Time calculations for days, hours, minutes and seconds
  hours = Math.floor((distanceTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  minutes = Math.floor((distanceTime % (1000 * 60 * 60)) / (1000 * 60));
  seconds = Math.floor((distanceTime % (1000 * 60)) / 1000);
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

// Starts timer in popup
function startTimePopup() {
  chrome.storage.local.get('timerType', (result) => {
    if (result.timerType == 'break') {
      updateTimerType(result.timerType);
      chrome.storage.local.get('breakTimer', (result) => {
        distanceTimeGlobal = result.breakTimer;
        updateTimer(distanceTimeGlobal);
        updateHTMLTime();
      });
    } else {
      updateTimerType(result.timerType);
      chrome.storage.local.get('distanceTime', function (result) {
        distanceTimeGlobal = result.distanceTime;
        updateTimer(distanceTimeGlobal);
        updateHTMLTime();
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
        updateHTMLTime();
      });
    } else {
      chrome.storage.local.get('distanceTime', function (result) {
        distanceTimeGlobal = result.distanceTime;
        updateTimer(distanceTimeGlobal);
        updateHTMLTime();
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
