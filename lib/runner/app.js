var spawn = require('child_process').spawn,
    fs    = require('fs'),
    path  = require('path'),
    wd    = __dirname + '/../..',
    args  = process.argv.slice(2),
    // TODO: Allow for selecting 32/64 Chrome
    chromeDriver = path.join(__dirname, 'drivers', 'chromedriver' + 
          (/^linux/.test(process.platform) ? '-linux64' :
          /^win/.test(process.platform) ? '.exe' : '-osx')),
    // TODO: Allow for selecting 32/64 IE
    ieDriver = path.join(__dirname, 'drivers', 'IEDriverServer32.exe'),
    selenium
          = spawn(
              'java',
              [
                '-jar', path.join(__dirname, 'selenium-server-standalone-2.49.1.jar'),
                '-Dwebdriver.chrome.driver=' + chromeDriver,
                '-Dwebdriver.ie.driver=' + ieDriver
              ].concat(args)
            ),
    ok    = false,
    out   = fs.createWriteStream(wd + '/logs/selenium.out', {flags: 'a'}),
    err   = fs.createWriteStream(wd + '/logs/selenium.err', {flags: 'a'});

selenium.stderr.on('data', function(data) {
  if (/^execvp\(\)/.test(data)) {
    console.log('Failed to start selenium. Please ensure that java '+
      'is in your system path');
  }
  else if (!ok) {
    ok = true;
    console.log("Selenium is started.");
    console.log("All output can be found at: " + wd + '/logs');
  }
});

selenium.stdout.pipe(out);
selenium.stderr.pipe(err);

process.on("SIGTERM", function () {
  selenium.kill("SIGTERM");
  process.exit(1);
});
