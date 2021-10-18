// background.js

chrome.runtime.onInstalled.addListener(() => {
  // Global variables that save the state of the timer
  var countdownTimer;
  // Countdown starts at 25 minutes
  var distanceTime = 1000 * 25 * 60;

  // Break Timer starts at 5 minutes
  var breakTimer = 1000 * 5 * 60;

  // Bool flag
  var startFlag = false;

  // Timer Type
  var timerType = 'pomodoro';

  // Sets background state of values
  chrome.storage.local.set({ countdownTimer });
  chrome.storage.local.set({ distanceTime: distanceTime });
  chrome.storage.local.set({ startFlag: startFlag });
  chrome.storage.local.set({ timerType: timerType });
  chrome.storage.local.set({ breakTimer: breakTimer });
});

// Keep alive from stackoverflow
let lifeline;

keepAlive();

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
        // `function` will become `func` in Chrome 93+
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

// Listens for connection
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
  port.onMessage.addListener(function (msg) {
    globalPort = port;
    // Starts the timer as the start button was pressed
    console.log('MESSAGE FROM POPUP IS ' + msg.cmd);
    if (msg.cmd === 'start') {
      console.log('STARTING SOON');
      if (++timesStarted > 1) {
        console.log('Too many times started');
        timesStarted = 0;
      } else {
        if (timesPaused == 1) {
          --timesPaused;
        }
        console.log('Time started = ' + timesStarted);
        chrome.storage.local.set({ startFlag: true }, () => {
          chrome.storage.local.get('timerType', (result) => {
            if (result.timerType == 'break') {
              chrome.storage.local.get('breakTimer', (result) => {
                globalTimerType = result.timerType;
                distanceTimeGlobal = result.breakTimer;
                countdownDriver(distanceTimeGlobal);
              });
            } else {
              chrome.storage.local.get('distanceTime', (result) => {
                distanceTimeGlobal = result.distanceTime;
                countdownDriver(distanceTimeGlobal);
              });
            }
          });
        });
      }
      // Pauses the timer as the pause button was pressed
    } else if (msg.cmd === 'pause') {
      console.log('PAUSED!');
      clearInterval(intervalTimer);
      if (++timesPaused > 1) {
        console.log('TOO MANY TIMES PAUSED');
        timesPaused = 1;
        if (timesStarted == 1) {
          --timesStarted;
        }
      } else {
        if (timesStarted >= 1) {
          timesStarted = 0;
        }
        console.log('Time paused = ' + timesPaused);
        chrome.storage.local.set({ startFlag: false }, () => {
          chrome.storage.local.get('timerType', (result) => {
            if (result.timerType == 'break') {
              chrome.storage.local.set(
                { breakTimer: distanceTimeGlobal },
                () => {
                  console.log('Distance time is set to ' + distanceTimeGlobal);
                }
              );
            } else {
              chrome.storage.local.set(
                { distanceTime: distanceTimeGlobal },
                () => {
                  console.log('Distance time is set to ' + distanceTimeGlobal);
                }
              );
            }
            clearInterval(intervalTimer);
          });
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
var hours, minutes, seconds;
var globalPort;
var timesPaused = 0,
  timesStarted = 0;
var intervalTimer;

// Countdown function driver
function countdownDriver(distanceTimeGlobal) {
  if (distanceTimeGlobal >= 0) {
    countdownTimer = new Date().getTime() + distanceTimeGlobal;
    console.log('Countdown timer' + countdownTimer);
    countdownStart(countdownTimer);
  }
}

// Starts the countdown function
function countdownStart(countdown) {
  intervalTimer = setInterval(function () {
    // Service worker run indefinitely
    // Find distanceTime between now and countdown date
    var timeNow = new Date().getTime();

    var today = new Date();

    var time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    console.log('CURRNE TIME IS ' + time);

    distanceTimeGlobal = countdown - timeNow;

    console.log('the time is ' + distanceTimeGlobal);

    updateTimer(distanceTimeGlobal);

    // Check timer type
    chrome.storage.local.get('timerType', (result) => {
      var globalTimerType = result.timerType;
      if (globalTimerType == 'break') {
        // Update break distance time in local storage
        chrome.storage.local.set({ breakTimer: distanceTimeGlobal }, () => {
          console.log('Distance time is set to ' + distanceTimeGlobal);

          chrome.action.setTitle({
            title: hours + 'h ' + minutes + 'm ' + seconds + 's ',
          });
          // Output the result in an element with id="countdownTimer"
          try {
            sendUpdate();
          } catch (e) {
            console.log('ERROR DISCONNECT ' + e);
            console.log('ERROR CAUGHT< TIME IS ' + distanceTimeGlobal);
            return;
          } finally {
            // If the count down is over, write some text
            if (distanceTimeGlobal < 0) {
              clearInterval(intervalTimer);
              chrome.storage.local.set({ startFlag: false }, () => {
                distanceTimeGlobal = 0;
                chrome.storage.local.set(
                  { breakTimer: distanceTimeGlobal },
                  () => {
                    timesStarted = 0;
                    timesPaused = 0;
                    console.log(
                      'Distance time is set to ' + distanceTimeGlobal
                    );
                    chrome.storage.local.set({ timerType: 'pomodoro' }, () => {
                      console.log('Timer set to pomodoro');
                      globalPort.postMessage({ response: 'expired' });
                    });
                  }
                );
              });
            }
          }
        });
      } else {
        // Update pomodoro distance time in local storage
        chrome.storage.local.set({ distanceTime: distanceTimeGlobal }, () => {
          console.log('Distance time is set to ' + distanceTimeGlobal);

          chrome.action.setTitle({
            title: hours + 'h ' + minutes + 'm ' + seconds + 's ',
          });
          // Output the result in an element with id="countdownTimer"
          try {
            sendUpdate();
          } catch (e) {
            console.log('ERROR DISCONNECT ' + e);
            console.log('ERROR CAUGHT< TIME IS ' + distanceTimeGlobal);
            return;
          } finally {
            // If the count down is over, write some text
            if (distanceTimeGlobal < 0) {
              clearInterval(intervalTimer);
              chrome.storage.local.set({ startFlag: false }, () => {
                distanceTimeGlobal = 0;
                chrome.storage.local.set(
                  { distanceTime: distanceTimeGlobal },
                  () => {
                    timesStarted = 0;
                    timesPaused = 0;
                    console.log(
                      'Distance time is set to ' + distanceTimeGlobal
                    );
                    chrome.storage.local.set({ timerType: 'break' }, () => {
                      console.log('Timer set to break');
                      globalPort.postMessage({ response: 'expired' });
                    });
                  }
                );
              });
            }
          }
        });
      }
    });
  }, 500);
}

function sendUpdate() {
  globalPort.postMessage({ response: 'update' });
}

// Updates hours, minutes, seconds
function updateTimer(distanceTime) {
  // Time calculations for days, hours, minutes and seconds
  hours = Math.floor((distanceTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  minutes = Math.floor((distanceTime % (1000 * 60 * 60)) / (1000 * 60));
  seconds = Math.floor((distanceTime % (1000 * 60)) / 1000);
}

/*
Break Timer
*/
