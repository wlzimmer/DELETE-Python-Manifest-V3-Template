var rate = 1.5
var volume = 1.0
chrome.runtime.onMessage.addListener(
  function (msg, sender, sendResponse) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, msg);
		chrome.tts.speak(msg, {'enqueue': true, 'lang': 'en-US', 'rate': rate, 'volume': volume})
	});
	return true;
})

