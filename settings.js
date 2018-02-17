var storage_keys = [
    "local_copy",
    "break_first_line",
    "ide_settings",
    "broadcast_port",
    "debug_port",
    "debug_host",
    "use_ssl"
];

function onError(error) {
    console.log(`Error: ${error}`);
}

function updateEnabledState() {
    var auto = "auto" == document.querySelector("input[name=ide_settings]:checked").value

    document.querySelector("#test").disabled = !auto;
    document.querySelector("#broadcast_port").disabled = !auto;
    document.querySelector("#debug_port").disabled = auto;
    document.querySelector("#debug_host").disabled = auto;
    document.querySelector("#use_ssl").disabled = auto;

    if (auto) {
        document.querySelector("#broadcast_port_label").classList.remove("disabled");
        document.querySelector("#debug_port_label").classList.add("disabled");
        document.querySelector("#debug_host_label").classList.add("disabled");
        document.querySelector("#use_ssl_label").classList.add("disabled");
    } else {
        document.querySelector("#broadcast_port_label").classList.add("disabled");
        document.querySelector("#debug_port_label").classList.remove("disabled");
        document.querySelector("#debug_host_label").classList.remove("disabled");
        document.querySelector("#use_ssl_label").classList.remove("disabled");
    }
}

function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        local_copy: document.querySelector("#local_copy").checked,
        break_first_line: document.querySelector("#break_first_line").checked,
        ide_settings: document.querySelector("input[name=ide_settings]:checked").value,
        broadcast_port: document.querySelector("#broadcast_port").value,
        debug_port: document.querySelector("#debug_port").value,
        debug_host: document.querySelector("#debug_host").value,
        use_ssl: document.querySelector("#use_ssl").checked
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#local_copy").checked = (result.local_copy == undefined) ? true : result.local_copy;
        document.querySelector("#break_first_line").checked = (result.break_first_line == undefined) ? true : result.break_first_line;
        document.querySelector("input[name=ide_settings][value=" + (result.ide_settings || "auto") + "]").checked = true;
        document.querySelector("#broadcast_port").value = result.broadcast_port || "20080";
        document.querySelector("#debug_port").value = result.debug_port || "10137";
        document.querySelector("#debug_host").value = result.debug_host || "127.0.0.1";
        document.querySelector("#use_ssl").checked = (result.use_ssl == undefined) ? false : result.use_ssl;
        updateEnabledState();
    }

    var getting = browser.storage.local.get(storage_keys);
    getting.then(setCurrentChoice, onError);
}

function restoreDefaults() {
    var removing = browser.storage.local.remove(storage_keys);
    removing.then(restoreOptions, onError);
}

function testAutoDetect() {
    document.querySelector("#test").disabled = true;
    document.querySelector("#test_result").textContent = "Processing...";

    var broadcastPort = document.querySelector("#broadcast_port").value;
    var url = "http://127.0.0.1:" + broadcastPort;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
            document.querySelector("#test").disabled = false;
			if (this.status == 200 && this.responseText != null) {
				var response = this.responseText;
				if (response.includes("debug_port") && response.includes("debug_host")) {
                    document.querySelector("#test_result").textContent = 
                        "Success. IDE settings can be detected at port " + broadcastPort + ".";
					return;
				}
			}
            document.querySelector("#test_result").textContent = 
                "Failure. IDE settings cannot be detected at port " + broadcastPort + ".";
		}
    };
    xhttp.open("GET", url);
    xhttp.send();
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("input[name=ide_settings][value=auto").addEventListener("click", updateEnabledState);
document.querySelector("input[name=ide_settings][value=manual").addEventListener("click", updateEnabledState);
document.querySelector("#test").addEventListener("click", testAutoDetect);
document.querySelector("#restore").addEventListener("click", restoreDefaults);
document.querySelector("form").addEventListener("submit", saveOptions);