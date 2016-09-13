/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * 
 * Contributor(s):
 * Zend Technologies - initial API and implementation 
 *******************************************************************************/

// User defined constants
const myToolbarId = "ztb"; // <toolbar>'s id

// ZDE settings:
var ZDE_IP;
var ZDE_Port;
var ZDE_UseSSL;
var ZDE_FastFile;
var ZDE_Protocol;

var debugMode;

var httpResponseObserver = {
	observe: function(subject,topic,data){
		try {
			this.unregister();

			var http = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			var header = http.getResponseHeader("X-Zend-Debug-Server");
			if( header ){
				if( header != "OK" ) alert("IDE server error:\n"+header);
			}
		} catch(e) { }

		zendWindowOnLoad();
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

function checkCookieEnabling() {
	document.cookie = '__test__cookie__=1'
	if ( document.cookie.indexOf('__test__cookie__') != -1) {
	document.cookie = "__test__cookie__=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
		return true;
	} else {
		return false;
	}
}

function zendEnableSearch(enable){
	var display;
	if( enable ) display = "";
	else display = "none";

	try {
		document.getElementById("zendSearchTerms").style.display = display;
	} catch(e){}
	try {
		document.getElementById("zendSearchSites").style.display = display;
	} catch(e){}
	try {
		document.getElementById("zendSearchLbl").style.display = display;
	} catch(e){}
	try {
		document.getElementById("zendSearchLbl2").style.display = display;
	} catch(e){}
	try {
		document.getElementById("zendSearchSitesBtn").style.display = display;
	} catch(e){}
	try {
		document.getElementById("zendsearch").style.display = display;
	} catch(e){}
}

function zendWindowOnLoad(){
	zendEnableSearch(zendGetZDESearch());

	try{
		var DebugNextPageMI = document.getElementById("zendDebugNextPage");
		var DebugNextPageContextMI = document.getElementById("zendDebugNextPage-context");
		var DebugPOSTMI = document.getElementById("zendDebugPOST");
		var DebugAllMI = document.getElementById("zendDebugAll");

		DebugNextPageMI.setAttribute("checked","false");
		DebugNextPageContextMI.setAttribute("checked","false");
		document.getElementById("zendDebug").disabled = false;
		document.getElementById("zendProfile").disabled = false;

		if ( DebugPOSTMI.getAttribute("checked")!="true" && DebugAllMI.getAttribute("checked")!="true" ) {
			zendClearDebugCookies();
		}
	} catch(e) { alert(e); }
}

function zendDisplayCheck(){
	zendWindowOnLoad();
}

function zendLoadPage(url){
	window.content.document.location.href=url;
}

function zendClearDebugCookies(){
	if( !checkCookieEnabling() ){
		return;
	}
	
	if (window.content == null) {
		return;
	}

	window.content.document.cookie = "_bm=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_line_bp=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_file_bp=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_port=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "send_debug_header=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_host=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "start_debug=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_stop=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "start_profile=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_coverage=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "send_sess_end=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_jit=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_start_session=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "original_url=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "ZendDebuggerCookie=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "use_ssl=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_fastfile=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_protocol=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "debug_session_id=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "no_remote=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";
	window.content.document.cookie = "use_remote=; expires=Sat, 12 Feb 2000 01:00:00 UTC; path=/";

}

function zendSetDebugCookies (activeDocument) {
	zendSetCookies (activeDocument, false);
}

function zendSetProfileCookies (activeDocument, targetDocument) {
	zendSetCookies (activeDocument, true);
}

function zendSetCookies(activeDocument, isProfiling){
	if(!checkCookieEnabling()){
		alert("To use the Zend Debugger toolbar, enable cookie support in your browser.");
		return;
	}

	if (!verifyZdeRunning()) {
		return;
	}

	// try and get the IDE settings
	if(getZdeSettings()){
		// connect the observer
		httpResponseObserver.register();
	} else {
		return;
	}

	if (ZDE_IP != null && ZDE_IP != "") {
		activeDocument.cookie = "debug_host="+ZDE_IP+"; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	}

	if(ZDE_UseSSL){
		activeDocument.cookie = "use_ssl=1 ; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	}

	if(ZDE_FastFile){
		activeDocument.cookie = "debug_fastfile=1 ; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	}

	activeDocument.cookie = "debug_port="+ZDE_Port+"; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	activeDocument.cookie = "start_debug=1; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	activeDocument.cookie = "send_debug_header=1; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	activeDocument.cookie = "send_sess_end=1; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	activeDocument.cookie = "debug_jit=1; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	activeDocument.cookie = "original_url="+activeDocument.location+"; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";

	if (isProfiling) {
		activeDocument.cookie = "start_profile=1; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
		activeDocument.cookie = "debug_coverage=1; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	} else {
		if( zendGetZDEFirstLine() ) {
			activeDocument.cookie = "debug_stop=1; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
		}
		if( !zendGetZDELocal() ){
			activeDocument.cookie = "no_remote=1 ; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
		} else {
			activeDocument.cookie = "use_remote=1 ; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
		}
	}

	if(ZDE_Protocol != null){
		activeDocument.cookie = "debug_protocol=" + ZDE_Protocol + "; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	}

	activeDocument.cookie = "debug_session_id=" + (Math.floor(Math.random() * 147483648) + 2000) + "; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";

	if (debugMode == "POST") {
		activeDocument.cookie = "debug_start_session=POST; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	} else if (debugMode == "ALL") {
		activeDocument.cookie = "debug_start_session=1; expires=Mon, 12 Feb 2035 01:00:00 UTC; path=/";
	}	
}

function zendGetActiveDocument(clickedInFrame){
	try{
		var frame = document.popupNode.ownerDocument
		if (clickedInFrame && (frame != window.content.document)) {
			/* return current frame */
			return frame;
		}
	} catch(e) { /* let the user select frames - we failed...*/ }

	if (window.content.frames != null) {
		var tmp = new Array;
		var currentFrames = window.content.frames;

		if (currentFrames.length > 0) {
			window.openDialog("chrome://zend-debugger-toolbar/content/frames.xul", 'Frame Selection', 'chrome,dialog,modal', tmp);
			return tmp[0];
		}
	}
	return window.content.document;
}

function getZdeSettingString(ZDE_DetectPort){
	try {
		var url = "http://127.0.0.1:"+ZDE_DetectPort;
		var rf = new XMLHttpRequest();
		rf.open("GET", url, false);
		// to prevent leaks see Mozilla bug #206947
		rf.overrideMimeType("text/xml");
		rf.send(null);
		if (rf.status!=200)
			return false;
		return rf.responseText;

	} catch(e) { return false; }
}

function verifyZdeRunning(){
	var ZDE_DetectPort = zendGetZDEAutodetectPort();
	var settingsString = getZdeSettingString(ZDE_DetectPort);
		
	if (!settingsString) {
		if (confirm("Cannot detect running IDE.\nWould you like to launch it?")) {
			return zendRunZDE();
		}
	}
	return true;
}

function getZdeSettings(){
try{
	// If auto detect is disabled - Use the user supplied arguments - and hope he knows what he is doing
	if( !zendGetAutodetect() ){
		ZDE_IP = zendGetZDEIP(true);
		ZDE_Port = zendGetZDEPort();
		ZDE_UseSSL = zendGetUseSSL();
		ZDE_FastFile = false; // true only in autodetect
		ZDE_Protocol = null;
		return true;
	} else {
		var ZDE_DetectPort = zendGetZDEAutodetectPort();
		var settingsString = getZdeSettingString(ZDE_DetectPort);
		if( !settingsString ){
			alert("Cannot auto detect IDE settings at port: "+ZDE_DetectPort);
			return false;
		}
		else{
			ZDE_IP = null;
			ZDE_Port = "10000";
			ZDE_UseSSL = false;
			ZDE_FastFile = false;
			ZDE_Protocol = null;
			settingsArray = settingsString.split("&");
			var i;
			for (i=0; i<settingsArray.length; i++) {
				// ignore setting that are not in the format of xxx=yyy
				if( settingsArray[i].indexOf("=") == -1 ) continue;
				// currently we only detect debug_port, debug_host and use_ssl
				var setting = settingsArray[i].split("=");

				if( setting[0] == "debug_port" ) ZDE_Port=setting[1];
				else if( setting[0] == "debug_host" ) ZDE_IP=setting[1];
				else if( setting[0] == "use_ssl" ) ZDE_UseSSL=setting[1];
				else if( setting[0] == "debug_fastfile" ) ZDE_FastFile=setting[1];
				else if( setting[0] == "debug_protocol" ) ZDE_Protocol=setting[1];
			}
			if( ZDE_IP == null ) return false;

			var zendSettingsPort = document.getElementById("zendSettingsPort");
			if (zendSettingsPort) {
				zendSettingsPort.value = ZDE_Port;
			}
			var zendSettingsUseSSL = document.getElementById("zendSettingsUseSSL");
			if (zendSettingsUseSSL) {
				zendSettingsUseSSL.checked = ZDE_UseSSL;
			}
			var zendSettingsIP = document.getElementById("zendSettingsIP");
			if (zendSettingsIP) {
				zendSettingsIP.value = ZDE_IP.replace("%2C", ",");
			}

			return true;
		}
	}
} catch(e) { alert(e); }
}

function zendDebug(contextMenu){
	if (document.getElementById("zendDebug").getAttribute("disabled")=="true") {
		return;
	}

	var DebugPOSTMI = document.getElementById("zendDebugPOST");
	var DebugAllMI = document.getElementById("zendDebugAll");
	if ( DebugPOSTMI.getAttribute("checked")!="true" && DebugAllMI.getAttribute("checked")!="true" ) {
		zendClearDebugCookies();
	}
	var targetDocument = zendGetActiveDocument(contextMenu);

	if (targetDocument == null) {
		return;
	}

	// Set the cookies, connect the observer and reload the page...
	zendSetDebugCookies(targetDocument);
	document.getElementById("zendDebug").disabled = true;
	document.getElementById("zendProfile").disabled = true;
	targetDocument.location.reload();
}

function zendProfile() {
	if (document.getElementById("zendProfile").getAttribute("disabled")=="true") {
		return;
	}

	var DebugPOSTMI = document.getElementById("zendDebugPOST");
	var DebugAllMI = document.getElementById("zendDebugAll");
	if ( DebugPOSTMI.getAttribute("checked")!="true" && DebugAllMI.getAttribute("checked")!="true" ) {
		zendClearDebugCookies();
	}
	var targetDocument = zendGetActiveDocument(false);

	if (targetDocument == null) {
		return;
	}

	// Set the cookies, connect the observer and reload the page...
	zendSetProfileCookies (targetDocument);
	document.getElementById("zendDebug").disabled = true;
	document.getElementById("zendProfile").disabled = true;
	targetDocument.location.reload();
}

function zendDebugChangeStatus(ActiveMI){
	var DebugNextPageMI = document.getElementById("zendDebugNextPage");
	var DebugNextPageContextMI = document.getElementById("zendDebugNextPage-context");
	var DebugPOSTMI = document.getElementById("zendDebugPOST");
	var DebugPOSTContextMI = document.getElementById("zendDebugPOST-context");
	var DebugAllMI = document.getElementById("zendDebugAll");
	var DebugAllContextMI = document.getElementById("zendDebugAll-context");

	var status = ActiveMI.getAttribute("checked");
	// sync context menu and toolbar checkbox
	if (ActiveMI == DebugNextPageMI || ActiveMI == DebugNextPageContextMI) {
		DebugNextPageMI.setAttribute("checked", status);
		DebugNextPageContextMI.setAttribute("checked", status);
		DebugPOSTMI.setAttribute("checked", "false");
		DebugPOSTContextMI.setAttribute("checked", "false");
		DebugAllMI.setAttribute("checked", "false");
		DebugAllContextMI.setAttribute("checked", "false");
	}
	if (ActiveMI == DebugPOSTMI || ActiveMI == DebugPOSTContextMI) {
		DebugNextPageMI.setAttribute("checked", "false");
		DebugNextPageContextMI.setAttribute("checked", "false");
		DebugPOSTMI.setAttribute("checked", status);
		DebugPOSTContextMI.setAttribute("checked", status);
		DebugAllMI.setAttribute("checked", "false");
		DebugAllContextMI.setAttribute("checked", "false");
	}
	if (ActiveMI == DebugAllMI || ActiveMI == DebugAllContextMI) {
		DebugNextPageMI.setAttribute("checked", "false");
		DebugNextPageContextMI.setAttribute("checked", "false");
		DebugPOSTMI.setAttribute("checked", "false");
		DebugPOSTContextMI.setAttribute("checked", "false");
		DebugAllMI.setAttribute("checked", status);
		DebugAllContextMI.setAttribute("checked", status);
	}

	debugMode = "";
	if (status == "true") {
		if (ActiveMI.getAttribute("id") == "zendDebugPOST" || ActiveMI.getAttribute("id") == "zendDebugPOST-context") {
			debugMode = "POST"; 
		} else if (ActiveMI.getAttribute("id") == "zendDebugAll" || ActiveMI.getAttribute("id") == "zendDebugAll-context") {
			debugMode = "ALL"; 
		}
		zendSetDebugCookies(window.content.document);
	} else {
		zendClearDebugCookies();
	}
}

//add a search term to the drop down.
function zendAddSearchTerms(searchTerms){
	var zendSearchTerms = document.getElementById("zendSearchTerms");
	var i;

	var childNodes = zendSearchTerms.firstChild.childNodes;
	for (i=0; i < childNodes.length; i++) {
		if (childNodes[i].getAttribute("label") == searchTerms) {
			zendSearchTerms.removeItemAt(i);
		}
	}

	zendSearchTerms.insertItemAt(0, searchTerms);
}

function zendSearch(){
	var searchTerms = document.getElementById("zendSearchTerms").value;

	if (searchTerms.length > 0) {
		zendAddSearchTerms(searchTerms);
		var terms = searchTerms.split(" ");

		var i;
		var URL = document.getElementById("zendSearchSites").selectedItem.getAttribute("data");;

		for (i=0; i<terms.length; i++) {
			URL += encodeURIComponent(terms[i]);
			if (i != terms.length-1) {
				URL += "+";
			}
		}
		zendLoadPage(URL);
	}
}

function zendAbout(){
	window.openDialog("chrome://zend-debugger-toolbar/content/about.xul", "zend-about-dialog", "centerscreen,chrome,modal");
}

function zendOpenSettings(){
	window.openDialog("chrome://zend-debugger-toolbar/content/settings.xul", "Settings", 'chrome,dialog,modal,titlebar');

	zendWindowOnLoad();
}

function setRightClickMenu(){
	// if the page contains frames -> show "debug this frame"
	if ( document.popupNode.ownerDocument != window.content.document )
		document.getElementById("zendDebugFrame-context").hidden = false;
	else
		document.getElementById("zendDebugFrame-context").hidden = true;
}

function zendToggleShow(){
	var hide = !document.getElementById("zendShow-context").getAttribute("checked");
	document.getElementById(myToolbarId).setAttribute("hidden",hide);
}

function zendRunZDE(){
	var cmd = zendGetZDEPath();
	try{
		var targetFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
		targetFile.initWithPath (cmd);
		var process = Components.classes['@mozilla.org/process/util;1'].getService(Components.interfaces.nsIProcess);
		process.init (targetFile);
		process.run (false, [], 0, {});
		return true;
	} catch(e) {
		alert (
			"Failed to launch the IDE!\n" +
			"Please check whether the path \"" + cmd + "\" is correct.\n" +
			"To configure it, go to \"Extra Stuff->Settings\".\n" + e.message
		);
	}
	return false;
}
