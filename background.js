browser.webRequest.onBeforeSendHeaders.addListener(
    onPageLoading,
    { urls: ["<all_urls>"] }
);

function onPageLoading(e) {
    if (e.type != "main_frame") {
        return;
    }

    browser.cookies.get({url: e.url, name: "debug_start_session"}).then(cookie => {
        if (!cookie) {
            resetIcon();
            clearDebugCookies(e.url);
        }
    });
}
