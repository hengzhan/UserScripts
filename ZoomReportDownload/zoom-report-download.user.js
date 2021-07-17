// ==UserScript==
// @name         Zoom Report Download
// @namespace    z
// @version      0.1
// @description  Downloads all Zoom participants reports on the current page as a zip file
// @author       Zhan
// @license      MIT
// @match        *.zoom.us/account/my/report*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

function getUrls() {
    var r = []
    var a = $('#meeting_list > tbody > tr > .col6 > a')
    a.each(function () {
        var url = 'https://' + window.location.hostname + '/account/my/report/participants/export?id=' + encodeURIComponent($(this).attr('data-id')) + '&isUnique=true'
        r.push(url);
    })
    return r;
}

function loadFile(filePath) {
    var xmlhttp = new XMLHttpRequest()
    xmlhttp.open('GET', filePath, false)
    xmlhttp.send()
    return xmlhttp;
}

function saveToZip(filename, urls) {
    const zip = new JSZip()
    var counts = {}
    urls.map(loadFile).forEach(r => {
        var fn = r.getResponseHeader('Content-Disposition').split('filename=')[1]
        counts[fn] = (counts[fn] || 0) + 1
        fn = ((counts[fn] > 1) ? fn.split('.')[0] + '_' + counts[fn] + '.csv' : fn)
        zip.file(fn, r.responseText);
    })
    zip.generateAsync({ type: 'blob' }).then((bytes) => {
        let elm = document.createElement('a')
        elm.href = URL.createObjectURL(bytes)
        elm.setAttribute('download', filename)
        elm.click();
    })
}

$('#searchMeetingListForm').append('<button id="batch-down" class="bold" style="margin-left: 20px; width: 140px; height: 20px; border: 1px solid gray; font-family: Verdana,sans-serif; font-size: 11px;">Download all</button>');
$('#batch-down').click(function (e) { event.preventDefault(); saveToZip('zoomReports_' + new Date().toLocaleDateString() + '.zip', getUrls()) });
