/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/bootstrap/dist/css/bootstrap.min.css":
/*!***********************************************************!*\
  !*** ./node_modules/bootstrap/dist/css/bootstrap.min.css ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://ipynb-pub/./node_modules/bootstrap/dist/css/bootstrap.min.css?");

/***/ }),

/***/ "./src/base.css":
/*!**********************!*\
  !*** ./src/base.css ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://ipynb-pub/./src/base.css?");

/***/ }),

/***/ "./src/front.css":
/*!***********************!*\
  !*** ./src/front.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://ipynb-pub/./src/front.css?");

/***/ }),

/***/ "./src/front.js":
/*!**********************!*\
  !*** ./src/front.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var bootstrap_dist_css_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bootstrap/dist/css/bootstrap.min.css */ \"./node_modules/bootstrap/dist/css/bootstrap.min.css\");\n/* harmony import */ var _base_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base.css */ \"./src/base.css\");\n/* harmony import */ var _front_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./front.css */ \"./src/front.css\");\n/* harmony import */ var _upload__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./upload */ \"./src/upload.js\");\n\n\n\n\n\n\n\ndocument.addEventListener('DOMContentLoaded', function() {\n    let uploadButton = document.getElementById('action-upload');\n    (0,_upload__WEBPACK_IMPORTED_MODULE_3__.setupUpload)(uploadButton);\n})\n\n\n//# sourceURL=webpack://ipynb-pub/./src/front.js?");

/***/ }),

/***/ "./src/upload.js":
/*!***********************!*\
  !*** ./src/upload.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"setupUpload\": () => (/* binding */ setupUpload)\n/* harmony export */ });\nfunction setupUpload(uploadButton) {\n    const form = document.createElement('form');\n    form.action = \"/upload\";\n    form.method = \"POST\";\n    form.enctype= \"multipart/form-data\";\n    form.style.display = 'none';\n\n    const input = document.createElement('input')\n    input.accept = \".ipynb\";\n    input.type = 'file';\n    input.name = 'upload';\n    form.appendChild(input);\n\n    document.body.appendChild(form);\n\n    uploadButton.addEventListener('click', () => {\n        input.click();\n    })\n\n    input.addEventListener('change', () => {\n        form.submit();\n    })\n\n}\n\n\n//# sourceURL=webpack://ipynb-pub/./src/upload.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/front.js");
/******/ 	
/******/ })()
;