/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * 
 * Contributor(s):
 * Zend Technologies - initial API and implementation 
 *******************************************************************************/

/**
 * Loads the Zend home page in a new tab.
 */
function zend_visitHomePage() {
	const
	homePageURL = "http://www.zend.com";
	const
	preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(
			Components.interfaces.nsIPrefService).getBranch("");

	// If the open in windows preference is set to true
	const
	newTab = window.opener.getBrowser().addTab(homePageURL);
	window.opener.getBrowser().selectedTab = newTab;
	window.close();
}

/**
 * Loads the project page in a new tab.
 */
function zend_visitProjectPage() {
	const
	projectPageURL = "https://github.com/zendtech/zend-debugger-firefox";
	const
	preferencesService = Components.classes["@mozilla.org/preferences-service;1"].getService(
			Components.interfaces.nsIPrefService).getBranch("");

	// If the open in windows preference is set to true
	const
	newTab = window.opener.getBrowser().addTab(projectPageURL);
	window.opener.getBrowser().selectedTab = newTab;
	window.close();
}
