/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Contributor(s): Zend Technologies - initial API and implementation
 ******************************************************************************/

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
 * @returns debug host IP preference value
 */
function zendGetZDEIP() {
	return zendGetZDEPrefs().getCharPref("debugHost");
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
	document.getElementById("zendSettingsIP").value = zendGetZDEIP();
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
	document.getElementById("zendSettingsAutodetectTest").disabled = true;
	var broadcastPort = document.getElementById("zendSettingsAutodetectPort").value;
	var url = "http://127.0.0.1:" + broadcastPort;
	var stringsBundle = document.getElementById("zdt-settings-messages");
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			document.getElementById("zendSettingsAutodetectTest").disabled = false;
			if (this.status != 200) {
				alert(stringsBundle.getString('messageConnectionTestFailure') + ' ' + broadcastPort);
				return;
			}
			if (this.responseText != null) {
				var response = this.responseText;
				if (response.includes("debug_port") && response.includes("debug_host")) {
					alert(stringsBundle.getString('messageConnectionTestSuccess') + ' ' + broadcastPort);
					return;
				}
			}
			alert(stringsBundle.getString('messageConnectionTestFailure') + ' ' + broadcastPort);
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}
