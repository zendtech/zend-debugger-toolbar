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
 * Returns preference branch related to Zend Debugger Toolbar settings.
 * 
 * @returns preference branch related to Zend Debugger Toolbar settings
 */
function zendGetZDEPrefs() {
	return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.zend.zdt.");
}

/**
 * Returns 'enableSearch' preference value.
 * 
 * @returns 'enableSearch' preference value
 */
function zendGetZDESearch() {
	return zendGetZDEPrefs().getBoolPref("enableSearch");
}

/**
 * Returns 'debugLocalCopy' preference value.
 * 
 * @returns 'debugLocalCopy' preference value
 */
function zendGetZDELocal() {
	return zendGetZDEPrefs().getBoolPref("debugLocalCopy");
}

/**
 * Returns 'breakAtFirstLine' preference value.
 * 
 * @returns 'breakAtFirstLine' preference value
 */
function zendGetZDEFirstLine() {
	return zendGetZDEPrefs().getBoolPref("breakAtFirstLine");
}

/**
 * Returns 'debugPort' preference value.
 * 
 * @returns 'debugPort' preference value
 */
function zendGetZDEPort() {
	return zendGetZDEPrefs().getCharPref("debugPort");
}

/**
 * Returns 'useSSL' preference value.
 * 
 * @returns 'useSSL' preference value
 */
function zendGetZDEUseSSL() {
	return zendGetZDEPrefs().getBoolPref("useSSL");
}

/**
 * Returns 'autodetectSettings' preference value.
 * 
 * @returns 'autodetectSettings' preference value
 */
function zendGetZDEAutodetect() {
	return zendGetZDEPrefs().getBoolPref("autodetectSettings");
}

/**
 * Returns 'autodetectPort' preference value.
 * 
 * @returns 'autodetectPort' preference value
 */
function zendGetZDEAutodetectPort() {
	return zendGetZDEPrefs().getCharPref("autodetectPort");
}

/**
 * Returns 'debugMode' preference value.
 * 
 * @returns 'debugMode' preference value
 */
function zendGetZDEDebugMode() {
	return zendGetZDEPrefs().getCharPref("debugMode");
}

/**
 * Returns 'enableFrameSelect' preference value.
 * 
 * @returns 'enableFrameSelect' preference value
 */
function zendGetZDEEnableFrameSelect() {
	return zendGetZDEPrefs().getBoolPref("enableFrameSelect");
}

/**
 * Returns 'debugHost' IP preference value.
 * 
 * @param ask
 *            if <code>true</code>, a prompt message dialog for providing IP
 *            value will be shown if related preference has no value.
 * @returns debug host IP preference value
 */
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
		ip = prompt(message, "");
	}
	zendGetZDEPrefs().setCharPref("debugHost", ip);
	return ip;
}

/**
 * Saves debug mode to persistent preference. Debug mode can have one of the
 * following values: ALL, POST, NEXT or empty string if there is no active mode.
 * 
 * @param value
 */
function zendSetZDEDebugMode(value) {
	zendGetZDEPrefs().setCharPref("debugMode", value);
}

/**
 * Loads settings from persistent preferences and initializes appropriate values
 * in related 'Settings' frame fields.
 */
function zendLoadSettings() {
	document.getElementById("zendSettings").getButton("extra2").label = "Uninstall";
	document.getElementById("zendSettingsSearch").checked = zendGetZDESearch();
	document.getElementById("zendSettingsLocal").checked = zendGetZDELocal();
	document.getElementById("zendSettingsFirstLine").checked = zendGetZDEFirstLine();
	document.getElementById("zendSettingsEnableFrameSelect").checked = zendGetZDEEnableFrameSelect();
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

/**
 * Saves settings to persistent preferences with the use of appropriate values
 * in related 'Settings' frame fields.
 */
function zendSaveSettings() {
	var prefs = zendGetZDEPrefs();
	prefs.setBoolPref("enableSearch", document.getElementById("zendSettingsSearch").checked);
	prefs.setBoolPref("debugLocalCopy", document.getElementById("zendSettingsLocal").checked);
	prefs.setBoolPref("breakAtFirstLine", document.getElementById("zendSettingsFirstLine").checked);
	prefs.setBoolPref("enableFrameSelect", document.getElementById("zendSettingsEnableFrameSelect").checked);
	prefs.setBoolPref("autodetectSettings", document.getElementById("zendSettingsAutodetect").selected);
	prefs.setCharPref("autodetectPort", document.getElementById("zendSettingsAutodetectPort").value);
	prefs.setCharPref("debugHost", document.getElementById("zendSettingsIP").value);
	prefs.setCharPref("debugPort", document.getElementById("zendSettingsPort").value);
	prefs.setBoolPref("useSSL", document.getElementById("zendSettingsUseSSL").checked);
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

/**
 * Disables/enables GUI elements in 'Settings' frame, that depends on 'Manual
 * Settings'/'Auto Detect Settings' radio buttons state.
 */
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
		console.exception(e);
	}
}

/**
 * Checks if IDE debug connection settings can be automatically detected ('Test'
 * button) and shows dialog with the appropriate message.
 */
function zendTestAutoDetect() {
	if (document.getElementById("zendSettingsAutodetectTest").disabled) {
		return;
	}
	var ZDE_Autodetect = zendGetZDEAutodetect();
	var ZDE_BroadcastPort = zendGetZDEAutodetectPort();
	var prefs = zendGetZDEPrefs();
	// Save current auto-detect preferences for the test time
	prefs.setBoolPref("autodetectSettings", true);
	prefs.setCharPref("autodetectPort", document.getElementById("zendSettingsAutodetectPort").value);
	document.getElementById("zendSettingsAutodetectTest").disabled = true;
	zendFetchConnectionSettings(function(connectionProps) {
		// Show success message here, failures are handled in callback owner
		if (connectionProps.get("dbg-valid")) {
			alert("Success!\n\nDebug connection settings can be automatically detected.");
		}
		document.getElementById("zendSettingsAutodetectTest").disabled = false;
		// Bring back auto-detect preferences
		prefs.setBoolPref("autodetectSettings", ZDE_Autodetect);
		prefs.setCharPref("autodetectPort", ZDE_BroadcastPort);
	});
}
