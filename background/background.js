var isRunning = false;
var menuListener = null;
var menuClick = function(info, tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'COPY_SELECTOR'}, function(response){});
};

var addContextMenu = function() {
    chrome.contextMenus.create({title: "Copy Selector"});
    chrome.contextMenus.create({title: "Save Selector"});
};

var sendMessageOnClick = function() {
    menuListener = chrome.contextMenus.onClicked.addListener(menuClick);
};

addContextMenu();
sendMessageOnClick();


// chrome.browserAction.onClicked.addListener(function (tab) {
//     if(isRunning) {
//         chrome.browserAction.disable(tab.id, function(){
//             isRunning = false;
//             addContextMenu();
//             sendMessageOnClick();
//         });
//     } else {
//         chrome.browserAction.enable(tab.id, function(){
//             isRunning = true;
//             chrome.contextMenus.removeAll(function(){});
//         });
//     }
//     console.log(isRunning);
//     // chrome.tabs.insertCSS(tab.id, {file: "content_style.css"});
//     // chrome.tabs.executeScript(tab.id, {file: "content_script.js"});
// });
