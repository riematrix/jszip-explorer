// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function Filesystem(type, quota) {
    this.quota = quota || this.quota;
    this.type = type || this.type; // PERSISTENT or TEMPORARY
    this.storageType = this.type === window.PERSISTENT
        ? "webkitPersistentStorage"
        : "webkitTemporaryStorage";
    this.fs = null;
}

Filesystem.prototype = {
    quota: 1024,
    type: window.TEMPORARY,
    mimeType: "text/plain",
    init: function(){
        var deferred = $.Deferred();
        var type = this.type,
            quota = this.quota,
            self = this;
        navigator[this.storageType].requestQuota(quota, function(quota) {
            window.webkitRequestFileSystem(type, quota, function(fs){
                self.fs = fs;
                deferred.resolve(fs);
            }, function(){
                FileErrorHandler();
                deferred.reject();
            });
        },  function(){
            FileErrorHandler();
            deferred.reject();
        });
        return deferred.promise();
    },
    createFile: function(name, data, mimeType){
        mimeType = mimeType || this.mimeType;
        var deferred = $.Deferred();

        var splitPath = name.split("/"),
            fileName = splitPath.pop(),
            self = this;

        /*this.createDirectory(splitPath.join("/")).done(function(){*/
            self.fs.root.getFile(fileName, {create: true}, function(fileEntry) {
                fileEntry.createWriter(function(writer) {
                    writer.onwriteend = function(e) {
                        deferred.resolve();
                    };
                    writer.onerror = function(e) {
                        deferred.reject();
                    };
                    writer.write(new Blob([data], {type: mimeType}));
                }, function(){
                    FileErrorHandler();
                    deferred.reject();
                });

            });/*, function(){
                FileErrorHandler();
                deferred.reject();
            });
        });*/
        return deferred.promise();
    },
    appendToFile: function(name, content, mimeType){
        mimeType = mimeType || this.mimeType;
        var deferred = $.Deferred();
        this.fs.root.getFile(name, { create: false }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.seek(fileWriter.length);

                var bb = new BlobBuilder();
                bb.append(content);
                fileWriter.write(bb.getBlob(mimeType));
                deferred.resolve();
            }, function(){
                FileErrorHandler();
                deferred.reject();
            });
        }, function(){
            FileErrorHandler();
            deferred.reject();
        });
        return deferred.promise();
    },
    readFile: function(name){
        var deferred = $.Deferred();
        this.fs.root.getFile(name,
            {create: false},
            function(entry) {
                entry.file(function(file) {
                    var fileReader = new FileReader(), self = this;

                    fileReader.onload = function(e) {
                        deferred.resolve(e.target.result);
                    };

                    fileReader.onerror = function(e) {
                        console.error("Read failed: " + e.toString());
                        deferred.reject();
                    };

                    fileReader.readAsText(file);
                }, function(){
                    FileErrorHandler();
                    deferred.reject();
                });
            });
        return deferred.promise();
    },
    createDirectory: function(folder){
        var decedentFolders = folder.split("/"), root = this.fs.root;
        var deferred = $.Deferred();
        (function create(folders){
            root.getDirectory(folders[0], {create: true}, function(dirEntry) {
                if (folders.length) {
                    create(folders.slice(1));
                }
                else{
                    deferred.resolve();
                }
            }, function(e){
                FileErrorHandler(e);
                deferred.reject();
            });
        })(decedentFolders);
        return deferred.promise();
    },
    removeDirectory: function (directoryName, callback) {
        var deferred = $.Deferred();
        fs.root.getDirectory(directoryName, {}, function (dirEntry) {
            dirEntry.removeRecursively(function () {
                deferred.resolve();
            }, FileErrorHandler);

        }, FileErrorHandler);
        return deferred.promise();
    }/*,
     errorHandler: function(e){
     this.deferred.reject();
     FileErrorHandler(e);
     }*/
};

function FileErrorHandler(e) {
    var msg = "";

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = "QUOTA_EXCEEDED_ERR";
            break;
        case FileError.NOT_FOUND_ERR:
            msg = "NOT_FOUND_ERR";
            break;
        case FileError.SECURITY_ERR:
            msg = "SECURITY_ERR";
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = "INVALID_MODIFICATION_ERR";
            break;
        case FileError.INVALID_STATE_ERR:
            msg = "INVALID_STATE_ERR";
            break;
        default:
            msg = "Unknown Error";
            break;
    }
    console.error("Error: " + msg);
}