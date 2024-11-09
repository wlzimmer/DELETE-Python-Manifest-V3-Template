//Process request from Python (sent through background.js)
console.log ('content')
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	try {
		let index = msg.indexOf(':');
		msg = [msg.slice(0, index), msg.slice(index + 1)];
		console.log ('...', msg)
		if (msg[0] == 'log') 
			log (...msg[1])
		else if (msg[0] == 'two')
			two (...msg[1].split('/'))
		return false;
	} catch(err) {
		  console.log ('*...content', err.message, err.stack, '-', msg);
	}
});

document.addEventListener('keydown', onKeyDown) // WTF Can't remove if document.onKeyDown
function onKeyDown(event) {
	try {
		if (['Control', 'Shift', 'Alt'].includes(event.key)) return;
		key = event.key;
		if (event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Enter', 'Backspace', 'Delete', 'End', 'Home', 'Insert', 'ScrollLock', 'Tab', 'Pause'].includes(key)) key = 'Shift-' + key.trim()
		if(event.altKey) key = 'Alt-' + key
		if (event.ctrlKey) key = 'Ctrl-'+ key
		chrome.runtime.sendMessage(key);
		event.stopPropagation();
		event.preventDefault();
	} catch(err) {
		  console.log ('*...content', err.message, err.stack);
	}
};

function log (strArg) {
	console.log ('*...' + strArg)
}
function two (first, second) {
	console.log ('+...' + first)
	console.log ('+...' + second)
}
