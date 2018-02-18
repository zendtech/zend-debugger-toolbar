function resetIcon() {
    browser.browserAction.setIcon({path: "icons/debugmenu.gif"});
}

function clearDebugCookies(url) {
    browser.cookies.remove({
        url: url,
        name: "debug_host"
    });

    browser.cookies.remove({
        url: url,
        name: "debug_port"
    });

    browser.cookies.remove({
        url: url,
        name: "debug_fastfile"
    });

    browser.cookies.remove({
        url: url,
        name: "start_debug"
    });

    browser.cookies.remove({
        url: url,
        name: "send_debug_header"
    });

    browser.cookies.remove({
        url: url,
        name: "send_sess_end"
    });

    browser.cookies.remove({
        url: url,
        name: "debug_jit"
    });

    browser.cookies.remove({
        url: url,
        name: "debug_stop"
    });

    browser.cookies.remove({
        url: url,
        name: "use_remote"
    });

    browser.cookies.remove({
        url: url,
        name: "no_remote"
    });

    browser.cookies.remove({
        url: url,
        name: "use_ssl"
    });

    browser.cookies.remove({
        url: url,
        name: "start_profile"
    });

    browser.cookies.remove({
        url: url,
        name: "debug_coverage"
    });

    browser.cookies.remove({
        url: url,
        name: "debug_session_id"
    });

    browser.cookies.remove({
        url: url,
        name: "debug_start_session"
    });

    browser.cookies.remove({
        url: url,
        name: "original_url"
    });

    browser.cookies.remove({
        url: url,
        name: "ZendDebuggerCookie"
    });
}