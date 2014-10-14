var fs = require('fs');
fs.readFile("text.json", "utf8", function (err, data) {
if (err) throw new Error(err);
var o = JSON.parse(data);
console.log(o);
});

