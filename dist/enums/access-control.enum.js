"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionControl = exports.ResourceControl = exports.ProfileType = exports.GroupType = void 0;
var GroupType;
(function (GroupType) {
    GroupType["Vivalisto"] = "VIVALISTO";
    GroupType["Imobiliaria"] = "IMOBILIARIA";
    GroupType["Autonomo"] = "AUTONOMO";
    GroupType["cliente"] = "CLIENTE";
})(GroupType = exports.GroupType || (exports.GroupType = {}));
var ProfileType;
(function (ProfileType) {
    ProfileType["Master"] = "MASTER";
    ProfileType["Gerente"] = "GERENTE";
    ProfileType["Coordenador"] = "COORDENADOR";
    ProfileType["Corretor"] = "CORRETOR";
    ProfileType["Operacional"] = "OPERACIONAL";
    ProfileType["AdminGerente"] = "ADMIN_GERENTE";
    ProfileType["AdminCoordenador"] = "ADMIN_COORDENADOR";
    ProfileType["Admin"] = "ADMIN";
})(ProfileType = exports.ProfileType || (exports.ProfileType = {}));
var ResourceControl;
(function (ResourceControl) {
    ResourceControl["Proposal"] = "PROPOSAL";
    ResourceControl["Signing"] = "SIGNING";
    ResourceControl["RegistrationData"] = "REGISTRATION_DATA";
    ResourceControl["Setting"] = "SETTING";
    ResourceControl["User"] = "USER";
    ResourceControl["Customer"] = "CUTOMER";
    ResourceControl["CPHiring"] = "CP_HIRING";
    ResourceControl["Pages"] = "PAGES";
})(ResourceControl = exports.ResourceControl || (exports.ResourceControl = {}));
var actionControl;
(function (actionControl) {
    actionControl["Edit"] = "EDIT";
    actionControl["View"] = "VIEW";
    actionControl["List"] = "LIST";
    actionControl["Create"] = "CREATE";
    actionControl["Cancel"] = "CANCEL";
    actionControl["ReturnNegotiation"] = "RETURN_NEGOTIATION";
    actionControl["cancelHiring"] = "CANCEL_HIRING";
    actionControl["Delete"] = "DELETE";
    actionControl["Export"] = "EXPORT";
    actionControl["Approve"] = "APPROVE";
    actionControl["Invite"] = "INVITE";
    actionControl["Enable"] = "ENABLE";
    actionControl["Disable"] = "DISABLE";
    actionControl["DashboardPage"] = "DASHBOARD-PAGE";
    actionControl["RentPage"] = "RENT-PAGE";
    actionControl["BuySellPage"] = "BUY_SELL-PAGE";
    actionControl["RegistrationDataPage"] = "REGISTRATION_DATA-PAGE";
    actionControl["SettingPage"] = "SETTING-PAGE";
    actionControl["UserPage"] = "USER-PAGE";
    actionControl["CustomerPage"] = "CUSTOMER-PAGE";
    actionControl["CPProposalPage"] = "CP_PROPOSAL-PAGE";
    actionControl["CPHiringPage"] = "CP_HIRING-PAGE";
})(actionControl = exports.actionControl || (exports.actionControl = {}));