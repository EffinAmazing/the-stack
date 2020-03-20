(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./$$_lazy_route_resource lazy recursive":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");





const routes = [
    {
        path: "home",
        loadChildren: () => Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(void 0, void 0, void 0, function* () {
            const { HomeModule } = yield Promise.resolve(/*! import() */).then(__webpack_require__.bind(null, /*! ./modules/home/home.module */ "./src/app/modules/home/home.module.ts"));
            return HomeModule;
        }),
    },
    {
        path: "blueprints",
        loadChildren: () => Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(void 0, void 0, void 0, function* () {
            const { BlueprintModule } = yield Promise.resolve(/*! import() */).then(__webpack_require__.bind(null, /*! ./modules/blueprint/blueprint.module */ "./src/app/modules/blueprint/blueprint.module.ts"));
            return BlueprintModule;
        })
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];
class AppRoutingModule {
}
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ factory: function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(routes)],
        _angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AppRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"],
        args: [{
                imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(routes)],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");



class AppComponent {
    constructor() {
        this.title = 'March Blueprint';
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 1, vars: 0, template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "router-outlet");
    } }, directives: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterOutlet"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyJ9 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-root',
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.scss']
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/animations.js");
/* harmony import */ var _modules_blueprint_blueprint_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/blueprint/blueprint.module */ "./src/app/modules/blueprint/blueprint.module.ts");
/* harmony import */ var _modules_home_home_module__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/home/home.module */ "./src/app/modules/home/home.module.ts");
/* harmony import */ var _core_interceptors_no_cache_headers_interceptor__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./core/interceptors/no-cache-headers.interceptor */ "./src/app/core/interceptors/no-cache-headers.interceptor.ts");










class AppModule {
}
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ factory: function AppModule_Factory(t) { return new (t || AppModule)(); }, providers: [
        {
            provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HTTP_INTERCEPTORS"],
            useClass: _core_interceptors_no_cache_headers_interceptor__WEBPACK_IMPORTED_MODULE_8__["NoCacheHeadersInterceptor"],
            multi: true
        }
    ], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_3__["AppRoutingModule"],
            _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
            _modules_blueprint_blueprint_module__WEBPACK_IMPORTED_MODULE_6__["BlueprintModule"],
            _modules_home_home_module__WEBPACK_IMPORTED_MODULE_7__["HomeModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_3__["AppRoutingModule"],
        _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
        _modules_blueprint_blueprint_module__WEBPACK_IMPORTED_MODULE_6__["BlueprintModule"],
        _modules_home_home_module__WEBPACK_IMPORTED_MODULE_7__["HomeModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AppModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"],
        args: [{
                declarations: [
                    _app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]
                ],
                imports: [
                    _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                    _app_routing_module__WEBPACK_IMPORTED_MODULE_3__["AppRoutingModule"],
                    _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
                    _modules_blueprint_blueprint_module__WEBPACK_IMPORTED_MODULE_6__["BlueprintModule"],
                    _modules_home_home_module__WEBPACK_IMPORTED_MODULE_7__["HomeModule"]
                ],
                providers: [
                    {
                        provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HTTP_INTERCEPTORS"],
                        useClass: _core_interceptors_no_cache_headers_interceptor__WEBPACK_IMPORTED_MODULE_8__["NoCacheHeadersInterceptor"],
                        multi: true
                    }
                ],
                bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/core/interceptors/no-cache-headers.interceptor.ts":
/*!*******************************************************************!*\
  !*** ./src/app/core/interceptors/no-cache-headers.interceptor.ts ***!
  \*******************************************************************/
/*! exports provided: NoCacheHeadersInterceptor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NoCacheHeadersInterceptor", function() { return NoCacheHeadersInterceptor; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");


class NoCacheHeadersInterceptor {
    constructor() {
    }
    intercept(request, next) {
        const authReq = request.clone({
            setHeaders: {
                'Cache-Control': 'no-cache'
            }
        });
        return next.handle(authReq);
    }
}
NoCacheHeadersInterceptor.ɵfac = function NoCacheHeadersInterceptor_Factory(t) { return new (t || NoCacheHeadersInterceptor)(); };
NoCacheHeadersInterceptor.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: NoCacheHeadersInterceptor, factory: NoCacheHeadersInterceptor.ɵfac });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](NoCacheHeadersInterceptor, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "./src/app/core/services/blueprints.service.ts":
/*!*****************************************************!*\
  !*** ./src/app/core/services/blueprints.service.ts ***!
  \*****************************************************/
/*! exports provided: BlueprintsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BlueprintsService", function() { return BlueprintsService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
/* harmony import */ var _shared_mappers_response_mapper_helper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shared/mappers/response-mapper.helper */ "./src/app/shared/mappers/response-mapper.helper.ts");




class BlueprintsService {
    constructor(http, mapper) {
        this.http = http;
        this.mapper = mapper;
        this.serverURI = 'http://198.211.96.29:9000/';
    }
    getDomainTools(domain) {
        return this.mapper.mapResponse(this.http.get(`${this.serverURI}blueprints/tools?domain=${domain}`));
    }
    updateNodeTool(nodeID, data) {
        return this.mapper.mapResponse(this.http.put(`${this.serverURI}toolsnodes/${nodeID}`, { data }));
    }
    hideNodes(ids) {
        return this.mapper.mapResponse(this.http.post(`${this.serverURI}toolshide/`, { ids }));
    }
    addArrow(blueprintId, data) {
        return this.mapper.mapResponse(this.http.post(`${this.serverURI}arrows/`, { data, blueprintId }));
    }
    updateArrow(data) {
        return this.mapper.mapResponse(this.http.put(`${this.serverURI}arrows/${data.id}`, { data }));
    }
    getArrows(blueprintId) {
        return this.mapper.mapResponse(this.http.get(`${this.serverURI}arrows/?blueprint=${blueprintId}`));
    }
    removeArrows(ids) {
        return this.mapper.mapResponse(this.http.post(`${this.serverURI}arrows/remove`, { ids }));
    }
}
BlueprintsService.ɵfac = function BlueprintsService_Factory(t) { return new (t || BlueprintsService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_shared_mappers_response_mapper_helper__WEBPACK_IMPORTED_MODULE_2__["ResponseMappers"])); };
BlueprintsService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: BlueprintsService, factory: BlueprintsService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](BlueprintsService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_1__["HttpClient"] }, { type: _shared_mappers_response_mapper_helper__WEBPACK_IMPORTED_MODULE_2__["ResponseMappers"] }]; }, null); })();


/***/ }),

/***/ "./src/app/modules/blueprint/blueprint-routing.module.ts":
/*!***************************************************************!*\
  !*** ./src/app/modules/blueprint/blueprint-routing.module.ts ***!
  \***************************************************************/
/*! exports provided: BlueprintRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BlueprintRoutingModule", function() { return BlueprintRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
/* harmony import */ var _pages_build_stack_build_stack_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/build-stack/build-stack.component */ "./src/app/modules/blueprint/pages/build-stack/build-stack.component.ts");
/* harmony import */ var _pages_share_share_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/share/share.component */ "./src/app/modules/blueprint/pages/share/share.component.ts");






const routes = [
    {
        path: "build",
        component: _pages_build_stack_build_stack_component__WEBPACK_IMPORTED_MODULE_2__["BuildStackComponent"]
    },
    {
        path: "share",
        component: _pages_share_share_component__WEBPACK_IMPORTED_MODULE_3__["ShareComponent"]
    }
];
class BlueprintRoutingModule {
}
BlueprintRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: BlueprintRoutingModule });
BlueprintRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function BlueprintRoutingModule_Factory(t) { return new (t || BlueprintRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
        _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](BlueprintRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](BlueprintRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/modules/blueprint/blueprint.module.ts":
/*!*******************************************************!*\
  !*** ./src/app/modules/blueprint/blueprint.module.ts ***!
  \*******************************************************/
/*! exports provided: BlueprintModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BlueprintModule", function() { return BlueprintModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/http.js");
/* harmony import */ var _blueprint_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./blueprint-routing.module */ "./src/app/modules/blueprint/blueprint-routing.module.ts");
/* harmony import */ var _pages_build_stack_build_stack_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/build-stack/build-stack.component */ "./src/app/modules/blueprint/pages/build-stack/build-stack.component.ts");
/* harmony import */ var _pages_share_share_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pages/share/share.component */ "./src/app/modules/blueprint/pages/share/share.component.ts");
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _shared_modules_material_common_behaviors_common_behaviors_module__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../shared/modules/material/common-behaviors/common-behaviors.module */ "./src/app/shared/modules/material/common-behaviors/common-behaviors.module.ts");
/* harmony import */ var _shared_modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../shared/modules/material/buttons-indicators/buttons-indicators.module */ "./src/app/shared/modules/material/buttons-indicators/buttons-indicators.module.ts");
/* harmony import */ var _shared_modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../shared/modules/material/forms-controls/forms-controls.module */ "./src/app/shared/modules/material/forms-controls/forms-controls.module.ts");
/* harmony import */ var _shared_modules_material_layout_layout_module__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../shared/modules/material/layout/layout.module */ "./src/app/shared/modules/material/layout/layout.module.ts");
/* harmony import */ var _components_builder_builder_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/builder/builder.component */ "./src/app/modules/blueprint/components/builder/builder.component.ts");
/* harmony import */ var _components_tools_list_tools_list_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/tools-list/tools-list.component */ "./src/app/modules/blueprint/components/tools-list/tools-list.component.ts");














class BlueprintModule {
}
BlueprintModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: BlueprintModule });
BlueprintModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function BlueprintModule_Factory(t) { return new (t || BlueprintModule)(); }, imports: [[
            _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
            _blueprint_routing_module__WEBPACK_IMPORTED_MODULE_3__["BlueprintRoutingModule"],
            _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClientModule"],
            _shared_shared_module__WEBPACK_IMPORTED_MODULE_6__["SharedModule"],
            _shared_modules_material_common_behaviors_common_behaviors_module__WEBPACK_IMPORTED_MODULE_7__["CommonBehaviorsModule"],
            _shared_modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_8__["ButtonsIndicatorsModule"],
            _shared_modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_9__["FormsControlsModule"],
            _shared_modules_material_layout_layout_module__WEBPACK_IMPORTED_MODULE_10__["LayoutModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](BlueprintModule, { declarations: [_pages_build_stack_build_stack_component__WEBPACK_IMPORTED_MODULE_4__["BuildStackComponent"], _pages_share_share_component__WEBPACK_IMPORTED_MODULE_5__["ShareComponent"], _components_builder_builder_component__WEBPACK_IMPORTED_MODULE_11__["BuilderComponent"], _components_tools_list_tools_list_component__WEBPACK_IMPORTED_MODULE_12__["ToolsListComponent"]], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
        _blueprint_routing_module__WEBPACK_IMPORTED_MODULE_3__["BlueprintRoutingModule"],
        _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClientModule"],
        _shared_shared_module__WEBPACK_IMPORTED_MODULE_6__["SharedModule"],
        _shared_modules_material_common_behaviors_common_behaviors_module__WEBPACK_IMPORTED_MODULE_7__["CommonBehaviorsModule"],
        _shared_modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_8__["ButtonsIndicatorsModule"],
        _shared_modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_9__["FormsControlsModule"],
        _shared_modules_material_layout_layout_module__WEBPACK_IMPORTED_MODULE_10__["LayoutModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](BlueprintModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [_pages_build_stack_build_stack_component__WEBPACK_IMPORTED_MODULE_4__["BuildStackComponent"], _pages_share_share_component__WEBPACK_IMPORTED_MODULE_5__["ShareComponent"], _components_builder_builder_component__WEBPACK_IMPORTED_MODULE_11__["BuilderComponent"], _components_tools_list_tools_list_component__WEBPACK_IMPORTED_MODULE_12__["ToolsListComponent"]],
                imports: [
                    _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                    _blueprint_routing_module__WEBPACK_IMPORTED_MODULE_3__["BlueprintRoutingModule"],
                    _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClientModule"],
                    _shared_shared_module__WEBPACK_IMPORTED_MODULE_6__["SharedModule"],
                    _shared_modules_material_common_behaviors_common_behaviors_module__WEBPACK_IMPORTED_MODULE_7__["CommonBehaviorsModule"],
                    _shared_modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_8__["ButtonsIndicatorsModule"],
                    _shared_modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_9__["FormsControlsModule"],
                    _shared_modules_material_layout_layout_module__WEBPACK_IMPORTED_MODULE_10__["LayoutModule"]
                ],
                schemas: [_angular_core__WEBPACK_IMPORTED_MODULE_0__["CUSTOM_ELEMENTS_SCHEMA"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/modules/blueprint/components/builder/builder.component.ts":
/*!***************************************************************************!*\
  !*** ./src/app/modules/blueprint/components/builder/builder.component.ts ***!
  \***************************************************************************/
/*! exports provided: BuilderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BuilderComponent", function() { return BuilderComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! d3 */ "./node_modules/d3/index.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/cdk/drag-drop */ "./node_modules/@angular/cdk/__ivy_ngcc__/fesm2015/drag-drop.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/icon.js");







const _c0 = ["stackWorkFlow"];
const _c1 = function () { return { x: 0, y: 0 }; };
function BuilderComponent_div_7_Template(rf, ctx) { if (rf & 1) {
    const _r34 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("cdkDragReleased", function BuilderComponent_div_7_Template_div_cdkDragReleased_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r33 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r33.relisedMove($event, node_r32); })("cdkDragMoved", function BuilderComponent_div_7_Template_div_cdkDragMoved_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); $event.event.stopPropagation(); return ctx_r35.handleNodeMove($event, node_r32); })("cdkDragStarted", function BuilderComponent_div_7_Template_div_cdkDragStarted_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r36.handleStartDrag(node_r32); })("mouseenter", function BuilderComponent_div_7_Template_div_mouseenter_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r37 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r37.handleMouseOverNode($event, node_r32); })("mouseleave", function BuilderComponent_div_7_Template_div_mouseleave_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r38.handleMouseOutNode($event, node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "img", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_4_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r39 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r39.handleAddArrowClick($event, "Left", node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "div", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_5_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r40.handleAddArrowClick($event, "Right", node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_6_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r41 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r41.handleAddArrowClick($event, "LeftTop", node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_7_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r42 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r42.handleAddArrowClick($event, "RightTop", node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](8, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_8_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r43.handleAddArrowClick($event, "MiddleTop", node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_9_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r44 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r44.handleAddArrowClick($event, "LeftBottom", node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "div", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_10_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r45 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r45.handleAddArrowClick($event, "RightBottom", node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](11, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_11_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r46 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r46.handleAddArrowClick($event, "MiddleBottom", node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](12, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function BuilderComponent_div_7_Template_div_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r34); const node_r32 = ctx.$implicit; const ctx_r47 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"](); return ctx_r47.hideNodeFormStack(node_r32); });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](13, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](14, "clear");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
} if (rf & 2) {
    const node_r32 = ctx.$implicit;
    const ctx_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("cdkDragFreeDragPosition", ctx_r31.hasCoords(node_r32.position) ? node_r32.position : _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](3, _c1));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", node_r32.tool.logo ? ctx_r31.processImageSrc(node_r32.tool.logo) : "/assets/images/layers.png", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", node_r32.tool == null ? null : node_r32.tool.name, " ");
} }
const containerOffset = 20;
const dotRadius = 9;
const lineGenerator = d3__WEBPACK_IMPORTED_MODULE_2__["line"]().curve(d3__WEBPACK_IMPORTED_MODULE_2__["curveCardinal"]);
const host = 'http://198.211.96.29:9000';
class BuilderComponent {
    constructor() {
        this.positionNodeChanged = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        this.arrowAdded = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        this.arrowUpdated = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        this.hideNode = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        this.removeArrows = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        this.selectArrow = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        this.nodes = [];
        // nodes: BluePrintTool[] = [];
        this.showNodes = [];
        this.listOfArrows = [];
        this.connectedLines = [];
    }
    ngOnInit() {
        this.svgD3 = d3__WEBPACK_IMPORTED_MODULE_2__["select"]('svg#paint');
        const offsetX = 200;
        const offsetY = 60;
        const maxItems = 5;
        const arrToChange = [];
        let index = 0;
        this.loadedNodes.subscribe((data) => {
            this.nodes = [];
            this.showNodes = [];
            // console.log(data);
            if (data.list) {
                data.list.forEach((nodeId) => {
                    const item = data.nodes[nodeId];
                    this.nodes.push(item);
                    if (!item.hide) {
                        if (typeof item.position.x !== 'number') {
                            const yIndex = Math.floor(index / maxItems);
                            const xIndex = (index - yIndex * maxItems);
                            item.position.y = yIndex * offsetY;
                            item.position.x = xIndex * offsetX;
                            arrToChange.push({ nodeId: item.id, position: item.position });
                            index++;
                        }
                        this.showNodes.push(item);
                    }
                });
                const promises = arrToChange.map((props) => Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
                    this.positionNodeChanged.emit(props);
                    return props;
                }));
                Promise.all(promises).then((result) => {
                    console.log(result);
                }).catch((err) => {
                    console.log(err);
                });
            }
            if (data.hiddenItem) {
                console.log("data.hiddenItem", data.hiddenItem);
                const arrowsToRemove = this.listOfArrows.filter((item) => item.lineId.indexOf(data.hiddenItem) !== -1);
                const ids = [];
                console.log(arrowsToRemove);
                if (arrowsToRemove.length) {
                    arrowsToRemove.forEach(element => {
                        ids.push(element.lineId);
                        console.log(element.lineId);
                        this.svgD3.select('path#' + element.lineId).remove();
                    });
                    this.removeArrows.emit(ids);
                }
            }
        });
        this.loadedArrows.subscribe((list) => {
            list.forEach((item) => {
                this.listOfArrows.push(item);
                this.svgD3.append('path')
                    .attr('id', item.lineId)
                    .attr('class', 'line')
                    .attr('d', lineGenerator(this.genrateDots([item.start.x, item.start.y], [item.end.x, item.end.y])))
                    .attr('stroke', '#1c57a4')
                    .attr('stroke-width', 2)
                    .attr('fill', 'transparent')
                    .attr('marker-end', 'url(#arrow-marker)');
                const lines = document.querySelectorAll('path.line');
                lines.forEach((line) => {
                    line.addEventListener('click', () => {
                        if (this.selectedArrow) {
                            this.svgD3.select('path#' + this.selectedArrow.lineId).attr('stroke-width', 2);
                        }
                        this.selectedArrow = this.listOfArrows.find((arrow) => arrow.lineId === line.id);
                        this.selectArrow.emit(this.selectedArrow);
                        line.setAttribute('stroke-width', '4');
                    });
                });
            });
        });
    }
    processImageSrc(link) {
        if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1) {
            return link;
        }
        else {
            return host + link;
        }
    }
    relisedMove(data, node) {
        console.log(data.source._dragRef._activeTransform);
        /*  */
        this.positionNodeChanged.emit({ nodeId: node.id, position: data.source._dragRef._activeTransform });
        const updatedLines = this.connectedLines.map((item) => Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return this.arrowUpdated.emit(item);
        }));
        Promise.all(updatedLines).then(() => { console.log('completed update'); }).catch(err => console.log(err));
        this.connectedLines = [];
    }
    hasCoords(position) {
        if (typeof position.x === 'number' && typeof position.y) {
            return true;
        }
        else {
            return false;
        }
    }
    handleClickOnWorkspace() {
        if (this.activeArrow) {
            if (!this.activeArrow.relesed) {
                if (this.activeArrow.end.nodeId) {
                    const Arrow = {
                        start: {
                            x: this.activeArrow.start.x,
                            y: this.activeArrow.start.y,
                            nodeId: this.activeArrow.start.nodeId,
                            pos: this.activeArrow.start.pos
                        },
                        end: {
                            x: this.activeArrow.end.x,
                            y: this.activeArrow.end.y,
                            nodeId: this.activeArrow.end.nodeId,
                            pos: this.activeArrow.end.pos
                        },
                        lineId: this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId
                    };
                    this.listOfArrows.push(Arrow);
                    this.arrowAdded.emit(Arrow);
                    this.svgD3.select('path#' + this.activeArrow.lineId).attr('id', this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId);
                    const line = document.querySelector(`path#${this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId}`);
                    line.addEventListener('click', () => {
                        if (this.selectedArrow) {
                            this.svgD3.select('path#' + this.selectedArrow.lineId).attr('stroke-width', 2);
                        }
                        this.selectedArrow = this.listOfArrows.find((arrow) => arrow.lineId === line.id);
                        this.selectArrow.emit(this.selectedArrow);
                        line.setAttribute('stroke-width', '4');
                    });
                    this.activeArrow = null;
                }
                else {
                    this.svgD3.select('path#' + this.activeArrow.lineId).remove();
                    this.activeArrow = null;
                }
            }
            else {
                this.activeArrow.relesed = false;
            }
        }
    }
    handleStartDrag(node) {
        const lines = this.listOfArrows.filter((item) => item.start.nodeId === node.id || item.end.nodeId === node.id);
        this.connectedLines = lines;
    }
    handleNodeMove(evt, node) {
        if (this.connectedLines.length) {
            const container = this.stackWorkFlow.nativeElement;
            const rectContainer = container.getBoundingClientRect();
            const X = rectContainer.x;
            const Y = rectContainer.y;
            let pointers = evt.event.target;
            if (!pointers.classList.contains('pointers')) {
                pointers = evt.event.target.parentNode;
            }
            // console.log(this.connectedLines);
            this.connectedLines.forEach((item) => {
                let offsetX = dotRadius;
                if (item.start.nodeId === node.id) {
                    const rect = pointers.querySelector('.pointer-' + item.start.pos).getBoundingClientRect();
                    const pos = {
                        y: rect.y - Y - containerOffset + dotRadius,
                        x: rect.x - X - containerOffset + dotRadius
                    };
                    item.start.x = pos.x;
                    item.start.y = pos.y;
                    this.svgD3.select('path#' + item.lineId)
                        .attr('d', lineGenerator(this.genrateDots([item.start.x, item.start.y], [item.end.x, item.end.y])));
                }
                if (item.end.nodeId === node.id) {
                    const rect = pointers.querySelector('.pointer-' + item.end.pos).getBoundingClientRect();
                    if (item.end.pos === 'Left') {
                        offsetX = dotRadius / 2;
                    }
                    if (item.end.pos === 'Right') {
                        offsetX = dotRadius * 2;
                    }
                    const pos = {
                        y: rect.y - Y - containerOffset + dotRadius,
                        x: rect.x - X - containerOffset + offsetX
                    };
                    item.end.x = pos.x;
                    item.end.y = pos.y;
                    this.svgD3.select('path#' + item.lineId)
                        .attr('d', lineGenerator(this.genrateDots([item.start.x, item.start.y], [item.end.x, item.end.y], item.end.pos !== 'Left' && item.end.pos !== 'Right' ? 'Top' : '')));
                }
            });
        }
    }
    handleMouseOverNode(evt, node) {
        if (this.activeArrow) {
            console.log('over', evt, node);
            const container = this.stackWorkFlow.nativeElement;
            const rectContainer = container.getBoundingClientRect();
            const X = rectContainer.x;
            const Y = rectContainer.y;
            let Xpos = 'Left';
            let Ypos = '';
            const x1 = evt.x - X - 15;
            const y1 = evt.y - Y - 15;
            const radAngle = Math.atan2(x1 - this.activeArrow.start.x, y1 - this.activeArrow.start.y);
            console.log(x1, y1, radAngle, radAngle * 180 / Math.PI + 180);
            const degAngle = radAngle * 180 / Math.PI + 180;
            const part = 8;
            const diapason = 360 / part / 2;
            if (degAngle < diapason || degAngle > 360 - diapason || degAngle > 180 - diapason && degAngle < 180 + diapason) {
                Xpos = 'Middle';
            }
            if (degAngle >= diapason && degAngle <= 180 - diapason) {
                Xpos = 'Right';
            }
            if (degAngle >= 180 + diapason && degAngle <= 360 - diapason) {
                Xpos = 'Left';
            }
            if (degAngle < 90 - diapason || degAngle > 270 + diapason) {
                Ypos = 'Bottom';
            }
            if (degAngle > 90 + diapason && degAngle < 270 - diapason) {
                Ypos = 'Top';
            }
            console.log(Xpos, Ypos, degAngle);
            /* */
            const rect = evt.target.querySelector('.pointers .pointer-' + Xpos + Ypos).getBoundingClientRect();
            this.activeArrow.end.nodeId = node.id;
            this.activeArrow.end.elRef = evt.target;
            this.activeArrow.end.pos = Xpos + Ypos;
            let offsetX = dotRadius;
            if (Xpos + Ypos === 'Right') {
                offsetX = dotRadius * 2;
            }
            if (Xpos + Ypos === 'Left') {
                offsetX = dotRadius / 2;
            }
            const pos = {
                y: rect.y - Y - containerOffset + dotRadius,
                x: rect.x - X - containerOffset + offsetX
            };
            this.activeArrow.end.x = pos.x;
            this.activeArrow.end.y = pos.y;
            this.svgD3.select('path#' + this.activeArrow.lineId)
                .attr('d', lineGenerator(this.genrateDots([this.activeArrow.start.x, this.activeArrow.start.y], [this.activeArrow.end.x, this.activeArrow.end.y], Ypos)));
        }
    }
    genrateDots(start, end, Ypos) {
        const arr = [start];
        const diffX = end[0] - start[0];
        const diffY = end[1] - start[1];
        console.log(diffX, diffY);
        arr.push([start[0] + diffX * 0.35, start[1] + diffY * 0.15]);
        if (typeof Ypos === 'string' && Ypos !== '') {
            console.log(Ypos);
            arr.push([start[0] + diffX * 0.90, start[1] + diffY * 0.65]);
        }
        else {
            arr.push([start[0] + diffX * 0.70, start[1] + diffY * 0.85]);
        }
        console.log(arr);
        arr.push(end);
        return arr;
    }
    handleMouseOutNode(evt, node) {
        // console.log('out', evt, node);
        if (this.activeArrow) {
            this.activeArrow.end.nodeId = null;
            this.activeArrow.end.elRef = null;
        }
    }
    handleAddArrowClick(evt, direction, node) {
        if (!this.activeArrow) {
            const target = evt.target;
            const container = this.stackWorkFlow.nativeElement;
            const rect = target.getBoundingClientRect();
            const rectContainer = container.getBoundingClientRect();
            const X = rectContainer.x;
            const Y = rectContainer.y;
            console.log(container);
            const pos = {
                y: rect.y - Y - containerOffset + dotRadius,
                x: rect.x - X - containerOffset + dotRadius
            };
            console.log(pos, direction);
            this.activeArrow = {
                start: { nodeId: node.id, x: pos.x, y: pos.y, pos: direction },
                end: { x: pos.x, y: pos.y },
                lineId: 'line-' + node.id,
                relesed: true
            };
            this.svgD3.append('path')
                .attr('id', 'line-' + node.id)
                .attr('class', 'line')
                .attr('d', lineGenerator([[pos.x, pos.y], [pos.x + 20, pos.y + 20]]))
                .attr('stroke', '#1c57a4')
                .attr('stroke-width', 2)
                .attr('fill', 'transparent')
                .attr('marker-end', 'url(#arrow-marker)');
        }
    }
    handleMouseMove(evt) {
        // console.log(this.activeArrow);
        if (this.activeArrow) {
            if (!this.activeArrow.end.nodeId) {
                const container = this.stackWorkFlow.nativeElement;
                const rectContainer = container.getBoundingClientRect();
                const X = rectContainer.x;
                const Y = rectContainer.y;
                const pos = { y: evt.y - Y - containerOffset, x: evt.x - X - containerOffset };
                this.activeArrow.end.x = pos.x;
                this.activeArrow.end.y = pos.y;
                // console.log(lineGenerator([ [this.activeArrow.start.x, this.activeArrow.start.y], [pos.x, pos.y] ]));
                this.svgD3.select('path#' + this.activeArrow.lineId)
                    .attr('d', lineGenerator([[this.activeArrow.start.x, this.activeArrow.start.y], [pos.x, pos.y]]));
            }
        }
    }
    hideNodeFormStack(node) {
        console.log("hideNodeFormStack", node);
        this.hideNode.emit(node);
    }
}
BuilderComponent.ɵfac = function BuilderComponent_Factory(t) { return new (t || BuilderComponent)(); };
BuilderComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: BuilderComponent, selectors: [["app-builder"]], viewQuery: function BuilderComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_c0, true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.stackWorkFlow = _t.first);
    } }, inputs: { loadedNodes: "loadedNodes", loadedArrows: "loadedArrows" }, outputs: { positionNodeChanged: "positionNodeChanged", arrowAdded: "arrowAdded", arrowUpdated: "arrowUpdated", hideNode: "hideNode", removeArrows: "removeArrows", selectArrow: "selectArrow" }, decls: 8, vars: 1, consts: [[1, "stackWorkflow", 3, "mousemove", "click"], ["stackWorkFlow", ""], ["id", "paint", "width", "1080", "height", "600"], ["id", "arrow-marker", "markerWidth", "8", "markerHeight", "12", "refX", "4", "refY", "6", "orient", "auto-start-reverse", "markerUnits", "userSpaceOnUse"], ["d", "M2,0 L8,6 L2,12 L0,10 L4,6 L0,2 z", 2, "stroke-width", "1", "z-index", "5"], ["class", "toolNode", "cdkDrag", "", 3, "cdkDragFreeDragPosition", "cdkDragReleased", "cdkDragMoved", "cdkDragStarted", "mouseenter", "mouseleave", 4, "ngFor", "ngForOf"], ["cdkDrag", "", 1, "toolNode", 3, "cdkDragFreeDragPosition", "cdkDragReleased", "cdkDragMoved", "cdkDragStarted", "mouseenter", "mouseleave"], [1, "node-icon", 3, "src"], [1, "pointers"], [1, "pointer-Left", 3, "click"], [1, "pointer-Right", 3, "click"], [1, "pointer-LeftTop", 3, "click"], [1, "pointer-RightTop", 3, "click"], [1, "pointer-MiddleTop", 3, "click"], [1, "pointer-LeftBottom", 3, "click"], [1, "pointer-RightBottom", 3, "click"], [1, "pointer-MiddleBottom", 3, "click"], [1, "hide-item-from-stack", 3, "click"]], template: function BuilderComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "div", 0, 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("mousemove", function BuilderComponent_Template_div_mousemove_1_listener($event) { return ctx.handleMouseMove($event); })("click", function BuilderComponent_Template_div_click_1_listener() { return ctx.handleClickOnWorkspace(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnamespaceSVG"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "svg", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "defs");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "marker", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](6, "path", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](7, BuilderComponent_div_7_Template, 15, 4, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.showNodes);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_3__["NgForOf"], _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_4__["CdkDrag"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_5__["MatIcon"]], styles: [".stackWorkflow[_ngcontent-%COMP%] {\n  position: relative;\n  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);\n  border-radius: 3px;\n  transition: 0.3s;\n  padding: 20px 20px;\n  margin-bottom: 20px;\n  background-color: #fff;\n  height: 620px;\n  overflow: hidden;\n}\n\n.toolNode[_ngcontent-%COMP%] {\n  z-index: 100;\n  padding: 8px;\n  min-width: 80px;\n  font-size: 1em;\n  background: #fff;\n  text-align: center;\n  color: #0087e2;\n  border-radius: 5px;\n  border: 1px solid #1c57a4;\n  opacity: 1;\n  display: inline-block;\n  position: absolute;\n  cursor: move;\n  transition: box-shadow 200ms cubic-bezier(0, 0, 0.2, 1);\n}\n\n.toolNode[_ngcontent-%COMP%]   .node-icon[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  vertical-align: middle;\n  float: left;\n  margin-right: 5px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 18px;\n  height: 18px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  box-sizing: border-box;\n  cursor: pointer;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:before {\n  content: \"+\";\n  display: inline-block;\n  color: honeydew;\n  font-size: 9px;\n  text-align: center;\n  line-height: 9px;\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background-color: green;\n  opacity: 0;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:hover:before {\n  opacity: 1;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]   .pointer-Left[_ngcontent-%COMP%] {\n  margin-top: -9px;\n  top: 50%;\n  left: -9px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]   .pointer-Right[_ngcontent-%COMP%] {\n  margin-top: -9px;\n  top: 50%;\n  right: -9px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]   .pointer-LeftTop[_ngcontent-%COMP%] {\n  top: -9px;\n  left: 9px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]   .pointer-RightTop[_ngcontent-%COMP%] {\n  top: -9px;\n  right: 9px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]   .pointer-MiddleTop[_ngcontent-%COMP%] {\n  top: -9px;\n  left: 50%;\n  margin-left: -9px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]   .pointer-LeftBottom[_ngcontent-%COMP%] {\n  bottom: -9px;\n  left: 9px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]   .pointer-RightBottom[_ngcontent-%COMP%] {\n  bottom: -9px;\n  right: 9px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .pointers[_ngcontent-%COMP%]   .pointer-MiddleBottom[_ngcontent-%COMP%] {\n  bottom: -9px;\n  left: 50%;\n  margin-left: -9px;\n}\n\n.toolNode[_ngcontent-%COMP%]   .hide-item-from-stack[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -10px;\n  border-radius: 50%;\n  background-color: #fff;\n  width: 20px;\n  height: 20px;\n  overflow: hidden;\n  cursor: pointer;\n  right: -10px;\n  display: none;\n}\n\n.toolNode[_ngcontent-%COMP%]   .hide-item-from-stack[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #A33;\n}\n\n.toolNode[_ngcontent-%COMP%]:hover   .hide-item-from-stack[_ngcontent-%COMP%] {\n  display: block;\n}\n\n.toolNode[_ngcontent-%COMP%]:hover   .pointers[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:before {\n  opacity: 1;\n}\n\n#paint[_ngcontent-%COMP%] {\n  position: absolute;\n}\n\n#paint[_ngcontent-%COMP%]   #arrow-marker[_ngcontent-%COMP%] {\n  stroke: #1c57a4;\n  fill: #1c57a4;\n}\n\n#paint[_ngcontent-%COMP%]   .line[_ngcontent-%COMP%] {\n  stroke: #1c57a4;\n  fill: #1c57a4;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbW9kdWxlcy9ibHVlcHJpbnQvY29tcG9uZW50cy9idWlsZGVyL0Q6XFxwcm9qZWN0c1xcbWFydGFjaHRvb2xcXGZyb250L3NyY1xcYXBwXFxtb2R1bGVzXFxibHVlcHJpbnRcXGNvbXBvbmVudHNcXGJ1aWxkZXJcXGJ1aWxkZXIuY29tcG9uZW50LnNjc3MiLCJzcmMvYXBwL21vZHVsZXMvYmx1ZXByaW50L2NvbXBvbmVudHMvYnVpbGRlci9idWlsZGVyLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksa0JBQUE7RUFDQSwwQ0FBQTtFQUNBLGtCQUFBO0VBRUEsZ0JBQUE7RUFDQSxrQkFBQTtFQUNBLG1CQUFBO0VBQ0Esc0JBQUE7RUFDQSxhQUFBO0VBQ0EsZ0JBQUE7QUNDSjs7QURFQTtFQUNJLFlBQUE7RUFDQSxZQUFBO0VBQ0EsZUFBQTtFQUNBLGNBQUE7RUFDQSxnQkFBQTtFQUNBLGtCQUFBO0VBQ0EsY0FBQTtFQUNBLGtCQUFBO0VBQ0EseUJBQUE7RUFDQSxVQUFBO0VBQ0EscUJBQUE7RUFDQSxrQkFBQTtFQUNBLFlBQUE7RUFDQSx1REFBQTtBQ0NKOztBRENJO0VBQ0ksV0FBQTtFQUNBLFlBQUE7RUFDQSxzQkFBQTtFQUNBLFdBQUE7RUFDQSxpQkFBQTtBQ0NSOztBREVJO0VBQ0ksa0JBQUE7RUFDQSxNQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSxTQUFBO0FDQVI7O0FERVE7RUFDSSxrQkFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0EsYUFBQTtFQUNBLHVCQUFBO0VBQ0EsbUJBQUE7RUFDQSxzQkFBQTtFQUNBLGVBQUE7QUNBWjs7QURFWTtFQUNJLFlBQUE7RUFDQSxxQkFBQTtFQUNBLGVBQUE7RUFDQSxjQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSx1QkFBQTtFQUNBLFVBQUE7QUNBaEI7O0FER1k7RUFDSSxVQUFBO0FDRGhCOztBREtRO0VBQ0ksZ0JBQUE7RUFDQSxRQUFBO0VBQ0EsVUFBQTtBQ0haOztBREtRO0VBQ0ksZ0JBQUE7RUFDQSxRQUFBO0VBQ0EsV0FBQTtBQ0haOztBREtRO0VBQ0ksU0FBQTtFQUNBLFNBQUE7QUNIWjs7QURLUTtFQUNJLFNBQUE7RUFDQSxVQUFBO0FDSFo7O0FES1E7RUFDSSxTQUFBO0VBQ0EsU0FBQTtFQUNBLGlCQUFBO0FDSFo7O0FES1E7RUFDSSxZQUFBO0VBQ0EsU0FBQTtBQ0haOztBREtRO0VBQ0ksWUFBQTtFQUNBLFVBQUE7QUNIWjs7QURLUTtFQUNJLFlBQUE7RUFDQSxTQUFBO0VBQ0EsaUJBQUE7QUNIWjs7QURPSTtFQUNJLGtCQUFBO0VBQ0EsVUFBQTtFQUNBLGtCQUFBO0VBQ0Esc0JBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLFlBQUE7RUFDQSxhQUFBO0FDTFI7O0FET1E7RUFDSSxlQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0FDTFo7O0FEVVE7RUFDSSxjQUFBO0FDUlo7O0FEV1E7RUFDSSxVQUFBO0FDVFo7O0FEZ0JBO0VBQ0ksa0JBQUE7QUNiSjs7QURjSTtFQUNJLGVBQUE7RUFDQSxhQUFBO0FDWlI7O0FEZUk7RUFDSSxlQUFBO0VBQ0EsYUFBQTtBQ2JSIiwiZmlsZSI6InNyYy9hcHAvbW9kdWxlcy9ibHVlcHJpbnQvY29tcG9uZW50cy9idWlsZGVyL2J1aWxkZXIuY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuc3RhY2tXb3JrZmxvdyB7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBib3gtc2hhZG93OiAwIDRweCA4cHggMCByZ2JhKDAsMCwwLC4yKTtcclxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcclxuICAgIC13ZWJraXQtdHJhbnNpdGlvbjogLjNzO1xyXG4gICAgdHJhbnNpdGlvbjogLjNzO1xyXG4gICAgcGFkZGluZzogMjBweCAyMHB4O1xyXG4gICAgbWFyZ2luLWJvdHRvbTogMjBweDtcclxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XHJcbiAgICBoZWlnaHQ6IDYyMHB4O1xyXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxufVxyXG5cclxuLnRvb2xOb2Rle1xyXG4gICAgei1pbmRleDogMTAwO1xyXG4gICAgcGFkZGluZzogOHB4O1xyXG4gICAgbWluLXdpZHRoOiA4MHB4O1xyXG4gICAgZm9udC1zaXplOiAxZW07XHJcbiAgICBiYWNrZ3JvdW5kOiAjZmZmO1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgY29sb3I6ICMwMDg3ZTI7XHJcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XHJcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMWM1N2E0O1xyXG4gICAgb3BhY2l0eTogMTtcclxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGN1cnNvcjogbW92ZTtcclxuICAgIHRyYW5zaXRpb246IGJveC1zaGFkb3cgMjAwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSk7XHJcblxyXG4gICAgLm5vZGUtaWNvbiB7XHJcbiAgICAgICAgd2lkdGg6IDIwcHg7XHJcbiAgICAgICAgaGVpZ2h0OiAyMHB4O1xyXG4gICAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XHJcbiAgICAgICAgZmxvYXQ6IGxlZnQ7XHJcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiA1cHg7XHJcbiAgICB9XHJcblxyXG4gICAgLnBvaW50ZXJze1xyXG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgICAgICB0b3A6IDA7XHJcbiAgICAgICAgbGVmdDogMDtcclxuICAgICAgICByaWdodDogMDtcclxuICAgICAgICBib3R0b206IDA7XHJcblxyXG4gICAgICAgICY+ZGl2e1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxOHB4O1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDE4cHg7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xyXG4gICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICY6YmVmb3Jle1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogJysnO1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xyXG4gICAgICAgICAgICAgICAgY29sb3I6IGhvbmV5ZGV3O1xyXG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiA5cHg7XHJcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogOXB4O1xyXG4gICAgICAgICAgICAgICAgd2lkdGg6IDEwcHg7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwcHg7XHJcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiBncmVlbjtcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICY6aG92ZXI6YmVmb3Jle1xyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnBvaW50ZXItTGVmdHtcclxuICAgICAgICAgICAgbWFyZ2luLXRvcDogLTlweDtcclxuICAgICAgICAgICAgdG9wOiA1MCU7XHJcbiAgICAgICAgICAgIGxlZnQ6IC05cHg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC5wb2ludGVyLVJpZ2h0e1xyXG4gICAgICAgICAgICBtYXJnaW4tdG9wOiAtOXB4O1xyXG4gICAgICAgICAgICB0b3A6IDUwJTtcclxuICAgICAgICAgICAgcmlnaHQ6IC05cHg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC5wb2ludGVyLUxlZnRUb3B7IFxyXG4gICAgICAgICAgICB0b3A6IC05cHg7XHJcbiAgICAgICAgICAgIGxlZnQ6IDlweDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLnBvaW50ZXItUmlnaHRUb3B7ICAgXHJcbiAgICAgICAgICAgIHRvcDogLTlweDtcclxuICAgICAgICAgICAgcmlnaHQ6IDlweDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLnBvaW50ZXItTWlkZGxlVG9we1xyXG4gICAgICAgICAgICB0b3A6IC05cHg7XHJcbiAgICAgICAgICAgIGxlZnQ6IDUwJTtcclxuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IC05cHg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC5wb2ludGVyLUxlZnRCb3R0b217XHJcbiAgICAgICAgICAgIGJvdHRvbTogLTlweDtcclxuICAgICAgICAgICAgbGVmdDogOXB4O1xyXG4gICAgICAgIH1cclxuICAgICAgICAucG9pbnRlci1SaWdodEJvdHRvbXsgIFxyXG4gICAgICAgICAgICBib3R0b206IC05cHg7XHJcbiAgICAgICAgICAgIHJpZ2h0OiA5cHg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC5wb2ludGVyLU1pZGRsZUJvdHRvbXsgXHJcbiAgICAgICAgICAgIGJvdHRvbTogLTlweDtcclxuICAgICAgICAgICAgbGVmdDogNTAlO1xyXG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogLTlweDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLmhpZGUtaXRlbS1mcm9tLXN0YWNre1xyXG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgICAgICB0b3A6IC0xMHB4O1xyXG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcclxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xyXG4gICAgICAgIHdpZHRoOiAyMHB4O1xyXG4gICAgICAgIGhlaWdodDogMjBweDtcclxuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgICAgICByaWdodDogLTEwcHg7XHJcbiAgICAgICAgZGlzcGxheTogbm9uZTtcclxuXHJcbiAgICAgICAgLm1hdC1pY29uIHtcclxuICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xyXG4gICAgICAgICAgICB3aWR0aDogMThweDtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxOHB4O1xyXG4gICAgICAgICAgICBjb2xvcjogI0EzMztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgJjpob3ZlcntcclxuICAgICAgICAuaGlkZS1pdGVtLWZyb20tc3RhY2t7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnBvaW50ZXJzPmRpdjpiZWZvcmV7XHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbiNwYWludHtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgICNhcnJvdy1tYXJrZXJ7XHJcbiAgICAgICAgc3Ryb2tlOiAjMWM1N2E0O1xyXG4gICAgICAgIGZpbGw6ICMxYzU3YTQ7XHJcbiAgICB9XHJcblxyXG4gICAgLmxpbmV7XHJcbiAgICAgICAgc3Ryb2tlOiAjMWM1N2E0O1xyXG4gICAgICAgIGZpbGw6ICMxYzU3YTQ7XHJcbiAgICB9XHJcbn0iLCIuc3RhY2tXb3JrZmxvdyB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgYm94LXNoYWRvdzogMCA0cHggOHB4IDAgcmdiYSgwLCAwLCAwLCAwLjIpO1xuICBib3JkZXItcmFkaXVzOiAzcHg7XG4gIC13ZWJraXQtdHJhbnNpdGlvbjogMC4zcztcbiAgdHJhbnNpdGlvbjogMC4zcztcbiAgcGFkZGluZzogMjBweCAyMHB4O1xuICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xuICBoZWlnaHQ6IDYyMHB4O1xuICBvdmVyZmxvdzogaGlkZGVuO1xufVxuXG4udG9vbE5vZGUge1xuICB6LWluZGV4OiAxMDA7XG4gIHBhZGRpbmc6IDhweDtcbiAgbWluLXdpZHRoOiA4MHB4O1xuICBmb250LXNpemU6IDFlbTtcbiAgYmFja2dyb3VuZDogI2ZmZjtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBjb2xvcjogIzAwODdlMjtcbiAgYm9yZGVyLXJhZGl1czogNXB4O1xuICBib3JkZXI6IDFweCBzb2xpZCAjMWM1N2E0O1xuICBvcGFjaXR5OiAxO1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgY3Vyc29yOiBtb3ZlO1xuICB0cmFuc2l0aW9uOiBib3gtc2hhZG93IDIwMG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpO1xufVxuLnRvb2xOb2RlIC5ub2RlLWljb24ge1xuICB3aWR0aDogMjBweDtcbiAgaGVpZ2h0OiAyMHB4O1xuICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuICBmbG9hdDogbGVmdDtcbiAgbWFyZ2luLXJpZ2h0OiA1cHg7XG59XG4udG9vbE5vZGUgLnBvaW50ZXJzIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG59XG4udG9vbE5vZGUgLnBvaW50ZXJzID4gZGl2IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB3aWR0aDogMThweDtcbiAgaGVpZ2h0OiAxOHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLnRvb2xOb2RlIC5wb2ludGVycyA+IGRpdjpiZWZvcmUge1xuICBjb250ZW50OiBcIitcIjtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICBjb2xvcjogaG9uZXlkZXc7XG4gIGZvbnQtc2l6ZTogOXB4O1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGxpbmUtaGVpZ2h0OiA5cHg7XG4gIHdpZHRoOiAxMHB4O1xuICBoZWlnaHQ6IDEwcHg7XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgYmFja2dyb3VuZC1jb2xvcjogZ3JlZW47XG4gIG9wYWNpdHk6IDA7XG59XG4udG9vbE5vZGUgLnBvaW50ZXJzID4gZGl2OmhvdmVyOmJlZm9yZSB7XG4gIG9wYWNpdHk6IDE7XG59XG4udG9vbE5vZGUgLnBvaW50ZXJzIC5wb2ludGVyLUxlZnQge1xuICBtYXJnaW4tdG9wOiAtOXB4O1xuICB0b3A6IDUwJTtcbiAgbGVmdDogLTlweDtcbn1cbi50b29sTm9kZSAucG9pbnRlcnMgLnBvaW50ZXItUmlnaHQge1xuICBtYXJnaW4tdG9wOiAtOXB4O1xuICB0b3A6IDUwJTtcbiAgcmlnaHQ6IC05cHg7XG59XG4udG9vbE5vZGUgLnBvaW50ZXJzIC5wb2ludGVyLUxlZnRUb3Age1xuICB0b3A6IC05cHg7XG4gIGxlZnQ6IDlweDtcbn1cbi50b29sTm9kZSAucG9pbnRlcnMgLnBvaW50ZXItUmlnaHRUb3Age1xuICB0b3A6IC05cHg7XG4gIHJpZ2h0OiA5cHg7XG59XG4udG9vbE5vZGUgLnBvaW50ZXJzIC5wb2ludGVyLU1pZGRsZVRvcCB7XG4gIHRvcDogLTlweDtcbiAgbGVmdDogNTAlO1xuICBtYXJnaW4tbGVmdDogLTlweDtcbn1cbi50b29sTm9kZSAucG9pbnRlcnMgLnBvaW50ZXItTGVmdEJvdHRvbSB7XG4gIGJvdHRvbTogLTlweDtcbiAgbGVmdDogOXB4O1xufVxuLnRvb2xOb2RlIC5wb2ludGVycyAucG9pbnRlci1SaWdodEJvdHRvbSB7XG4gIGJvdHRvbTogLTlweDtcbiAgcmlnaHQ6IDlweDtcbn1cbi50b29sTm9kZSAucG9pbnRlcnMgLnBvaW50ZXItTWlkZGxlQm90dG9tIHtcbiAgYm90dG9tOiAtOXB4O1xuICBsZWZ0OiA1MCU7XG4gIG1hcmdpbi1sZWZ0OiAtOXB4O1xufVxuLnRvb2xOb2RlIC5oaWRlLWl0ZW0tZnJvbS1zdGFjayB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAtMTBweDtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xuICB3aWR0aDogMjBweDtcbiAgaGVpZ2h0OiAyMHB4O1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHJpZ2h0OiAtMTBweDtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi50b29sTm9kZSAuaGlkZS1pdGVtLWZyb20tc3RhY2sgLm1hdC1pY29uIHtcbiAgZm9udC1zaXplOiAxOHB4O1xuICB3aWR0aDogMThweDtcbiAgaGVpZ2h0OiAxOHB4O1xuICBjb2xvcjogI0EzMztcbn1cbi50b29sTm9kZTpob3ZlciAuaGlkZS1pdGVtLWZyb20tc3RhY2sge1xuICBkaXNwbGF5OiBibG9jaztcbn1cbi50b29sTm9kZTpob3ZlciAucG9pbnRlcnMgPiBkaXY6YmVmb3JlIHtcbiAgb3BhY2l0eTogMTtcbn1cblxuI3BhaW50IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xufVxuI3BhaW50ICNhcnJvdy1tYXJrZXIge1xuICBzdHJva2U6ICMxYzU3YTQ7XG4gIGZpbGw6ICMxYzU3YTQ7XG59XG4jcGFpbnQgLmxpbmUge1xuICBzdHJva2U6ICMxYzU3YTQ7XG4gIGZpbGw6ICMxYzU3YTQ7XG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](BuilderComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-builder',
                templateUrl: './builder.component.html',
                styleUrls: ['./builder.component.scss']
            }]
    }], function () { return []; }, { stackWorkFlow: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"],
            args: ['stackWorkFlow']
        }], positionNodeChanged: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"]
        }], arrowAdded: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"]
        }], arrowUpdated: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"]
        }], hideNode: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"]
        }], removeArrows: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"]
        }], selectArrow: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"]
        }], loadedNodes: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"]
        }], loadedArrows: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"]
        }] }); })();


/***/ }),

/***/ "./src/app/modules/blueprint/components/tools-list/tools-list.component.ts":
/*!*********************************************************************************!*\
  !*** ./src/app/modules/blueprint/components/tools-list/tools-list.component.ts ***!
  \*********************************************************************************/
/*! exports provided: ToolsListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ToolsListComponent", function() { return ToolsListComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/icon.js");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/expansion */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/expansion.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");





function ToolsListComponent_mat_expansion_panel_8_div_5_mat_icon_4_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-icon", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "visibility");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function ToolsListComponent_mat_expansion_panel_8_div_5_mat_icon_5_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-icon", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, "visibility_off");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function ToolsListComponent_mat_expansion_panel_8_div_5_Template(rf, ctx) { if (rf & 1) {
    const _r55 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "img", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function ToolsListComponent_mat_expansion_panel_8_div_5_Template_div_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r55); const nodeId_r51 = ctx.$implicit; const ctx_r54 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r54.toggleNodeFormStack(ctx_r54.nodes[nodeId_r51]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](4, ToolsListComponent_mat_expansion_panel_8_div_5_mat_icon_4_Template, 2, 0, "mat-icon", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, ToolsListComponent_mat_expansion_panel_8_div_5_mat_icon_5_Template, 2, 0, "mat-icon", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const nodeId_r51 = ctx.$implicit;
    const ctx_r50 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("src", ctx_r50.nodes[nodeId_r51].tool.logo ? ctx_r50.processImageSrc(ctx_r50.nodes[nodeId_r51].tool.logo) : "/assets/images/layers.png", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsanitizeUrl"]);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", ctx_r50.nodes[nodeId_r51].tool.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx_r50.nodes[nodeId_r51].hide);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r50.nodes[nodeId_r51].hide);
} }
function ToolsListComponent_mat_expansion_panel_8_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-expansion-panel", 6);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-expansion-panel-header");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "mat-panel-title");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, ToolsListComponent_mat_expansion_panel_8_div_5_Template, 6, 4, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r49 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("expanded", true);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", item_r49.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", item_r49.nodes);
} }
const host = 'http://198.211.96.29:9000';
class ToolsListComponent {
    constructor() {
        this.toogleVisibilityNode = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.closeTools = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.categoriesList = [];
        this.nodes = {};
    }
    ngOnInit() {
        this.loadedNodes.subscribe((data) => {
            this.nodes = data.nodes;
        });
        this.loadedCategories.subscribe((data) => {
            const categories = Object.keys(data);
            for (const iterator of categories) {
                // console.log(data[iterator]);
                const lowerCase = iterator.toLocaleLowerCase();
                if (lowerCase.indexOf('analytic') !== -1 || lowerCase.indexOf('tracking') || lowerCase.indexOf('marketing')) {
                    this.categoriesList.unshift({
                        name: iterator,
                        nodes: data[iterator]
                    });
                }
                else {
                    this.categoriesList.push({
                        name: iterator,
                        nodes: data[iterator]
                    });
                }
            }
        });
    }
    toggleNodeFormStack(node) {
        this.toogleVisibilityNode.emit(node);
    }
    close() {
        this.closeTools.emit(true);
    }
    processImageSrc(link) {
        if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1) {
            return link;
        }
        else {
            return host + link;
        }
    }
}
ToolsListComponent.ɵfac = function ToolsListComponent_Factory(t) { return new (t || ToolsListComponent)(); };
ToolsListComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ToolsListComponent, selectors: [["app-tools-list"]], inputs: { loadedNodes: "loadedNodes", loadedCategories: "loadedCategories" }, outputs: { toogleVisibilityNode: "toogleVisibilityNode", closeTools: "closeTools" }, decls: 9, vars: 2, consts: [[1, "tools-list-categoreies"], [1, "close", 3, "click"], ["color", "primary"], [1, "categories-list"], [3, "multi"], [3, "expanded", 4, "ngFor", "ngForOf"], [3, "expanded"], [1, "nodes-holder"], ["class", "node-items", 4, "ngFor", "ngForOf"], [1, "node-items"], [1, "node-icon", 3, "src"], [1, "actions", 3, "click"], ["class", "visible", 4, "ngIf"], ["class", "hidden", 4, "ngIf"], [1, "visible"], [1, "hidden"]], template: function ToolsListComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, " Tools ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function ToolsListComponent_Template_div_click_3_listener() { return ctx.close(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "mat-icon", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, "clear");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "mat-accordion", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, ToolsListComponent_mat_expansion_panel_8_Template, 6, 3, "mat-expansion-panel", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("multi", true);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.categoriesList);
    } }, directives: [_angular_material_icon__WEBPACK_IMPORTED_MODULE_1__["MatIcon"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatAccordion"], _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgForOf"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionPanel"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionPanelHeader"], _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionPanelTitle"], _angular_common__WEBPACK_IMPORTED_MODULE_3__["NgIf"]], styles: [".tools-list-categoreies[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 60px;\n  left: 0;\n  right: 0;\n  background-color: #ffffff;\n  height: 600px;\n  padding: 20px;\n  z-index: 200;\n}\n.tools-list-categoreies[_ngcontent-%COMP%]   .close[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  cursor: pointer;\n}\n.tools-list-categoreies[_ngcontent-%COMP%]   .close[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%] {\n  font-size: 36px;\n  width: 36px;\n  height: 36px;\n}\n.categories-list[_ngcontent-%COMP%] {\n  height: 550px;\n  overflow: auto;\n}\n.nodes-holder[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: flex-start;\n}\n.nodes-holder[_ngcontent-%COMP%]   .node-items[_ngcontent-%COMP%] {\n  padding: 5px 20px;\n  border: solid 1px #999999;\n  margin: 4px 3px;\n  cursor: default;\n}\n.nodes-holder[_ngcontent-%COMP%]   .node-items[_ngcontent-%COMP%]   .node-icon[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  margin-right: 5px;\n  vertical-align: middle;\n}\n.nodes-holder[_ngcontent-%COMP%]   .node-items[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%] {\n  display: inline-block;\n  cursor: pointer;\n  vertical-align: middle;\n  box-sizing: border-box;\n  line-height: 16px;\n  margin-left: 10px;\n}\n.nodes-holder[_ngcontent-%COMP%]   .node-items[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%]   .visible[_ngcontent-%COMP%] {\n  color: #306ebe;\n}\n.nodes-holder[_ngcontent-%COMP%]   .node-items[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%]   .hidden[_ngcontent-%COMP%] {\n  color: #a04d42;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbW9kdWxlcy9ibHVlcHJpbnQvY29tcG9uZW50cy90b29scy1saXN0L0Q6XFxwcm9qZWN0c1xcbWFydGFjaHRvb2xcXGZyb250L3NyY1xcYXBwXFxtb2R1bGVzXFxibHVlcHJpbnRcXGNvbXBvbmVudHNcXHRvb2xzLWxpc3RcXHRvb2xzLWxpc3QuY29tcG9uZW50LnNjc3MiLCJzcmMvYXBwL21vZHVsZXMvYmx1ZXByaW50L2NvbXBvbmVudHMvdG9vbHMtbGlzdC90b29scy1saXN0LmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQ0ksa0JBQUE7RUFDQSxTQUFBO0VBQ0EsT0FBQTtFQUNBLFFBQUE7RUFDQSx5QkFBQTtFQUNBLGFBQUE7RUFDQSxhQUFBO0VBQ0EsWUFBQTtBQ0RKO0FER0k7RUFDSSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxXQUFBO0VBQ0EsZUFBQTtBQ0RSO0FER1E7RUFDSSxlQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7QUNEWjtBRE1BO0VBQ0ksYUFBQTtFQUNBLGNBQUE7QUNISjtBRE1BO0VBQ0ksYUFBQTtFQUNBLGVBQUE7RUFDQSwyQkFBQTtBQ0hKO0FES0k7RUFDSSxpQkFBQTtFQUNBLHlCQUFBO0VBQ0EsZUFBQTtFQUNBLGVBQUE7QUNIUjtBREtRO0VBQ0ksV0FBQTtFQUNBLFlBQUE7RUFDQSxpQkFBQTtFQUNBLHNCQUFBO0FDSFo7QURNUTtFQUNJLHFCQUFBO0VBQ0EsZUFBQTtFQUNBLHNCQUFBO0VBQ0Esc0JBQUE7RUFDQSxpQkFBQTtFQUNBLGlCQUFBO0FDSlo7QURNWTtFQUNJLGNBQUE7QUNKaEI7QURPWTtFQUNJLGNBQUE7QUNMaEIiLCJmaWxlIjoic3JjL2FwcC9tb2R1bGVzL2JsdWVwcmludC9jb21wb25lbnRzL3Rvb2xzLWxpc3QvdG9vbHMtbGlzdC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5cclxuLnRvb2xzLWxpc3QtY2F0ZWdvcmVpZXMge1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgdG9wOiA2MHB4O1xyXG4gICAgbGVmdDogMDtcclxuICAgIHJpZ2h0OiAwO1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZmZmZjtcclxuICAgIGhlaWdodDogNjAwcHg7XHJcbiAgICBwYWRkaW5nOiAyMHB4O1xyXG4gICAgei1pbmRleDogMjAwO1xyXG5cclxuICAgIC5jbG9zZXtcclxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgdG9wOiAxMHB4O1xyXG4gICAgICAgIHJpZ2h0OiAxMHB4O1xyXG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuXHJcbiAgICAgICAgLm1hdC1pY29ue1xyXG4gICAgICAgICAgICBmb250LXNpemU6IDM2cHg7XHJcbiAgICAgICAgICAgIHdpZHRoOiAzNnB4O1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDM2cHg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4uY2F0ZWdvcmllcy1saXN0e1xyXG4gICAgaGVpZ2h0OiA1NTBweDtcclxuICAgIG92ZXJmbG93OiBhdXRvO1xyXG59XHJcblxyXG4ubm9kZXMtaG9sZGVyeyBcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmbGV4LXdyYXA6IHdyYXA7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XHJcblxyXG4gICAgLm5vZGUtaXRlbXMge1xyXG4gICAgICAgIHBhZGRpbmc6IDVweCAyMHB4O1xyXG4gICAgICAgIGJvcmRlcjogc29saWQgMXB4ICM5OTk5OTk7XHJcbiAgICAgICAgbWFyZ2luOiA0cHggM3B4O1xyXG4gICAgICAgIGN1cnNvcjogZGVmYXVsdDtcclxuXHJcbiAgICAgICAgLm5vZGUtaWNvbntcclxuICAgICAgICAgICAgd2lkdGg6IDIwcHg7XHJcbiAgICAgICAgICAgIGhlaWdodDogMjBweDtcclxuICAgICAgICAgICAgbWFyZ2luLXJpZ2h0OiA1cHg7XHJcbiAgICAgICAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC5hY3Rpb25zeyAgICBcclxuICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xyXG4gICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICAgICAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XHJcbiAgICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XHJcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xyXG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcclxuXHJcbiAgICAgICAgICAgIC52aXNpYmxle1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICMzMDZlYmU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC5oaWRkZW57XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogI2EwNGQ0MjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi50b29scy1saXN0LWNhdGVnb3JlaWVzIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDYwcHg7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmZmZmO1xuICBoZWlnaHQ6IDYwMHB4O1xuICBwYWRkaW5nOiAyMHB4O1xuICB6LWluZGV4OiAyMDA7XG59XG4udG9vbHMtbGlzdC1jYXRlZ29yZWllcyAuY2xvc2Uge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMTBweDtcbiAgcmlnaHQ6IDEwcHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi50b29scy1saXN0LWNhdGVnb3JlaWVzIC5jbG9zZSAubWF0LWljb24ge1xuICBmb250LXNpemU6IDM2cHg7XG4gIHdpZHRoOiAzNnB4O1xuICBoZWlnaHQ6IDM2cHg7XG59XG5cbi5jYXRlZ29yaWVzLWxpc3Qge1xuICBoZWlnaHQ6IDU1MHB4O1xuICBvdmVyZmxvdzogYXV0bztcbn1cblxuLm5vZGVzLWhvbGRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtd3JhcDogd3JhcDtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xufVxuLm5vZGVzLWhvbGRlciAubm9kZS1pdGVtcyB7XG4gIHBhZGRpbmc6IDVweCAyMHB4O1xuICBib3JkZXI6IHNvbGlkIDFweCAjOTk5OTk5O1xuICBtYXJnaW46IDRweCAzcHg7XG4gIGN1cnNvcjogZGVmYXVsdDtcbn1cbi5ub2Rlcy1ob2xkZXIgLm5vZGUtaXRlbXMgLm5vZGUtaWNvbiB7XG4gIHdpZHRoOiAyMHB4O1xuICBoZWlnaHQ6IDIwcHg7XG4gIG1hcmdpbi1yaWdodDogNXB4O1xuICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xufVxuLm5vZGVzLWhvbGRlciAubm9kZS1pdGVtcyAuYWN0aW9ucyB7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBsaW5lLWhlaWdodDogMTZweDtcbiAgbWFyZ2luLWxlZnQ6IDEwcHg7XG59XG4ubm9kZXMtaG9sZGVyIC5ub2RlLWl0ZW1zIC5hY3Rpb25zIC52aXNpYmxlIHtcbiAgY29sb3I6ICMzMDZlYmU7XG59XG4ubm9kZXMtaG9sZGVyIC5ub2RlLWl0ZW1zIC5hY3Rpb25zIC5oaWRkZW4ge1xuICBjb2xvcjogI2EwNGQ0Mjtcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ToolsListComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-tools-list',
                templateUrl: './tools-list.component.html',
                styleUrls: ['./tools-list.component.scss']
            }]
    }], function () { return []; }, { loadedNodes: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }], loadedCategories: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"]
        }], toogleVisibilityNode: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"]
        }], closeTools: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"]
        }] }); })();


/***/ }),

/***/ "./src/app/modules/blueprint/pages/build-stack/build-stack.component.ts":
/*!******************************************************************************!*\
  !*** ./src/app/modules/blueprint/pages/build-stack/build-stack.component.ts ***!
  \******************************************************************************/
/*! exports provided: BuildStackComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BuildStackComponent", function() { return BuildStackComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm2015/index.js");
/* harmony import */ var _core_services_blueprints_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/services/blueprints.service */ "./src/app/core/services/blueprints.service.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/button.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/icon.js");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/progress-spinner */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/progress-spinner.js");
/* harmony import */ var _components_builder_builder_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../components/builder/builder.component */ "./src/app/modules/blueprint/components/builder/builder.component.ts");
/* harmony import */ var _components_tools_list_tools_list_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../components/tools-list/tools-list.component */ "./src/app/modules/blueprint/components/tools-list/tools-list.component.ts");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/card.js");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/slide-toggle */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/slide-toggle.js");













const _c0 = ["stackWorkFlow"];
function BuildStackComponent_div_5_button_8_Template(rf, ctx) { if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function BuildStackComponent_div_5_button_8_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r10); const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r9.handleDeselectArrow(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "layers_clear");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function BuildStackComponent_div_5_button_9_Template(rf, ctx) { if (rf & 1) {
    const _r12 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "button", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function BuildStackComponent_div_5_button_9_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r12); const ctx_r11 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](2); return ctx_r11.handleRemoveArrow(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "clear");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, " Delete Arrow ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function BuildStackComponent_div_5_Template(rf, ctx) { if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function BuildStackComponent_div_5_Template_button_click_2_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r14); const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r13.handleHideList(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4, "list");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, " All Tools ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](6, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, BuildStackComponent_div_5_button_8_Template, 3, 0, "button", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](9, BuildStackComponent_div_5_button_9_Template, 4, 0, "button", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r1.selectedArrow);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx_r1.selectedArrow);
} }
function BuildStackComponent_div_6_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](1, "mat-spinner");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "p", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, " Data being processed please wait... ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
function BuildStackComponent_div_7_Template(rf, ctx) { if (rf & 1) {
    const _r16 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-icon", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "warning");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "p", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "button", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function BuildStackComponent_div_7_Template_button_click_5_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r16); const ctx_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r15.moveToHome(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6, " Try Again ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", ctx_r3.errMessage, " ");
} }
function BuildStackComponent_app_builder_8_Template(rf, ctx) { if (rf & 1) {
    const _r18 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "app-builder", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("positionNodeChanged", function BuildStackComponent_app_builder_8_Template_app_builder_positionNodeChanged_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r18); const ctx_r17 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r17.updatedNodePosiotion($event); })("arrowAdded", function BuildStackComponent_app_builder_8_Template_app_builder_arrowAdded_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r18); const ctx_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r19.handleAddArrow($event); })("arrowUpdated", function BuildStackComponent_app_builder_8_Template_app_builder_arrowUpdated_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r18); const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r20.handleUpdateArrow($event); })("hideNode", function BuildStackComponent_app_builder_8_Template_app_builder_hideNode_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r18); const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r21.handleHideNode($event); })("removeArrows", function BuildStackComponent_app_builder_8_Template_app_builder_removeArrows_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r18); const ctx_r22 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r22.handleRemoveArrows($event); })("selectArrow", function BuildStackComponent_app_builder_8_Template_app_builder_selectArrow_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r18); const ctx_r23 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r23.handleSlectArrow($event); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("loadedNodes", ctx_r4.changedNodes$)("loadedArrows", ctx_r4.changedArrows$);
} }
const _c1 = function (a0) { return { "hideTools": a0 }; };
function BuildStackComponent_app_tools_list_9_Template(rf, ctx) { if (rf & 1) {
    const _r25 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "app-tools-list", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("toogleVisibilityNode", function BuildStackComponent_app_tools_list_9_Template_app_tools_list_toogleVisibilityNode_0_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r25); const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r24.handleHideNodeItem($event); })("closeTools", function BuildStackComponent_app_tools_list_9_Template_app_tools_list_closeTools_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r25); const ctx_r26 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r26.handleCloseTools(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction1"](3, _c1, ctx_r5.hideList))("loadedNodes", ctx_r5.changedNodes$)("loadedCategories", ctx_r5.changedCategories$);
} }
function BuildStackComponent_div_17_Template(rf, ctx) { if (rf & 1) {
    const _r29 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "mat-card");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4, "Categories: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "p", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "b");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](8, "Name: ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "p", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "mat-slide-toggle", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("change", function BuildStackComponent_div_17_Template_mat_slide_toggle_change_13_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵrestoreView"](_r29); const nodeId_r27 = ctx.$implicit; const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"](); return ctx_r28.handleHideNodeItem(ctx_r28.nodes[nodeId_r27]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14, " Hide ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} if (rf & 2) {
    const nodeId_r27 = ctx.$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", ctx_r6.nodes[nodeId_r27].tool && ctx_r6.nodes[nodeId_r27].tool.categories ? ctx_r6.nodes[nodeId_r27].tool.categories.join(",") : "", " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", ctx_r6.nodes[nodeId_r27].tool == null ? null : ctx_r6.nodes[nodeId_r27].tool.name, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"](" ", ctx_r6.nodes[nodeId_r27].tool == null ? null : ctx_r6.nodes[nodeId_r27].tool.description, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("checked", ctx_r6.nodes[nodeId_r27].hide)("color", "accent");
} }
const _c2 = function () { return { "toolsList": true, "hide": true }; };
class BuildStackComponent {
    constructor(service, route, router) {
        this.service = service;
        this.route = route;
        this.router = router;
        this.nodes = [];
        this.nodesList = [];
        this.showNodes = [];
        this.categories = { "None": [] };
        this.changedNodes$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"]({});
        this.changedArrows$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"]([]);
        this.changedCategories$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__["BehaviorSubject"]({});
        this.nodesForUpdate = [];
        this.hideList = true;
        this.loaded = false;
        this.domain = '';
        this.isError = false;
        this.errMessage = 'Something went wrong plaese check domain and try again';
        this.route.queryParams.subscribe((params) => {
            this.domain = params.domain;
        });
    }
    ngOnInit() {
        if (this.domain) {
            this.service.getDomainTools(this.domain).subscribe((data) => {
                if (typeof data === 'string') {
                    return this.isError = true;
                }
                console.log(data);
                let hidden = 0;
                this.blueprint = data.blueprint;
                data.nodes.forEach((item) => {
                    const tool = data.tools.find((atool) => atool.id === item.toolId);
                    item.tool = tool;
                    this.nodes[item.id] = item;
                    this.nodesList.push(item.id);
                    if (item.hide) {
                        hidden++;
                    }
                    if (item.tool.categories) {
                        item.tool.categories.forEach((cat) => {
                            if (this.categories[cat]) {
                                this.categories[cat].push(item.id);
                            }
                            else {
                                this.categories[cat] = [item.id];
                            }
                        });
                    }
                    else {
                        this.categories['None'].push(item.id);
                    }
                    /*if (!item.hide) {
                      this.showNodes.push(item);
                    }*/
                });
                if (data.nodes.length - hidden > 50) {
                    this.proceedNodes(data.nodes.length, hidden);
                }
                else {
                    this.completedProceedNodes();
                }
                // console.log(this.nodes, this.nodes.length);
            }, err => this.isError = true);
        }
        else {
            this.isError = true;
        }
    }
    proceedNodes(all, hidden, force) {
        if (force) {
            this.nodesList.forEach((nodeId) => {
                const item = this.nodes[nodeId];
                if (!item.hide && all - hidden > 50) {
                    if (item.tool.categories[0].search('Analytics') === -1 && item.tool.name !== this.domain) {
                        item.hide = true;
                        hidden++;
                        this.nodesForUpdate.push(item.id);
                    }
                }
            });
            this.completedProceedNodes();
        }
        else {
            this.nodesList.forEach((nodeId) => {
                const item = this.nodes[nodeId];
                if (!item.hide && this.verifyOrderRoHide(item.tool.categories)) {
                    item.hide = true;
                    this.nodesForUpdate.push(item.id);
                    hidden++;
                }
            });
            if (all - hidden <= 50) {
                this.completedProceedNodes();
            }
            else {
                console.log("force");
                this.proceedNodes(all, hidden, true);
            }
        }
    }
    verifyOrderRoHide(categories) {
        if (!categories) {
            return true;
        }
        else {
            let hide = false;
            categories.forEach((cat) => {
                if (cat.toLowerCase().indexOf('framework') !== -1 ||
                    cat.toLowerCase().indexOf('hosting') !== -1 ||
                    cat.toLowerCase().indexOf('hosting') !== -1 ||
                    cat.toLowerCase().indexOf('player') !== -1 ||
                    cat.toLowerCase().indexOf('wordpress') !== -1 ||
                    cat.toLowerCase().indexOf('programming') !== -1 ||
                    cat.toLowerCase().indexOf('javascript') !== -1 ||
                    cat.toLowerCase().indexOf('slider') !== -1) {
                    hide = true;
                }
            });
            return hide;
        }
    }
    handleSlectArrow(data) {
        this.selectedArrow = data;
    }
    handleRemoveArrow() {
        this.handleRemoveArrows([this.selectedArrow.lineId]);
        document.querySelector(`path#${this.selectedArrow.lineId}`).remove();
        this.selectedArrow = null;
    }
    updatedNodePosiotion(data) {
        //console.log('aaa', data);
        this.service.updateNodeTool(data.nodeId, { position: data.position }).subscribe((res) => {
            const tool = this.nodes[data.nodeId].tool;
            res.tool = this.nodes[data.nodeId].tool;
            this.nodes[data.nodeId] = res;
        });
    }
    handleCloseTools() {
        this.hideList = true;
    }
    completedProceedNodes() {
        console.log(this.nodesForUpdate);
        this.loaded = true;
        if (this.nodesForUpdate.length) {
            this.service.hideNodes(this.nodesForUpdate).subscribe((data) => {
                this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList });
                this.changedCategories$.next(this.categories);
                this.getArrowsList();
            });
        }
        else {
            this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList });
            this.changedCategories$.next(this.categories);
            this.getArrowsList();
        }
    }
    getArrowsList() {
        if (this.blueprint.id) {
            this.service.getArrows(this.blueprint.id).toPromise().then((data) => {
                this.changedArrows$.next(data);
            }).catch((err) => { console.log(err); });
        }
    }
    handleDeselectArrow() {
        document.querySelector(`path#${this.selectedArrow.lineId}`).setAttribute('stroke-width', '2');
        this.selectedArrow = null;
    }
    handleRemoveArrows(ids) {
        console.log(ids);
        this.service.removeArrows(ids).toPromise().then((result) => {
            this.service.getArrows(this.blueprint.id).toPromise().then((data) => {
                this.changedArrows$.next(data);
            }).catch((err) => console.log(err));
        }).catch((error) => {
            console.log(error);
        });
    }
    moveToHome() {
        this.router.navigateByUrl('/home');
    }
    handleHideList() {
        this.hideList = !this.hideList;
    }
    handleHideNodeItem(data) {
        if (!data.hide) {
            data['hide'] = true;
        }
        else {
            data.hide = false;
        }
        this.service.updateNodeTool(data.id, { hide: data.hide }).subscribe((res) => {
            // const nodeIndex = this.nodes.findIndex((item) => item.id = res.id );
            res.tool = this.nodes[data.id].tool;
            this.nodes[data.id] = res;
            this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList });
            // this.margeShowNodes();
        });
    }
    handleAddArrow(data) {
        console.log(data);
        this.service.addArrow(this.blueprint.id, data).toPromise().then((result) => {
            console.log(result);
        }).catch(err => console.log(err));
    }
    handleUpdateArrow(data) {
        console.log(data);
        this.service.updateArrow(data).toPromise().then((result) => {
            console.log(result);
        }).catch(err => console.log(err));
    }
    handleHideNode(data) {
        // console.log("handleHideNode", data);
        this.service.updateNodeTool(data.id, { hide: true }).subscribe((res) => {
            res.tool = this.nodes[data.id].tool;
            this.nodes[data.id] = res;
            console.log('-----------------------updateNodeTool--------------------------------');
            this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList, hiddenItem: data.id });
        });
    }
    margeShowNodes() {
        this.showNodes = [];
        this.nodes.forEach((item) => {
            if (!item.hide) {
                this.showNodes.push(item);
            }
        });
    }
}
BuildStackComponent.ɵfac = function BuildStackComponent_Factory(t) { return new (t || BuildStackComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_core_services_blueprints_service__WEBPACK_IMPORTED_MODULE_2__["BlueprintsService"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"])); };
BuildStackComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: BuildStackComponent, selectors: [["app-build-stack"]], viewQuery: function BuildStackComponent_Query(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵviewQuery"](_c0, true);
    } if (rf & 2) {
        var _t;
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵloadQuery"]()) && (ctx.stackWorkFlow = _t.first);
    } }, decls: 18, vars: 8, consts: [[1, "main"], [1, "mt-container"], [1, "stackContainer"], ["class", "stackActions", 4, "ngIf"], ["class", "loading-data-section", 4, "ngIf"], ["class", "error-loading-alert", 4, "ngIf"], [3, "loadedNodes", "loadedArrows", "positionNodeChanged", "arrowAdded", "arrowUpdated", "hideNode", "removeArrows", "selectArrow", 4, "ngIf"], [3, "ngClass", "loadedNodes", "loadedCategories", "toogleVisibilityNode", "closeTools", 4, "ngIf"], [3, "ngClass"], [1, "header-tools"], [1, "title"], ["mat-icon-button", "", 3, "click"], [1, "tools-node-items"], ["class", "node-item", 4, "ngFor", "ngForOf"], [1, "stackActions"], ["mat-raised-button", "", 3, "click"], ["mat-raised-button", "", 3, "click", 4, "ngIf"], ["mat-raised-button", "", "class", "delete-arrow-action", 3, "click", 4, "ngIf"], ["mat-raised-button", "", 1, "delete-arrow-action", 3, "click"], [1, "loading-data-section"], [1, "loading-message"], [1, "error-loading-alert"], ["color", "accent"], [1, "error-message"], ["mat-button", "", "color", "primary", 3, "click"], [3, "loadedNodes", "loadedArrows", "positionNodeChanged", "arrowAdded", "arrowUpdated", "hideNode", "removeArrows", "selectArrow"], [3, "ngClass", "loadedNodes", "loadedCategories", "toogleVisibilityNode", "closeTools"], [1, "node-item"], [1, "item-categories"], [1, "item-name"], [1, "item-description"], [1, "actions"], [1, "example-margin", 3, "checked", "color", "change"]], template: function BuildStackComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, " Build Your Stack ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](5, BuildStackComponent_div_5_Template, 10, 2, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](6, BuildStackComponent_div_6_Template, 4, 0, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](7, BuildStackComponent_div_7_Template, 7, 1, "div", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](8, BuildStackComponent_app_builder_8_Template, 1, 2, "app-builder", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](9, BuildStackComponent_app_tools_list_9_Template, 1, 5, "app-tools-list", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](10, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](11, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](12, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "button", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function BuildStackComponent_Template_button_click_13_listener() { return ctx.handleHideList(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](14, "mat-icon");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](15, "clear");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](16, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](17, BuildStackComponent_div_17_Template, 15, 5, "div", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.loaded);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", !ctx.loaded && !ctx.isError);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.isError);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.loaded);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.loaded);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction0"](7, _c2));
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", ctx.nodesList);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_4__["NgIf"], _angular_common__WEBPACK_IMPORTED_MODULE_4__["NgClass"], _angular_material_button__WEBPACK_IMPORTED_MODULE_5__["MatButton"], _angular_material_icon__WEBPACK_IMPORTED_MODULE_6__["MatIcon"], _angular_common__WEBPACK_IMPORTED_MODULE_4__["NgForOf"], _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_7__["MatSpinner"], _components_builder_builder_component__WEBPACK_IMPORTED_MODULE_8__["BuilderComponent"], _components_tools_list_tools_list_component__WEBPACK_IMPORTED_MODULE_9__["ToolsListComponent"], _angular_material_card__WEBPACK_IMPORTED_MODULE_10__["MatCard"], _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_11__["MatSlideToggle"]], styles: [".stackContainer[_ngcontent-%COMP%] {\n  max-width: 1170px;\n  margin: auto;\n  position: relative;\n}\n.stackContainer[_ngcontent-%COMP%]   .stackActions[_ngcontent-%COMP%] {\n  min-height: 60px;\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n}\n.stackContainer[_ngcontent-%COMP%]   .delete-arrow-action[_ngcontent-%COMP%] {\n  background-color: #AA2211;\n  color: #ffffff;\n}\n.stackContainer[_ngcontent-%COMP%]   .item-categories[_ngcontent-%COMP%] {\n  border-bottom: solid 1px #cccccc;\n}\n.stackContainer[_ngcontent-%COMP%]   .item-description[_ngcontent-%COMP%] {\n  font-size: 0.8em;\n}\n.stackContainer[_ngcontent-%COMP%]   .loading-data-section[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding-top: 100px;\n  padding-bottom: 50px;\n  flex-wrap: wrap;\n}\n.stackContainer[_ngcontent-%COMP%]   .loading-data-section[_ngcontent-%COMP%]   .loading-message[_ngcontent-%COMP%] {\n  margin-top: 40px;\n  width: 100%;\n  text-align: center;\n  font-size: 1.2em;\n}\n.stackContainer[_ngcontent-%COMP%]   .error-loading-alert[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding-top: 100px;\n  padding-bottom: 50px;\n  flex-wrap: wrap;\n}\n.stackContainer[_ngcontent-%COMP%]   .error-loading-alert[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%] {\n  font-size: 72px;\n  width: 72px;\n  height: 72px;\n}\n.stackContainer[_ngcontent-%COMP%]   .error-loading-alert[_ngcontent-%COMP%]   .error-message[_ngcontent-%COMP%] {\n  margin-top: 30px;\n  width: 100%;\n  text-align: center;\n}\n.hideTools[_ngcontent-%COMP%] {\n  display: none;\n}\n.toolsList[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 100%;\n  max-width: 400px;\n  top: 0;\n  left: 0;\n  z-index: 105;\n  background-color: #ffffff;\n  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3);\n  height: 100vh;\n}\n.toolsList[_ngcontent-%COMP%]   .tools-node-items[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 60px;\n  bottom: 0;\n  width: 100%;\n  overflow: auto;\n}\n.toolsList[_ngcontent-%COMP%]   .header-tools[_ngcontent-%COMP%] {\n  border-bottom: solid 2px #cccccc;\n  height: 58px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0 20px;\n}\n.toolsList[_ngcontent-%COMP%]   .node-item[_ngcontent-%COMP%] {\n  border-bottom: solid 1px #999999;\n}\n.toolsList.hide[_ngcontent-%COMP%] {\n  display: none;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbW9kdWxlcy9ibHVlcHJpbnQvcGFnZXMvYnVpbGQtc3RhY2svRDpcXHByb2plY3RzXFxtYXJ0YWNodG9vbFxcZnJvbnQvc3JjXFxhcHBcXG1vZHVsZXNcXGJsdWVwcmludFxccGFnZXNcXGJ1aWxkLXN0YWNrXFxidWlsZC1zdGFjay5jb21wb25lbnQuc2NzcyIsInNyYy9hcHAvbW9kdWxlcy9ibHVlcHJpbnQvcGFnZXMvYnVpbGQtc3RhY2svYnVpbGQtc3RhY2suY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxpQkFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtBQ0NKO0FEQ0k7RUFDSSxnQkFBQTtFQUNBLGFBQUE7RUFDQSw4QkFBQTtFQUNBLHVCQUFBO0FDQ1I7QURFSTtFQUNJLHlCQUFBO0VBQ0EsY0FBQTtBQ0FSO0FER0k7RUFDSSxnQ0FBQTtBQ0RSO0FESUk7RUFDSSxnQkFBQTtBQ0ZSO0FES0k7RUFDRyxhQUFBO0VBQ0EsdUJBQUE7RUFDQSxrQkFBQTtFQUNBLG9CQUFBO0VBQ0EsZUFBQTtBQ0hQO0FES087RUFDSyxnQkFBQTtFQUNBLFdBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0FDSFo7QURPSTtFQUNJLGFBQUE7RUFDQSx1QkFBQTtFQUNBLGtCQUFBO0VBQ0Esb0JBQUE7RUFDQSxlQUFBO0FDTFI7QURPUTtFQUNJLGVBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtBQ0xaO0FEUVE7RUFDSSxnQkFBQTtFQUNBLFdBQUE7RUFDQSxrQkFBQTtBQ05aO0FEWUE7RUFDSSxhQUFBO0FDVEo7QURZQTtFQUNJLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLGdCQUFBO0VBQ0EsTUFBQTtFQUNBLE9BQUE7RUFDQSxZQUFBO0VBQ0EseUJBQUE7RUFDQSwwQ0FBQTtFQUNBLGFBQUE7QUNUSjtBRFdJO0VBQ0ksa0JBQUE7RUFDQSxTQUFBO0VBQ0EsU0FBQTtFQUNBLFdBQUE7RUFDQSxjQUFBO0FDVFI7QURZSTtFQUNJLGdDQUFBO0VBQ0EsWUFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLDhCQUFBO0VBQ0EsZUFBQTtBQ1ZSO0FEYUk7RUFDSSxnQ0FBQTtBQ1hSO0FEY0k7RUFDSSxhQUFBO0FDWlIiLCJmaWxlIjoic3JjL2FwcC9tb2R1bGVzL2JsdWVwcmludC9wYWdlcy9idWlsZC1zdGFjay9idWlsZC1zdGFjay5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5zdGFja0NvbnRhaW5lcntcclxuICAgIG1heC13aWR0aDogMTE3MHB4O1xyXG4gICAgbWFyZ2luOiBhdXRvO1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG5cclxuICAgIC5zdGFja0FjdGlvbnN7XHJcbiAgICAgICAgbWluLWhlaWdodDogNjBweDtcclxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcclxuICAgICAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcclxuICAgIH1cclxuXHJcbiAgICAuZGVsZXRlLWFycm93LWFjdGlvbntcclxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjQUEyMjExO1xyXG4gICAgICAgIGNvbG9yOiAjZmZmZmZmO1xyXG4gICAgfVxyXG5cclxuICAgIC5pdGVtLWNhdGVnb3JpZXN7XHJcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogc29saWQgMXB4ICNjY2NjY2M7XHJcbiAgICB9XHJcblxyXG4gICAgLml0ZW0tZGVzY3JpcHRpb257XHJcbiAgICAgICAgZm9udC1zaXplOiAwLjhlbTtcclxuICAgIH1cclxuXHJcbiAgICAubG9hZGluZy1kYXRhLXNlY3Rpb257XHJcbiAgICAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgICAgICBwYWRkaW5nLXRvcDogMTAwcHg7XHJcbiAgICAgICBwYWRkaW5nLWJvdHRvbTogNTBweDtcclxuICAgICAgIGZsZXgtd3JhcDogd3JhcDtcclxuXHJcbiAgICAgICAubG9hZGluZy1tZXNzYWdle1xyXG4gICAgICAgICAgICBtYXJnaW4tdG9wOiA0MHB4O1xyXG4gICAgICAgICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgICAgICAgICBmb250LXNpemU6IDEuMmVtO1xyXG4gICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC5lcnJvci1sb2FkaW5nLWFsZXJ0e1xyXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgICAgICAgcGFkZGluZy10b3A6IDEwMHB4O1xyXG4gICAgICAgIHBhZGRpbmctYm90dG9tOiA1MHB4O1xyXG4gICAgICAgIGZsZXgtd3JhcDogd3JhcDtcclxuXHJcbiAgICAgICAgLm1hdC1pY29ue1xyXG4gICAgICAgICAgICBmb250LXNpemU6IDcycHg7XHJcbiAgICAgICAgICAgIHdpZHRoOiA3MnB4O1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDcycHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAuZXJyb3ItbWVzc2FnZXtcclxuICAgICAgICAgICAgbWFyZ2luLXRvcDogMzBweDtcclxuICAgICAgICAgICAgd2lkdGg6IDEwMCU7XHJcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuLmhpZGVUb29sc3tcclxuICAgIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuXHJcbi50b29sc0xpc3R7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIG1heC13aWR0aDogNDAwcHg7XHJcbiAgICB0b3A6IDA7XHJcbiAgICBsZWZ0OiAwO1xyXG4gICAgei1pbmRleDogMTA1O1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZmZmZjtcclxuICAgIGJveC1zaGFkb3c6IDAgNHB4IDhweCAwIHJnYmEoMCwwLDAsLjMpO1xyXG4gICAgaGVpZ2h0OiAxMDB2aDtcclxuXHJcbiAgICAudG9vbHMtbm9kZS1pdGVtc3tcclxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgdG9wOiA2MHB4O1xyXG4gICAgICAgIGJvdHRvbTogMDtcclxuICAgICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgICBvdmVyZmxvdzogYXV0bztcclxuICAgIH1cclxuXHJcbiAgICAuaGVhZGVyLXRvb2xze1xyXG4gICAgICAgIGJvcmRlci1ib3R0b206IHNvbGlkIDJweCAjY2NjY2NjO1xyXG4gICAgICAgIGhlaWdodDogNThweDtcclxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xyXG4gICAgICAgIHBhZGRpbmc6IDAgMjBweDtcclxuICAgIH1cclxuXHJcbiAgICAubm9kZS1pdGVte1xyXG4gICAgICAgIGJvcmRlci1ib3R0b206IHNvbGlkIDFweCAjOTk5OTk5O1xyXG4gICAgfVxyXG5cclxuICAgICYuaGlkZXtcclxuICAgICAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgfVxyXG59XHJcbiIsIi5zdGFja0NvbnRhaW5lciB7XG4gIG1heC13aWR0aDogMTE3MHB4O1xuICBtYXJnaW46IGF1dG87XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbi5zdGFja0NvbnRhaW5lciAuc3RhY2tBY3Rpb25zIHtcbiAgbWluLWhlaWdodDogNjBweDtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbn1cbi5zdGFja0NvbnRhaW5lciAuZGVsZXRlLWFycm93LWFjdGlvbiB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNBQTIyMTE7XG4gIGNvbG9yOiAjZmZmZmZmO1xufVxuLnN0YWNrQ29udGFpbmVyIC5pdGVtLWNhdGVnb3JpZXMge1xuICBib3JkZXItYm90dG9tOiBzb2xpZCAxcHggI2NjY2NjYztcbn1cbi5zdGFja0NvbnRhaW5lciAuaXRlbS1kZXNjcmlwdGlvbiB7XG4gIGZvbnQtc2l6ZTogMC44ZW07XG59XG4uc3RhY2tDb250YWluZXIgLmxvYWRpbmctZGF0YS1zZWN0aW9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHBhZGRpbmctdG9wOiAxMDBweDtcbiAgcGFkZGluZy1ib3R0b206IDUwcHg7XG4gIGZsZXgtd3JhcDogd3JhcDtcbn1cbi5zdGFja0NvbnRhaW5lciAubG9hZGluZy1kYXRhLXNlY3Rpb24gLmxvYWRpbmctbWVzc2FnZSB7XG4gIG1hcmdpbi10b3A6IDQwcHg7XG4gIHdpZHRoOiAxMDAlO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGZvbnQtc2l6ZTogMS4yZW07XG59XG4uc3RhY2tDb250YWluZXIgLmVycm9yLWxvYWRpbmctYWxlcnQge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgcGFkZGluZy10b3A6IDEwMHB4O1xuICBwYWRkaW5nLWJvdHRvbTogNTBweDtcbiAgZmxleC13cmFwOiB3cmFwO1xufVxuLnN0YWNrQ29udGFpbmVyIC5lcnJvci1sb2FkaW5nLWFsZXJ0IC5tYXQtaWNvbiB7XG4gIGZvbnQtc2l6ZTogNzJweDtcbiAgd2lkdGg6IDcycHg7XG4gIGhlaWdodDogNzJweDtcbn1cbi5zdGFja0NvbnRhaW5lciAuZXJyb3ItbG9hZGluZy1hbGVydCAuZXJyb3ItbWVzc2FnZSB7XG4gIG1hcmdpbi10b3A6IDMwcHg7XG4gIHdpZHRoOiAxMDAlO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG5cbi5oaWRlVG9vbHMge1xuICBkaXNwbGF5OiBub25lO1xufVxuXG4udG9vbHNMaXN0IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB3aWR0aDogMTAwJTtcbiAgbWF4LXdpZHRoOiA0MDBweDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB6LWluZGV4OiAxMDU7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmZmZmY7XG4gIGJveC1zaGFkb3c6IDAgNHB4IDhweCAwIHJnYmEoMCwgMCwgMCwgMC4zKTtcbiAgaGVpZ2h0OiAxMDB2aDtcbn1cbi50b29sc0xpc3QgLnRvb2xzLW5vZGUtaXRlbXMge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogNjBweDtcbiAgYm90dG9tOiAwO1xuICB3aWR0aDogMTAwJTtcbiAgb3ZlcmZsb3c6IGF1dG87XG59XG4udG9vbHNMaXN0IC5oZWFkZXItdG9vbHMge1xuICBib3JkZXItYm90dG9tOiBzb2xpZCAycHggI2NjY2NjYztcbiAgaGVpZ2h0OiA1OHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIHBhZGRpbmc6IDAgMjBweDtcbn1cbi50b29sc0xpc3QgLm5vZGUtaXRlbSB7XG4gIGJvcmRlci1ib3R0b206IHNvbGlkIDFweCAjOTk5OTk5O1xufVxuLnRvb2xzTGlzdC5oaWRlIHtcbiAgZGlzcGxheTogbm9uZTtcbn0iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](BuildStackComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-build-stack',
                templateUrl: './build-stack.component.html',
                styleUrls: ['./build-stack.component.scss']
            }]
    }], function () { return [{ type: _core_services_blueprints_service__WEBPACK_IMPORTED_MODULE_2__["BlueprintsService"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"] }]; }, { stackWorkFlow: [{
            type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"],
            args: ['stackWorkFlow']
        }] }); })();


/***/ }),

/***/ "./src/app/modules/blueprint/pages/share/share.component.ts":
/*!******************************************************************!*\
  !*** ./src/app/modules/blueprint/pages/share/share.component.ts ***!
  \******************************************************************/
/*! exports provided: ShareComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShareComponent", function() { return ShareComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");


class ShareComponent {
    constructor() {
    }
    ngOnInit() {
    }
}
ShareComponent.ɵfac = function ShareComponent_Factory(t) { return new (t || ShareComponent)(); };
ShareComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: ShareComponent, selectors: [["app-share"]], decls: 4, vars: 0, consts: [[1, "main"], [1, "mt-container"]], template: function ShareComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](3, " Share you stack ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL21vZHVsZXMvYmx1ZXByaW50L3BhZ2VzL3NoYXJlL3NoYXJlLmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ShareComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-share',
                templateUrl: './share.component.html',
                styleUrls: ['./share.component.scss']
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "./src/app/modules/home/home-routing.module.ts":
/*!*****************************************************!*\
  !*** ./src/app/modules/home/home-routing.module.ts ***!
  \*****************************************************/
/*! exports provided: HomeRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeRoutingModule", function() { return HomeRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
/* harmony import */ var _pages_home_home_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/home/home.component */ "./src/app/modules/home/pages/home/home.component.ts");





const routes = [
    {
        path: '',
        component: _pages_home_home_component__WEBPACK_IMPORTED_MODULE_2__["HomeComponent"]
    }
];
class HomeRoutingModule {
}
HomeRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: HomeRoutingModule });
HomeRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function HomeRoutingModule_Factory(t) { return new (t || HomeRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
        _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](HomeRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](HomeRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes)],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/modules/home/home.module.ts":
/*!*********************************************!*\
  !*** ./src/app/modules/home/home.module.ts ***!
  \*********************************************/
/*! exports provided: HomeModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeModule", function() { return HomeModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/__ivy_ngcc__/fesm2015/forms.js");
/* harmony import */ var _home_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./home-routing.module */ "./src/app/modules/home/home-routing.module.ts");
/* harmony import */ var _pages_home_home_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pages/home/home.component */ "./src/app/modules/home/pages/home/home.component.ts");
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _shared_modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../shared/modules/material/buttons-indicators/buttons-indicators.module */ "./src/app/shared/modules/material/buttons-indicators/buttons-indicators.module.ts");
/* harmony import */ var _shared_modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../shared/modules/material/forms-controls/forms-controls.module */ "./src/app/shared/modules/material/forms-controls/forms-controls.module.ts");









class HomeModule {
}
HomeModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: HomeModule });
HomeModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function HomeModule_Factory(t) { return new (t || HomeModule)(); }, imports: [[
            _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
            _home_routing_module__WEBPACK_IMPORTED_MODULE_3__["HomeRoutingModule"],
            _shared_shared_module__WEBPACK_IMPORTED_MODULE_5__["SharedModule"],
            _shared_modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_7__["FormsControlsModule"],
            _shared_modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_6__["ButtonsIndicatorsModule"],
            _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"],
            _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ReactiveFormsModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](HomeModule, { declarations: [_pages_home_home_component__WEBPACK_IMPORTED_MODULE_4__["HomeComponent"]], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
        _home_routing_module__WEBPACK_IMPORTED_MODULE_3__["HomeRoutingModule"],
        _shared_shared_module__WEBPACK_IMPORTED_MODULE_5__["SharedModule"],
        _shared_modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_7__["FormsControlsModule"],
        _shared_modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_6__["ButtonsIndicatorsModule"],
        _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"],
        _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ReactiveFormsModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](HomeModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [_pages_home_home_component__WEBPACK_IMPORTED_MODULE_4__["HomeComponent"]],
                imports: [
                    _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                    _home_routing_module__WEBPACK_IMPORTED_MODULE_3__["HomeRoutingModule"],
                    _shared_shared_module__WEBPACK_IMPORTED_MODULE_5__["SharedModule"],
                    _shared_modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_7__["FormsControlsModule"],
                    _shared_modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_6__["ButtonsIndicatorsModule"],
                    _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"],
                    _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ReactiveFormsModule"]
                ],
                schemas: [_angular_core__WEBPACK_IMPORTED_MODULE_0__["CUSTOM_ELEMENTS_SCHEMA"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/modules/home/pages/home/home.component.ts":
/*!***********************************************************!*\
  !*** ./src/app/modules/home/pages/home/home.component.ts ***!
  \***********************************************************/
/*! exports provided: HomeComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomeComponent", function() { return HomeComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/__ivy_ngcc__/fesm2015/forms.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/form-field.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/input.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/button.js");









function HomeComponent_mat_error_11_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "mat-error");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](1, " Please enter a valid domain ");
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
} }
class HomeComponent {
    constructor(router) {
        this.router = router;
        this.domain = new _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControl"]('', [_angular_forms__WEBPACK_IMPORTED_MODULE_1__["Validators"].pattern(/^([a-z.\-]+(\.)[a-z]{2,3})$/i)]);
    }
    ngOnInit() { }
    submitDomain() {
        if (!this.domain.invalid) {
            this.router.navigateByUrl('/blueprints/build?domain=' + this.domain.value);
        }
    }
}
HomeComponent.ɵfac = function HomeComponent_Factory(t) { return new (t || HomeComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"])); };
HomeComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: HomeComponent, selectors: [["app-home"]], decls: 15, vars: 2, consts: [[1, "main"], [1, "mt-full-screen", "mt-flex"], [1, "mt-container"], [1, "form-doamin"], ["appearance", "outline", 1, "input-domain"], ["matInput", "", "placeholder", "", "required", "", 3, "formControl"], [4, "ngIf"], [1, "submit-domain"], ["mat-raised-button", "", "color", "primary", 3, "click"]], template: function HomeComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "section", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](4, "h2");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](5, " Input Domain ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](6, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "mat-form-field", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](8, "mat-label");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](9, "Domain name:");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](10, "input", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](11, HomeComponent_mat_error_11_Template, 2, 0, "mat-error", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](12, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](13, "button", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function HomeComponent_Template_button_click_13_listener() { return ctx.submitDomain(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](14, "Submit");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](10);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("formControl", ctx.domain);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngIf", ctx.domain.invalid);
    } }, directives: [_angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__["MatFormField"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__["MatLabel"], _angular_material_input__WEBPACK_IMPORTED_MODULE_4__["MatInput"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["DefaultValueAccessor"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["RequiredValidator"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["NgControlStatus"], _angular_forms__WEBPACK_IMPORTED_MODULE_1__["FormControlDirective"], _angular_common__WEBPACK_IMPORTED_MODULE_5__["NgIf"], _angular_material_button__WEBPACK_IMPORTED_MODULE_6__["MatButton"], _angular_material_form_field__WEBPACK_IMPORTED_MODULE_3__["MatError"]], styles: [".input-domain[_ngcontent-%COMP%] {\n  min-width: 320px;\n}\n\n.submit-domain[_ngcontent-%COMP%] {\n  text-align: center;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbW9kdWxlcy9ob21lL3BhZ2VzL2hvbWUvRDpcXHByb2plY3RzXFxtYXJ0YWNodG9vbFxcZnJvbnQvc3JjXFxhcHBcXG1vZHVsZXNcXGhvbWVcXHBhZ2VzXFxob21lXFxob21lLmNvbXBvbmVudC5zY3NzIiwic3JjL2FwcC9tb2R1bGVzL2hvbWUvcGFnZXMvaG9tZS9ob21lLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksZ0JBQUE7QUNDSjs7QURDQTtFQUNJLGtCQUFBO0FDRUoiLCJmaWxlIjoic3JjL2FwcC9tb2R1bGVzL2hvbWUvcGFnZXMvaG9tZS9ob21lLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmlucHV0LWRvbWFpbntcclxuICAgIG1pbi13aWR0aDogMzIwcHg7XHJcbn1cclxuLnN1Ym1pdC1kb21haW57XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbn0iLCIuaW5wdXQtZG9tYWluIHtcbiAgbWluLXdpZHRoOiAzMjBweDtcbn1cblxuLnN1Ym1pdC1kb21haW4ge1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59Il19 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](HomeComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-home',
                templateUrl: './home.component.html',
                styleUrls: ['./home.component.scss']
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }]; }, null); })();


/***/ }),

/***/ "./src/app/shared/mappers/response-mapper.helper.ts":
/*!**********************************************************!*\
  !*** ./src/app/shared/mappers/response-mapper.helper.ts ***!
  \**********************************************************/
/*! exports provided: ResponseMappers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ResponseMappers", function() { return ResponseMappers; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm2015/index.js");




class ResponseMappers {
    constructor() {
    }
    mapResponse(observable) {
        return observable.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["map"])((response) => {
            return response.result;
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_1__["catchError"])(error => {
            if (error) {
                return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["throwError"])(error);
            }
        }));
    }
    getParams(filters, keyName) {
        let params = ['?'];
        if (filters && filters.length) {
            filters.forEach(filter => {
                params.push(`${keyName}=${filter}&`);
            });
        }
        return params.join('');
    }
}
ResponseMappers.ɵfac = function ResponseMappers_Factory(t) { return new (t || ResponseMappers)(); };
ResponseMappers.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: ResponseMappers, factory: ResponseMappers.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ResponseMappers, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{
                providedIn: 'root'
            }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "./src/app/shared/modules/material/buttons-indicators/buttons-indicators.module.ts":
/*!*****************************************************************************************!*\
  !*** ./src/app/shared/modules/material/buttons-indicators/buttons-indicators.module.ts ***!
  \*****************************************************************************************/
/*! exports provided: ButtonsIndicatorsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ButtonsIndicatorsModule", function() { return ButtonsIndicatorsModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/button.js");
/* harmony import */ var _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/button-toggle */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/button-toggle.js");
/* harmony import */ var _angular_material_chips__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/chips */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/chips.js");
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/icon.js");
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/progress-spinner */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/progress-spinner.js");







class ButtonsIndicatorsModule {
}
ButtonsIndicatorsModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: ButtonsIndicatorsModule });
ButtonsIndicatorsModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function ButtonsIndicatorsModule_Factory(t) { return new (t || ButtonsIndicatorsModule)(); }, imports: [[
            _angular_material_button__WEBPACK_IMPORTED_MODULE_1__["MatButtonModule"],
            _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_2__["MatButtonToggleModule"],
            _angular_material_chips__WEBPACK_IMPORTED_MODULE_3__["MatChipsModule"],
            _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__["MatIconModule"],
            _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_5__["MatProgressSpinnerModule"]
        ],
        _angular_material_button__WEBPACK_IMPORTED_MODULE_1__["MatButtonModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_2__["MatButtonToggleModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_3__["MatChipsModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__["MatIconModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_5__["MatProgressSpinnerModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](ButtonsIndicatorsModule, { imports: [_angular_material_button__WEBPACK_IMPORTED_MODULE_1__["MatButtonModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_2__["MatButtonToggleModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_3__["MatChipsModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__["MatIconModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_5__["MatProgressSpinnerModule"]], exports: [_angular_material_button__WEBPACK_IMPORTED_MODULE_1__["MatButtonModule"],
        _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_2__["MatButtonToggleModule"],
        _angular_material_chips__WEBPACK_IMPORTED_MODULE_3__["MatChipsModule"],
        _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__["MatIconModule"],
        _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_5__["MatProgressSpinnerModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](ButtonsIndicatorsModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [],
                imports: [
                    _angular_material_button__WEBPACK_IMPORTED_MODULE_1__["MatButtonModule"],
                    _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_2__["MatButtonToggleModule"],
                    _angular_material_chips__WEBPACK_IMPORTED_MODULE_3__["MatChipsModule"],
                    _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__["MatIconModule"],
                    _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_5__["MatProgressSpinnerModule"]
                ],
                exports: [
                    _angular_material_button__WEBPACK_IMPORTED_MODULE_1__["MatButtonModule"],
                    _angular_material_button_toggle__WEBPACK_IMPORTED_MODULE_2__["MatButtonToggleModule"],
                    _angular_material_chips__WEBPACK_IMPORTED_MODULE_3__["MatChipsModule"],
                    _angular_material_icon__WEBPACK_IMPORTED_MODULE_4__["MatIconModule"],
                    _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_5__["MatProgressSpinnerModule"]
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/shared/modules/material/common-behaviors/common-behaviors.module.ts":
/*!*************************************************************************************!*\
  !*** ./src/app/shared/modules/material/common-behaviors/common-behaviors.module.ts ***!
  \*************************************************************************************/
/*! exports provided: CommonBehaviorsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommonBehaviorsModule", function() { return CommonBehaviorsModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/cdk/drag-drop */ "./node_modules/@angular/cdk/__ivy_ngcc__/fesm2015/drag-drop.js");



class CommonBehaviorsModule {
}
CommonBehaviorsModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: CommonBehaviorsModule });
CommonBehaviorsModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function CommonBehaviorsModule_Factory(t) { return new (t || CommonBehaviorsModule)(); }, imports: [[
            _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["DragDropModule"]
        ],
        _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["DragDropModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](CommonBehaviorsModule, { imports: [_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["DragDropModule"]], exports: [_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["DragDropModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](CommonBehaviorsModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [],
                imports: [
                    _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["DragDropModule"]
                ],
                exports: [
                    _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_1__["DragDropModule"]
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/shared/modules/material/forms-controls/forms-controls.module.ts":
/*!*********************************************************************************!*\
  !*** ./src/app/shared/modules/material/forms-controls/forms-controls.module.ts ***!
  \*********************************************************************************/
/*! exports provided: FormsControlsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormsControlsModule", function() { return FormsControlsModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/input.js");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/form-field.js");
/* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/checkbox */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/checkbox.js");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/slide-toggle */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/slide-toggle.js");






class FormsControlsModule {
}
FormsControlsModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: FormsControlsModule });
FormsControlsModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function FormsControlsModule_Factory(t) { return new (t || FormsControlsModule)(); }, imports: [[
            _angular_material_input__WEBPACK_IMPORTED_MODULE_1__["MatInputModule"],
            _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldModule"],
            _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_3__["MatCheckboxModule"],
            _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_4__["MatSlideToggleModule"]
        ],
        _angular_material_input__WEBPACK_IMPORTED_MODULE_1__["MatInputModule"],
        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldModule"],
        _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_3__["MatCheckboxModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_4__["MatSlideToggleModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](FormsControlsModule, { imports: [_angular_material_input__WEBPACK_IMPORTED_MODULE_1__["MatInputModule"],
        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldModule"],
        _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_3__["MatCheckboxModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_4__["MatSlideToggleModule"]], exports: [_angular_material_input__WEBPACK_IMPORTED_MODULE_1__["MatInputModule"],
        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldModule"],
        _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_3__["MatCheckboxModule"],
        _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_4__["MatSlideToggleModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](FormsControlsModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [],
                imports: [
                    _angular_material_input__WEBPACK_IMPORTED_MODULE_1__["MatInputModule"],
                    _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldModule"],
                    _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_3__["MatCheckboxModule"],
                    _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_4__["MatSlideToggleModule"]
                ],
                exports: [
                    _angular_material_input__WEBPACK_IMPORTED_MODULE_1__["MatInputModule"],
                    _angular_material_form_field__WEBPACK_IMPORTED_MODULE_2__["MatFormFieldModule"],
                    _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_3__["MatCheckboxModule"],
                    _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_4__["MatSlideToggleModule"]
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/shared/modules/material/layout/layout.module.ts":
/*!*****************************************************************!*\
  !*** ./src/app/shared/modules/material/layout/layout.module.ts ***!
  \*****************************************************************/
/*! exports provided: LayoutModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LayoutModule", function() { return LayoutModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/card.js");
/* harmony import */ var _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/expansion */ "./node_modules/@angular/material/__ivy_ngcc__/fesm2015/expansion.js");




class LayoutModule {
}
LayoutModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: LayoutModule });
LayoutModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function LayoutModule_Factory(t) { return new (t || LayoutModule)(); }, imports: [[
            _angular_material_card__WEBPACK_IMPORTED_MODULE_1__["MatCardModule"],
            _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionModule"]
        ],
        _angular_material_card__WEBPACK_IMPORTED_MODULE_1__["MatCardModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](LayoutModule, { imports: [_angular_material_card__WEBPACK_IMPORTED_MODULE_1__["MatCardModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionModule"]], exports: [_angular_material_card__WEBPACK_IMPORTED_MODULE_1__["MatCardModule"],
        _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](LayoutModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [],
                imports: [
                    _angular_material_card__WEBPACK_IMPORTED_MODULE_1__["MatCardModule"],
                    _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionModule"]
                ],
                exports: [
                    _angular_material_card__WEBPACK_IMPORTED_MODULE_1__["MatCardModule"],
                    _angular_material_expansion__WEBPACK_IMPORTED_MODULE_2__["MatExpansionModule"]
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/app/shared/shared.module.ts":
/*!*****************************************!*\
  !*** ./src/app/shared/shared.module.ts ***!
  \*****************************************/
/*! exports provided: SharedModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SharedModule", function() { return SharedModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/__ivy_ngcc__/fesm2015/common.js");
/* harmony import */ var _modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/material/forms-controls/forms-controls.module */ "./src/app/shared/modules/material/forms-controls/forms-controls.module.ts");
/* harmony import */ var _modules_material_layout_layout_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/material/layout/layout.module */ "./src/app/shared/modules/material/layout/layout.module.ts");
/* harmony import */ var _modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/material/buttons-indicators/buttons-indicators.module */ "./src/app/shared/modules/material/buttons-indicators/buttons-indicators.module.ts");
/* harmony import */ var _modules_material_common_behaviors_common_behaviors_module__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/material/common-behaviors/common-behaviors.module */ "./src/app/shared/modules/material/common-behaviors/common-behaviors.module.ts");







class SharedModule {
}
SharedModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: SharedModule });
SharedModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function SharedModule_Factory(t) { return new (t || SharedModule)(); }, imports: [[
            _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
            _modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_2__["FormsControlsModule"],
            _modules_material_layout_layout_module__WEBPACK_IMPORTED_MODULE_3__["LayoutModule"],
            _modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_4__["ButtonsIndicatorsModule"],
            _modules_material_common_behaviors_common_behaviors_module__WEBPACK_IMPORTED_MODULE_5__["CommonBehaviorsModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](SharedModule, { imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
        _modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_2__["FormsControlsModule"],
        _modules_material_layout_layout_module__WEBPACK_IMPORTED_MODULE_3__["LayoutModule"],
        _modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_4__["ButtonsIndicatorsModule"],
        _modules_material_common_behaviors_common_behaviors_module__WEBPACK_IMPORTED_MODULE_5__["CommonBehaviorsModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](SharedModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [],
                imports: [
                    _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                    _modules_material_forms_controls_forms_controls_module__WEBPACK_IMPORTED_MODULE_2__["FormsControlsModule"],
                    _modules_material_layout_layout_module__WEBPACK_IMPORTED_MODULE_3__["LayoutModule"],
                    _modules_material_buttons_indicators_buttons_indicators_module__WEBPACK_IMPORTED_MODULE_4__["ButtonsIndicatorsModule"],
                    _modules_material_common_behaviors_common_behaviors_module__WEBPACK_IMPORTED_MODULE_5__["CommonBehaviorsModule"]
                ],
            }]
    }], null, null); })();


/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/platform-browser.js");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! D:\projects\martachtool\front\src\main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main-es2015.js.map