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
  chrome.storage.sync.set({ countdownTimer });
  chrome.storage.sync.set({ intervalTimer });
  chrome.storage.sync.set({ distanceTime });
  chrome.storage.sync.set({ startFlag });
});
