/*
TODO
Remember to use Chrome Storage API
Add sound
Add boolean flags
Textbox to edit time
Block websites
Add notes?
*/

// Global variables that save the state of the timer
var countdownTimer = new Date().getTime() + distanceTime;
var intervalTimer;
// Starts at 25 minutes
var distanceTime = 1000 * 25 * 60;

// Time calculations for days, hours, minutes and seconds
var hours = Math.floor(
  (distanceTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
);
var minutes = Math.floor((distanceTime % (1000 * 60 * 60)) / (1000 * 60));
var seconds = Math.floor((distanceTime % (1000 * 60)) / 1000);

// Output the result in an element with id="countdownTimer"
document.getElementById('countdownTimer').innerHTML =
  hours + 'h ' + minutes + 'm ' + seconds + 's ';

function countdownStart() {
  intervalTimer = setInterval(() => {
    // Find distanceTime between now and countdown date
    var timeNow = new Date().getTime();

    distanceTime = countdownTimer - timeNow;

    // Time calculations for days, hours, minutes and seconds
    updateTimer();

    // Output the result in an element with id="countdownTimer"
    document.getElementById('countdownTimer').innerHTML =
      hours + 'h ' + minutes + 'm ' + seconds + 's ';

    // If the count down is over, write some text
    if (distanceTime < 0) {
      clearInterval(intervalTimer);
      document.getElementById('countdownTimer').innerHTML = 'EXPIRED';
    }
  }, 50);
}

// Updates hours, minutes, seconds
function updateTimer() {
  // Time calculations for days, hours, minutes and seconds
  hours = Math.floor((distanceTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  minutes = Math.floor((distanceTime % (1000 * 60 * 60)) / (1000 * 60));
  seconds = Math.floor((distanceTime % (1000 * 60)) / 1000);
}

// Adds 1 minute to timer
addTime.addEventListener('click', () => {
  distanceTime += 60000;
  updateTimer();
  document.getElementById('countdownTimer').innerHTML =
    hours + 'h ' + minutes + 'm ' + seconds + 's ';
});

// Substracts 1 minute from timer
subtractTime.addEventListener('click', () => {
  if ((distanceTime -= 60000) >= 0) {
    updateTimer();
    document.getElementById('countdownTimer').innerHTML =
      hours + 'h ' + minutes + 'm ' + seconds + 's ';
  }
});

// Starts the countdown timer
buttonStart.addEventListener('click', () => {
  if (distanceTime >= 0) {
    countdownTimer = new Date().getTime() + distanceTime;
  }
  countdownStart();
});

// Pauses the countdown timer
buttonPause.addEventListener('click', () => {
  clearInterval(intervalTimer);
});
