/*******************************************************************************
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * 
 * Contributor(s):
 * Zend Technologies - initial API and implementation 
 *******************************************************************************/

function zendPopulateFrames()
{
	var currentFrames = window.opener.content.frames;
	var numFrames = currentFrames.length;
	var i;

	FramesPulldown = document.getElementById("zendFrames");

	FramesPulldown.appendItem("Top Frameset");
	for (i=0; i<numFrames; i++) {
		var FrameName = currentFrames[i].name;

		if (FrameName == null || FrameName == "") {
			FrameName = currentFrames[i].location.pathname;
		}
		FramesPulldown.appendItem(FrameName);
	}
	FramesPulldown.selectedIndex = 0;
}

function zendSaveFrame()
{
	var currentFrames = window.opener._content.frames;
	var numFrames = currentFrames.length;
	var result;
	var selectedIndex = document.getElementById("zendFrames").selectedIndex;

	if (selectedIndex==0) {
		result = window.opener._content.document;
	} else {
		result = currentFrames[selectedIndex-1].document;
	}
	window.arguments[0][0] = result;
	window.arguments[0][1] = selectedIndex;
	window.close();
}
