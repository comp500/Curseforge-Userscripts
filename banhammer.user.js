// ==UserScript==
// @name         No More MCreator Mods
// @version      0.8
// @description  you weren't gonna use them anyway
// @author       comp500
// @namespace    https://infra.link/
// @match        https://www.curseforge.com/minecraft/*
// @updateURL    https://github.com/comp500/Curseforge-Userscripts/raw/master/banhammer.user.js
// @downloadURL  https://github.com/comp500/Curseforge-Userscripts/raw/master/banhammer.user.js
// @homepageURL  https://github.com/comp500/Curseforge-Userscripts/
// @supportURL   https://github.com/comp500/Curseforge-Userscripts/issues/
// @source       https://github.com/comp500/Curseforge-Userscripts/
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @connect      addons-ecs.forgesvc.net
// @connect      edge.forgecdn.net
// @connect      media.forgecdn.net
// @require      https://unpkg.com/jszip@3.2.2/dist/jszip.min.js
// ==/UserScript==

(function() {
	"use strict";

	if (!JSZip) {
		console.log("NoMoreMCreatorMods: JSZip did not load properly!");
		return;
	}

	let storage = {};
	if (localStorage.NoMoreMCreatorMods != null) {
		try {
			storage = JSON.parse(localStorage.NoMoreMCreatorMods);
		} catch (e) {
			console.error(e);
			storage = {};
		}
	}

	let modRegex = /\/minecraft\/mc-mods\/([a-z][\da-z\-_]{0,127})$/;
	let mCreatorDescRegex = /<div class="box p-4 pb-2 project-detail__content" data-user-content>[\w\W]*MCreator[\w\W]*?<\/div>/i;
	let openSourceRegex = /Source<svg class="icon icon-offsite-nav" viewBox="0 0 20 20" width="20" height="20"><use xlink:href="\/Content\/2-0-7166-24694\/Skins\/CurseForge\/images\/twitch\/Action\/Popout.svg#Action\/Popout\"\/><\/svg>/;
	// haha nice try
    let hahaSourceRegex = /<a href="https?:\/\/(www.)?mcreator.(net|com)\/?[^"\n]*"  ?class="text-gray-500 hover:no-underline" ?>\s*<span class="b-list-label">\s*Source/i;
    let projectIDRegex = /<span>Project ID<\/span>\s*<span>(\d+)<\/span>/;

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
				let stored = link.href.replace("https://www.curseforge.com/minecraft/mc-mods/", "");
				if (storage[stored] == "mcreator") {
					row.parentNode.removeChild(row);
					return null;
				} else if (storage[stored] == "normal" || stored == "thanos-skin") {
					return null;
				}
				let res = await fetch(link.href);
				if (res.status !== 200) {
					console.error("NoMoreMCreatorMods: failed to get mod page " + link.href);
					console.log(res);
					return null;
				}

				let text = await res.text();
				// Exclude mods with MCreator in the description
				if (mCreatorDescRegex.test(text)) {
					storage[stored] = "mcreator";
					row.parentNode.removeChild(row);
					return null;
				}
				// Allow OSS mods
				if (openSourceRegex.test(text) && !hahaSourceRegex.test(text)) {
					storage[stored] = "normal";
					return null;
				}

				let projectIDMatches = projectIDRegex.exec(text);
				if (projectIDMatches != null && projectIDMatches.length > 0) {
					return [parseInt(projectIDMatches[1], 10), row, stored];
				}
			}
		})
	)
		.then(async ids => {
			let validIDs = ids.filter(id => id != null);
			if (validIDs.length > 0) {
				// Request the mod data from CurseForge's API
				let res = await greaseMonkeyXHR({
					url: "https://addons-ecs.forgesvc.net/api/v2/addon/",
					method: "POST",
					data: JSON.stringify(validIDs.map(i => i[0])),
					responseType: "json",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json"
					}
				});
				if (res.status != 200) {
					console.error("NoMoreMCreatorMods: failed to get addon info: " + res.status + " " + res.statusText);
					return;
				}
				if (res.response == null) {
					console.error("NoMoreMCreatorMods: failed to get addon info: null response");
					return;
				}
				await Promise.all(
					res.response.map(async mod => {
						if (mod.latestFiles == null) {
							console.error("NoMoreMCreatorMods: failed to get addon info: null latestFiles");
							return;
						}
						if (mod.latestFiles.length > 0) {
							// Download the mod
							let url = mod.latestFiles[0].downloadUrl;
							if (url == null) {
								console.error("NoMoreMCreatorMods: failed to get addon info: null download url");
								return;
							}
							let downloadRes = await greaseMonkeyXHR({ url: url });
							if (downloadRes.status != 200) {
								console.error("NoMoreMCreatorMods: failed to get mod download: " + res.status);
								return;
							}
							let zip = await JSZip.loadAsync(downloadRes.response);
							let row = validIDs.find(i => i[0] == mod.id)[1];
							let stored = validIDs.find(i => i[0] == mod.id)[2];
							// Check for a folder called net/mcreator
							if (zip.files["net/mcreator/"] != null || zip.files["mod/mcreator/"] != null) {
								storage[stored] = "mcreator";
								row.parentNode.removeChild(row);
								return;
							} else {
								storage[stored] = "normal";
								return;
							}
						}
					})
				);
			}
		})
		.then(a => {
			localStorage.NoMoreMCreatorMods = JSON.stringify(storage);
		})
		.catch(e => {
			console.error(e);
		});
})();
