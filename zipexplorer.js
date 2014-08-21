/**
 * Created by riematrix on 2014/8/21.
 */
var DataAdapter = {
    zipToTreeObject: function(zip){
        var root = {
            id: "root",
            text: "root",
            state: ""
        };
        var convert = function(dir, node){
            var files = zip.file(/[\s\S]/),
                folders = zip.folder(/[\s\S]/),
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
                    children.push({
                        id: name,
                        text: name.substring(0,name.lastIndexOf("/")).split("/").pop()
                    });
                }
            }
        };
        convert("", root);
        return root;
    }
};