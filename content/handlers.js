/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Contributor(s): Zend Technologies - initial API and implementation
 ******************************************************************************/

/**
 * Handles message responsible for setting debug cookies.
 * 
 * @param message
 *            message data
 */
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

/**
 * Handles message responsible for loading page via provided URL.
 * 
 * @param message
 *            message data
 */
function zendHandleLoadPage(message) {
	var pageURL = message.data.pageURL;
	content.document.location.href = pageURL;
}

/**
 * Handles message responsible for checking if cookies are enabled.
 * 
 * @param message
 *            message data
 */
function zendHandleCookiesEnabled(message) {
	var doc = content.document;
	zendCheckCookiesEnabled(doc);
}

/**
 * Handles message responsible for checking if debug cookies are available.
 * 
 * @param message
 *            message data
 */
function zendHandleHasDebugSessionCookies(message) {
	var pageLoadListener = function(event) {
		var doc = event.originalTarget;
		var win = doc.defaultView;
		if (doc.nodeName != "#document")
			return;
		if (win != win.top)
			return;
		if (win.frameElement)
			return;
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

/**
 * Retrieves frames available in current tab and gives user possibility to
 * choose the frame that should be debugged.
 * 
 * @param cookies
 *            debug cookies to be set
 * @param triggerSession
 *            if <code>true</code> page will be reloaded causing debug session
 *            to be triggered
 */
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
		if (frameName == null || frameName.trim() == "") {
			frameName = frames[i].location.pathname;
		}
		if (frameName == null || frameName.trim() == "") {
			continue;
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
	sendAsyncMessage("zend-fs-zendSelectFrame", {
		frameNames : frameNames
	});
}

/**
 * Checks if cookies are enabled.
 * 
 * @param doc
 *            current document
 */
function zendCheckCookiesEnabled(doc) {
	doc.cookie = '__test__cookie__=1';
	if (doc.cookie.indexOf('__test__cookie__') != -1) {
		doc.cookie = "__test__cookie__=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
		sendAsyncMessage("zend-fs-zendCheckCookiesEnabled", {
			enabled : true
		});
	} else {
		sendAsyncMessage("zend-fs-zendCheckCookiesEnabled", {
			enabled : false
		});
	}
}

/**
 * Sets debug cookies for given document.
 * 
 * @param doc
 *            document which debug cookies should be set for
 * @param cookies
 *            debug cookies array
 */
function zendSetDebugCookies(doc, cookies) {
	doc.cookie = "original_url=" + doc.location + "; expires=0; path=/";
	var i;
	for (i = 0; i < cookies.length; i++) {
		doc.cookie = cookies[i];
	}
}

// Message listeners
addMessageListener("zend-cs-zendHandleDebugCookies", zendHandleDebugCookies);
addMessageListener("zend-cs-zendHandleLoadPage", zendHandleLoadPage);
addMessageListener("zend-cs-zendHandleCookiesEnabled", zendHandleCookiesEnabled);
addMessageListener("zend-cs-zendHandleHasDebugSessionCookies", zendHandleHasDebugSessionCookies);
