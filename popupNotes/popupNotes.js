/**
 * TODO: Save list in localstorage
 */

buttonTimer.addEventListener('click', () => {
  location.href = '../popup.html';
  chrome.action.setPopup({ popup: '../popup.html' });
});

/**
 * Copied from W3Schools
 */
// Add a "checked" symbol when clicking on a list item
addButton.addEventListener('click', () => {
  var li = document.createElement('li');
  var inputValue = document.getElementById('taskInput').value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert('You must write something!');
  } else {
    document.getElementById('taskList').appendChild(li);
  }
  document.getElementById('taskInput').value = '';

  // Create Close button
  var span = document.createElement('SPAN');
  var txt = document.createTextNode('\u00D7');
  span.className = 'close';
  span.appendChild(txt);
  li.appendChild(span);

  // Create Edit button
  var edit = document.createElement('BUTTON');
  edit.innerText = 'Edit';
  edit.className = 'edit';
  li.appendChild(edit);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      var div = this.parentElement;
      div.style.display = 'none';
    };
  }

  for (let index = 0; index < editButton.length; index++) {
    editButton[index].onclick = () => {
      let editNew = prompt('Enter the new task: ', 'Enter Task Here...');
      t.nodeValue = editNew;
    };
  }
});

// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName('LI');
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement('SPAN');
  var txt = document.createTextNode('\u00D7');
  span.className = 'close';
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName('close');
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function () {
    var div = this.parentElement;
    div.style.display = 'none';
  };
}

// Click on an edit button to edit current list item
var editButton = document.getElementsByClassName('edit');
for (let index = 0; index < editButton.length; index++) {
  editButton[index].onclick = () => {
    const div = this.parentElement;
    let editNew = prompt('Enter the new task: ', 'Enter Task Here...');
    div.t.nodeValue = editNew;
  };
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener(
  'click',
  (ev) => {
    if (ev.target.tagName === 'LI') {
      ev.target.classList.toggle('checked');
    }
  },
  false
);
