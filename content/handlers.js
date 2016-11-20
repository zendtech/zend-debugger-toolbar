/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Contributor(s): Zend Technologies - initial API and implementation
 ******************************************************************************/

function zendHandleDebugCookies(message) {
	var selectFrame = message.data.selectFrame;
	var triggerSession = message.data.triggerSession;
	var cookies = message.data.cookies;
	if (triggerSession && selectFrame && content.frames.length > 0) {
		zendFetchFrames(cookies, triggerSession)
		return;
	}
	zendSetDebugCookies(content.document, cookies);
	if (triggerSession) {
		content.document.location.reload();
	}
}

function zendHandleLoadPage(message) {
	var pageURL = message.data.pageURL;
	content.document.location.href = pageURL;
}

function zendHandleCookiesEnabled() {
	var doc = content.document;
	zendCheckCookiesEnabled(doc);
}

function zendHandleHasDebugSessionCookies() {
	var pageLoadListener = function(event) {
		var doc = event.originalTarget;
	    var win = doc.defaultView;
	    if (doc.nodeName != "#document") return;
	    if (win != win.top) return;
	    if (win.frameElement) return;
	    // Check if session cookies were removed
	    var doc = content.document;
		var cookies = doc.cookie.split(";");
		if (doc.cookie.indexOf('ZendDebuggerCookie') == -1 || doc.cookie.indexOf('ZendDebuggerCookie=;') != -1) {
			sendAsyncMessage("zend-fs-zendDebugCookiesMissing");
			removeEventListener("DOMContentLoaded", pageLoadListener, false);
		}
	}
	addEventListener("DOMContentLoaded", pageLoadListener, false);
}

function zendFetchFrames(cookies, triggerSession) {
	var frames = content.frames;
	var frameNames = new Array();
	var framesMap = new Map();
	var topFrameSet = "Top Frameset";
	frameNames.push(topFrameSet);
	framesMap.set(topFrameSet, content);
	var i;
	for (i = 0; i < frames.length; i++) {
		var frameName = frames[i].name;
		if (frameName == null || frameName == "") {
			frameName = frames[i].location.pathname;
		}
		if (framesMap.get(frameName) == null) {
			frameNames.push(frameName);
			framesMap.set(frameName, frames[i]);
		}
	}
	// Handler for user selected frame
	var zendHandleSelectedFrame = function(message) {
		removeMessageListener("zend-cs-zendHandleSelectedFrame", zendHandleSelectedFrame);
		var selectedFrameName = message.data.selectedFrame;
		var selectedFrame = framesMap.get(selectedFrameName);
		if (selectedFrame == null) {
			return;
		}
		var doc = selectedFrame.document;
		// Set cookies for frame
		zendSetDebugCookies(doc, cookies);
		if (triggerSession) {
			// Trigger debug session by reloading page
			doc.location.reload();
		}
	};
	
	addMessageListener("zend-cs-zendHandleSelectedFrame", zendHandleSelectedFrame);
	// Let user choose a frame...
	sendAsyncMessage("zend-fs-zendSelectFrame", { frameNames : frameNames });
}

function zendCheckCookiesEnabled(doc) {
	doc.cookie = '__test__cookie__=1';
	if (doc.cookie.indexOf('__test__cookie__') != -1) {
		doc.cookie = "__test__cookie__=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
		sendAsyncMessage("zend-fs-zendCheckCookiesEnabled", { enabled : true });
	} else {
		sendAsyncMessage("zend-fs-zendCheckCookiesEnabled", { enabled : false });
	}
}

function zendSetDebugCookies(doc, cookies) {
	doc.cookie = "original_url=" + doc.location + "; expires=0; path=/";
	var i;
	for (i = 0; i < cookies.length; i++) {
		doc.cookie = cookies[i];
	}
}

addMessageListener("zend-cs-zendHandleDebugCookies", zendHandleDebugCookies);
addMessageListener("zend-cs-zendHandleLoadPage", zendHandleLoadPage);
addMessageListener("zend-cs-zendHandleCookiesEnabled", zendHandleCookiesEnabled);
addMessageListener("zend-cs-zendHandleHasDebugSessionCookies", zendHandleHasDebugSessionCookies);
