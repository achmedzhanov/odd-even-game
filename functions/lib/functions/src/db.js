"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var functions = require("firebase-functions");
var admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
function get(path) {
    return admin.database().ref(path).once('value').then(function (snapshot) {
        return snapshot.val();
    });
}
exports.get = get;
function set(path, value) {
    return admin.database().ref(path).set(value);
}
exports.set = set;
function push(path, value) {
    return admin.database().ref(path).push(value);
}
exports.push = push;
function remove(path) {
    return admin.database().ref(path).remove();
}
exports.remove = remove;
function transaction(path, callback) {
    return admin.database().ref(path).transaction(callback);
}
exports.transaction = transaction;
