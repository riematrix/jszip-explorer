/**
 * Created by riematrix on 2014/8/21.
 */
function ZipExplorer(zipData, renderTarget){
    this.zip = new JSZip(DataStorage.get(zipData));
    this.tree = this.rootZipToTreeObject();
    if(renderTarget) this.explore(renderTarget);
}
ZipExplorer.prototype = {
    explore: function(renderTarget){
        var target = typeof renderTarget === "string"
            ? $("#" +renderTarget)
            : $(renderTarget);
        target.jstree(this.defaultTheme);
    },
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
        this.defaultTheme.core.data = this.root;
        return root;
    }
};
ZipExplorer.prototype.defaultTheme = {
    "core" : {
        "animation" : 0,
        "check_callback" : true,
        "themes" : { "stripes" : true,'variant' : 'small' }
    },
    'sort' : function(a, b) {
        return this.get_type(a) === this.get_type(b) ? (this.get_text(a) > this.get_text(b) ? 1 : -1) : (this.get_type(a) >= this.get_type(b) ? 1 : -1);
    },
    'contextmenu' : {
        'items' : function(node) {
            var tmp = $.jstree.defaults.contextmenu.items();
            delete tmp.create.action;
            tmp.create.label = "New";
            tmp.create.submenu = {
                "create_folder" : {
                    "separator_after"	: true,
                    "label"				: "Folder",
                    "action"			: function (data) {
                        var inst = $.jstree.reference(data.reference),
                            obj = inst.get_node(data.reference);
                        inst.create_node(obj, { type : "default", text : "New folder" }, "last", function (new_node) {
                            setTimeout(function () { inst.edit(new_node); },0);
                        });
                    }
                },
                "create_file" : {
                    "label"				: "File",
                    "action"			: function (data) {
                        var inst = $.jstree.reference(data.reference),
                            obj = inst.get_node(data.reference);
                        inst.create_node(obj, { type : "file", text : "New file" }, "last", function (new_node) {
                            setTimeout(function () { inst.edit(new_node); },0);
                        });
                    }
                }
            };
            if(this.get_type(node) === "file") {
                delete tmp.create;
            }
            return tmp;
        }
    },
    'types' : {
        'default' : { 'icon' : 'folder' },
        'file' : { 'valid_children' : [], 'icon' : 'file' }
    },
    'plugins' : ['state','dnd','sort','types','contextmenu','unique']
};
ZipExplorer.prototype.controller = {
    'delete_node.jstree': function(e, data){},
    'create_node.jstree': function(e, data){},
    'rename_node.jstree': function(e, data){},
    'move_node.jstree': function(e, data){},
    'copy_node.jstree': function(e, data){},
    'changed.jstree': function(e, data){},
    'dblclick.jstree': function(e, data){}
};

function FileDecorator(fileName, data){
    if(fileName && data)
    {
        var end_fix = fileName.split(".").pop();
        return this.decorate(end_fix, data);
    }
    return this;
}
FileDecorator.prototype = {
    decorators: {
        "image": function(data){
            return data;
        },
        "css": function(data){
            return data;
        },
        "javascript": function(data){
            return data;
        },
        "html": function(data){
            return data;
        },
        "text": function(data){
            return data;
        }
    },
    decoratorMapping: function(){
        this.decoratorMapping = {
        'png': this.decorators["image"],
        'jpg': this.decorators["image"],
        'jpeg': this.decorators["image"],
        'bmp': this.decorators["image"],
        'gif': this.decorators["image"],
        'css': this.decorators["css"],
        'html': this.decorators["html"],
        'js': this.decorators["javascript"],
        'txt': this.decorators["javascript"]
    }
    },
    extend: function(end_fix, decorator){
        this.decoratorMapping[end_fix] = decorator;
    },
    decorate: function(end_fix, data){
        var decorator = this.decoratorMapping[end_fix];
        if(typeof decorator === "function"){
            return decorator(data);
        }
        return data;
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