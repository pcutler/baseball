// DRIVE SERVICE HANDLER

var gdmDriveServiceHandler = function() {
    gdmBaseServiceHandler.call(this);
    this.APIName = 'Drive';
};

gdmDriveServiceHandler.prototype = new gdmBaseServiceHandler();


gdmDriveServiceHandler.prototype.getAvailable = function() {
    return true;
};

gdmDriveServiceHandler.prototype.getRequest = function(params) {
    params.trashed = false;
    return gapi.client.request({
        'path': '/drive/v2/files',
        'corpus': 'DEFAULT',
        'params': params
    });
};

gdmDriveServiceHandler.prototype.isCorrectType = function(resp) {
    return resp.kind == 'drive#fileList';
};

gdmDriveServiceHandler.prototype.getAllowSearch = function() {
    return true;
};

gdmDriveServiceHandler.prototype.getUrlsAndReasons = function(drivefile) {
    if (drivefile.kind != 'drive#file') {
        return {};
    }

    var links = {
        id : drivefile.id,
        embed : { url : '', reason : '' },
        viewer : { url : drivefile.alternateLink ? drivefile.alternateLink : '', reason : '' },
        download : { url : drivefile.webContentLink ? drivefile.webContentLink : '' , reason : '' },
        title : drivefile.title,
        icon: { url : drivefile.iconLink }
    };

    if (drivefile.mimeType == 'application/vnd.google-apps.folder' || drivefile.mimeType == 'application/vnd.google-apps.form' || drivefile.mimeType.match(/^image\//)) {
        links.embed.reason = 'PREMIUM';
        links.download.reason = 'FOLDERDOWNLOAD';
    }
    else {

        if (drivefile.embedLink) {
            links.embed.url = drivefile.embedLink;
        }
        else {

            if (drivefile.alternateLink) {
                links.embed.url = drivefile.alternateLink.replace(/\/(edit|view)(\?|$)/g, '/preview?');
            }
            else if (drivefile.webContentLink) {
                // Old-style Google Doc Viewer as fallback
                links.embed.url = '//docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(drivefile.webContentLink);
            }
            else {
                links.embed.reason = 'WEBCONTENT';
            }
        }
    }

    // Video needs special attention
    if (drivefile.mimeType.match(/^video\//) && drivefile.alternateLink) {
        links.embed.url = '';
        links.embed.reason = "PREMIUM";
    }

    if (links.download.url == '' && drivefile.exportLinks) {
        links.download.reason = "PREMIUM";
    }

    return links;
};

gdmDriveServiceHandler.prototype.getReasonText = function(reason) {
    switch (reason) {
        case 'SHARE':
            return 'To enable embedding, set Sharing to \'Anyone with the link can view\'';
            break;

        case 'PREMIUM':
            return 'Please purchase a paid version to enable this file type '
                +'(<a href="http://wp-glogin.com/drive/?utm_source=Embed%20Reason&utm_medium=freemium&utm_campaign=Drive" '
                +'target="_blank">Find out more</a>)';
            break;

        case 'FOLDERDOWNLOAD':
            return 'Not possible to download this type';
            break;

        case 'WEBCONTENT':
            return 'There is no content available';
            break;

        default:
            return 'Not possible for this file type';
    }
};

gdmDriveServiceHandler.prototype.allowSetEmbedOwnerParent = function() {
    return false;
};

gdmDriveServiceHandler.prototype.showOwnerEditorWarning = function() {
    return false;
};

gdmDriveServiceHandler.prototype.allowInsertDriveFile = function() {
    return true;
};


// CALENDAR SERVICE HANDLER


var gdmCalendarServiceHandler = function() {
    gdmBaseServiceHandler.call(this);
    this.APIName = 'Calendar';
};

gdmCalendarServiceHandler.prototype = new gdmBaseServiceHandler();

gdmCalendarServiceHandler.prototype.getAvailable = function() {
    return false;
};

gdmCalendarServiceHandler.prototype.allowSetEmbedOwnerParent = function() {
    return false;
};

gdmCalendarServiceHandler.prototype.showOwnerEditorWarning = function() {
    return false;
};

gdmCalendarServiceHandler.prototype.allowInsertDriveFile = function() {
    return true;
}

gdmCalendarServiceHandler.prototype.isCorrectType = function(resp) {
    return resp.kind == 'calendar#calendarList';
};

gdmCalendarServiceHandler.prototype.getUrlsAndReasons = function(calendar) {
    return {};
};

gdmCalendarServiceHandler.prototype.getAllowSearch = function() {
    return false;
};

GdmBrowserRegistry = {
	'allfiles' : GdmSimpleFileBrowser,
	'drive' : GdmSimpleFileBrowser,
	'recent' : GdmSimpleFileBrowser,
	'calendar' : GdmSimpleFileBrowser
};


