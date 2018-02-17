var storage_keys = [
  "local_copy",
  "break_first_line",
  "frame_selection",
  "ide_settings",
  "broadcast_port",
  "debug_port",
  "debug_host",
  "use_ssl"
];

/**
 * Check if debug cookies are already set and update menu items with a cancel action.
 */
browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
  browser.cookies.get({url: tabs[0].url, name: "debug_start_session"}).then(cookie => {
    if (cookie) {
      if (cookie.value == "1") {
        document.querySelector(".debug_all_pages").innerHTML = "Cancel Debug All Pages";
        document.querySelector(".debug_all_pages").classList.add("cancel");
      } else if (cookie.value == "POST") {
        document.querySelector(".debug_all_forms").innerHTML = "Cancel Debug All Forms (POST)";
        document.querySelector(".debug_all_forms").classList.add("cancel");
      }
    } else {
      browser.cookies.get({url: tabs[0].url, name: "debug_session_id"}).then(cookie => {
        if (cookie && !cookie.expirationDate) {
          document.querySelector(".debug_next_page").innerHTML = "Cancel Debug Next Page";
          document.querySelector(".debug_next_page").classList.add("cancel");
        }
      });
    }
  });
});

/**
 * Menu click listener.
 */
document.addEventListener("click", e => {
  if (e.target.classList.contains("cancel")) {
    cancelDebug();
  } else if (e.target.classList.contains("debug_current_page")) {
    debugCurrentPage();
  } else if (e.target.classList.contains("debug_next_page")) {
    debugNextPage();
  } else if (e.target.classList.contains("debug_all_forms")) {
    debugAllForms();
  } else if (e.target.classList.contains("debug_all_pages")) {
    debugAllPages();
  } else if (e.target.classList.contains("profile_current_page")) {
    profileCurrentPage();
  } else if (e.target.classList.contains("settings")) {
    browser.runtime.openOptionsPage();
    window.close();
  } else {
    window.close();
  }
});

function cancelDebug() {
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    resetIcon();
    clearDebugCookies(tabs[0].url);
    window.close();
  });
}

function debugCurrentPage() {
  debug(false, true);
}

function debugNextPage() {
  debug(false, false);
}

function debugAllForms() {
  debug(false, false, "POST");
}

function debugAllPages() {
  debug(false, false, "1");
}

function profileCurrentPage() {
  debug(true, true);
}

function debug(profile, reload, session) {
  Promise.all([
    browser.tabs.query({active: true, currentWindow: true}),
    browser.storage.local.get(storage_keys)
  ]).then(([tabs, settings]) => {
    autoDetect(settings, function(props) {
      clearDebugCookies(tabs[0].url);
      setDebugCookies(tabs[0], props, profile, reload, session);
    });
  }).catch(onError);
}

function onError(error) {
    console.log(`Error: ${error}`);
    window.close();
}

/**
 * 'Debug' action handler.
 */
function setDebugCookies(tab, props, profile, reload, session) {
  var expDate = null;
  if (reload) {
    expDate = Math.round(new Date() / 1000) + 2;
  }

  var setDebugHost = browser.cookies.set({
    url: tab.url,
    name: "debug_host",
    value: props.debug_host,
    expirationDate: expDate
  });

  var setDebugPort = browser.cookies.set({
    url: tab.url,
    name: "debug_port",
    value: props.debug_port,
    expirationDate: expDate
  });

  var setDebugFastFile = null
  if (props.debug_fastfile) {
    setDebugFastFile = browser.cookies.set({
      url: tab.url,
      name: "debug_fastfile",
      value: "1",
      expirationDate: expDate
    });
  }

  var setStartDebug = browser.cookies.set({
    url: tab.url,
    name: "start_debug",
    value: "1",
    expirationDate: expDate
  });

  var setSendDebugHeader = browser.cookies.set({
    url: tab.url,
    name: "send_debug_header",
    value: "1",
    expirationDate: expDate
  });

  var setSendSessionEnd = browser.cookies.set({
    url: tab.url,
    name: "send_sess_end",
    value: "1",
    expirationDate: expDate
  });

  var setDebugJIT = browser.cookies.set({
    url: tab.url,
    name: "debug_jit",
    value: "1",
    expirationDate: expDate
  });

  var setDebugStop = null;
  if (props.break_first_line) {
    setDebugStop = browser.cookies.set({
      url: tab.url,
      name: "debug_stop",
      value: "1",
      expirationDate: expDate
    });
  }

  var setUseRemote = null;
  var setNoRemote = null;
  if (props.local_copy) {
    setUseRemote = browser.cookies.set({
      url: tab.url,
      name: "use_remote",
      value: "1",
      expirationDate: expDate
    });
  } else {
    setNoRemote = browser.cookies.set({
      url: tab.url,
      name: "no_remote",
      value: "1",
      expirationDate: expDate
    });
  }

  var setUseSSL = null;
  if (props.use_ssl) {
    setUseSSL = browser.cookies.set({
      url: tab.url,
      name: "use_ssl",
      value: "1",
      expirationDate: expDate
    });
  }

  var setStartProfile = null;
  var setDebugCoverage = null;
  if (profile) {
    setStartProfile = browser.cookies.set({
      url: tab.url,
      name: "start_profile",
      value: "1",
      expirationDate: expDate
    });

    setDebugCoverage = browser.cookies.set({
      url: tab.url,
      name: "debug_coverage",
      value: "1",
      expirationDate: expDate
    });
  }

  var debug_session_id = Math.floor(Math.random() * 147483648) + 2000;
  var setDebugSessionId = browser.cookies.set({
    url: tab.url,
    name: "debug_session_id",
    value: '' + debug_session_id,
    expirationDate: expDate
  });

  var setDebugStartSession = null;
  if (session) {
    setDebugStartSession = browser.cookies.set({
      url: tab.url,
      name: "debug_start_session",
      value: session,
      expirationDate: expDate
    });
  }

  var setOriginalUrl = browser.cookies.set({
    url: tab.url,
    name: "original_url",
    value: tab.url,
    expirationDate: expDate
  });

  Promise.all([
    setDebugHost,
    setDebugPort,
    setDebugFastFile,
    setStartDebug,
    setSendDebugHeader,
    setSendSessionEnd,
    setDebugJIT,
    setDebugStop,
    setUseRemote,
    setNoRemote,
    setUseSSL,
    setStartProfile,
    setDebugCoverage,
    setDebugSessionId,
    setDebugStartSession,
    setOriginalUrl
  ]).then(() => {
    if (reload) {
      browser.tabs.reload();
      browser.browserAction.setIcon({path: "icons/debugmenu.gif"});
    } else if (session == "1") {
      browser.browserAction.setIcon({path: "icons/debugmenu_all.gif"});
    } else if (session == "POST") {
      browser.browserAction.setIcon({path: "icons/debugmenu_post.gif"});
    } else {
      browser.browserAction.setIcon({path: "icons/debugmenu_next.gif"});
    }
    window.close();
  }).catch(onError);
}

function autoDetect(settings, callback) {
  var props = {
    local_copy: (settings.local_copy == undefined) ? true : settings.local_copy,
    break_first_line: (settings.break_first_line == undefined) ? true : settings.break_first_line,
    debug_port: settings.debug_port || "10137",
    debug_host: settings.debug_host || "127.0.0.1",
    use_ssl: (settings.use_ssl == undefined) ? false : settings.use_ssl,
    debug_fastfile: true
  };

  if (settings.ide_settings && settings.ide_settings == "manual") {
    callback(props);
  } else {
    var broadcastPort = settings.broadcastPort || "20080";
    var url = "http://127.0.0.1:" + broadcastPort;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == XMLHttpRequest.DONE) {
        if (this.status == 200 && this.responseText != null) {
          var settingsArray = this.responseText.split("&");
          var i;
          for (i = 0; i < settingsArray.length; i++) {
            // Ignore setting that are not in the format of 'key=value'
            if (settingsArray[i].indexOf("=") == -1) {
              continue;
            }
            // Detect debug_port, debug_host, use_ssl and debug_fastfile settings
            var setting = settingsArray[i].split("=");
            if (setting[0] == "debug_port") {
              props.debug_port = setting[1];
            } else if (setting[0] == "debug_host") {
              props.debug_host = setting[1].replace(/\s/g, ''); // remove spaces
            } else if (setting[0] == "use_ssl") {
              props.use_ssl = setting[1];
            } else if (setting[0] == "debug_fastfile") {
              props.debug_fastfile = setting[1];
            }
          }
          if (props.debug_host != null && props.debug_port != null) {
            callback(props);
            return;
          }
        }
        alert("Cannot detect IDE settings at port " + broadcastPort + ".");
      }
    };
    xhttp.open("GET", url);
    xhttp.send();
  }
}
