/**
 * map etherpad attribute 'linebreak' to 
 * a dom class 'linebreak' in the editor dom
 */
exports.aceAttribsToClasses = function(hook_name, context){
    if (context.key == 'linebreak') return ['linebreak', context.value];
};

exports.aceEditorCSS = function() {
    return ["ep_linebreak/static/main.css"];
};

/**
 * catch Shift-Enter and insert linebreak instead of a new etherpad line
 */
exports.aceKeyEvent = function(hook_name, context) {
    var event = context.evt;    
    
    if (event.shiftKey && enterPressed(event)) {
        event.preventDefault();
        if (event.type === "keyup") {
            insertLinebreak(context);	
        }
        // From doc: "The return value should be true if you have handled the event."
        return true;
    }
};

var enterPressed = function (event) {
    // Chrome does not set evt.key but only evt.keyCode
    return event.key === "Enter" || event.keyCode === 13;
};

var insertLinebreak = function(context) {
    var rep = context.rep;
    
    // insert linebreak unicode character 
    context.editorInfo.ace_replaceRange(rep.selStart, rep.selEnd, '\u2028');

    // add linebreak attribute
    context.documentAttributeManager.setAttributesOnRange(
        [rep.selStart[0], rep.selStart[1]-1], rep.selStart, 
        [['linebreak', "true"]]
    );
};

