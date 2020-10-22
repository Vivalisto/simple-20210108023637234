"use strict";
//sendgridkey: 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
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var nodemailer = __importStar(require("nodemailer"));
var sendGridTransport = require('nodemailer-sendgrid-transport');
var keys_dev_1 = __importDefault(require("../config/keys-dev"));
var Mail = /** @class */ (function () {
    function Mail(from, to, cc, subject, message) {
        this.from = from;
        this.to = to;
        this.cc = cc;
        this.subject = subject;
        this.message = message;
    }
    Mail.prototype.sendMail = function () {
        var mailOptions = {
            from: this.from || 'noreply@vivalisto.com.br',
            to: this.to,
            cc: this.cc,
            subject: this.subject,
            html: this.message,
        };
        var transporter = nodemailer.createTransport(sendGridTransport({
            auth: {
                api_key: keys_dev_1.default.apiKeySendgrid,
            },
        }));
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return error;
            }
            else {
                console.log('info', info);
                return 'E-mail enviado com sucesso!';
            }
        });
    };
    return Mail;
}());
exports.default = new Mail();
