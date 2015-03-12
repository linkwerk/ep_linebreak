# Etherpad Linebreak Plugin (ep_linebreak)

This Plugin enables the user to insert line breaks by pressing [Shift]+[Enter].

## Internals

This Plugins hooks into aceKeyEvent, catches [Shift]+[Enter], inserts a unicode character ('\u2028') and wraps an attribute around it (linebreak:true).

The unicode character itself is not displayed in the Etherpad Editor. Instead CSS is used to add a line break as content after the corresponding dom element. 

This implementation may change in future if I encounter problems with browsers, other etherpad plugins and so on. 

Any Feedback is appreciated!
