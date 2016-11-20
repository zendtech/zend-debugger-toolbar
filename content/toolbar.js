/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Contributor(s): Zend Technologies - initial API and implementation
 ******************************************************************************/

(function() {
	zendSetZDEDebugMode("");
	zendDetectIPs();
	var windowMM = window.messageManager;
	windowMM.loadFrameScript("chrome://zend-debugger-toolbar/content/handlers.js", true);
})();

const zendHTTPResponseObserver = {
	observe: function(subject, topic, data) {
		try {
			this.unregister();
			var http = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			var header = http.getResponseHeader("X-Zend-Debug-Server");
			if (header) {
				if (header != "OK") alert("IDE client error:\n" + header);
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
}

function zendCheckCookiesEnabled() {
	// Send asynchronous call to 'content'
	var browserMM = gBrowser.selectedBrowser.messageManager;
	var messageListener = function(message) {
		if (!message.data.enabled) {
			alert("To use the Zend Debugger toolbar, enable cookie support in your browser.");
		}
		browserMM.removeMessageListener("zend-fs-zendCheckCookiesEnabled", messageListener);
	};
	browserMM.addMessageListener("zend-fs-zendCheckCookiesEnabled", messageListener);
	browserMM.sendAsyncMessage("zend-cs-zendHandleCookiesEnabled");
}

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

function zendDebug() {
	zendToggleDebugAndProfile(true);
	zendFetchConnectionSettings(function(connectionProps) {
		if (connectionProps.get("dbg-valid")) {
			zendSetDebugCookies(false, true, connectionProps);
		}
		zendToggleDebugAndProfile(false);
	});
}

function zendProfile() {
	zendClearDebugActions();
	zendToggleDebugAndProfile(true);
	zendFetchConnectionSettings(function(connectionProps) {
		if (connectionProps.get("dbg-valid")) {
			zendSetDebugCookies(true, true, connectionProps);
		}
		zendToggleDebugAndProfile(false);
	});
}

function zendToggleDebugAndProfile(disable) {
	document.getElementById("zendDebug").disabled = disable;
	document.getElementById("zendDebugDropdown").disabled = disable;
	document.getElementById("zendProfile").disabled = disable;
}

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

function zendDebugStatusChanged() {
	var windowMM = window.messageManager;
	var zendDebugCookiesMissing = function(message) {
		windowMM.removeMessageListener("zend-fs-zendDebugCookiesMissing", zendDebugCookiesMissing);
		zendClearDebugActions();
	};
	windowMM.addMessageListener("zend-fs-zendDebugCookiesMissing", zendDebugCookiesMissing);
	windowMM.broadcastAsyncMessage("zend-cs-zendHandleHasDebugSessionCookies");
}

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

function zendToggleSearch() {
	var hidden = "true";
	if (zendGetZDESearch())
		hidden = "false";
	try {
		document.getElementById("zendSearchBox").setAttribute("hidden", hidden);
	} catch (e) {
	}
}

function zendLoadPage(pageURL) {
	// Send asynchronous call to 'content'
	var browserMM = gBrowser.selectedBrowser.messageManager;
	browserMM.sendAsyncMessage("zend-cs-zendHandleLoadPage", {
		pageURL : pageURL
	});
}

function zendAbout() {
	window.openDialog("chrome://zend-debugger-toolbar/content/about.xul", "zend-about-dialog",
			"centerscreen, chrome, modal");
}

function zendOpenSettings() {
	window.openDialog("chrome://zend-debugger-toolbar/content/settings.xul", "Settings",
			'chrome, dialog, modal, titlebar');
	zendToggleSearch();
}

function zendToggleShow() {
	var hide = !document.getElementById("zendShow-context").getAttribute("checked");
	document.getElementById("zendDebuggerToolbar").setAttribute("hidden", hide);
}

function zendRunIDE() {
	var launcherPath = zendGetZDEPath(true);
	try {
		var targetFile = Components.classes['@mozilla.org/file/local;1']
				.createInstance(Components.interfaces.nsILocalFile);
		targetFile.initWithPath(launcherPath);
		var process = Components.classes['@mozilla.org/process/util;1']
				.createInstance(Components.interfaces.nsIProcess);
		process.init(targetFile);
		process.run(false, [], 0, {});
	} catch (e) {
		alert("Failed to launch the IDE!\n" + "Please check whether the path \"" + launcherPath + "\" is correct.\n"
				+ "To configure it, go to \"Extra Stuff->Settings\".\n");
	}
}

function zendFetchConnectionSettings(callback) {
	var callbackArgs = Array.prototype.slice.call(arguments, 1);
	var connectionProps = new Map();
	// Use user specified settings
	if (!zendGetZDEAutodetect()) {
		connectionProps.set("dbg-host", zendGetZDEIP(true));
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
			if (this.status != 200) {
				if (confirm("Could not automatically detect debug connection settings at port: "
						+ zendGetZDEAutodetectPort()
						+ "\n\nIDE is not running or does not support debug connection settings auto-detection.\n"
						+ "Would you like to launch the IDE?")) {
					zendRunIDE();
				}
				connectionProps.set("dbg-valid", false);
				callbackArgs.push(connectionProps)
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
				// Detect debug_port, debug_host, use_ssl and debug_fastfile settings
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
				alert("Could not automatically detect debug connection settings at port: " + zendGetZDEAutodetectPort());
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