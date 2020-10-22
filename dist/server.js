"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var startUp_1 = __importDefault(require("./startUp"));
var port = process.env.PORT || '3333';
startUp_1.default.app.listen(port, function () {
    console.log("\uD83D\uDE00 servidor executando na porta " + port);
});
// import express, { json } from 'express';
// import UserRoutes from './routes/UserRoutes';
// const server = express();
// server.use(express.json());
// server.use('/users', UserRoutes);
// server.listen(3333, () => {
//   console.log('api online!');
// });
