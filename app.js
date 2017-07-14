//mh_xml_filemanager

var express = require('express');
var ejs = require('ejs');
const fs = require("fs-extra");
var mkdirp = require("mkdirp");
var multer = require("multer");
var app = express();
var bodyParser = require("body-parser");

var http = require('http').Server(app);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set('views', __dirname);
app.use(express.static(__dirname));
app.use(express.static(__dirname + "/uploads/assets2"));




// ****************** INDEX *********************

app.get('/', function(req, res){
    "use strict";
    var thisurl = "/files/";
    var searchresults = [{name:"", path:""}];
    res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: "0"});
});


// ****************** NEW FOLDER ******************************************

app.post("/newfolder", function(req, res) {
    "use strict";
    var newfolder_name = (req.body.newfolder_name).trim();
    var newfolder_path = (req.body.newfolder_path).trim().toLowerCase();
    var folder_upload_directory = (req.body.folder_upload_directory).trim();
    var data, json;
    if ((newfolder_name !== "") && (newfolder_path !== "")) {
        try {
            data = fs.readFileSync("files" + folder_upload_directory + "root.json", "utf-8");
        } catch (err) {
            console.log("Error reading for newfolder: files" + folder_upload_directory + "root.json");
            return;
        }
        json = JSON.parse(data);
        if (json.length > 0) {
            var newid = Number(json[json.length - 1].id);
            newid+=1;
        } else {
            var newid = 1;
        }
        var i = -1, makefolder = true, newfolder = {};
        newfolder.id = newid;
        newfolder.name = newfolder_name;
        newfolder.type = "directory";
        newfolder.extension = "";
        newfolder.path = "/files" + folder_upload_directory + newfolder_path + "/";
        while ((i < json.length - 1) && (makefolder === true)) {
            i+=1;
            if (json[i].name.toLowerCase() === newfolder.name.toLowerCase()) {
                console.log('Folder with name already exists (non case sensitive)!');
                makefolder = false;
            }
            if (json[i].path === newfolder.path) {
                console.log('Folder with path already exists!');
                makefolder = false;
            }
        }
        if (makefolder === true) {
            json.push(newfolder);
            try {
                fs.writeFileSync("files" + folder_upload_directory + "root.json", JSON.stringify(json));
            } catch(err) {
                console.log("Error writing for newfolder: " + "files" + folder_upload_directory + "root.json");
                return;
            }
            var newarray = [];
            mkdirp("files" + folder_upload_directory + newfolder_path + "/", function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                try {
                    fs.writeFileSync("files" + folder_upload_directory + newfolder_path + "/root.json", JSON.stringify(newarray));            
                } catch(err) {
                    console.log("Error writing for newfolder: " + "files" + folder_upload_directory + newfolder_path + "/root.json");
                    return;
                }
            });
            try {
                data = fs.readFileSync("files/rootfiles.json", "utf-8");
            } catch (err) {
                console.log("Error reading for newfolder: files/rootfiles.json");
                return;
            }
            json = JSON.parse(data);
            var newroot = {};
            newroot.path = "/files" + folder_upload_directory + newfolder_path + "/root.json";
            json.push(newroot);
            try {
                fs.writeFileSync("files/rootfiles.json", JSON.stringify(json));
            } catch(err) {
                console.log("Error writing for newfolder: files/rootfiles.json");
                return;       
            }
            console.log("/files" + folder_upload_directory + newfolder_path + "/root.json" + " was added to rootfiles.json");
        }
    } else {
        console.log('Must input new folder name and path!');        
    }
    var thisurl = "/files" + folder_upload_directory;
    var searchresults = [{name:"", path:""}];
    res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: "0"});  
});



// ****************** UPLOAD FILES ************************************************************************

var storageFile = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/assets2/");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  } 
});

var uploadFile = multer({ storage : storageFile}).array("userFile",10);

var uploadfiles = [];

app.post("/uploadfile", function(req, res) {
    "use strict";
    uploadFile(req, res, function (err) {
        if(err) {
            res.redirect("back");
            return;
        } else {
            var file_upload_directory = req.body.file_upload_directory;
            var thisurl = "/files" + file_upload_directory;
            var searchresults = [{name:"", path:""}];
            if (req.files.length < 1) {
                res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: "0"});  
                return;
            } else {
                uploadfiles.length = 0;
                var f, thisfile, x;
                for (f = 0; f < req.files.length; f+=1) {
                    thisfile = req.files[f].filename;
                    fs.rename("/mh_xml_filemanager/uploads/assets2/" + thisfile, "/mh_xml_filemanager/files" + file_upload_directory + thisfile, function (err) {
                        if (err) {
                            console.log('Error moving ' + thisfile + ' to ' + file_upload_directory);
                            res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: "0"});  
                            return;
                        }
                    });
                    uploadfiles.push(thisfile);
                }
                try {
                    var data = fs.readFileSync("files" + file_upload_directory + "root.json", "utf-8");
                } catch (err) {
                    console.log("Error reading for uploadfile: " + file_upload_directory + "root.json");
                    res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: "0"});  
                    return;
                }                   
                var json = JSON.parse(data);
                for (f = 0; f < uploadfiles.length; f+=1) {
                    if (json.length > 0) {
                        var newid = Number(json[json.length - 1].id) + 1;
                    } else {
                        var newid = 1;
                    }
                    var filename = uploadfiles[f];
                    var i = filename.lastIndexOf(".");
                    var newfile = {};
                    newfile.id = newid;
                    newfile.name = filename.slice(0, i);
                    newfile.type = "file";
                    newfile.extension = filename.slice(i + 1);
                    newfile.path = "/files" + file_upload_directory + uploadfiles[f];
                    var j = -1, replacefile = false, thisfile;
                    while ((j < json.length - 1) && (replacefile === false)) {
                        j+=1;
                        i = json[j].path.lastIndexOf("/");
                        thisfile = json[j].path.slice(i + 1);
                        if (thisfile.toLowerCase() === uploadfiles[f].toLowerCase()) {
                            replacefile = true;
                        }
                    }
                    if (replacefile === false) {
                        json.push(newfile);
                    } else {
                        json[j].name = newfile.name;
                        json[j].path = newfile.path;
                    }                       
                }
                try {
                    fs.writeFileSync("files" + file_upload_directory + "root.json", JSON.stringify(json));
                } catch(err) {
                    console.log("Error writing for uploading: " + "files" + file_upload_directory + "root.json");
                    return;
                }
            }
            res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: "0"});  
        }
    });
});



//**** DOWNLOAD FILE **********************************************

app.get('/download/:urlfile', function(req, res) {
  var urlfile = req.query.urlfile;
  if (urlfile.lastIndexOf("/") !== (urlfile.length - 1)) {
      var file = __dirname + urlfile;
  } else {
      console.log('Download selected file only!');
  }
  res.download(file);
});




// ****************** SEARCH  ******************************************

app.post("/search", function(req, res) {
    "use strict";
    var searchinput = (req.body.searchinput).trim().toLowerCase();
    var thisurl = "/files" + req.body.thislevel;
    var searchtype = req.body.searchtype;
    var resulttype, rootfiles = [], thisgroup = {}, searchresults = [];
    if (searchinput !== "") {
        try {
            var theserootfiles = fs.readFileSync("files/rootfiles.json", "utf8");
        } catch (err) {
            console.log("Error reading for search: files/rootfiles.json");
            return;
        }
        rootfiles = JSON.parse(theserootfiles);
        var i, thisroot, data, j, json;
        for (i = 0; i < rootfiles.length; i+=1) {
            thisroot = rootfiles[i].path.slice(1);
            try {
                data = fs.readFileSync(thisroot, "utf8");
            } catch (err) {
                console.log("Error reading for search: " + thisroot);
                return;
            }
            json = JSON.parse(data);
            for (j = 0; j < json.length; j+=1) {
                if ((searchtype === "xmlfilenames") || (searchtype === "xmlcontent")) {           
                    if ((json[j].extension.toLowerCase() === "xml") || (json[j].extension.toLowerCase() === "exp")) {
                        if (json[j].name.toLowerCase().indexOf(searchinput) > -1) {
                            thisgroup = {};
                            thisgroup.name = json[j].name + "." + json[j].extension;
                            thisgroup.path = json[j].path;
                            searchresults.push(thisgroup);
                        } else {
                            if (searchtype === "xmlcontent") {
                                try {
                                    var thisxmlfile = fs.readFileSync(json[j].path.slice(1), "utf8");
                                } catch (err) {
                                    console.log("Error reading xml while searching: " + json[j].path);
                                    return;
                                }
                                if (thisxmlfile.toLowerCase().indexOf(searchinput) > -1) {
                                    thisgroup = {};
                                    thisgroup.name = json[j].name + "." + json[j].extension;
                                    thisgroup.path = json[j].path;
                                    searchresults.push(thisgroup);
                                }
                            }
                        }
                    }
                } else {
                    if (searchtype === "otherfilenames") {
                        if ((json[j].type === "file") && (json[j].extension.toLowerCase() !== "xml") && (json[j].extension.toLowerCase() !== "exp") && (json[j].name.toLowerCase().indexOf(searchinput) > -1)) {
                            thisgroup = {};
                            thisgroup.name = json[j].name + "." + json[j].extension;
                            thisgroup.path = json[j].path;
                            searchresults.push(thisgroup);
                        }
                    }
                }
            }
        }
        if (searchresults.length > 0) {
            if ((searchtype === "xmlfilenames") || (searchtype === "xmlcontent")) {                 
                resulttype = "1";
            } else {
                if (searchtype === "otherfilenames") {
                    resulttype = "2";
                }
            }
        } else {
            thisgroup.name = searchinput + " not found!";
            thisgroup.path = "/";
            searchresults.push(thisgroup);
            resulttype = "3";
        }
     } else {
        thisgroup.name = "Input search info!";
        thisgroup.path = "/";
        searchresults.push(thisgroup);
        resulttype = "3";
    }
    res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: resulttype});   
});



//****  DELETE A FILE OR FOLDER  **********************************************

app.post("/deleteitem", function(req, res) {
    "use strict";
    var item_id = req.body.delete_item_id;
    var item_parent = req.body.delete_item_parent;
    var thisurl = "/files" + item_parent;
    var searchresults = [{name:"", path:""}];
    if ((item_id !== "") && (item_parent !== "")) {
        try {
            var data = fs.readFileSync("files" + item_parent + "root.json", "utf-8");
        } catch (err) {
            console.log('Error reading from deleteitem: ' + thisurl + "root.json");
            res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: "0"});
            return;
        }
        var json = JSON.parse(data);
        var i = -1, found = false;
        while ((found === false) && (i < json.length - 1)) {
            i+=1;
            if (json[i].id === Number(item_id)) {
                found = true;
            }
        }
        if (found === true) {
            if (json[i].type === "directory") { 
                try {
                    var theserootfiles = fs.readFileSync("files/rootfiles.json", "utf8");
                } catch (err) {
                    console.log("Error reading for deleteitem: files/rootfiles.json");
                    return;
                }
                var rootfiles = JSON.parse(theserootfiles);
                var p, foundpath = rootfiles.length;
                for (p = rootfiles.length - 1; p >= 0; p-=1) {
                    if (rootfiles[p].path.indexOf(json[i].path) > -1) {
                        rootfiles.splice(p, 1);
                    }
                }
                if (foundpath === rootfiles.length) {
                    console.log('Error, old rootfile path not found!');
                }
                try {
                    fs.writeFileSync("files/rootfiles.json", JSON.stringify(rootfiles));
                } catch(err) {
                    console.log("Error writing for deleteitem: files/rootfiles.json");
                    return;
                }                  
            }
            var itemname = json[i].name, itemtype = json[i].type, itemextension = json[i].extension, itempath = json[i].path;
            var thisitem = json[i].path.slice(1);
            json.splice(i, 1);
            try {
                fs.writeFileSync("files" + item_parent + "root.json", JSON.stringify(json));
            } catch(err) {
                console.log("Error writing file for deleteitem: " + "files" + item_parent + "root.json");
                return;
            }
            fs.remove(thisitem, err => {
                if (err) {
                    console.log('Error deleting: ' + thisitem + ' from directory');
                    return;
                }
                console.log('Success deleting: ' + thisitem + ' from directory');
            });                
        } else {
            console.log('Error, item with ID = ' + item_id + ' not found in root.json under folder ' + item_parent + ' so could not delete!');
        }  
    } else {
        console.log('Perform select/delete function again');        
    }
    res.render('index', {thisurl: thisurl, searchresults: searchresults, resulttype: "0"});   
});


http.listen(process.env.PORT || 3000);
