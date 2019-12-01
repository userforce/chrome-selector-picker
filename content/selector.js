const CSS_CLASS_NAME = 'userforce_chrome_selector_picker';
const CSS_CLASS_STYLES = '.' + CSS_CLASS_NAME + '{-webkit-box-shadow: 0px 0px 0px 1px rgba(96,143,61,1); box-shadow: 0px 0px 0px 1px rgba(96,143,61,1);}'

var current_element = null;
var result = null;

var addCssClassToTheDOM = function() {
    var headElement = document.querySelector('head'),
        style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(CSS_CLASS_STYLES));
    headElement.appendChild(style);
};

var prepareElementSelecting = function() {
    document.addEventListener('mousemove', function(e) {
        if(e.srcElement !== current_element && e.srcElement.tagName.toLowerCase() != 'html') {
            if (current_element != null) current_element.classList.remove(CSS_CLASS_NAME);
            current_element = e.srcElement;
            current_element.classList.add(CSS_CLASS_NAME);
        }
    }, false);
};

var copyRequested = function(message) {
    if(message.hasOwnProperty('action')) {
        return message.action === 'COPY_SELECTOR';
    }
    return false;
};

var prepareContextMenuActions = function() {
    chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse) {
            if(copyRequested(message)) {
                result = findCurrentElementSelector().trim(' ');
                console.log(result);
            }
            // Chrome is expecting a response and throwing and error if
            // it was not received so we just send a boolean true back.
            sendResponse(true);
        }
    );
};

var findCurrentElementSelector = function(children = '') {
    if(!!current_element.id) return ('#' + current_element.id + children);
    return detectNodeSelector(current_element);
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

var initSelector = function() {
    // Add extension CSS class to the DOM tree.
    addCssClassToTheDOM();
    // Then we are going to listen for the mouse move in currently open tab.
    // Here we will add specific css styles to visualy detect hovered element
    // and remember that element.
    prepareElementSelecting();
    // Copy current_element selector to the clipboard or remember it by saving
    // to the chrome storage.
    prepareContextMenuActions();
}

initSelector();
