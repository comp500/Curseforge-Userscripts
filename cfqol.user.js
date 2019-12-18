// ==UserScript==
// @name         Curseforge QOL Fixes
// @version      0.10
// @description  Fix Minecraft default tab to search mods, fix browse button to go to /minecraft/mc-mods, add search box in the navbar, add All Files tab, add pagination to the bottom
// @author       comp500
// @namespace    https://infra.link/
// @match        https://www.curseforge.com/*
// @updateURL    https://github.com/comp500/Curseforge-Userscripts/raw/master/cfqol.user.js
// @downloadURL  https://github.com/comp500/Curseforge-Userscripts/raw/master/cfqol.user.js
// @homepageURL  https://github.com/comp500/Curseforge-Userscripts/
// @supportURL   https://github.com/comp500/Curseforge-Userscripts/issues/
// @source       https://github.com/comp500/Curseforge-Userscripts/
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
	"use strict";

	// Change the Browse link and the default Minecraft tab (from other links) to /minecraft/mc-mods
	let regexBrowse = /^http:\/\/bit.ly\/2Lzpfsl|https:\/\/www.curseforge.com\/minecraft\/?$/;
	Array.from(document.getElementsByTagName("a"))
		.filter(a => regexBrowse.test(a.href))
		.forEach(a => {
			a.href = "https://www.curseforge.com/minecraft/mc-mods";
		});

	// Add a search box
	let searchBoxContainer = document.createElement("div");
	searchBoxContainer.className = "flex mr-4 items-center";
	// Get the current assets path
	let styleSheet = Array.from(document.styleSheets).find(s => /\/Content\//.test(s.href));
	let assetsPath = styleSheet == null ? "2-0-7179-35052" : /\/Content\/([\d\-]+)\//.exec(styleSheet.href)[1];
	searchBoxContainer.innerHTML = `<form action="/minecraft/mc-mods/search" method="get" novalidate="novalidate" autocomplete="false" style="width:100%">
    <div class="flex flex-col h-full justify-between">
         <div class="input input--icon" style="color: #000">
            <i class="search textgray-900 flex items-center justify-center">
                <svg class="icon" viewBox="0 0 20 20" width="16" height="16"><use xlink:href="/Content/${assetsPath}/Skins/CurseForge/images/twitch/Object/Search.svg#Object/Search"></use></svg>
            </i>
            <input type="text" name="search" id="cfqolTopbarSearch" placeholder="Search Mods">
        </div>
    </div></form>`;
	let insertLocation = document.querySelector(".private-message");
	if (insertLocation != null) {
		// @Inject(method = "the navbar", at = @At("HEAD"))
		insertLocation.parentNode.insertBefore(searchBoxContainer, insertLocation);
	}

	// Make the search box magically grow
	let searchBox = searchBoxContainer.querySelector("#cfqolTopbarSearch");
	if (searchBox != null) {
		// Fix stupid flexboxes - set to flex-grow 1 flex-shrink 0
		searchBoxContainer.style.flex = "1 0";
		searchBoxContainer.parentNode.parentNode.style.flex = "1 0";

		let navLinksContainer = document.querySelector(".top-nav__nav-link").parentNode;
		navLinksContainer.style.transition = "opacity 0.4s, max-width 0.3s";
		navLinksContainer.style.overflowX = "hidden";
		searchBox.style.transition = "";
		searchBox.addEventListener("focus", e => {
			navLinksContainer.style.opacity = 0;
			navLinksContainer.style.maxWidth = "0";
		});
		searchBox.addEventListener("blur", e => {
			navLinksContainer.style.opacity = 1;
			navLinksContainer.style.maxWidth = "2000px";
		});
		// Make the search icon focus the search box
		let searchIcon = searchBoxContainer.querySelector(".search");
		if (searchIcon != null) {
			searchIcon.addEventListener("click", e => {
				searchBox.focus();
			});
		}
	}

	// Hide useless links, to save space
	let uselessLinks = ["Minecraft Forums"];
	Array.from(document.querySelectorAll(".top-nav__nav-link"))
		.filter(n => uselessLinks.includes(n.innerText))
		.forEach(n => n.parentNode.removeChild(n));

	// Add an "All Files" tab
	let pathMatches = /\/minecraft\/mc-mods\/([a-z][\da-z\-_]{0,127})/.exec(document.location.pathname);
	let files = document.getElementById("nav-files");
	if (pathMatches != null && pathMatches.length == 2 && files != null) {
		let slug = pathMatches[1];
		let allFiles = document.createElement("li");
		let isAllFilesPage = /\/minecraft\/mc-mods\/[a-z][\da-z\-_]{0,127}\/files\/all/.test(
			document.location.pathname
		);
		if (isAllFilesPage) {
			allFiles.className =
				"border-b-2 border-primary-500 b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
			files.className = "b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
		} else {
			allFiles.className = "b-list-item p-nav-item px-2 pb-1/10 -mb-1/10 text-gray-500";
		}
		allFiles.innerHTML = `<a href="/minecraft/mc-mods/${slug}/files/all" class="text-${
			isAllFilesPage ? "primary" : "gray"
		}-500 hover:no-underline">
            <span class="b-list-label">
                All Files
            </span>
        </a>`;
		files.parentNode.insertBefore(allFiles, files.nextSibling);
	}

	// Add pagination to the bottom of the page in dependency lists
	let dependenciesPage = document.querySelector(".project-dependencies-page > div");
	if (dependenciesPage != null) {
		let paginationTop = document.querySelector(".project-dependencies-page > div .pagination-top");
		if (paginationTop != null) {
			dependenciesPage.appendChild(paginationTop.parentNode.cloneNode(true)).classList.remove("mb-4");
		}
	}
})();
