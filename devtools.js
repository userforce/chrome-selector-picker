console.log(123);

chrome.devtools.inspectedWindow.eval(
    "jQuery.fn.jquery",
    function(result, isException) {
        if (isException)
            console.log("the page is not using jQuery");
        else
            console.log("The page is using jQuery v" + result);
    }
);