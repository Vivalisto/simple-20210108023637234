"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = __importStar(require("mongoose"));
var access_control_enum_1 = require("../enums/access-control.enum");
var ResourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uppercase: true,
        enum: Object.values(access_control_enum_1.ResourceControl),
    },
    action: {
        type: [String],
    },
});
var ProfileSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        uppercase: true,
        enum: Object.values(access_control_enum_1.ProfileType),
    },
    resource: [ResourceSchema],
});
var RoleSchema = new mongoose.Schema({
    group: {
        type: String,
        required: true,
        uppercase: true,
        enum: Object.values(access_control_enum_1.GroupType),
    },
    profile: ProfileSchema,
    description: {
        type: String,
    },
});
exports.default = RoleSchema;
