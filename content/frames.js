/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * Contributor(s): Zend Technologies - initial API and implementation
 ******************************************************************************/

function zendPopulateFrames(frameNames) {
	var i;
	framesPulldown = document.getElementById("zendFrames");
	for (i = 0; i < frameNames.length; i++) {
		framesPulldown.appendItem(frameNames[i]);
	}
	framesPulldown.selectedIndex = 0;
}

function zendSaveResult() {
	var selectedIndex = document.getElementById("zendFrames").selectedIndex;
	var result = window.arguments[0][selectedIndex];
	window.arguments[1][0] = result;
	window.close();
}
