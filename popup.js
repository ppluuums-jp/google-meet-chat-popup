"use strict";
//Inicialize some variables
let tabId;
let windowId = -1;
let parent = document.getElementById("parent");
let error = document.getElementById("error");
let btn = document.getElementById("windowBtn");
let meetURL = "https://meet.google.com/";

//Get a current tab's id
{
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    tabId = tabs[0].id;
    if (tabs[0].url.indexOf(meetURL)) {
      setErrorMessage("Click on the meet tab.");
      toggleError(true);
    } else {
      chrome.storage.local.set({"meetTabId": tabId}, function(){});
      error.innerHTML = "";
      toggleError(false); 
    }
  });
}

//Set an error message properly
function setErrorMessage(text) {
  let error_p = document.createElement("p");
  error_p.className = "text-danger";
  error_p.innerHTML = text;
  error.appendChild(error_p);
}

//An error handler
function toggleError(display) {
  if (display) {
    error.classList.remove("hidden");
    btn.setAttribute("disabled", true);
    btn.classList.add("btn-secondary");
  } else {
    error.classList.add("hidden");
    btn.removeAttribute("disabled");
    btn.classList.add("btn-success");
  }
}

//A click event
btn.onclick = function() {
  chrome.storage.local.get("windowId", function(result){
    windowId = result.windowId;
    if (windowId === undefined) {
      // if not the case above, create new a one
      chrome.windows.create({
        url : 'window.html',
        focused : true,
        type : 'popup',
        height : 600,
        width : 352
      },
      function (window) {
        chrome.storage.local.set({"windowId": window.id}, function(){});
        return;
      });
    }
    chrome.windows.get(windowId, function (chromeWindow) {
      //see if there's already the window
      if (!chrome.runtime.lastError && chromeWindow) {
        chrome.windows.update(windowId, { focused: true });
        return;
      }
      
      // if not the case above, create new a one
      chrome.windows.create({
        url : 'window.html',
        focused : true,
        type : 'popup',
        height : 600,
        width : 352
      },
      function (window) {
        chrome.storage.local.set({"windowId": window.id}, function(){});
      });
    });
  });
};
