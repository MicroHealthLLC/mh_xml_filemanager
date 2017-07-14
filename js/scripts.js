
var thisurl = "." + document.getElementById("thisurl_div").innerHTML + "root.json";
;(function(j) {
    j(function() {
        j.ajax({
            url: thisurl
        }).done(function(files, textStatus, jqXHR) {
            j('.explorer').fileManager(files);
        }).fail(function(data, textStatus, jqXHR) {});
    });
})(jQuery);


if (document.getElementById("thisurl_div").innerHTML === "/files/") {
    presentpath = "/files/";
    document.getElementById("presentpath_div").innerHTML = "/files/";
    document.getElementById("breadcrumbs").innerHTML = "Home";
} else {
    presentpath = document.getElementById("thisurl_div").innerHTML;
    document.getElementById("presentpath_div").innerHTML = presentpath;
    document.getElementById("breadcrumbs").innerHTML = "Home" + presentpath.slice(6);
}

