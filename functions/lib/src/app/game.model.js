"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["Created"] = 0] = "Created";
    GameStatus[GameStatus["Started"] = 1] = "Started";
    GameStatus[GameStatus["Finished"] = 2] = "Finished";
    GameStatus[GameStatus["Canceled"] = 3] = "Canceled";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
var TurnType;
(function (TurnType) {
    TurnType[TurnType["MakeNumber"] = 0] = "MakeNumber";
    TurnType[TurnType["Guess"] = 1] = "Guess";
    TurnType[TurnType["Wait"] = 2] = "Wait";
})(TurnType = exports.TurnType || (exports.TurnType = {}));
