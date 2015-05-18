// character stored in database as a placeholder
//var LINEBREAK_PLACEHOLDER = '\u2028';
var LINEBREAK_PLACEHOLDER = '\u23ce'; // return symbol
var LENGTH_OF_PLACEHOLDER = LINEBREAK_PLACEHOLDER.length;


/**
 * map etherpad attribute 'linebreak' to
 * a dom class 'linebreak' in the editor dom
 */
exports.aceAttribsToClasses = function(hook_name, context){
    if (context.key === 'linebreak') {
    	return ['linebreak', context.value];
    }
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


/*
exports.acePostWriteDomLineHTML = function(name, context) {
}
*/


/*
 * Insert br element for content with attribute "linebreak"
 * http://etherpad.org/doc/v1.5.6/#index_acecreatedomline
 *
 * see ep_linkify plug-in for a more elaborate example
 * https://github.com/fourplusone/etherpad-plugins/blob/f6561a2b2323f8df2d3ef79154527f1ec5adfa56/ep_linkify/static/js/index.js#L50
 */
exports.aceCreateDomLine = function(name, context){
	  var cls = context.cls;

	  if (cls.indexOf('linebreak') >= 0) {
	    var modifier = {
	      extraOpenTags: '',
	      extraCloseTags: '<br/>',
	      cls: cls
	    }
	    return [modifier];
	  }
	  return;
}

/*
 * Prevent the br element from introducing a new magic domline
 * http://etherpad.org/doc/v1.5.6/#index_collectcontentlinebreak
 *
 */
exports.collectContentLineBreak = function (name, context) {
	  return false;
};

var enterPressed = function (event) {
    // Chrome does not set evt.key but only evt.keyCode
    return event.key === "Enter" || event.keyCode === 13;
};

var insertLinebreak = function(context) {
    var rep = context.rep;

    // insert linebreak placeholder
    context.editorInfo.ace_replaceRange(rep.selStart, rep.selEnd, LINEBREAK_PLACEHOLDER);

    // add linebreak attribute
    context.documentAttributeManager.setAttributesOnRange(
        [rep.selStart[0], rep.selStart[1]-1], rep.selStart,
        [['linebreak', "true"]]
    );
};
