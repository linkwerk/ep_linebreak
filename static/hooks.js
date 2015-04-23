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



/* ***************************************************************************
 * BEGIN bugfix due to n.innerText usage in nodeText(). See below for details.
 ***************************************************************************** */

exports.aceEndLineAndCharForPoint = function(hook_name, context) {
	return getLineAndCharForPoint(context);
}

exports.aceStartLineAndCharForPoint = function(hook_name, context) {
	return getLineAndCharForPoint(context);
}


/*
 * This function is a MODIFIED copy of
 *  http://etherpad.org/doc/v1.5.6/#index_editorinfo_ace_getlineandcharforpoint
 *  Trying to fix a bug, that causes different behaviour of FF and chrome
 */
function getLineAndCharForPoint(ctx)
{
	var point = ctx.point;
	var rep = ctx.rep;

	// http://etherpad.org/doc/v1.5.6/#index_editorinfo_ace_isblockelement_element
	var isBlockElement = ctx.editorInfo.ace_isBlockElement;


  // Turn DOM node selection into [line,char] selection.
  // This method has to work when the DOM is not pristine,
  // assuming the point is not in a dirty node.
  if (point.node == ctx.root)
  {
    if (point.index === 0)
    {
      return [0, 0];
    }
    else
    {
      var N = rep.lines.length();
      var ln = rep.lines.atIndex(N - 1);
      return [N - 1, ln.text.length];
    }
  }
  else
  {
    var n = point.node;
    var col = 0;

    // if this part fails, it probably means the selection node
    // was dirty, and we didn't see it when collecting dirty nodes.
    if (n.nodeType == 3) // text node
    {
      col = point.index;
    }
    else if (point.index > 0)
    {
      col = nodeText(n).length;
    }
    var parNode, prevSib;
    while ((parNode = n.parentNode) != ctx.root)
    {
      if ((prevSib = n.previousSibling))
      {
        n = prevSib;

        /*
         * The following if-clause prevents Chrome from
         * crash with the *original* nodeText() function
         * when counting the length of the linebreak
         * markup.
         */
 		if (n.nodeType === Node.ELEMENT_NODE
 				&& n.hasAttribute("class")
 				&& n.classList.contains("linebreak")) {
 			col += LENGTH_OF_PLACEHOLDER;
 			/* the linebreak element counts as
 			 * LENGTH_OF_PLACEHOLDER number of characters,
 			 * no matter how much additional markup we insert
 			 */

 		} else {
 			col += nodeText(n).length;
 		}
      }
      else
      {
        n = parNode;
      }
    }
    if (n.id === "") console.debug("BAD");
    if (n.firstChild && isBlockElement(n.firstChild))
    {
      col += 1; // lineMarker
    }
    var lineEntry = rep.lines.atKey(n.id);
    var lineNum = rep.lines.indexOfEntry(lineEntry);
    return [lineNum, col];
  }
}



/*
 * modified copy from https://github.com/ether/etherpad-lite/blob/6a027d88a90c7ac70ad23af4786cd79a3b47c8b5/src/static/js/ace2_inner.js#L1983
 * BE AWARE that FF and chrome return different result for some elements,
 * if n.innerText is the first in row.
 * TODO: Test with MSIE (which version to support?)
 */
function nodeText(n)
{
  return n.textContent || n.nodeValue || n.innerText || '';
}

/*
 * Bug description:
 *
 * Given this markup: <span id="test">x<br/></span>
 *
 * Compare the following expressions in FF (37.0.1) and Chrome (42.0.2311.90):
 *
 *
 * document.getElementById("test").innerText
 *
 * FF: fails
 * Chrome: "x\n"
 *
 *
 * document.getElementById("test").innerText.length
 *
 * FF: fails
 * Chrome: 2
 *
 *
 * document.getElementById("test").textContent
 *
 * FF: "x"
 * Chrome: "x"
 *
 * document.getElementById("test").textContent.length
 *
 * FF: 1
 * Chrome: 1
 *
 *
 *
 * A solution for our bug could be to remove .innerText from nodeText().
 * I decided to check if node is our linebreak node and define the
 * character count.
 * .innerText has been moved to the end of nodeText().
 *
 */
