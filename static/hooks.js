/**
 * map etherpad attribute 'linebreak' to 
 * a dom class 'linebreak' in the editor dom
 */
exports.aceAttribsToClasses = function(name, context){
  if (context.key == 'linebreak') return ['linebreak', context.value];
};

/**
 * 
 */
exports.aceEditorCSS = function () {
  return ["ep_linebreak/static/main.css"];
};

/**
 * catch Shift-Enter and insert linebreak instead of a new etherpad line
 */
var aceKeyEvent = function(name, context) {
    var padeditor = require("ep_etherpad-lite/static/js/pad_editor").padeditor;
    var rep = context.rep;
    var evt = context.evt;
    
    
    if (evt.shiftKey && evt.key === "Enter") {
      evt.preventDefault();
      if (evt.type === "keyup") {
	
	// insert linebreak unicode character 
	context.editorInfo.ace_replaceRange(rep.selStart, rep.selEnd, '\u2028');
	
	// add linebreak attribute
	context.documentAttributeManager.setAttributesOnRange(
	    [rep.selStart[0], rep.selStart[1]-1], rep.selStart, 
	    [['linebreak', "true"]]
	);
      }
    }
};

exports.aceKeyEvent = aceKeyEvent;
