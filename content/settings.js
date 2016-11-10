/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Contributor(s): Zend Technologies - initial API and implementation
 ******************************************************************************/

var detectedIPs = "";

var onDNSLookupListener = {
		
	onLookupComplete : function(request, record, status) {
		if (record.hasMore()) {
			detectedIPs += record.getNextAddrAsString();
		}
		while (record.hasMore()) {
			detectedIPs += ", " + record.getNextAddrAsString();
		}
	}

};

function zendGetZDEPrefs() {
	return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.zend.");
}

function zendGetZDESearch() {
	return zendGetZDEPrefs().getBoolPref("ZDE_Search");
}

function zendGetZDELocal() {
	return zendGetZDEPrefs().getBoolPref("ZDE_Local");
}

function zendGetZDEFirstLine() {
	return zendGetZDEPrefs().getBoolPref("ZDE_FirstLine");
}

function zendGetZDEPath(showPrompt) {
	return zendGetZDEPrefs().getCharPref("ZDE_Path");
}

function zendGetZDEPort() {
	return zendGetZDEPrefs().getCharPref("ZDE_Port");
}

function zendGetZDEUseSSL() {
	return zendGetZDEPrefs().getBoolPref("ZDE_UseSSL");
}

function zendGetZDEAutodetect() {
	return zendGetZDEPrefs().getBoolPref("ZDE_Autodetect");
}

function zendGetZDEAutodetectPort() {
	return zendGetZDEPrefs().getCharPref("ZDE_AutodetectPort");
}

function zendGetZDEIP(ask) {
	if (!ask) {
		return zendGetZDEPrefs().getCharPref("ZDE_IP");
	}
	var ip = null;
	while (ip == "" || ip == null) {
		ip = prompt(
				"Please enter the client IP address for Zend Debugger engine.\n",
		"");
	}
	zendGetZDEPrefs().setCharPref("ZDE_IP", ip);
	return ip;
}

function zendBrowseForZDEPath() {
	try {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, "Please select the IDE executable", nsIFilePicker.modeOpen);
		fp.appendFilters(nsIFilePicker.filterAll);
		var res = fp.show();
		if (res == nsIFilePicker.returnOK) {
			document.getElementById("zendSettingsPath").value = fp.file.path;
		}
	} catch (e) {
	}
}

function zendSaveSettings() {
	var prefs = zendGetZDEPrefs();
	prefs.setBoolPref("ZDE_Search", document.getElementById("zendSettingsSearch").checked);
	prefs.setBoolPref("ZDE_Local", document.getElementById("zendSettingsLocal").checked);
	prefs.setBoolPref("ZDE_FirstLine", document.getElementById("zendSettingsFirstLine").checked);
	prefs.setCharPref("ZDE_Path", document.getElementById("zendSettingsPath").value);
	prefs.setBoolPref("ZDE_Autodetect", document.getElementById("zendSettingsAutodetect").selected);
	prefs.setCharPref("ZDE_AutodetectPort", document.getElementById("zendSettingsAutodetectPort").value);
	prefs.setCharPref("ZDE_IP", document.getElementById("zendSettingsIP").value);
	prefs.setCharPref("ZDE_Port", document.getElementById("zendSettingsPort").value);
	prefs.setBoolPref("ZDE_UseSSL", document.getElementById("zendSettingsUseSSL").checked);
}

function zendLoadSettings() {
	console.log("1");
	document.getElementById("zendSettings").getButton("extra2").label = "Uninstall";
	document.getElementById("zendSettingsSearch").checked = zendGetZDESearch();
	console.log("2");
	document.getElementById("zendSettingsLocal").checked = zendGetZDELocal();
	console.log("3");
	document.getElementById("zendSettingsFirstLine").checked = zendGetZDEFirstLine();
	console.log("4");
	document.getElementById("zendSettingsPath").value = zendGetZDEPath();
	console.log("5");
	document.getElementById("zendSettingsAutodetectPort").value = zendGetZDEAutodetectPort();
	console.log("6");
	document.getElementById("zendSettingsIP").value = zendGetZDEIP(false);
	console.log("7");
	document.getElementById("zendSettingsPort").value = zendGetZDEPort();
	console.log("8");
	document.getElementById("zendSettingsUseSSL").checked = zendGetZDEUseSSL();
	console.log("9");
	if (zendGetZDEAutodetect())
		document.getElementById("zendSettingsRadio").selectedIndex = 0;
	else
		document.getElementById("zendSettingsRadio").selectedIndex = 1;
	console.log("10");
	zendToggleAutoDetect();
}

function zendLoadZDEIPs() {
	var dnsService = Components.classes["@mozilla.org/network/dns-service;1"]
			.getService(Components.interfaces.nsIDNSService);
	if (dnsService != null) {
		dnsService.asyncResolve(dnsService.myHostName, dnsService.RESOLVE_DISABLE_IPV6, onDNSLookupListener, null);
	}
}

function zendToggleAutoDetect() {
	try {
		var ZDE_Autodetect = document.getElementById("zendSettingsAutodetect").selected;
		document.getElementById("zendSettingsAutodetectPort").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsAutodetectPortLbl").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsAutodetectTest").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsIP").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsIPLbl").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsPort").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsPortLbl").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsUseSSL").disabled = ZDE_Autodetect;
	} catch (e) {
		alert("Zend Debugger Toolbar internal error has occured.\nPlease restart your browser.");
	}
}

function zendTestAutoDetect() {
	try {
		// save the current value in the detect port field because
		// getZdeSettings() reads from the prefs.
		var autoDetect = document.getElementById("zendSettingsAutodetect").selected;
		if (!autoDetect)
			return;
		zendGetZDEPrefs()
				.setCharPref("ZDE_AutodetectPort", document.getElementById("zendSettingsAutodetectPort").value);
		zendGetZDEPrefs().setBoolPref("ZDE_Autodetect", autoDetect);
		if (!getZdeSettings()) {
			// do nothing - alert is already displayed at getZdeSettings()...
		} else {
			/*
			 * Don't display ZDE_Port & ZDE_IP since tunneling may be turned on
			 * and they will make no sense to the user
			 */
			alert("Auto Detect test was completed successfully.");
		}
	} catch (e) {
		alert(e);
	}
}
