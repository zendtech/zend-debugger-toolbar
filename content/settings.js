/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Contributor(s): Zend Technologies - initial API and implementation
 ******************************************************************************/

const zendDetectedIPs = [ "127.0.0.1" ];
const zendOnDNSLookupListener = {
	onLookupComplete : function(request, record, status) {
		while (record.hasMore()) {
			zendDetectedIPs.push(record.getNextAddrAsString());
		}
	}
};

function zendGetZDEPrefs() {
	return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.zend.zdt.");
}

function zendGetZDESearch() {
	return zendGetZDEPrefs().getBoolPref("enableSearch");
}

function zendGetZDELocal() {
	return zendGetZDEPrefs().getBoolPref("debugLocalCopy");
}

function zendGetZDEFirstLine() {
	return zendGetZDEPrefs().getBoolPref("breakAtFirstLine");
}

function zendGetZDEPort() {
	return zendGetZDEPrefs().getCharPref("debugPort");
}

function zendGetZDEUseSSL() {
	return zendGetZDEPrefs().getBoolPref("useSSL");
}

function zendGetZDEAutodetect() {
	return zendGetZDEPrefs().getBoolPref("autodetectSettings");
}

function zendGetZDEAutodetectPort() {
	return zendGetZDEPrefs().getCharPref("autodetectPort");
}

function zendGetZDEDebugMode() {
	return zendGetZDEPrefs().getCharPref("debugMode");
}

function zendGetZDEEnableFrameSelect() {
	return zendGetZDEPrefs().getBoolPref("enableFrameSelect");
}

function zendGetZDEPath(ask) {
	var ideLauncherPath = zendGetZDEPrefs().getCharPref("ideLauncherPath");
	if (!ask) {
		return ideLauncherPath;
	}
	if (ideLauncherPath == null || ideLauncherPath == "") {
		ideLauncherPath = zendBrowseForZDEPath();
	}
	zendGetZDEPrefs().setCharPref("ideLauncherPath", ideLauncherPath);
	return ideLauncherPath;
}

function zendGetZDEIP(ask) {
	var ip = zendGetZDEPrefs().getCharPref("debugHost");
	if (!ask) {
		return ip;
	}
	if (ip == "" || ip == null) {
		var message = "Please enter the Zend Debugger client IP address.\n";
		if (zendDetectedIPs.length > 0) {
			message += "\nThe following IP addresses have been detected:\n\n";
			var i;
			for (i = 0; i < zendDetectedIPs.length; i++) {
				message += "\u2022 " + zendDetectedIPs[i] + "\n";
			}
			message += "\n";
		}
		while (ip == "" || ip == null) {
			ip = prompt(message, "");
		}
	}
	zendGetZDEPrefs().setCharPref("debugHost", ip);
	return ip;
}

function zendSetZDEPath() {
	document.getElementById("zendSettingsIDELauncherPath").value = zendBrowseForZDEPath();
}

function zendSetZDEDebugMode(value) {
	zendGetZDEPrefs().setCharPref("debugMode", value);
}

function zendLoadSettings() {
	document.getElementById("zendSettings").getButton("extra2").label = "Uninstall";
	document.getElementById("zendSettingsSearch").checked = zendGetZDESearch();
	document.getElementById("zendSettingsLocal").checked = zendGetZDELocal();
	document.getElementById("zendSettingsFirstLine").checked = zendGetZDEFirstLine();
	document.getElementById("zendSettingsEnableFrameSelect").checked = zendGetZDEEnableFrameSelect();
	document.getElementById("zendSettingsIDELauncherPath").value = zendGetZDEPath(false);
	document.getElementById("zendSettingsAutodetectPort").value = zendGetZDEAutodetectPort();
	document.getElementById("zendSettingsIP").value = zendGetZDEIP(false);
	document.getElementById("zendSettingsPort").value = zendGetZDEPort();
	document.getElementById("zendSettingsUseSSL").checked = zendGetZDEUseSSL();
	if (zendGetZDEAutodetect())
		document.getElementById("zendSettingsRadio").selectedIndex = 0;
	else
		document.getElementById("zendSettingsRadio").selectedIndex = 1;
	zendToggleAutoDetect();
}

function zendSaveSettings() {
	var prefs = zendGetZDEPrefs();
	prefs.setBoolPref("enableSearch", document.getElementById("zendSettingsSearch").checked);
	prefs.setBoolPref("debugLocalCopy", document.getElementById("zendSettingsLocal").checked);
	prefs.setBoolPref("breakAtFirstLine", document.getElementById("zendSettingsFirstLine").checked);
	prefs.setBoolPref("enableFrameSelect", document.getElementById("zendSettingsEnableFrameSelect").checked);
	prefs.setCharPref("ideLauncherPath", document.getElementById("zendSettingsIDELauncherPath").value);
	prefs.setBoolPref("autodetectSettings", document.getElementById("zendSettingsAutodetect").selected);
	prefs.setCharPref("autodetectPort", document.getElementById("zendSettingsAutodetectPort").value);
	prefs.setCharPref("debugHost", document.getElementById("zendSettingsIP").value);
	prefs.setCharPref("debugPort", document.getElementById("zendSettingsPort").value);
	prefs.setBoolPref("useSSL", document.getElementById("zendSettingsUseSSL").checked);
}

function zendDetectIPs() {
	var dnsService = Components.classes["@mozilla.org/network/dns-service;1"]
			.getService(Components.interfaces.nsIDNSService);
	if (dnsService != null) {
		dnsService.asyncResolve(dnsService.myHostName, dnsService.RESOLVE_DISABLE_IPV6, zendOnDNSLookupListener, null);
	}
}

function zendToggleAutoDetect() {
	try {
		var ZDE_Autodetect = document.getElementById("zendSettingsAutodetect").selected;
		document.getElementById("zendSettingsAutodetectPort").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsAutodetectPortLbl").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsAutodetectTest").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsIDELauncherLbl").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsIDELauncherPath").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsIDELauncherBtn").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsIP").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsIPLbl").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsPort").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsPortLbl").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsUseSSL").disabled = ZDE_Autodetect;
	} catch (e) {
		console.exception(e);
	}
}

function zendTestAutoDetect() {
	var ZDE_Autodetect = zendGetZDEAutodetect();
	zendGetZDEPrefs().setBoolPref("autodetectSettings", true);
	document.getElementById("zendSettingsAutodetectTest").disabled = true;
	zendFetchConnectionSettings(function(connectionProps) {
		// Show success message here, failures are handled in callback owner
		if (connectionProps.get("dbg-valid")) {
			alert("Success!\n\nDebug connection settings could be automatically detected.");
		}
		document.getElementById("zendSettingsAutodetectTest").disabled = false;
		zendGetZDEPrefs().setBoolPref("autodetectSettings", ZDE_Autodetect);
	});
}

function zendBrowseForZDEPath() {
	try {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, "Please select the IDE executable", nsIFilePicker.modeOpen);
		fp.appendFilters(nsIFilePicker.filterAll);
		var res = fp.show();
		if (res == nsIFilePicker.returnOK) {
			return fp.file.path;
		}
	} catch (e) {
		console.exception(e);
	}
	return "";
}
