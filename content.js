//Process request from Python (sent through background.js)
console.log ('content')
callTable = {
	'log': log,
	'two': two
}
data = {}
data.running = true
chrome.runtime.sendMessage('get:running')
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	try {
		let index = msg.indexOf(':');
		msg = [msg.slice(0, index), msg.slice(index + 1)];
		console.log ('...', msg)
		if (msg[0] == 'log') 
			/* chrome.runtime.sendMessage */(msg[0] + ':' + log (...msg[1].split('/')))
		else if (callTable.hasOwnProperty(msg[0]))
			chrome.runtime.sendMessage(msg[0] + ':' + callTable['two'] (...msg[1].split('/')))
		else if (msg[0] == 'log') 
			console.log ('...', msg[1].toString())
		else if (msg[0] == 'put') {
			let put = msg[1].split ('=')
			data[put[0]] = put[1]
			if (msg[0] == 'running' && data.running)
				chrome.runtime.sendMessage('restarting:' + window.location.href);
			console.log ('put=', data.running)
		} else 
			console.log ('*...Function ' + msg[0] + ' does not exist')
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
		console.log ('key=', key)

		if (key == 'Ctrl-F1') {
			data.running = !data.running
			console.log ('...running=', data.running, data.running == true)
			chrome.runtime.sendMessage('put:running=' + data.running)
			if (data.running) 
				chrome.runtime.sendMessage('restarting:' + window.location.href);
		} else if (data.running) {
			chrome.runtime.sendMessage('key:' + key);
			event.stopPropagation();
			event.preventDefault();
		} 
	} catch(err) {
		  console.log ('*...content', err.message, err.stack);
	}
};

function log (strArg) {
	console.log ('*...' + strArg)
	return 'log'
}
function two (first, second) {
	console.log ('+...' + first)
	console.log ('+...' + second)
	return 'two got called'
}
