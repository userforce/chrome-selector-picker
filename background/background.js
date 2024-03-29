const TC_ICONS = { path: 'src/img/' };
const TC_CONTEXT_MENU_ID_COPY = 'tc_cm_id_copy';
const TC_CONTEXT_MENU_ID_SAVE = 'tc_cm_id_save';

var active = false;
var menuListener = null;

var refrashIcons = function() {
    var icon = TC_ICONS.path + 'icon' + (active ? '' : '_disabled_') + '16.png';
    chrome.browserAction.setIcon({path: icon});
};

var menuClick = function(info, tab) {
    sendMessage(tab, {action: info.menuItemId});
};

var addContextMenu = function() {
    chrome.contextMenus.create({
        title: "Copy Selector",
        type: "normal",
        contexts: ["all"],
        id: TC_CONTEXT_MENU_ID_COPY
    });
    chrome.contextMenus.create({
        title: "Save Selector",
        type: "normal",
        contexts: ["all"],
        id: TC_CONTEXT_MENU_ID_SAVE
    });
    menuListener = chrome.contextMenus.onClicked.addListener(menuClick);
};

var removeContextMenu = function() {
    chrome.contextMenus.onClicked.removeListener(menuListener);
    chrome.contextMenus.removeAll();
};

var run = function(tab) {
    addContextMenu();
};

var stop = function(tab) {
    removeContextMenu();
};

var toggleSelector = function(tab) {
    (active = !active) ? run(tab) : stop(tab);
    sendMessage(tab, {app: {isRunning: active}});
    refrashIcons();
};

var refrashSelector = function(tab) {
    stop(tab);
    if(active) {
        run(tab);
        sendMessage(tab, {app: {isRunning: active}});
    }
    refrashIcons();
};

refrashIcons();

chrome.browserAction.onClicked.addListener(function (tab) {
    toggleSelector(tab);
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') refrashSelector(tab);
});

// Wait for content script workaround.
var sendMessage = function(tab, message) {
    if(chrome.runtime.lastError) {
        setTimeout(function() {
            sendMessage(tab, message);
        }, 1000);
    } else {
        chrome.tabs.sendMessage(tab.id, message, function(response){});
    }
};
