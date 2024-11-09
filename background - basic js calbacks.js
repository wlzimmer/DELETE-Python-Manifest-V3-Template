chrome.runtime.onMessage.addListener(
  function (msg, sender, sendResponse) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

		var port = chrome.runtime.connectNative('com.zimmer.testv3');
		port.onDisconnect.addListener(function () {
			console.log('Disconnected');
		});
		port.onMessage.addListener(function(msg) {
			console.log ('msg=' + msg)
//			chrome.tabs.sendMessage(tabs[0].id, 'two:'+ msg + '/from Python')
			chrome.tabs.sendMessage(tabs[0].id, msg);
			return true
		})
		
		port.postMessage (msg)
	});
})

