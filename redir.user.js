// ==UserScript==
// @name         Redirect Old Links
// @version      0.1
// @description  No more "Module Disabled"!
// @author       comp500
// @namespace    https://infra.link/
// @match        https://minecraft.curseforge.com/mc-mods/*
// @updateURL    https://github.com/comp500/Curseforge-Userscripts/raw/master/redir.user.js
// @downloadURL  https://github.com/comp500/Curseforge-Userscripts/raw/master/redir.user.js
// @homepageURL  https://github.com/comp500/Curseforge-Userscripts/
// @supportURL   https://github.com/comp500/Curseforge-Userscripts/issues/
// @source       https://github.com/comp500/Curseforge-Userscripts/
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      addons-ecs.forgesvc.net
// ==/UserScript==

(async function() {
    'use strict';

    let greaseMonkeyXHR = details => {
		details.method = details.method ? details.method : "GET";
		details.anonymous = true;
		details.responseType = details.responseType ? details.responseType : "arraybuffer";
		return new Promise((resolve, reject) => {
			details.onload = resolve;
			details.onerror = reject;
			GM_xmlhttpRequest(details);
		});
	};

	// Match project IDs
	let matches = location.href.match(/https:\/\/minecraft.curseforge.com\/mc-mods\/(\d+)/);
	if (matches != null && matches[1] != null) {
		let res = await greaseMonkeyXHR({
			url: "https://addons-ecs.forgesvc.net/api/v2/addon/" + matches[1],
			method: "GET",
			responseType: "json",
			headers: {
				Accept: "application/json"
			}
		});
		if (res.status != 200) {
			console.error("RedirectOldLinks: failed to get addon info: " + res.status + " " + res.statusText);
			return;
		}
		if (res.response == null) {
			console.error("RedirectOldLinks: failed to get addon info: null response");
			return;
		}
		location.href = res.response.websiteUrl;
	} else {
		// Match slug IDs
		matches = location.href.match(/https:\/\/minecraft.curseforge.com\/mc-mods\/([a-z][\da-z\-_]{1,127})\/?$/);
		if (matches != null && matches[1] != null) {
			location.href = "https://www.curseforge.com/minecraft/mc-mods/" + matches[1];
		}
	}
})();