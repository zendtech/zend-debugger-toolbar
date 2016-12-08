/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Contributor(s): Zend Technologies - initial API and implementation
 ******************************************************************************/

/**
 * Array with host IPs.
 */
var zendDetectedIPs = [ "127.0.0.1" ];
/**
 * DNS lookup listener.
 */
var zendOnDNSLookupListener = {
	onLookupComplete : function(request, record, status) {
		while (record.hasMore()) {
			zendDetectedIPs.push(record.getNextAddrAsString());
		}
	}
};

/**
 * HTTP response observer responsible for reporting Zend debugger client errors.
 */
var zendHTTPResponseObserver = {
	observe: function(subject, topic, data) {
		try {
			this.unregister();
			var http = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			var header = http.getResponseHeader("X-Zend-Debug-Server");
			if (header) {
				if (header != "OK") {
					var stringsBundle = document.getElementById("zdt-toolbar-messages");
					alert(stringsBundle.getString('messageIDEClientError') + header);
				}
			}
		} catch(e) {
			// ignore
		}
	},
	get observerService() {
		return Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	},
	register: function(){
		this.observerService.addObserver(this, "http-on-examine-response", false);
	},
	unregister: function(){
		this.observerService.removeObserver(this, "http-on-examine-response");
	}
};

// Initialize defaults, load frames script, etc.
(function() {
	zendSetZDEDebugMode("");
	zendDetectIPs();
	var windowMM = window.messageManager;
	windowMM.loadFrameScript("chrome://zend-debugger-toolbar/content/handlers.js", true);
})();

/**
 * Checks if cookies are enabled in the browser.
 */
function zendCheckCookiesEnabled() {
	// Send asynchronous call to 'content'
	var browserMM = gBrowser.selectedBrowser.messageManager;
	var messageListener = function(message) {
		if (!message.data.enabled) {
			var stringsBundle = document.getElementById("zdt-toolbar-messages");
			alert(stringsBundle.getString('messageEnableCookiesSupport'));
		}
		browserMM.removeMessageListener("zend-fs-zendCheckCookiesEnabled", messageListener);
	};
	browserMM.addMessageListener("zend-fs-zendCheckCookiesEnabled", messageListener);
	browserMM.sendAsyncMessage("zend-cs-zendHandleCookiesEnabled", {});
}

/**
 * Clears all possible debug cookies.
 */
function zendClearDebugCookies() {
	var cookies = new Array();
	var cookieSuffix = "; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	cookies.push("_bm=" + cookieSuffix);
	cookies.push("debug_line_bp=" + cookieSuffix);
	cookies.push("debug_file_bp=" + cookieSuffix);
	cookies.push("debug_port=" + cookieSuffix);
	cookies.push("send_debug_header=" + cookieSuffix);
	cookies.push("debug_host=" + cookieSuffix);
	cookies.push("start_debug=" + cookieSuffix);
	cookies.push("debug_stop=" + cookieSuffix);
	cookies.push("start_profile=" + cookieSuffix);
	cookies.push("debug_coverage=" + cookieSuffix);
	cookies.push("send_sess_end=" + cookieSuffix);
	cookies.push("debug_jit=" + cookieSuffix);
	cookies.push("debug_start_session=" + cookieSuffix);
	cookies.push("original_url=" + cookieSuffix);
	cookies.push("ZendDebuggerCookie=" + cookieSuffix);
	cookies.push("use_ssl=" + cookieSuffix);
	cookies.push("debug_fastfile=" + cookieSuffix);
	cookies.push("debug_protocol=" + cookieSuffix);
	cookies.push("debug_session_id=" + cookieSuffix);
	cookies.push("no_remote=" + cookieSuffix);
	cookies.push("use_remote=" + cookieSuffix);
	// Broadcast asynchronous call to 'content' process
	var windowMM = window.messageManager;
	windowMM.broadcastAsyncMessage("zend-cs-zendHandleDebugCookies", {
		cookies : cookies,
		reloadPage : false
	});
}

/**
 * Sets debug cookies.
 * 
 * @param isProfiling
 *            if <code>true</code> profile session cookies will be set, if
 *            <code>false</code> then debug session cookies will be set
 * @param triggerSession
 *            if <code>true</code> then page will be reloaded to trigger
 *            debug/profile session
 * @param connectionProps
 *            connection properties to create the appropriate cookies data from
 */
function zendSetDebugCookies(isProfiling, triggerSession, connectionProps) {
	zendCheckCookiesEnabled();
	var cookies = new Array();
	var cookieSuffix = "; expires=0; path=/";
	// Connect the response observer
	zendHTTPResponseObserver.register();
	// Set cookies array
	var dbgIP = connectionProps.get("dbg-host");
	var dbgPort = connectionProps.get("dbg-port");
	var dbgUseSSL = connectionProps.get("dbg-use-ssl");
	var dbgFastFile = connectionProps.get("dbg-fast-file");
	var dbgProtocol = connectionProps.get("dbg-protocol");
	// Set cookies that are common for profile and debug session
	if (dbgIP != null && dbgIP != "")
		cookies.push("debug_host=" + dbgIP + cookieSuffix);
	if (dbgUseSSL)
		cookies.push("use_ssl=1" + cookieSuffix);
	if (dbgFastFile)
		cookies.push("debug_fastfile=1" + cookieSuffix);
	if (dbgProtocol != null)
		cookies.push("debug_protocol=" + dbgProtocol + cookieSuffix);
	if (zendGetZDEDebugMode() == "POST")
		cookies.push("debug_start_session=POST" + cookieSuffix);
	else if (zendGetZDEDebugMode() == "ALL")
		cookies.push("debug_start_session=1" + cookieSuffix);
	cookies.push("debug_port=" + dbgPort + cookieSuffix);
	cookies.push("start_debug=1" + cookieSuffix);
	cookies.push("send_debug_header=1" + cookieSuffix);
	cookies.push("send_sess_end=1" + cookieSuffix);
	cookies.push("debug_jit=1" + cookieSuffix);
	cookies.push("debug_session_id=" + (Math.floor(Math.random() * 147483648) + 2000) + cookieSuffix);
	// Set cookies specific only for profile or debug session
	if (isProfiling) {
		cookies.push("start_profile=1" + cookieSuffix);
		cookies.push("debug_coverage=1" + cookieSuffix);
	} else {
		if (zendGetZDEFirstLine())
			cookies.push("debug_stop=1" + cookieSuffix);
		if (!zendGetZDELocal())
			cookies.push("no_remote=1" + cookieSuffix);
		else
			cookies.push("use_remote=1" + cookieSuffix);
	}
	var selectFrame = zendGetZDEEnableFrameSelect();
	// Send asynchronous call to 'content' process
	var browserMM = gBrowser.selectedBrowser.messageManager;
	browserMM.addMessageListener("zend-fs-zendSelectFrame", zendSelectFrame);
	browserMM.sendAsyncMessage("zend-cs-zendHandleDebugCookies", {
		cookies : cookies,
		triggerSession : triggerSession,
		selectFrame : selectFrame
	});
}

/**
 * 'Debug' action handler.
 */
function zendDebug() {
	if (document.getElementById("zendDebug").disabled) {
		return;
	}
	zendToggleDebugAndProfile(true);
	zendFetchConnectionSettings(function(connectionProps) {
		if (connectionProps.get("dbg-valid")) {
			zendSetDebugCookies(false, true, connectionProps);
		}
		zendToggleDebugAndProfile(false);
	});
}

/**
 * 'Profile' action handler.
 */
function zendProfile() {
	if (document.getElementById("zendProfile").disabled) {
		return;
	}
	zendClearDebugActions();
	zendToggleDebugAndProfile(true);
	zendFetchConnectionSettings(function(connectionProps) {
		if (connectionProps.get("dbg-valid")) {
			zendSetDebugCookies(true, true, connectionProps);
		}
		zendToggleDebugAndProfile(false);
	});
}

/**
 * Disables/enables buttons for starting debug/profile session.
 * 
 * @param disable
 *            if <code>true</code> then buttons will be disabled
 */
function zendToggleDebugAndProfile(disable) {
	document.getElementById("zendDebug").disabled = disable;
	document.getElementById("zendDebugDropdown").disabled = disable;
	document.getElementById("zendProfile").disabled = disable;
}

/**
 * Asks user to choose the frame that should be debugged/profiled.
 * 
 * @param message
 *            message data with the list of available frames
 */
function zendSelectFrame(message) {
	var frameNames = message.data.frameNames;
	var result = new Array();
	var selectedFrame;
	if (frameNames.length > 0) {
		window.openDialog("chrome://zend-debugger-toolbar/content/frames.xul", 'Frame Selection',
				'chrome, dialog, modal', frameNames, result);
		selectedFrame = result[0];
	}
	var browserMM = gBrowser.selectedBrowser.messageManager;
	browserMM.removeMessageListener("zend-fs-zendSelectFrame", zendSelectFrame);
	// Send asynchronous call to 'content' process
	browserMM.sendAsyncMessage("zend-cs-zendHandleSelectedFrame", {
		selectedFrame : selectedFrame
	});
}

/**
 * Sets up debug mode menu elements status and presentation with the use of
 * provided element that is marked as currently active.
 * 
 * @param ActiveMI
 *            active menu element
 */
function zendDebugChangeStatus(ActiveMI) {
	var debugNextPageMI = document.getElementById("zendDebugNextPage");
	var debugNextPageContextMI = document.getElementById("zendDebugNextPage-context");
	var debugPOSTMI = document.getElementById("zendDebugPOST");
	var debugPOSTContextMI = document.getElementById("zendDebugPOST-context");
	var debugAllMI = document.getElementById("zendDebugAll");
	var debugAllContextMI = document.getElementById("zendDebugAll-context");
	var checked = ActiveMI.getAttribute("checked");
	if (ActiveMI == debugNextPageMI || ActiveMI == debugNextPageContextMI) {
		debugNextPageMI.setAttribute("checked", checked);
		debugNextPageContextMI.setAttribute("checked", checked);
		debugPOSTMI.setAttribute("checked", "false");
		debugPOSTContextMI.setAttribute("checked", "false");
		debugAllMI.setAttribute("checked", "false");
		debugAllContextMI.setAttribute("checked", "false");
	}
	if (ActiveMI == debugPOSTMI || ActiveMI == debugPOSTContextMI) {
		debugNextPageMI.setAttribute("checked", "false");
		debugNextPageContextMI.setAttribute("checked", "false");
		debugPOSTMI.setAttribute("checked", checked);
		debugPOSTContextMI.setAttribute("checked", checked);
		debugAllMI.setAttribute("checked", "false");
		debugAllContextMI.setAttribute("checked", "false");
	}
	if (ActiveMI == debugAllMI || ActiveMI == debugAllContextMI) {
		debugNextPageMI.setAttribute("checked", "false");
		debugNextPageContextMI.setAttribute("checked", "false");
		debugPOSTMI.setAttribute("checked", "false");
		debugPOSTContextMI.setAttribute("checked", "false");
		debugAllMI.setAttribute("checked", checked);
		debugAllContextMI.setAttribute("checked", checked);
	}
	var ZendDebugDropdown = document.getElementById("zendDebugDropdown");
	var imagesPath = "chrome://zend-debugger-toolbar/content/images/";
	zendClearDebugCookies();
	if (checked == "true") {
		if (ActiveMI.getAttribute("id") == "zendDebugPOST" || ActiveMI.getAttribute("id") == "zendDebugPOST-context") {
			zendSetZDEDebugMode("POST");
			ZendDebugDropdown.setAttribute("image", imagesPath + "debugmenu_post.gif");
		} else if (ActiveMI.getAttribute("id") == "zendDebugAll"
				|| ActiveMI.getAttribute("id") == "zendDebugAll-context") {
			zendSetZDEDebugMode("ALL");
			ZendDebugDropdown.setAttribute("image", imagesPath + "debugmenu_all.gif");
		} else if (ActiveMI.getAttribute("id") == "zendDebugNextPage"
				|| ActiveMI.getAttribute("id") == "zendDebugNextPage-context") {
			zendSetZDEDebugMode("NEXT");
			ZendDebugDropdown.setAttribute("image", imagesPath + "debugmenu_next.gif");
		}
		zendFetchConnectionSettings(zendSetDebugCookies, false, false);
		zendDebugStatusChanged();
	} else {
		zendSetZDEDebugMode("");
		ZendDebugDropdown.setAttribute("image", imagesPath + "debugmenu.gif");
	}
}

/**
 * Notifies message listeners about debug mode change.
 */
function zendDebugStatusChanged() {
	var windowMM = window.messageManager;
	var zendDebugCookiesMissing = function(message) {
		windowMM.removeMessageListener("zend-fs-zendDebugCookiesMissing", zendDebugCookiesMissing);
		zendClearDebugActions();
	};
	windowMM.addMessageListener("zend-fs-zendDebugCookiesMissing", zendDebugCookiesMissing);
	windowMM.broadcastAsyncMessage("zend-cs-zendHandleHasDebugSessionCookies", {});
}

/**
 * Clears debug mode actions state.
 */
function zendClearDebugActions() {
	var debugNextPageMI = document.getElementById("zendDebugNextPage");
	var debugPOSTMI = document.getElementById("zendDebugPOST");
	var debugAllMI = document.getElementById("zendDebugAll");
	debugNextPageMI.setAttribute("checked", "false");
	zendDebugChangeStatus(debugNextPageMI);
	debugPOSTMI.setAttribute("checked", "false");
	zendDebugChangeStatus(debugPOSTMI);
	debugAllMI.setAttribute("checked", "false");
	zendDebugChangeStatus(debugAllMI);
}

/**
 * Adds search terms.
 * 
 * @param searchTerms
 *            search terms to be added
 */
function zendAddSearchTerms(searchTerms) {
	var zendSearchTerms = document.getElementById("zendSearchTerms");
	var i;
	var childNodes = zendSearchTerms.firstChild.childNodes;
	for (i = 0; i < childNodes.length; i++) {
		if (childNodes[i].getAttribute("label") == searchTerms) {
			zendSearchTerms.removeItemAt(i);
		}
	}
	zendSearchTerms.insertItemAt(0, searchTerms);
}

/**
 * Performs search with the use of provide search terms.
 */
function zendSearch() {
	var searchTerms = document.getElementById("zendSearchTerms").value;
	if (searchTerms.length > 0) {
		zendAddSearchTerms(searchTerms);
		var terms = searchTerms.split(" ");
		var i;
		var termURL = document.getElementById("zendSearchSites").selectedItem.getAttribute("data");
		for (i = 0; i < terms.length; i++) {
			termURL += encodeURIComponent(terms[i]);
			if (i != terms.length - 1) {
				termURL += "+";
			}
		}
		zendLoadPage(termURL);
	}
}

/**
 * Opens provided page URL.
 * 
 * @param pageURL
 *            page URL to be opened
 */
function zendLoadPage(pageURL) {
	// Send asynchronous call to 'content'
	var browserMM = gBrowser.selectedBrowser.messageManager;
	browserMM.sendAsyncMessage("zend-cs-zendHandleLoadPage", {
		pageURL : pageURL
	});
}

/**
 * Opens 'About' dialog.
 */
function zendAbout() {
	window.openDialog("chrome://zend-debugger-toolbar/content/about.xul", "zend-about-dialog",
			"centerscreen, chrome, modal");
}

/**
 * Opens 'Settings' dialog.
 */
function zendOpenSettings() {
	window.openDialog("chrome://zend-debugger-toolbar/content/settings.xul", "Settings",
			'chrome, dialog, modal, titlebar');
	var hideSearch = "true";
	if (zendGetZDESearch())
		hideSearch = "false";
	try {
		document.getElementById("zendSearchBox").setAttribute("hidden", hideSearch);
	} catch (e) {
	}
}

/**
 * Hides/shows Zend debugger toolbar.
 */
function zendToggleShow() {
	var hide = !document.getElementById("zendShow-context").getAttribute("checked");
	document.getElementById("zendDebuggerToolbar").setAttribute("hidden", hide);
}

/**
 * Detects host IP(s) with the use of DNS service.
 */
function zendDetectIPs() {
	var dnsService = Components.classes["@mozilla.org/network/dns-service;1"]
			.getService(Components.interfaces.nsIDNSService);
	if (dnsService != null) {
		dnsService.asyncResolve(dnsService.myHostName, dnsService.RESOLVE_DISABLE_IPV6, zendOnDNSLookupListener, null);
	}
}

function zendGetClientIP() {
	var ip = zendGetZDEIP();
	if (ip == "" || ip == null) {
		var stringsBundle = document.getElementById("zdt-toolbar-messages");
		var message = stringsBundle.getString('messageEnterClientIP') + "\n";
		if (zendDetectedIPs.length > 0) {
			message += "\n" + stringsBundle.getString('messageFollowingIPsDetected') + "\n\n";
			var i;
			for (i = 0; i < zendDetectedIPs.length; i++) {
				message += "\u2022 " + zendDetectedIPs[i] + "\n";
			}
			message += "\n";
		}
		ip = prompt(message, "");
		zendGetZDEPrefs().setCharPref("debugHost", ip);
	}
	return ip;
}

/**
 * Retrieves debug connection settings and triggers provided callback function.
 * 
 * @param callback
 *            callback function
 */
function zendFetchConnectionSettings(callback) {
	var callbackArgs = Array.prototype.slice.call(arguments, 1);
	var connectionProps = new Map();
	// Use user specified settings
	if (!zendGetZDEAutodetect()) {
		connectionProps.set("dbg-host", zendGetClientIP());
		connectionProps.set("dbg-port", zendGetZDEPort());
		connectionProps.set("dbg-use-ssl", zendGetZDEUseSSL());
		connectionProps.set("dbg-fast-file", false);
		connectionProps.set("dbg-protocol", null);
		connectionProps.set("dbg-valid", true);
		callbackArgs.push(connectionProps)
		// Trigger callback immediately and return
		callback.apply(null, callbackArgs);
		return;
	}
	// Use settings auto-detection
	var url = "http://127.0.0.1:" + zendGetZDEAutodetectPort();
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			var stringsBundle = document.getElementById("zdt-toolbar-messages");
			if (this.status != 200) {
				alert(stringsBundle.getString('messageCannotDetectIDESettings') 
						+ ' ' + zendGetZDEAutodetectPort());
				connectionProps.set("dbg-valid", false);
				callbackArgs.push(connectionProps);
				// Trigger callback
				callback.apply(null, callbackArgs);
				return;
			}
			var settingsArray = this.responseText.split("&");
			var i;
			for (i = 0; i < settingsArray.length; i++) {
				// Ignore setting that are not in the format of 'key=value'
				if (settingsArray[i].indexOf("=") == -1)
					continue;
				// Detect debug_port, debug_host, use_ssl and debug_fastfile
				// settings
				var setting = settingsArray[i].split("=");
				if (setting[0] == "debug_port")
					connectionProps.set("dbg-port", setting[1]);
				else if (setting[0] == "debug_host")
					connectionProps.set("dbg-host", setting[1]);
				else if (setting[0] == "use_ssl")
					connectionProps.set("dbg-use-ssl", setting[1]);
				else if (setting[0] == "debug_fastfile")
					connectionProps.set("dbg-fast-file", setting[1]);
				else if (setting[0] == "debug_protocol")
					connectionProps.set("dbg-protocol", setting[1]);
			}
			if (connectionProps.get("dbg-host") == null || connectionProps.get("dbg-port") == null) {
				alert(stringsBundle.getString('messageCannotDetectIDESettings') 
						+ ' ' + zendGetZDEAutodetectPort());
				connectionProps.set("dbg-valid", false);
			} else {
				connectionProps.set("dbg-valid", true);
			}
			callbackArgs.push(connectionProps)
			// Trigger callback
			callback.apply(null, callbackArgs);
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}