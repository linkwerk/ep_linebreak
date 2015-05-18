# Etherpad Linebreak Plugin (ep_linebreak)

This Plugin enables the user to insert line breaks by pressing [Shift]+[Enter].

## Internals

This Plugins hooks into aceKeyEvent, catches [Shift]+[Enter], inserts a return symbol ('⏎') and wraps an attribute around it (linebreak:true).

When creating the editor DOM this attribute is turned into a br-Element.

This implementation may change in future (it already has, see below) if I encounter problems with browsers, other etherpad plugins and so on. 

Any Feedback is appreciated!

### Implementation until version <= 0.0.3 (for historical documentation)

This Plugins hooks into aceKeyEvent, catches [Shift]+[Enter], inserts a whitespace character (' ') and wraps an attribute around it (linebreak:true).

CSS is used to add a return symbol (⏎) and a line break as content after the corresponding dom element. 

This implementation turned out to be suboptimal as it led to a strange cursor behaviour.

## Known issues

The cursor can be placed behind the return symbol. It should be placed before the return symbol, and jump to the beginning of the next line, when the right arrow key is pressed. 
Instead the cursor stays behind the return symbol when the right arrow key is pressed. 
You have to press the down key to jump to the next line and additionally the pos1 key to get to the start of the next line.
