"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var functions = require("firebase-functions");
var db = require("./db");
var game_model_1 = require("../../src/app/game.model");
// When a new guessed noun is written to the Firebase Realtime Database (either
// from the 'analyzeSpeech' function or directly by the user's app when) we'll
// do the actual scorekeeping in this function.
exports.createGame = functions.database.ref('/requests/create-game/{userId}/{gameId}').onWrite(function (event) { return __awaiter(_this, void 0, void 0, function () {
    var numberOfPlayers, userId, gameId, nickname_1, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!event.data.current.val()) {
                    return [2 /*return*/];
                }
                numberOfPlayers = event.data.current.val().numberOfPlayers;
                userId = event.params.userId;
                gameId = event.params.gameId;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, db.get(/users/ + userId + '/nickname')];
            case 2:
                nickname_1 = _a.sent();
                return [4 /*yield*/, db.transaction('/games/' + gameId, function (game) {
                        if (game !== null) {
                            return game;
                        }
                        var players = {};
                        players[userId] = nickname_1;
                        return {
                            numberOfPlayers: numberOfPlayers,
                            creator: {
                                uid: userId,
                                nickname: nickname_1
                            },
                            players: players,
                            state: game_model_1.GameStatus.Created
                        };
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, db.set('/responses/create-game/' + userId + '/' + gameId, gameId)];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                console.error('Error while create game: ' + err_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
