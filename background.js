// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var current = "icon_on.png";

function updateIcon() {
  chrome.browserAction.setIcon({path: current});

  if (current === "icon_on.png") {
    current = "icon_off.png";
  } else {
    current = "icon_on.png";
  }


}

chrome.browserAction.onClicked.addListener(updateIcon);
updateIcon();



chrome.history.onVisited.addListener(updateLink);

function updateLink(historyItem) {

}
