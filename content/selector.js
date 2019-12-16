const CSS_CLASS_NAME = 'userforce_chrome_selector_picker';
const CSS_RESOURCE_FILE = chrome.runtime.getURL("resources/css/panel.css");
const CSS_ELEMENT_KEY = 'tc_panel_css';
const HTML_TEMPLATE_PANEL = chrome.runtime.getURL("resources/html/panel.html");
const CSS_ELEMENT_PANEL_KEY = 'tc_panel_element';

var tc_styles_element = null;

var embedded = {};
var tc_current_element = null;
var tc_highlighted_element = null;
var tc_mouse_move_listener = null;
var tc_contextmenu_listener = null;
var tc_result = null;
var arrow_close = null;
var arrow_open = null;
var this_panel = null;
var panel_open = false;
var selected_variable = null;

// Add extension CSS to the DOM.
var addCss = function() {
    embedFromResources(CSS_RESOURCE_FILE, 'style', 'head', CSS_ELEMENT_KEY);
};

var removeCss = function() {
    if (!!tc_highlighted_element) {
        tc_highlighted_element.classList.remove(CSS_CLASS_NAME);
    }
    removeEmbdded(CSS_ELEMENT_KEY);
};

var setResutlSelector = function(selector) {
    document.querySelector('.tc_panel_preview_name').innerHTML = selector;
};

var setResutlValue = function(value) {
    document.querySelector('.tc_panel_preview_value').innerHTML = value;
};

var insertVariableValue = function (variableValue) {
    if (!!selected_variable) {
        var variableChildNodes = selected_variable.childNodes;
        for (var varElementIndex in variableChildNodes) {
            var varElement = variableChildNodes[varElementIndex];
            if (varElement.tagName) {
                if (varElement.classList.contains('tc_panel_variable_value')) {
                    varElement.value = variableValue;
                }
            }
        }
    }
};

var rememberVariableValue = function(event) {
    if (!event.target.classList.contains('tc_ignore_highlighting')) {
        var variableValue = findCurrentElementSelector().trim(' ');
        insertVariableValue(variableValue);
    }
};

// Then we are going to listen for the mouse move in currently open tab.
// Here we will add specific css styles to visualy detect hovered element
// and remember that element.
var showSelectedElement = function() {
    tc_mouse_move_listener = function(e) {
        if(e.srcElement !== tc_highlighted_element && e.srcElement.tagName.toLowerCase() != 'html') {
            if ( !e.srcElement.classList.contains('tc_ignore_highlighting')) {
                if (tc_highlighted_element != null) tc_highlighted_element.classList.remove(CSS_CLASS_NAME);
                tc_highlighted_element = e.srcElement;
                tc_highlighted_element.classList.add(CSS_CLASS_NAME);
                tc_current_element = tc_highlighted_element;
                setResutlSelector(findCurrentElementSelector().trim(' '));
                setResutlValue(tc_highlighted_element.textContent);
            }
        }
    };
    document.addEventListener('mousemove', tc_mouse_move_listener, false);
};

document.addEventListener('click', rememberVariableValue, false);

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
    // if(isActionRequested(message, 'tc_cm_id_copy')) {
    //
    // }
    if (isActionRequested(message, 'tc_cm_id_save')) {

        // var panel_selector = document.querySelector('.tc_panel_selector');
        // if (!!panel_selector) {
        //     panel_selector.innerHTML = findCurrentElementSelector().trim(' ');
        // }
    }
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

var embedFromResources = function(template_path, element, parentSelector, key) {
    var parentElement = document.querySelector(parentSelector);
    fetch(template_path).then(
        function(response) {
          response.text().then(function(data) {
              var panel_template = document.createElement(element);
              panel_template.innerHTML = data;
              embedded[key] = parentElement.appendChild(panel_template);
          })
        }
    );
};

var removeEmbdded = function(key) {
    if (embedded.hasOwnProperty(key)) {
        embedded[key].remove();
    }
};

var togglePanel = function(event) {
    panel_open = !panel_open;
    if (panel_open) {
        this_panel.classList.remove('tc_panel_closed');
        arrow_close.classList.add('tc_panel_arrow_hide');
        arrow_open.classList.remove('tc_panel_arrow_hide');
    } else {
        this_panel.classList.add('tc_panel_closed');
        arrow_open.classList.add('tc_panel_arrow_hide');
        arrow_close.classList.remove('tc_panel_arrow_hide');
    }
};

var setActiveVariable = function(event) {
    var clickedCheckbox = event.target;
    var allCheckboxes = document.querySelectorAll('.tc_panel_active_selector input');
    for (var ckb in allCheckboxes) {
        allCheckboxes[ckb].checked = false;
    }
    clickedCheckbox.checked = true;
    selected_variable = clickedCheckbox.parentNode.parentNode;
};

var addPanel = function() {
    embedFromResources(HTML_TEMPLATE_PANEL, 'div', 'body', CSS_ELEMENT_PANEL_KEY);
    var waitPanel = setInterval(function() {
        this_panel = document.querySelector('.tc_panel');
        if (!!this_panel) {
            clearInterval(waitPanel);
            arrow_close = document.querySelector('.tc_panel_arrow_close');
            arrow_open = document.querySelector('.tc_panel_arrow_open');
            arrow_close.addEventListener('click', togglePanel, false);
            arrow_open.addEventListener('click', togglePanel, false);
            panel_open = false;
            togglePanel();
            var allCheckboxes = document.querySelectorAll('.tc_panel_active_selector input');
            for (var ckb in allCheckboxes) {
                if ( typeof allCheckboxes[ckb].addEventListener === 'function') {
                    allCheckboxes[ckb].addEventListener('click', setActiveVariable, false);
                }
            }
            var rememberButton = document.querySelectorAll('.tc_remember_variables');
            rememberButton.addEventListener('click', saveVariables, false);
        }
    }, 500);
};

var removePanel = function() {
    removeEmbdded(CSS_ELEMENT_PANEL_KEY);
};

var start = function() {
    addPanel();
    setCurrentElement();
    showSelectedElement();
    addCss();
}

var stop = function() {
    removePanel();
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
