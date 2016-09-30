var program = require('commander');
var chokidar = require('chokidar');
var globToRE = require('glob-to-regexp');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var timeoutID = null;
var timeoutPref = 10000;

program
  .version('0.0.1')
  .command('watch <dir>')
  .action(function(dir) {
    var dirName = path.normalize(dir);
    console.log(dir);
    fs.readFile(path.join(dirName, '.gitignore'), 'utf-8', function(err, data) {
      var ignoreRE = new RegExp('.git/' + '|' + 'node_modules/');
      if (err) {
        console.log('.gitignore not found');
      } else {
        var ignoreList = data.trim().split('\n').map(function(s) {
          return globToRE(s).source;
        });
        ignoreRE = new RegExp( ignoreRE.source + '|' + ignoreList.join('|'));
      }

      console.log(ignoreRE);
      console.log(data);
      chokidar.watch(dirName, { ignored: ignoreRE }).on('all', function(event, fPath) {
        console.log(event, fPath);
        if(event === 'change') {
          clearTimeout(timeoutID);
          timeoutID = setTimeout(function() {
            exec('git -C ' + dirName + ' add .', function(e, std, stde) {
              exec('git -C ' + dirName + ' commit -am "changes"', function(e, std, stde) {
                exec('git -C ' + dirName + ' push origin master');
              })
            });
          }, timeoutPref);
        }
      })
    });
  });
program.parse(process.argv);
