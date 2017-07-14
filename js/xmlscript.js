
function setURL(thisurl) {
    "use strict";
    thisurl = '.' + thisurl + 'root.json';
    ;(function(j) {
        j(function() {
            j.ajax({
                url: thisurl
            }).done(function(files, textStatus, jqXHR) {
                j('.explorer').fileManager(files);
            }).fail(function(data, textStatus, jqXHR) {});
        });
    })(jQuery);
}


$("body").on("click", "#homebtn", function() {
    "use strict";
    presentpath = "/files/";
    window.location.href = "/";
    document.getElementById("breadcrumbs").innerHTML = "Home";
});


$("body").on("click", "#levelupbtn", function() {
    "use strict";
    if (presentpath !== "/files/") {
        var thisurl = presentpath.slice(0, presentpath.length - 1);
        var i = thisurl.lastIndexOf("/");
        thisurl = thisurl.slice(0, i + 1);
        presentpath = thisurl;
        document.getElementById("presentpath_div").innerHTML = presentpath;
        document.getElementById("breadcrumbs").innerHTML = "Home" + presentpath.slice(6);
    }
    if (presentpath !== "/files/") {
        setURL(thisurl);
    } else {
        $("#homebtn").click();
    }
});


$("body").on("click", "#newfolderbtn", function() {
    "use strict";
    if (document.getElementById("newfolder_div").style.display === "block") {
        $("#folder_upload_directory").val("/");
        $("#newfolder_div").hide();
    } else {
        $("#newfolder_div").show();
        if (presentpath !== "/files/") {
            $("#folder_upload_directory").val(presentpath.slice(6));
        } else {
            $("#folder_upload_directory").val("/");            
        }
    }
});

$("#newfolder_name").change(function () {
    "use strict";
    $("#newfolder_name").val($("#newfolder_name").val().trim());
});

$("#newfolder_path").change(function () {
    "use strict";
    $("#newfolder_path").val($("#newfolder_path").val().trim().toLowerCase());
});

$("#resetnewfolder").click(function(e) {
    "use strict";
    e.preventDefault();
    $("#newfolder_name").val("");
    $("#newfolder_path").val("");
});

$("#submitnewfolder").click(function(e) {
    "use strict";
    e.preventDefault();
    if (($("#newfolder_name").val().trim() !== "") && ($("#newfolder_path").val().trim() !== "")) {
        $("#newfolder_form").submit();
        $("#newfolder_div").hide();  
    } else {
        alert("Must input new folder name and path!");
    }
});


$("body").on("click", "#uploadbtn", function() {
    "use strict";
    if (document.getElementById("uploadfile_div").style.display === "block") {
        $("#file_upload_directory").val("/");
        $("#uploadfile_div").hide();
    } else {
        $("#uploadfile_div").show();
        if (presentpath !== "/files/") {
            $("#file_upload_directory").val(presentpath.slice(6));
        } else {
            $("#file_upload_directory").val("/");
        }
    }
});

$("#resetuploadform").click(function(e) {
    "use strict";
    e.preventDefault();
    $("#filebrowsebtn").val("");
    $("#uploadfilebtns").empty();  
});

$("#submituploadfile").click(function(e) {
    "use strict";
    e.preventDefault();
    if ($("#filebrowsebtn").val().trim() === "") {
        alert("Must upload a file!");
    } else {
        $("#uploadfile_form").submit();
        $("#resetuploadform").click();
    }
});

$("body").on("click", ".deleteuploadbtn", function (e) {
    "use strict";
    e.preventDefault();
    $(this).closest("div").remove();
});    

$("#addfileuploadbtn").click(function (e) {
    "use strict";
    e.preventDefault();
    var uploads = document.querySelectorAll(".uploadfilebtn");
    var k = 0;
    var emptyupload = false;
    while ((emptyupload === false) && (k < uploads.length)) {
        if (uploads[k].value === "") {
            emptyupload = true;
        }
        k += 1;
    }
    if ((emptyupload === true) && (k <= 10)) {
        alert("Use empty upload.");
    } else if (emptyupload === false) {
        if (k < 10) {
            var newfileuploadbtn = '<div class="uploadformgroup"><input type="file" class="btn btn-primary btn-md uploadfilebtn" title="Select File to Upload button" name="userFile" /><button class="formbtn deleteuploadbtn" title="Delete this file from Upload Form" type="button"><img src="images/glyphicons-257-delete.png" /></button></div>';
            $("#uploadfilebtns").append(newfileuploadbtn);
        } else {
            alert("Maximum 10 files uploaded at once.");
        }
    }
});



$("body").on("click", "#downloadfilebtn", function() {
    "use strict";
    if ($("#urlfile").val() !== "") {
        if ($("#urlfile").val().lastIndexOf("/") !== ($("#urlfile").val().length - 1)) {       
            $("#download_form").submit();
            $("#urlfile").val().val("");
        } else {
            alert('Download selected file only!');
        }
    } else {
        alert('Please select file to download!');
    }
});


$("body").on("click", "#deleteitembtn", function() {
    "use strict";    
    //  $("#deleteitemform_div").show();
    if (($("#delete_item_id").val() !== "") && ($("#delete_item_parent").val() !== "")) {
        var checkstr = window.confirm("Sure you want to delete this item?");
        if (checkstr === false) {
            return false;
        }
        $("#deleteitem_form").submit();
        $("#delete_item_id").val("");
        $("#delete_item_parent").val("");
    } else {
        alert('Please select file or folder to be deleted!');
    }
});



$("body").on("click", "#searchbtn", function() {
    "use strict";
    if (document.getElementById("searchform_div").style.display === "block") {
        $("#searchform_div").hide();
    } else {
        $("#searchform_div").show();        
    }
});

$("#submitsearch").click(function (e) {
    "use strict";
    e.preventDefault();
    var searchinput = $("#searchinput").val().trim().toLowerCase();
    if (searchinput !== "") {
        $("#thislevel").val(presentpath.slice(6));
        $("#searchform").submit();
    } else {
        alert("Input search info!");
    }
});

$("#closesearchpanelbtn").click(function () {
    "use strict";
    $("#searchpanel_div").hide();
    $(".explorer").show();
});


$(window).load(function () {
    "use strict";
    $("#newfolder_form").reset();
    $("#newfolder_div").hide();
    $("#uploadfile_form").reset();
    $("#uploadfile_div").hide();
    $("#deleteitem_form").reset();
    $("#deleteitemform_div").hide();
});

$(document).ready(function () {
    var resulttype = document.getElementById("resulttype_div").innerHTML;
//    alert('resulttype = ' + resulttype);
    if (resulttype === "0") {
        $("#searchpanel_div").hide();
        $(".explorer").show();
    } else {        
        if ((resulttype === "1") || (resulttype === "2")) {
            $("#searchresults_div").show();
            $("#searchmessage_div").hide();
        } else {
            $("#searchmessage_div").show();
            $("#searchresults_div").hide();
        }
        $("#searchpanel_div").show();
        $(".explorer").hide();
    }
    var searchlinks = document.querySelectorAll(".searchlink");
    var s, p, thisurl;
    for (s = 0; s < searchlinks.length; s+=1) {
        searchlinks[s].addEventListener("click", function () {
            p = this.id.slice(10);
            thisurl = document.getElementById("searchpath" + p).innerHTML;
            if (resulttype === "1") {
                window.location = "xml?file=" + thisurl;
            } else {
                window.open(thisurl);
            }
        });
    }    
});

$("#backbtn").click(function() {
    "use strict";
    window.history.back();
});
