var http = require('http');
var static = require('node-static');
var file = new static.Server('./front/dist/merch-blueprint-front');

http.createServer(function(req, res) {
//  file.serve(req, res);
  file.serve(req, res, function (e, result) {
        if (e) { // If the file wasn't found

            file.serveFile('index.html', 404, {}, req, res);
        }
    });
}).listen(3000);

console.log('Server running on port 3000');