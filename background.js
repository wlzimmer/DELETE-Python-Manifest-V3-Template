//chrome.storage.session.clear()

port = null
__contents__ = []
data = {}
function saveData(name, value) {
	arg = {}
	arg[name] =  value
	data[name] = value
	__contents__.push(name)
	chrome.storage.session.set(	{__contents__: __contents__}, function() {
	})
	chrome.storage.session.set(	arg, function() {
		console.log('Settings saved', name, value)
	})
}

saveData('running', 'true')
saveData('rate', 1.5)
saveData('volume', 1.0)
chrome.tts.speak('start', {'enqueue': true, 'lang': 'en-US', 'rate': data.rate, 'volume': data.volume})

chrome.storage.session.get(['__contents__'], function(items) {
   chrome.storage.session.get(items.__contents__, function(items) {
      console.log('Settings retrieved', items);
	  data = items
	  bar()
    });
});

function bar () {
chrome.runtime.onMessage.addListener(
  function (msg, sender, sendResponse) {
	console.log ('contentMsg', msg)
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (!('tabId' in data)) data.tabId = tabs[0].id;
		if (tabs[0].id != data.tabId) return;
 		if (msg.startsWith('put:')) {
			let splits = msg.slice(4).split ('=')
			saveData (splits[0].trim(), splits[1].trim())
			if (msg.slice(4) == 'running=true') {	
				chrome.tts.speak('start talking browser', {'enqueue': true, 'lang': 'en-US', 'rate': data.rate, 'volume': data.volume})
				console.log ('start talking browser' +  data.rate +  data.volume)
			} else if (msg.slice(4) == 'running=false'){
				console.log ('...port.disconnect()')
				chrome.tts.speak('stop talking browser', {'enqueue': true, 'lang': 'en-US', 'rate': data.rate, 'volume': data.volume})
				port.disconnect();
				port = null
			}
		} else if (msg.startsWith('get:')) {
			if (msg.slice(4).trim() in data) {
				chrome.tabs.sendMessage(tabs[0].id, 'put:' + msg.slice(4).trim() +'='+ data[msg.slice(4).trim()]);
				console.log ('get data', 'put:' + msg.slice(4).trim() +'='+ data[msg.slice(4).trim()])
			}
			else console.log ('*... ', msg.slice(4).trim(), 'not found')
		} else { 
			console.log ('running', data.running)
			if (data.running == 'true') {
				if (port == null) {
					port = chrome.runtime.connectNative('com.zimmer.testv3');
					port.onDisconnect.addListener(function () {
						console.log('Disconnected');
					});
					port.onMessage.addListener(function(msg) {
						console.log ('msg=' + msg)
						console.log('data', data)
						chrome.tabs.sendMessage(tabs[0].id, msg);
						return true
					})
					console.log ('...connect Port')
				}
				port.postMessage (msg);
			}
		}
	});
})
}











function barx () {
try {
	var rate = 1.5
	var volume = 1.0
	var data = {};
	data['running'] = 'true'
	var tabId = null;
	var port = null   //getNativeMessagingPort ('com.zimmer.browser');

	//Forward message from content.js to Python
	chrome.runtime.onMessage.addListener(
	  function (msg, sender, sendResponse) {
	  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabId == null) tabId = tabs[0].id;
//		if (tabs[0].id != tabId) return;
//		console.log (Date.now()-startTime, '-->', tabs[0].id, msg.slice(0,100));
//		if (port == null) console.log ('Port == null')
/* 		if (msg.startsWith('put:')) {
			let splits = msg.slice(4).split ('=')
			data[splits[0].trim()] = splits[1].trim()
			chrome.tabs.sendMessage(tabs[0].id, 'put:');
		} else if (msg.startsWith('get:')) {
			if (msg.slice(4).trim() in data) 
				chrome.tabs.sendMessage(tabs[0].id, 'get:' + msg.slice(4).trim() +'='+ data[msg.slice(4).trim()]);
			else console.log ('*... ', msg.slice(4).trim(), 'not found')
			
		} else { */

			try {
//				console.log ('port=', port)
				if (data.running == 'true') {
					if (port == null) {
						chrome.tts.speak('start talking browser', {'enqueue': true, 'lang': 'en-US', 'rate': data.rate, 'volume': data.volume})
						port = getNativeMessagingPort ('com.zimmer.browser');
					}
					port.postMessage (msg);
				} else if (port != null) {	
					console.log ('...port.disconnect()')
					chrome.tts.speak('stop talking browser', {'enqueue': true, 'lang': 'en-US', 'rate': data.rate, 'volume': data.volume})
//					port.postMessage ('key:Ctrl-F1')
					port.disconnect();
					port = null
				}
			} catch(err) {
				port = null
				console.log ('*...postMessage', err.message, err.stack);
		}
	  });
	  return true;
	})
} catch(err) {
	  console.log ('*...background', err.message, err.stack);
}
}

function getNativeMessagingPort (app) {
	console.log ('...', app)
	var port = chrome.runtime.connectNative(app);
	port.onMessage.addListener(function(msg) {
		if (msg.startsWith('talk:')) {
			chrome.tts.speak(msg.slice(5), {requiredEventTypes: ['end'],
    onEvent: function(event) {
        if(event.type === 'end') {
            port.postMessage ('key:SpeakDone')
        }
    },'enqueue': true, 'lang': 'en-US', 'rate': rate, 'volume': volume})
		} else if (msg.startsWith('stoptalk:')) {
			chrome.tts.stop();
		} else if (msg.startsWith('talkrate:')) {
			rate = parseFloat(msg.slice(9))  / 10.0 +1.
		} else if (msg.startsWith('talkvolume:')) {
			volume = parseFloat(msg.slice(11)) / 100.
		
/* 		} else if (msg.startsWith('put:')) {
			let splits = msg.slice(4).split("=").slice(1).join("=")
			data[splits[0].trim()] = splits[1].trim()
			port.postMessage ('put:')
		} else if (msg.startsWith('get:')) {
			if (msg.slice(4).trim() in data) msg =  data[msg.slice(4).trim()]
			else msg =  ''
			port.postMessage ('get:' + msg);
 */		
		} else if (msg.startsWith('put:')) {
			let splits = msg.slice(4).split ('=')
			data[splits[0].trim()] = splits[1].trim()
			port.postMessage ('put:')
		} else if (msg.startsWith('get:')) {
			if (msg.slice(4).trim() in data) 
				port.postMessage ('get:'  + msg.slice(4).trim() +'='+ data[msg.slice(4).trim()]);
//				chrome.tabs.sendMessage(tabs[0].id, 'get:' + msg.slice(4).trim() +'='+ data[msg.slice(4).trim()]);
			else console.log ('*... ', msg.slice(4).trim(), 'not found')

		} else if (msg.startsWith('norefresh:')) {
			if (msg.slice(10).trim() == 'on')
				chrome.tabs.update(tabId, {autoDiscardable: false});
			else
				chrome.tabs.update(tabId, {autoDiscardable: true});
		} else {
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				if (tabId == null) tabId = tabs[0].id;
				if (tabs[0].id != tabId) return;
//				console.log (Date.now()-startTime, '<--', tabs[0].id, msg)   //.slice(0,100));
				if (tabs[0] == null) {
					console.log ('tabs[0] == null')
					return true				// Cannot read properties of undefined (reading 'id')???
				}
				chrome.tabs.sendMessage(tabs[0].id, msg);
			});
		}
		return true
	});
	return port
}

