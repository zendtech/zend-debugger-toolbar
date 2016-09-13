/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * 
 * Contributor(s):
 * Zend Technologies - initial API and implementation 
 *******************************************************************************/

function zendGetZDESearch(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	try {
		return prefs.getBoolPref("ZDE_Search");
	} catch(e) {
		return true;
	}
}

function zendGetZDELocal(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	try {
		return prefs.getBoolPref("ZDE_Local");
	} catch(e) {
		return true;
	}
}

function zendGetZDEFirstLine(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	try {
		return prefs.getBoolPref("ZDE_FirstLine");
	} catch(e) {
		return true;
	}
}

function zendBrowseForZDEPath() {
	try {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init (window, "Please select the IDE executable", nsIFilePicker.modeOpen);
		fp.appendFilters (nsIFilePicker.filterAll);

		var res = fp.show();
		if (res == nsIFilePicker.returnOK) {
			document.getElementById("zendSettingsPath").value = fp.file.path;
		}
	} catch(e) { }
}

function zendGetZDEPath(showPrompt){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	var ZDE_Path = null;

	try {
		ZDE_Path = prefs.getCharPref("ZDE_Path");
	} catch(e) {
	}

	if (ZDE_Path == null) {
		return "";
	}

	return ZDE_Path;
}

function zendGetZDEAutodetectPort(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	var ZDE_AutodetectPort = null;

	try {
		ZDE_AutodetectPort = prefs.getCharPref("ZDE_AutodetectPort");
	} catch(e) {
	}

	if (ZDE_AutodetectPort == null) {
		ZDE_AutodetectPort = "20080";
	}

	return ZDE_AutodetectPort;
}

function zendGetZDEIP(showPrompt){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	var ip = "";
	try {
		ip = prefs.getCharPref("ZDE_IP");
	} catch(e) {}

	if (ip == "" || ip == null) {
		var dnsService = Components.classes["@mozilla.org/network/dns-service;1"].getService(Components.interfaces.nsIDNSService);
		if (dnsService != null) {
			var res = dnsService.resolve(dnsService.myHostName, 0);
			if (res.hasMore()) {
				ip = res.getNextAddrAsString();
			}
		}
	}
	
	// if showPrompt is true - ask the user for IP untill he gives a reasonable answer
	while( showPrompt && (ip == "" || ip == null) ){
			ip = prompt("Please enter the IP address of the computer running ZDE.\n\n**You can change this setting later from the 'settings' dialog.","");
	}
	prefs.setCharPref("ZDE_IP",ip);

	return ip;
}

function zendGetZDEPort(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	var ZDE_Port = null;

	try {
		ZDE_Port = prefs.getCharPref("ZDE_Port");
	} catch(e) {
	}

	if (ZDE_Port == null || ZDE_Port == "") {
		ZDE_Port = "10000";
	}

	return ZDE_Port;
}

function zendGetUseSSL(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	try {
		return prefs.getBoolPref("ZDE_UseSSL");
	} catch(e) {
		return false;
	}
}

function zendGetAutodetect(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

	try {
		return prefs.getBoolPref("ZDE_Autodetect");
	} catch(e) {
		return true;
	}
}

function zendSaveSettings(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");
	
	// General
	prefs.setBoolPref("ZDE_Search",         document.getElementById("zendSettingsSearch").checked );
	// Debug Session Settings
	prefs.setBoolPref("ZDE_Local",          document.getElementById("zendSettingsLocal" ).checked );
	prefs.setBoolPref("ZDE_FirstLine",          document.getElementById("zendSettingsFirstLine" ).checked );
	// IDE Settings
	prefs.setCharPref("ZDE_Path",           document.getElementById("zendSettingsPath"  ).value   );
	prefs.setBoolPref("ZDE_Autodetect",     document.getElementById("zendSettingsAutodetect").selected );
	prefs.setCharPref("ZDE_AutodetectPort", document.getElementById("zendSettingsAutodetectPort").value );	
	prefs.setCharPref("ZDE_IP",             document.getElementById("zendSettingsIP"    ).value   );
	prefs.setCharPref("ZDE_Port",           document.getElementById("zendSettingsPort"  ).value   );
	prefs.setBoolPref("ZDE_UseSSL",         document.getElementById("zendSettingsUseSSL").checked );
}


function zendLoadSettings()
{
	getZdeSettings();

	document.getElementById("zendSettings").getButton("extra2").label = "Uninstall";

	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");
	
	// General
	document.getElementById("zendSettingsSearch"        ).checked = zendGetZDESearch();
	// Debug Session Settings
	document.getElementById("zendSettingsLocal"         ).checked = zendGetZDELocal();
	document.getElementById("zendSettingsFirstLine"         ).checked = zendGetZDEFirstLine();
	// IDE Settings
	document.getElementById("zendSettingsPath"          ).value   = zendGetZDEPath();
	document.getElementById("zendSettingsAutodetectPort").value   = zendGetZDEAutodetectPort();
	document.getElementById("zendSettingsIP"            ).value   = zendGetZDEIP(false);
	document.getElementById("zendSettingsPort"          ).value   = zendGetZDEPort();
	document.getElementById("zendSettingsUseSSL"        ).checked = zendGetUseSSL();

	if( zendGetAutodetect() )
		document.getElementById("zendSettingsRadio").selectedIndex = 0;
	else 
		document.getElementById("zendSettingsRadio").selectedIndex = 1;

	toggleAutoDetect();
}

function toggleAutoDetect(){
	try {
		var ZDE_Autodetect = document.getElementById("zendSettingsAutodetect").selected;
		
		// Display when autodetect is selected
		document.getElementById("zendSettingsAutodetectPort"   ).disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsAutodetectPortLbl").disabled = !ZDE_Autodetect;
		document.getElementById("zendSettingsAutodetectTest"   ).disabled = !ZDE_Autodetect;
		
		// Hide when autodetect is selected
		document.getElementById("zendSettingsIP"     ).disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsIPLbl"  ).disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsPort"   ).disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsPortLbl").disabled = ZDE_Autodetect;
		document.getElementById("zendSettingsUseSSL" ).disabled = ZDE_Autodetect;
	} catch(e) { 
		alert("Zend Debugger Toolbar internal error has occured.\nPlease restart your browser."); 
	}

}

function testAutoDetect(){
	try{
		// save the current value in the detect port field because getZdeSettings() reads from the prefs.
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("zend.");

		var autoDetect = document.getElementById("zendSettingsAutodetect").selected;
		if( ! autoDetect ) return;

		prefs.setCharPref("ZDE_AutodetectPort",document.getElementById("zendSettingsAutodetectPort").value );
		prefs.setBoolPref("ZDE_Autodetect", autoDetect );
	
		if( !getZdeSettings() ){
			// do nothing - alert is already displayed at getZdeSettings()...
		}
		else {
			/* Don't display ZDE_Port & ZDE_IP since tunneling may be turned on and they will
			   make no sense to the user */
			/*
			var msg = "Auto detected settings:\n"+
			          "Debug Port: "+ZDE_Port+"\n"+
			          "IP Adderss: "+ZDE_IP+"\n";
			
			if( ZDE_UseSSL ){
				msg = msg+"IDE will encrypt communications using SSL."
			}
			alert(msg);
			*/
			alert("Auto Detect test was completed successfully.");
		}
	} catch(e) { alert(e); }
}
