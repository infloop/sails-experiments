var fs = require('fs');
var path = require('path');
module.exports = {
  downloadAvatar: function(req, res) {

    // Get the URL of the file to download
    var file = req.param('file');

    // Get the file path of the file on disk
    var filePath = path.resolve(sails.config.appPath, "uploads/avatars/", file);

    // Should check that it exists here, but for demo purposes, assume it does
    // and just pipe a read stream to the response.
    fs.createReadStream(filePath).pipe(res);
  }
};
