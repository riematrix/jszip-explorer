/**
 * Created by riematrix on 2014/8/21.
 */
function ZipExplorer(zipData){
    this.zip = new JSZip(DataStorage.get(zipData));
}
ZipExplorer.prototype = {
    explore: function(){},
    createFile: function(path, data){
        var content = data || "";
        return this.zip.file(path, content);
    },
    readFile: function(path){
        return this.zip.file(path);
    },
    createFolder: function(path){
        return this.zip.folder(path);
    },
    update: function(path,data){},
    remove: function(path){
        return this.zip.remove(path);
    },

    getRootZipObject: function(){
        return this.zip;
    },

    rootZipToTreeObject: function(){
        var zipObject = this.zip;
        var root = {
            id: "root",
            text: "root",
            state: ""
        };
        var convert = function(dir, node){
            var current = zipObject.folder(dir);
            var files = current.file(/[\s\S]/),
                folders = current.folder(/[\s\S]/),
                name,
                children = [],
                i;
            node.children = children;
            for(i=0;i<files.length;i++){
                name = files[i].name;
                if(dir === "" && name.match(/\//g) === null
                    || name.replace(dir).match(/\//g) === null){
                    children.push({
                        id: name,
                        text: name.split("/").pop(),
                        icon: "file file-" + name.substring(name.lastIndexOf(".") +1)
                    });
                }
            }
            for(i=0;i<folders.length;i++){
                name = folders[i].name;
                if(dir === "" && name.match(/\//g).length === 1
                    || name.replace(dir).match(/\//g).length === 1){
                    var folder = {
                        id: name,
                        text: name.substring(0,name.lastIndexOf("/")).split("/").pop()
                    };
                    convert(name, folder);
                    children.push(folder);
                }
            }
        };
        convert("", root);
        return root;
    }
};

var DataStorage = {
    get: function(keyStore){
        if(typeof keyStore === "object"){}
        else{
            keyStore += "";
        }
        return null;
    },
    put: function(key, value){
        if(typeof key === "object"){}
        else{
            key += "";
        }
    }
};