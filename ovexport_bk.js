/**
 * Retrieve report from server using PhantomJS
 * Website http://phantomjs.org/
 * @license MIT
 *
 * It works like this:
 * Starts a browser, opens a page with some ov widgets( ex. ovChart, ovTable, ovList, ...) loaded in it and
 * produces a chart and saves it as an image, PDF or SVG.
 */

/* global phantom:false */
(function () {
  'use strict';

  var render,
    system = require('system'),
    fs = require('fs'),
    args,
    mapArguments,
    waitFor;

  //Wait until the test condition is true or a timeout occurs.
  waitFor = function (testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
      start = new Date().getTime(),
      condition = false,
      interval = setInterval(function () {
        if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
          // If not time-out yet and condition not yet fulfilled
          condition = (typeof(testFx) === 'string' ? eval(testFx) : testFx()); //< defensive code
        } else {
          if (!condition) {
            // If condition still not fulfilled (timeout but condition is 'false')
            console.log('\'waitFor()\' timeout');
            phantom.exit(1);
          } else {
            // Condition fulfilled (timeout and/or condition is 'true')
            console.log('\'waitFor()\' finished in ' + (new Date().getTime() - start) + 'ms.');
            typeof(onReady) === 'string' ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
            clearInterval(interval); //< Stop this interval
          }
        }
      }, 250); //< repeat check every 250ms
  };

  //map arguments
  mapArguments = function () {
    var map = {},
      i,
      key;

    for (i = 0; i < system.args.length; i += 1) {
      if (system.args[i].charAt(0) === '-') {
        key = system.args[i].substr(1, i.length);
        if (key === 'config') {
          // get string from file
          try {
            map[key] = fs.read(system.args[i + 1]).replace(/^\s+/, '');
          } catch (e) {
            console.log('Error: cannot find file, ' + system.args[i + 1]);
            phantom.exit();
          }
        } else {
          map[key] = system.args[i + 1];
        }
      }
    }
    return map;
  };


  //begin render page
  render = function (params, exitCallback) {
    var page = require('webpage').create(),//create page
      capture,
      outputFormat,
      config,
      scaleAndClipPage,
      setPageSize;

    page.viewportSize = {width: 600, height: 600};

    //console log from browser
    page.onConsoleMessage = function (msg) {
      console.log(msg);
    };

    //alert from browser
    page.onAlert = function (msg) {
      console.log(msg);
    };

    //scale and clip page rendered
    scaleAndClipPage = function () {
      var size = [];
      if (outputFormat === 'pdf' && system.args.length > 5) {//for pdf
        var papersize = params.papersize || '';
        size = papersize.split('*');
        page.paperSize = size.length === 2 ? {
          width: size[0],
          height: size[1],
          margin: '0px'
        } : {
          format: params.paperformat,
          orientation: 'portrait',
          margin: '1cm'
        };
      } else if (system.args.length > 5 && params.width) {//for image
        var pageWidth, pageHeight;
        if (size !== undefined && !!size.length) {
          size.length = 0;
        }
        if (params.width) {
          size.push(params.width);
        }
        if (params.height) {
          size.push(params.height);
        }

        if (size.length === 2) {
          pageWidth = parseInt(size[0], 10);
          pageHeight = parseInt(size[1], 10);
          page.viewportSize = {width: pageWidth, height: pageHeight};
          page.clipRect = {top: 0, left: 0, width: pageWidth, height: pageHeight};
        } else {
          pageWidth = parseInt(params.width, 10);
          pageHeight = parseInt(pageWidth * 3 / 4, 10); // it's as good an assumption as any
          page.viewportSize = {width: pageWidth, height: pageHeight};
        }
      }

      if (system.args.length > 6 && params.zoom) {//zoom
        page.zoomFactor = params.zoom;
      }
    };

    setPageSize = function(pageObj){
      console.log(pageObj.width, pageObj.height);
      var dpiCorrection = 1.4,//default dpi in phantom is 72 and this monitor is 96 so ratio is  = 1.3333 ...
        clipwidth = pageObj.width,
        clipheight = pageObj.height;

      page.clipRect = {
        top: 0,
        left: 0,
        width: clipwidth,
        height: clipheight
      };

      if(outputFormat === 'pdf'){
        clipwidth = clipwidth * dpiCorrection;
        clipheight = clipheight * dpiCorrection;

        page.viewportSize = { width: clipwidth, height: clipheight};

        page.paperSize = {
          width: clipwidth + 2,
          height: (clipwidth*4/3) + 2,
          margin: '10px'
        };
      }
    };

    //capture snapshots
    capture = function () {
      page.render(params.outfile);
      exitCallback();
    };

    if (params.length < 1) {
      exitCallback('Error: Insuficient parameters');
    } else {

      if (params.config !== undefined) {
        config = JSON.parse(params.config);
      }

      if (config === undefined) {
        exitCallback('Error: Wrong parameters');
      }

      if (params.outfile !== undefined) {
        var outfile = params.outfile || 'png';
        outputFormat = outfile.split('.').pop();
      } else {
        outputFormat = 'png';
      }

      page.open('http://localhost:63342/webapp/app/index.html', function () {

        //wait for page rendered thoroughly
        waitFor(function () {
          // Check in the page if a specific element is now visible
          return page.evaluate(function () {
            return $('.ovTable table').is(':visible');
          });
        }, function () {
          console.log('The page was rendered thoroughly.');
          //set paper size
          //scaleAndClipPage();
          var pageObj = page.evaluate(function(){
            return {
              width: document.body.clientWidth,
              height: document.body.clientHeight
            };
          });
          setPageSize(pageObj);
          //now, go ... to capture
          capture();
        },5000);

      });
    }
  };

  //set arguments
  args = mapArguments();

  if (system.args.length < 2) {
    console.log('Error: Insuficient parameters');
    console.log('Usage: ovReport.js -config config -outfile filename [-papersize paperwidth*paperheight] [-paperformat a4] [-zoom 1]');
    phantom.exit();
  } else {
    //begin render
    render(args, function (msg) {
      if (msg) {
        console.log(msg);
      }
      phantom.exit();
    });
  }


})();
