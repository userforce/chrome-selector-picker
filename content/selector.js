const CSS_CLASS_NAME = 'userforce_chrome_selector_picker';
const CSS_CLASS_STYLES = '.' + CSS_CLASS_NAME + '{-webkit-box-shadow: 0px 0px 0px 1px rgba(96,143,61,1); box-shadow: 0px 0px 0px 1px rgba(96,143,61,1);}'

var tc_styles_element = null;
var tc_current_element = null;
var tc_highlighted_element = null;
var tc_mouse_move_listener = null;
var tc_contextmenu_listener = null;
var tc_result = null;

// Add extension CSS to the DOM.
var addCss = function() {
    var headElement = document.querySelector('head'),
        styles = document.createElement('style');
    styles.type = 'text/css';
    styles.appendChild(document.createTextNode(CSS_CLASS_STYLES));
    tc_styles_element = headElement.appendChild(styles);
};

var removeCss = function() {
    if (!!tc_highlighted_element) {
        tc_highlighted_element.classList.remove(CSS_CLASS_NAME);
        tc_highlighted_element.remove();
    }
};

// Then we are going to listen for the mouse move in currently open tab.
// Here we will add specific css styles to visualy detect hovered element
// and remember that element.
var showSelectedElement = function() {
    tc_mouse_move_listener = function(e) {
        if(e.srcElement !== tc_highlighted_element && e.srcElement.tagName.toLowerCase() != 'html') {
            if (tc_highlighted_element != null) tc_highlighted_element.classList.remove(CSS_CLASS_NAME);
            tc_highlighted_element = e.srcElement;
            tc_highlighted_element.classList.add(CSS_CLASS_NAME);
        }
    };
    document.addEventListener('mousemove', tc_mouse_move_listener, false);
};

var hideSelectedElement = function() {
    document.removeEventListener('mousemove', tc_mouse_move_listener);
};

var setCurrentElement = function() {
    tc_contextmenu_listener = function(e) {
        tc_current_element = e.srcElement;
    };
    document.addEventListener('contextmenu', tc_contextmenu_listener, false);
};

var removeCurrentElement = function() {
    document.removeEventListener('mousemove', tc_contextmenu_listener);
};

var isActionRequested = function(message, action) {
    return message.action === action;
};

var isContextMenuAction = function(message) {
    return message.hasOwnProperty('action');
}

var runContextMenuAction = function(message) {
    if(isActionRequested(message, 'tc_cm_id_copy')) {

    }
    if (isActionRequested(message, 'tc_cm_id_save')) {

    }
    console.log(findCurrentElementSelector().trim(' '));
    console.log('---------------------------');
};

var findCurrentElementSelector = function(children = '') {
    if(!!tc_current_element.id) return ('#' + tc_current_element.id + children);
    return detectNodeSelector(tc_current_element);
};

var detectNodeSelector = function(element, selector = '') {
    elementSelector = '';
    if(hasValidParentNode(element)) {
        var parentNode = element.parentNode;
        var orderNumber = findElementOrderNumber(element);
        var classSelector = findElementClassSelector(element);
        if (classSelector) {
            elementSelector += classSelector;
        }
        if (orderNumber) {
            elementSelector += ':nth-child('+orderNumber+')';
        }
        elementSelector = ' ' + element.tagName.toLowerCase() + elementSelector + selector
        selector = detectNodeSelector(element.parentNode, elementSelector);
    }
    return selector;
}

var hasValidParentNode = function(node) {
    if (!!node.parentNode) {
        var parentTagName = node.parentNode.tagName.toLowerCase();
        var parentIsRoot = (parentTagName == 'html');
        return !parentIsRoot;
    }
    return false;
};

var findElementOrderNumber = function(element, order = 0) {
    if (!!element.previousSibling) {
        var isDOMElement = !element.previousSibling.nodeName.match(/^#[\w\d]+$/);
        if(isDOMElement) order++;
        return findElementOrderNumber(element.previousSibling, order);
    } else {
        return order === 0 ? order : ++order;
    }
}

var findElementClassSelector = function(element) {
    var classSelector = '';
    var classes = element.classList.value.replace(CSS_CLASS_NAME, '').split(' ');
    for(var index in classes) {
        if(!!classes[index]){
            classSelector += ('.' + classes[index])
        };
    }
    return classSelector;
}

var start = function() {
    setCurrentElement();
    showSelectedElement();
    addCss();
}

var stop = function() {
    removeCurrentElement();
    hideSelectedElement();
    removeCss();
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.hasOwnProperty('app')) {
            message.app.isRunning ? start() : stop();
        }
        if (isContextMenuAction(message)) {
            // Copy tc_current_element selector to the clipboard or remember it
            // by saving to the chrome storage.
            runContextMenuAction(message);
        }
        // Chrome is expecting a response and throwing and error if
        // it was not received so we just send a boolean true back.
        sendResponse(true);
        return true;
    }
);
