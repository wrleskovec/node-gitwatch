var program = require('commander');
var chokidar = require('chokidar');
var globToRE = require('glob-to-regexp');
var fs = require('fs');
var path = require('path');

program
  .version('0.0.1')
  .command('watch <dir>')
  .action(function(dir) {
    console.log(dir);
    fs.readFile(path.join(dir, '.gitignore'), 'utf-8', function(err, data) {
      if (err) console.error(err);
      var ignoreList = data.trim().split('\n').map(function(s) {
        return globToRE(s).source;
      });
      var ignoreRE = new RegExp('.git/' + '|' + 'node_modules/' + '|' + ignoreList.join('|'));
      console.log(ignoreRE);
      console.log(data);
      chokidar.watch(path.normalize(dir), { ignored: ignoreRE }).on('all', function(event, fPath) {
        console.log(event, fPath);
      })
    });
  });
program.parse(process.argv);
