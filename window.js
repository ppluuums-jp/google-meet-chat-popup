"use strict";
//Inicialize some variables
let parent = document.getElementById("parent");
let numberOfMessage_previous = 0;
let count_block_previous = 0;
let message_execute_count = 0;
let i_tmp = 0;
let j_tmp = 0;
let no_message_flag = false;

chrome.storage.local.get("meetTabId", async function(result){
    let tabId = result.meetTabId;
    await main(tabId);
    setInterval(async () => {
        await main(tabId);
    }, 3000);
});

async function main(tabId) {
    const count_block = await returnBlockCount(tabId);
    const numberOfMessage_object = await returnNumberOfMessages(tabId);
    const numberOfMessage = numberOfMessage_object.result;

    //see if there are diffs of number of messages
    if (numberOfMessage == 0 && !no_message_flag) {
        setMessage("No message found.");
        no_message_flag = true;
    } else if (numberOfMessage_previous < numberOfMessage) {
        //Execute
        if (no_message_flag) {
            parent.innerHTML = "";
            no_message_flag = false;
        }
        //see if there are diffs of number of blocks
        if (count_block_previous == count_block.result) {
            await getDiffs(tabId);
        } else {
            await getNewMessage(count_block, tabId);
            // chrome.windows.create({ type: "popup" });
        }

        numberOfMessage_previous = numberOfMessage;
        parent.scrollIntoView(false);
    }
}

//Get a block count that contains names and times, messages
function getBlockCount() {
    return document.getElementsByClassName("GDhqjd").length;
}

async function returnBlockCount(tabId) {
return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
    { target: { tabId: tabId }, func: getBlockCount },
    (results) => {
        if (results[0] === null) {
        reject(new Error("Failed to parse meet."));
        } else {
        resolve(results[0]);
        }
    }
    );
});
}

//Get a number of messages
function getNumberOfMessages() {
return document.getElementsByClassName("oIy2qc").length;
}

async function returnNumberOfMessages(tabId) {
return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
    { target: { tabId: tabId }, func: getNumberOfMessages },
    (results) => {
        if (results[0] === null) {
        reject(new Error("Failed to parse meet."));
        } else {
        resolve(results[0]);
        }
    }
    );
});
}

//Get message counts which are included in each the blocks
function getMessageCount(i) {
if (i + 1 == 1) {
    var content_content_length = document.querySelector(
    "#ow3 > div.T4LgNb > div > div:nth-child(10) > div.crqnQb > div.R3Gmyc.qwU8Me > div.WUFI9b > div.hWX4r > div > div.z38b6 > div > div.Zmm6We"
    ).childElementCount;
} else {
    var content_content_length = document.querySelector(
    "#ow3 > div.T4LgNb > div > div:nth-child(10) > div.crqnQb > div.R3Gmyc.qwU8Me > div.WUFI9b > div.hWX4r > div > div.z38b6 > div:nth-child(" +
        String(i + 1) +
        ") > div.Zmm6We"
    ).childElementCount;
}
return content_content_length;
}

async function returnMessageCount(tabId, i) {
return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
    { target: { tabId: tabId }, func: getMessageCount, args: [i] },
    (results) => {
        if (results[0] === null) {
        reject(new Error("Failed to parse meet."));
        } else {
        resolve(results[0]);
        }
    }
    );
});
}

//Get names and times from "Google Meet Chat"
function parseNameAndTime(i) {
return [
    document.getElementsByClassName("YTbUzc")[i].textContent,
    document.getElementsByClassName("MuzmKe")[i].textContent,
];
} 

async function getNameAndTime(tabId, i) {
return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
    { target: { tabId: tabId }, func: parseNameAndTime, args: [i] },
    (results) => {
        if (results[0] === null) {
        reject(new Error("Failed to parse meet."));
        } else {
        resolve(results[0]);
        }
    }
    );
});
}

//Get Messages from "Google Meet Chat"
function parseMessage(i) {
return document.getElementsByClassName("oIy2qc")[i].textContent;
} 

async function getMessage(tabId, i) {
return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
    { target: { tabId: tabId }, func: parseMessage, args: [i] },
    (results) => {
        if (results[0] === null) {
        reject(new Error("Failed to parse meet."));
        } else {
        resolve(results[0]);
        }
    }
    );
});
}

//Execute when there are diffs of blocks
async function getNewMessage(count_block, tabId) {
//Count messages to get start point
for (let i = i_tmp; i < count_block.result; i++) {
    const count_message = await returnMessageCount(tabId, i);
    const name_time_object = await getNameAndTime(tabId, i);
    const name_time =
    name_time_object.result[0] + " " + name_time_object.result[1];
    setNameAndTime(name_time);

    //Get messages for each name_times
    for (let j = 0; j < count_message.result; j++) {
    const get_message = await getMessage(tabId, message_execute_count);
    const message = get_message.result;
    setMessage(message);
    message_execute_count++;
    j_tmp = j + 1;
    }
    i_tmp = i + 1;
}
count_block_previous = count_block.result;
}

async function getDiffs(tabId) {
    const count_message = await returnMessageCount(tabId, i_tmp - 1);

    for (let j = j_tmp; j < count_message.result; j++) {
        const get_message = await getMessage(tabId, message_execute_count);
        const message = get_message.result;
        setMessage(message);
        message_execute_count++;
        j_tmp = j + 1;
    }
}

//Set names and times properly
function setNameAndTime(name_time) {
    let content_hr = document.createElement("hr");
    let content_h6 = document.createElement("h6");
    content_h6.className = "card-subtitle mb-2 text-muted";
    content_h6.innerHTML = name_time;
    parent.appendChild(content_hr);
    parent.appendChild(content_h6);
}

//Set messages properly
function setMessage(chat) {
    let content_p = document.createElement("p");
    content_p.className = "card-text";
    content_p.innerHTML = chat;
    parent.appendChild(content_p);
}

