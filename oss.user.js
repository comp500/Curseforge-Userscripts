// ==UserScript==
// @name         No More ARR Mods
// @version      0.3
// @description  you weren't gonna use them anyway
// @author       comp500
// @namespace    https://infra.link/
// @match        https://www.curseforge.com/minecraft/*
// @match        https://www.curseforge.com/Minecraft/*
// @match        https://legacy.curseforge.com/minecraft/*
// @match        https://legacy.curseforge.com/Minecraft/*
// @updateURL    https://github.com/comp500/Curseforge-Userscripts/raw/master/oss.user.js
// @downloadURL  https://github.com/comp500/Curseforge-Userscripts/raw/master/oss.user.js
// @homepageURL  https://github.com/comp500/Curseforge-Userscripts/
// @supportURL   https://github.com/comp500/Curseforge-Userscripts/issues/
// @source       https://github.com/comp500/Curseforge-Userscripts/
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      addons-ecs.forgesvc.net
// @connect      edge.forgecdn.net
// @connect      media.forgecdn.net
// ==/UserScript==

(function() {
	"use strict";

	let storage = {};
	if (localStorage.NoMoreARRMods != null) {
		try {
			storage = JSON.parse(localStorage.NoMoreARRMods);
		} catch (e) {
			console.error(e);
			storage = {};
		}
	}

	let modRegex = /\/minecraft\/mc-mods\/([a-z][\da-z\-_]{0,127})$/;
	let mCreatorDescRegex = /<div class="box p-4 pb-2 project-detail__content" data-user-content>[\w\W]*MCreator[\w\W]*?<\/div>/i;
	let openSourceRegex = /Source<svg class="icon icon-offsite-nav" viewBox="0 0 20 20" width="20" height="20"><use xlink:href="[^"]+"\/><\/svg>/;
	// haha nice try
	let hahaSourceRegex = /<a href="https?:\/\/(www.)?mcreator.(net|com)\/?[^"\n]*"  ?class="text-gray-500 hover:no-underline" ?>\s*<span class="b-list-label">\s*Source/i;

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

	Promise.all(
		Array.from(document.querySelectorAll(".project-listing-row")).map(async row => {
			let link = Array.from(row.getElementsByTagName("a")).find(a => modRegex.test(a.href));
			if (link != undefined) {
				let stored = (link.href
					.replace("https://legacy.curseforge.com/minecraft/mc-mods/", "")
					.replace("https://legacy.curseforge.com/Minecraft/mc-mods/", "")
					.replace("https://www.curseforge.com/minecraft/mc-mods/", "")
					.replace("https://www.curseforge.com/Minecraft/mc-mods/", ""));
				if (storage[stored] == "arr") {
					row.parentNode.removeChild(row);
					return;
				} else if (storage[stored] == "normal" || stored == "thanos-skin") {
					return;
				}
				let res = await fetch(link.href);
				if (res.status !== 200) {
					console.error("NoMoreARRMods: failed to get mod page " + link.href);
					console.log(res);
					return;
				}

				let text = await res.text();
				// Exclude mods with MCreator in the description
				if (mCreatorDescRegex.test(text)) {
					storage[stored] = "arr";
					row.parentNode.removeChild(row);
					return;
				}
				// Allow only OSS mods
				if (openSourceRegex.test(text) && !hahaSourceRegex.test(text)) {
					storage[stored] = "normal";
				} else {
					storage[stored] = "arr";
					row.parentNode.removeChild(row);
				}
			}
		})
	)
		.then(a => {
			localStorage.NoMoreARRMods = JSON.stringify(storage);
		})
		.catch(e => {
			console.error(e);
		});
})();
