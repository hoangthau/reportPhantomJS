/**
 * @author Hao Huynh
 * @license MIT
 */
/*global d3:false */
(function () {
  'use strict';
  angular.module('ngnms.ui.fwk.ovChart.directive')
    .directive('pieChart', ['$document', '$location','$timeout','$window', function ($document, $location,$timeout,$window) {
      return {
        restrict: 'EA',
        template: '<div class="ov-pie-chart"></div>',
        scope: {
          chartData: '=',
          chartConfig: '=',
          onClick: '='
        },
        link: function (scope, element, attrs) {
          var defaultConfig={
            properties: {
              width:'100%',
              height:'100%',
              innerRadius: 0,
              marginTop: 50,
              marginLeft:50,
              colors: 'colorScale20',
              id:'ov-chart'
            },
            legend: {
              show: false,
              showValue: true,
              showCenterDonut: false,
              top: 60,
              left: 450,
              square: 10,
              xDistance: 0,
              yDistance: 30,
              textGap: 5,
              textStyle: {'font': '12px Arial'},
              textColor: 'gray'
            },
            mapping: {
              name: 'name',
              value: 'count',
              link: 'link'
            },
            label: {
              outer: {
                show:false,
                format:'percent',  // 'percent': 50% or 'count': 7 or 'label',
                style: {'font': '16px Arial'},
                showWhenLessThanPercentage:4
              },
              inner:{
                show:false,
                format:'percent',
                color:'white',
                style: {'font': '11px Arial'},
                hideWhenLessThanPercentage:4
              }
            },
            tooltip:{
              show:false
            }
          };

          scope.chartConfig.api={
            setActive:null,
            resetActive:null,
            resetAllActive:null,
            drawChildren:null,
            updateChart:null
          };
          var elemNode = element.children()[0];
          var name = scope.chartConfig.mapping.name;
          var value = scope.chartConfig.mapping.value;
          var label = scope.chartConfig.label;
          var innerLabel= scope.chartConfig.label.inner || defaultConfig.label.inner;
          var outerLabel = scope.chartConfig.label.outer || defaultConfig.label.outer;
          var legend = scope.chartConfig.legend || defaultConfig.legend;
          var tooltip = scope.chartConfig.tooltip || defaultConfig.tooltip;
          var svgWith=scope.chartConfig.properties.width;
          var svgHeight=scope.chartConfig.properties.height;
          var id=scope.chartConfig.properties.id || defaultConfig.properties.id;
          var legendCenterDonut = scope.chartConfig.legend.showCenterDonut || false;
          //disable outsite label
          var pieDistance=30;

         // var radius = scope.chartConfig.properties.outerRadius;
          var innerRadius=scope.chartConfig.properties.innerRadius;
          var  marginTop = scope.chartConfig.properties.marginTop,
            marginLeft = scope.chartConfig.properties.marginLeft;
           // colors = d3.scale.category20();

          // Color Scale Handling...
          var colorScale = d3.scale.category20c();
          function setColors(){
            var colors = scope.chartConfig.properties.colors;
            switch (colors) {
            case 'colorScale10':
              colorScale = d3.scale.category10();
              break;
            case 'colorScale20':
              colorScale = d3.scale.category20();
              break;
            case 'colorScale20b':
              colorScale = d3.scale.category20b();
              break;
            case 'colorScale20c':
              colorScale = d3.scale.category20c();
              break;
            default:
              colorScale = d3.scale.ordinal().range(colors);
            }
          }
          setColors();

          // --------------------------------------------------------------------------
          var getPercenByValue = function (val, dataSet) {
            var percent = 0, total = 0;
            for (var i = 0; i < dataSet.length; i++) {
              total += dataSet[i][value];
            }
            for (var j = 0; j < dataSet.length; j++) {
              if (val === dataSet[j][value]) {
                percent = (dataSet[j][value] / total * 100).toFixed(2);
              }
            }
            return percent;

          };
          var isOneData = function(data){
            var total=getTotal(data);
            var oneData=false;
            for (var i = 0; i < data.length; i++) {
              if(data[i][value] === total){
                oneData = true;
                break;
              }
            }
            return oneData;
          };
          function displayLabel(d,currData,position) {
            var format=label[position]?label[position].format:'';
            if (format === 'count') {
              return d.data[value];
            } else if (format === 'percent') {
              return getPercenByValue(d.data[value], currData) + '%';
            } else if (format === 'label') {
              return d.data[name];
            }else if (format === '') {
              return getPercenByValue(d.data[value], currData) + '%';
            }else {
              return d.data[value] + ' (' + getPercenByValue(d.data[value], currData) + '%)';
            }
          }
          // 'Fold' pie sectors by tweening its current start/end angles
          // into 2*PI
          function tweenOut(data) {
            data.startAngle = data.endAngle = (2 * Math.PI);
            var interpolation = d3.interpolate(this._current, data);
            this._current = interpolation(0);
            return function (t) {
              return arc(interpolation(t));
            };
          }


          // 'Unfold' pie sectors by tweening its start/end angles
          // from 0 into their final calculated values
          function tweenIn(data) {
            var angle={startAngle: 0, endAngle: 0};
            if(this._current!==undefined){
              angle.startAngle=this._current.startAngle;
              angle.endAngle=this._current.endAngle;
            }
            var interpolation = d3.interpolate(angle, data);
            this._current = interpolation(0);
            return function (t) {
              return arc(interpolation(t));
            };
          }
          //for line path
          var lineFunction = d3.svg.line()
            .interpolate('basis')
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });

          var getTotal=function(dataSet){
            var total = 0;
            for (var i = 0; i < dataSet.length; i++) {
              total += dataSet[i][value];
            }
            return total;
          };

          // SVG elements init
          var svg = d3.select(elemNode).append('svg')
            .style('display', typeof svgWith==='number'?'':'block')
            .attr('width', svgWith ? svgWith: '100%')
            .attr('height', svgHeight ? svgHeight:'100%');

          var svgStyles,diameter,radius,pieCenterX,pieCenterY;
          function calRadius(){
            svgStyles = window.getComputedStyle(svg.node());
            var width=parseInt(svgStyles.width,10);
            var height=parseInt(svgStyles.height,10);
            diameter = Math.min(
              (width- marginLeft*2),
              (height- marginTop*2));
           // diameter = width- marginLeft*2;
            if(!isNaN(diameter)){
              radius=diameter/2;
              if(radius - innerRadius <= 25){
                radius = innerRadius + 25;
              }
            }else{
              radius=0;
            }
            pieCenterX = (width- marginLeft*2)/2 +marginLeft;
            if(isNaN(pieCenterX)){
              pieCenterX=0;
            }
            pieCenterY = radius+marginTop ;
          }
          calRadius();
          var helpers={
            rectIntersect: function(r1, r2) {
              var returnVal=false;
              if(r2){
                returnVal = (
                  // r2.left > r1.right
                  (r2.x > (r1.x + r1.w)) ||

                  // r2.right < r1.left
                  ((r2.x + r2.w) < r1.x) ||

                  // r2.top < r1.bottom
                  ((r2.y + r2.h) < r1.y) ||

                  // r2.bottom > r1.top
                  (r2.y > (r1.y + r1.h))
                  );
              }
              return !returnVal;
            }
          };
          var math={
            getTotalPieSize: function(data) {
              var totalSize = 0;
              for (var i=0; i<data.length; i++) {
                totalSize += data[i][value];
              }
              return totalSize;
            },
            rotate: function(x, y, xm, ym, a) {
              a = a * Math.PI / 180; // convert to radians
              var cos = Math.cos,
                sin = Math.sin,
              // subtract midpoints, so that midpoint is translated to origin and add it in the end again
                xr = (x - xm) * cos(a) - (y - ym) * sin(a) + xm,
                yr = (x - xm) * sin(a) + (y - ym) * cos(a) + ym;

              return { x: xr, y: yr };
            }
          };

          var segments={
            getSegmentAngle: function(index, data, totalSize, opts) {
              var options = $.extend({
                // if true, this returns the full angle from the origin. Otherwise it returns the single segment angle
                compounded: true,
                // optionally returns the midpoint of the angle instead of the full angle
                midpoint: false
              }, opts);

              var currValue = data[index][value];
              var fullValue;
              if (options.compounded) {
                fullValue = 0;

                // get all values up to and including the specified index
                for (var i=0; i<=index; i++) {
                  fullValue += data[i][value];
                }
              }

              if (typeof fullValue === 'undefined') {
                fullValue = currValue;
              }

              // now convert the full value to an angle
              var angle = (fullValue / totalSize) * 360;

              // lastly, if we want the midpoint, factor that sucker in
              if (options.midpoint) {
                var currAngle = (currValue / totalSize) * 360;
                angle -= (currAngle / 2);
              }
              return angle;
            },
            getPercentage: function(currData, i) {
              return (currData[i][value] / math.getTotalPieSize(currData)) * 100;
            }
          };
          var labels={
            /**
             * This does the heavy-lifting to compute the actual coordinates for the outer label groups. It does two things:
             * 1. Make a first pass and position them in the ideal positions, based on the pie sizes
             * 2. Do some basic collision avoidance.
             */
            computeOuterLabelCoords: function(pie,currData) {
              // 1. figure out the ideal positions for the outer labels
              svg.selectAll('.ov-outside-label')
                .each(function(d, i) {
                  return labels.getIdealOuterLabelPositions(pie, i, currData);
                });

              // 2. now adjust those positions to try to accommodate conflicts
              if(!isOneData(currData)){
                labels.resolveOuterLabelCollisions(pie,currData);
              }
            },

            /**
             * This attempts to resolve label positioning collisions.
             */
            resolveOuterLabelCollisions: function(pie,currData) {
              var size = currData.length;
              if(size>1){
                labels.checkConflict(pie, 0, 'clockwise', size);
                labels.checkConflict(pie, size-1, 'anticlockwise', size);
              }

            },

            checkConflict: function(pie, currIndex, direction, size) {
              var currIndexHemisphere = pie.outerLabelGroupData[currIndex].hs;
              if (direction === 'clockwise' && currIndexHemisphere !== 'right') {
                return;
              }
              if (direction === 'anticlockwise' && currIndexHemisphere !== 'left') {
                return;
              }
              var nextIndex = (direction === 'clockwise') ? currIndex+1 : currIndex-1;

              // this is the current label group being looked at. We KNOW it's positioned properly (the first item
              // is always correct)
              var currLabelGroup = pie.outerLabelGroupData[currIndex];

              // this one we don't know about. That's the one we're going to look at and move if necessary
              var examinedLabelGroup = pie.outerLabelGroupData[nextIndex];

              var info = {
                labelHeights: pie.outerLabelGroupData[0].h,
                center: pie.pieCenter,
                lineLength: (radius + pieDistance),
                heightChange: pie.outerLabelGroupData[0].h + 1 // 1 = padding
              };

              // loop through *ALL* label groups examined so far to check for conflicts. This is because when they're
              // very tightly fitted, a later label group may still appear high up on the page
              if (direction === 'clockwise') {
                for (var i=0; i<=currIndex; i++) {
                  var curr = pie.outerLabelGroupData[i];
                  // if there's a conflict with this label group, shift the label to be AFTER the last known
                  // one that's been properly placed
                  if (helpers.rectIntersect(curr, examinedLabelGroup)) {
                    labels.adjustLabelPos(pie, nextIndex, currLabelGroup, info);
                    break;
                  }
                }
              } else {
                for (var j=size-1; j>=currIndex; j--) {
                  var currj = pie.outerLabelGroupData[j];

                  // if there's a conflict with this label group, shift the label to be AFTER the last known
                  // one that's been properly placed
                  if (helpers.rectIntersect(currj, examinedLabelGroup)) {
                    labels.adjustLabelPos(pie, nextIndex, currLabelGroup, info);
                    break;
                  }
                }
              }
              labels.checkConflict(pie, nextIndex, direction, size);
            },	// does a little math to shift a label into a new position based on the last properly placed one
            adjustLabelPos: function(pie, nextIndex, lastCorrectlyPositionedLabel, info) {
              var xDiff, yDiff, newXPos, newYPos;
              newYPos = lastCorrectlyPositionedLabel.y + info.heightChange;
              yDiff = info.center.y - newYPos;

              if (Math.abs(info.lineLength) > Math.abs(yDiff)) {
                xDiff = Math.sqrt((info.lineLength * info.lineLength) - (yDiff * yDiff));
              } else {
                xDiff = Math.sqrt((yDiff * yDiff) - (info.lineLength * info.lineLength));
              }

              // ahhh! info.lineLength is no longer a constant.....

              if (lastCorrectlyPositionedLabel.hs === 'right') {
                newXPos = info.center.x + xDiff;
              } else {
                newXPos = info.center.x - xDiff - pie.outerLabelGroupData[nextIndex].w;
              }

              if (!newXPos) {
                console.log(lastCorrectlyPositionedLabel.hs, xDiff);
              }
              if(typeof pie.outerLabelGroupData[nextIndex] !=='undefined'){
                pie.outerLabelGroupData[nextIndex].x = newXPos;
                pie.outerLabelGroupData[nextIndex].y = newYPos;
              }
            },
            /**
             * @param i 0-N where N is the dataset size - 1.
             */
            getIdealOuterLabelPositions: function(pie, i,currData) {
              var labelGroupDims =currData[i][value]!==0? element.find('.ov-outside-label')[0].getBoundingClientRect():{width:0,height:0};
              var angle = segments.getSegmentAngle(i, currData, pie.totalSize, { midpoint: true });
              // console.log(angle,i)

              var originalX = pie.pieCenter.x;
              var originalY = pie.pieCenter.y - (radius+pieDistance);
              var newCoords = math.rotate(originalX, originalY, pie.pieCenter.x, pie.pieCenter.y, angle);
              // if the label is on the left half of the pie, adjust the values
              var hemisphere = 'right'; // hemisphere
              if (angle > 180) {
                newCoords.x -= (labelGroupDims.width + 8);
                hemisphere = 'left';
              } else {
                newCoords.x += 8;
              }


              pie.outerLabelGroupData[i] = {
                x: newCoords.x,
                y: newCoords.y,
                w: labelGroupDims.width,
                h: labelGroupDims.height*5/6,
                hs: hemisphere
              };

            },
            computeLabelLinePositions: function(pie,currData) {
              pie.lineCoordGroups = [];
              svg.selectAll('.ov-outside-label')
                .each(function(d, i) {
                  return labels.computeLinePosition(pie, i , currData);
                });
            },

            computeLinePosition: function(pie, i, currData) {
              var angle = segments.getSegmentAngle(i, currData, pie.totalSize, { midpoint: true });
              var originCoords = math.rotate(pie.pieCenter.x, pie.pieCenter.y - radius, pie.pieCenter.x, pie.pieCenter.y, angle);
              var midCoords=math.rotate(pie.pieCenter.x, pie.pieCenter.y - radius - pieDistance*2/3, pie.pieCenter.x, pie.pieCenter.y, angle);
              var heightOffset = pie.outerLabelGroupData[i].h / 5; // TODO check
              var labelXMargin = 1; // the x-distance of the label from the end of the line [TODO configurable]

              var quarter = Math.floor(angle / 90);
              var midPoint = 4;
              var x2, y2, x3, y3;
              x2 = midCoords.x;
              y2 = midCoords.y;
              switch (quarter) {
              case 0:
                x2 = pie.outerLabelGroupData[i].x - labelXMargin - ((pie.outerLabelGroupData[i].x - labelXMargin - originCoords.x) / 2);
                y2 = pie.outerLabelGroupData[i].y + ((originCoords.y - pie.outerLabelGroupData[i].y) / midPoint);
                x3 = pie.outerLabelGroupData[i].x - labelXMargin;
                y3 = pie.outerLabelGroupData[i].y - heightOffset;
                break;
              case 1:
//                  x2 = originCoords.x + (pie.outerLabelGroupData[i].x - originCoords.x) / midPoint;
//                  y2 = originCoords.y + (pie.outerLabelGroupData[i].y - originCoords.y) / midPoint;
                x3 = pie.outerLabelGroupData[i].x - labelXMargin;
                y3 = pie.outerLabelGroupData[i].y - heightOffset;
                break;
              case 2:
//                  var startOfLabelX = pie.outerLabelGroupData[i].x + pie.outerLabelGroupData[i].w + labelXMargin;
//                  x2 = originCoords.x - (originCoords.x - startOfLabelX) / midPoint;
//                  y2 = originCoords.y + (pie.outerLabelGroupData[i].y - originCoords.y) / midPoint;
                x3 = pie.outerLabelGroupData[i].x + pie.outerLabelGroupData[i].w + labelXMargin;
                y3 = pie.outerLabelGroupData[i].y - heightOffset;
                break;
              case 3:
//                  var startOfLabel = pie.outerLabelGroupData[i].x + pie.outerLabelGroupData[i].w + labelXMargin;
//                  x2 = startOfLabel + ((originCoords.x - startOfLabel) / midPoint);
//                  y2 = pie.outerLabelGroupData[i].y + (originCoords.y - pie.outerLabelGroupData[i].y) / midPoint;
                x3 = pie.outerLabelGroupData[i].x + pie.outerLabelGroupData[i].w + labelXMargin;
                y3 = pie.outerLabelGroupData[i].y - heightOffset;
                break;
              }

              /*
               * x1 / y1: the x/y coords of the start of the line, at the mid point of the segments arc on the pie circumference
               * x2 / y2: if "curved" line style is being used, this is the midpoint of the line. Other
               * x3 / y3: the end of the line; closest point to the label
               */
              pie.lineCoordGroups[i] = [
                { x: originCoords.x, y: originCoords.y },
                { x: x2, y: y2 },
                { x: typeof x3!=='undefined'?x3:x2, y:  typeof y3!=='undefined'?y3:y2 }
              ];
            }
          };

          // Pie layout will use the 'val' property of each data object entry
          var pieChart = d3.layout.pie().sort(null).value(function (d) {
              return d[value];
            }),
            arc = d3.svg.arc()
              .innerRadius(innerRadius) // Causes center of pie to be hollow
              .outerRadius(radius);

          // The pie sectors container
          var  arcGroup = svg.append('svg:g')
              .attr('class', 'ov-arc-group')
              .attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');


          var inLabelGroup = svg.append('svg:g')
            .attr('class', 'ov-inside-label-group')
            .attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');
          var outLabelGroup = svg.append('svg:g')
            .attr('class', 'ov-outside-label-group');
           // .attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');

          var lineGroup = svg.append('svg:g')
            .attr('class', 'ov-outside-line-group');
           // .attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');

          var legendGroup = svg.append('g')
            .attr('class', 'ov-pie-chart legend')
            .attr('transform', 'translate(' + (legendCenterDonut ? (pieCenterX - marginLeft / 2) : legend.left) + ',' + (legendCenterDonut ? (pieCenterY - marginTop / 2) : legend.top) + ')');
          // Redraw the graph given a certain level of data
          function updateGraph(currData) {
            setColors();
            //calculate radius and position again
            calRadius();
            if(radius===0){
              svg.style('opacity',0);
            }
            var pie={
              totalSize:math.getTotalPieSize(currData),
              pieCenter:{
                x:pieCenterX,
                y:pieCenterY
              },
              outerLabelGroupData:[]
            };

            if(getTotal(currData)>0){
              arc.innerRadius(innerRadius) // Causes center of pie to be hollow
                .outerRadius(radius);
              arcGroup.attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');
              inLabelGroup.attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');
            //  outLabelGroup.attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');
             // lineGroup.attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');
              if (legendCenterDonut) {
                legendGroup.attr('transform', 'translate(' + (pieCenterX - marginLeft / 2) /*legend.left*/ + ',' + (pieCenterY - marginTop / 2) /*legend.top*/ + ')');
              }
              //reset all active
              svg.selectAll('path').attr('transform', 'translate(0,0)');

              //currData=mappingData(angular.copy(currData));
              // Create a sector for each entry in the enter selection
              var paths = arcGroup.selectAll('path')
                .data(pieChart(currData), function (d) {
                  return d.data[name];
                });
              paths.enter().append('svg:path').attr('class', 'sector');
               // .attr('stroke', 'white');
              paths.attr('stroke', function(d){
                  return Number(getPercenByValue(d.data[value], currData)) === 0?'none':'white';
                });
              paths.each(function () {
                this._listenToEvents = false;
              });
              // Each sector will refer to its gradient fill
              paths.attr('fill', function (d, i) {
                return colorScale(i);
              })
                .transition().duration(1000).attrTween('d', tweenIn).each('end', function () {
                  this._listenToEvents = true;
                });

              var onClick=function(d){
                if (this._listenToEvents) {
                  if (scope.onClick) {
                    if (d.data) {
                      scope.onClick(d.data,currData);
                    }
                  }
                  // Reset inmediatelly
                  d3.select(this).attr('transform', 'translate(0,0)');
                  // Change level on click if no transition has started

                  if(d.data.children){
                    paths.each(function () {
                      this._listenToEvents = false;
                    });
                    //  d3.select('.text-back').text('< '+ d.data[name]);
                    updateGraph(d.data.children);
                  }else{
                    // updateGraph(scope.chartData);
                    //  d3.select('.text-back').text('App Group');
                  }
                }
              };
              var onMouseOver=function(d){
                // Mouseover effect if no transition has started
                if (this._listenToEvents) {
                  svg.selectAll('.sector').style('cursor', 'pointer');
                  if(scope.chartConfig.properties.hoverColor){
                    d3.select(this).style('fill', scope.chartConfig.properties.hoverColor);
                  }else{
                    if(Number(getPercenByValue(d.data[value], currData)) !== 100){
                      //reset all active
                      svg.selectAll('path').transition()
                        .duration(150).attr('transform', 'translate(0,0)');
                      // Calculate angle bisector
                      var ang = d.startAngle + (d.endAngle - d.startAngle) / 2;
                      // Transformate to SVG space
                      ang = (ang - (Math.PI / 2) ) * -1;

                      // Calculate a 10% radius displacement
                      var x = Math.cos(ang) * radius * 0.05;
                      var y = Math.sin(ang) * radius * -0.05;

                      d3.select(this).transition()
                        .duration(250).attr('transform', 'translate(' + x + ',' + y + ')');
                    }
                  }

                }
              };
              var onMouseOut=function(){
                // Mouseout effect if no transition has started
                if (this._listenToEvents) {
                  if(scope.chartConfig.properties.hoverColor){
                    d3.select(this).style('fill', null);
                  }else{
                    d3.select(this).transition()
                      .duration(150).attr('transform', 'translate(0,0)');
                  }
                }
              };
              // Mouse interaction handling
              paths.on('click',onClick)
                .on('mouseover',onMouseOver)
                .on('mouseout',onMouseOut);

              // Collapse sectors for the exit selection
              paths.exit().each(function () {
                this._listenToEvents = false;
              }).transition()
                .duration(1000)
                .attrTween('d', tweenOut).remove();



              var setActive=function(i){
                var path=paths[0][i];
                if(path&&path._listenToEvents){
                  var d=path.__data__;
                  //reset all active
                  svg.selectAll('path').transition()
                    .duration(150).attr('transform', 'translate(0,0)');
                  //set selected active
                  if(currData.length>1){
                    var ang = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    // Transformate to SVG space
                    ang = (ang - (Math.PI / 2) ) * -1;

                    // Calculate a 10% radius displacement
                    var x = Math.cos(ang) * radius * 0.05;
                    var y = Math.sin(ang) * radius * -0.05;

                    d3.select(path).transition()
                      .duration(250).attr('transform', 'translate(' + x + ',' + y + ')');
                  }
                }
              };
              var resetActive=function(i){
                var path=paths[0][i];
                if(path&&path._listenToEvents){
                  d3.select(path).transition()
                    .duration(150).attr('transform', 'translate(0,0)');
                }
              };
              var drawChildren=function(i){
                var path=paths[0][i];
                if(path&&path._listenToEvents){
                  d3.select(path).attr('transform', 'translate(0,0)');
                }
                updateGraph(currData[i].children);
                if (scope.onClick) {
                  scope.onClick(currData[i],currData);
                }
              };

              scope.chartConfig.api.setActive=function(i){
                setActive(i);
              };
              scope.chartConfig.api.resetAllActive=function(){
                svg.selectAll('path').attr('transform', 'translate(0,0)');
              };
              scope.chartConfig.api.resetActive=function(i){
                resetActive(i);
              };
              // DRAW INSIDE LABELS
              var sliceLabel = inLabelGroup.selectAll('text').data(pieChart(currData), function (d) {
                return d.data[name];
              });
              sliceLabel.enter().append('svg:text')
                .attr('class', 'arcLabel')
                .attr('text-anchor', 'middle')
                .attr('fill', innerLabel.color)
                .style(innerLabel.style);
              sliceLabel.style({opacity: 0}).transition()
                .duration(1000).delay(function (d, i) {
                  return i * 50;
                }).style({opacity: 1}).attr('transform', function (d) {
                //return 'translate(' + arc.centroid(d) + ')';
                var c = arc.centroid(d);
                return 'translate(' + c[0]*1.2 +',' + c[1]*1.2 + ')';
              });
              sliceLabel.style('display', function (d,i) {
                // return d.endAngle - d.startAngle > maxAngle ? null : 'none';
                var percentage = innerLabel.hideWhenLessThanPercentage;
                var segmentPercentage = segments.getPercentage(currData, i);
                return segmentPercentage < percentage ? 'none' : '';
              });
              if(innerLabel.show){
                sliceLabel.text(function (d) {
                  return displayLabel(d,currData,'inner');
                });
              }

              sliceLabel.exit().transition().style({opacity: 0}).remove();

              //DRAW OUT SIDE LABELS
              var outNameLabel = outLabelGroup.selectAll('text.ov-outside-label').data(pieChart(currData), function (d) {
                return d.data[name];
              });
              outNameLabel.enter().append('svg:text')
                .attr('class', 'ov-outside-label')
                .style(outerLabel.style);
              outNameLabel.attr('fill', function (d, i) {
                return colorScale(i);
              });
              if(outerLabel.show){
                outNameLabel.text(function (d) {
                  //return d.data[name];
                  return displayLabel(d,currData,'outer');
                }).on('click',function(d,i){
                  if(d3.select((this)).style('opacity')!=='0'&& d.data.children){
                    drawChildren(i);
                  }
                })
                  .on('mouseover',function(d,i){
                    if(d3.select((this)).style('opacity')!=='0'){
                      d3.select(this).style('cursor', 'pointer');
                      setActive(i);
                    }
                  })
                  .on('mouseout',function(d,i){
                    if(d3.select((this)).style('opacity')!=='0'){
                      resetActive(i);
                    }
                  });
              }
              // Collapse name label for the exit selection
              outNameLabel.exit()
                .remove();

              labels.computeOuterLabelCoords(pie, currData);
              outNameLabel.style({opacity: 0}).transition()
                .duration(1000).delay(function (d, i) {
                  return i * 50;
                }).style({opacity: 1})
                .attr('transform', function(d, i) {
                  var x,y;
                  x = pie.outerLabelGroupData[i].x;
                  y = pie.outerLabelGroupData[i].y;
                  return 'translate(' + x + ',' + y + ')';
                }).style('opacity', function (d,i) {
                  if(outerLabel.show){
                    var percentage = outerLabel.showWhenLessThanPercentage;
                    var segmentPercentage = segments.getPercentage(currData, i);
                    var isHidden = (percentage !== undefined && segmentPercentage >= percentage) || d.data[value]===0;
                    return isHidden ? 0 : 1;
                  }else{
                    return 0;
                  }
                });

              //DRAW LINES STICK MARK for out side label
              labels.computeLabelLinePositions(pie,currData);
              var  linePath = lineGroup.selectAll('path.line-path').data(pie.lineCoordGroups);
              linePath.enter().append('svg:path')
                .attr('class','line-path')
                .attr('stroke-width', 1)
                .attr('fill', 'none');
              linePath.style({opacity: 0}).transition()
                .duration(1000).delay(function (d, i) {
                  return i * 50;
                }).style({opacity: 1})
                .attr('d', lineFunction)
                .attr('stroke', function(d,i){
                  return colorScale(i);
                }).style('opacity', function (d,i) {
                  var percentage = outerLabel.showWhenLessThanPercentage;
                  var segmentPercentage = segments.getPercentage(currData, i);
                  var isHidden = (percentage !== undefined && segmentPercentage >= percentage) || !outerLabel.show || currData[i][value]===0;
                  return isHidden ? 0 : 1;
                });
              linePath.exit()
                .transition()
//                .duration(1000)
                .delay(function (d, i) {
                  return i * 50;
                }).style({opacity: 0})
                .remove();

              //draw tooltip
              var drawTooltip =function(currData) {
                paths.call(d3.tooltip().style({
                  color: 'black'
                }).text(function (d) {
                  return '<h3>' + d.data[name] + '</h3>' +
                    '<p>' + d.data[value] + ' ( ' + getPercenByValue(d.data[value], currData) + '% )</p>';
                }));
              };
              if(tooltip&&tooltip.show){
                drawTooltip(currData);
              }

              //resize event
              var setSize=function() {

                calRadius();//calculate radius again
                if(radius===0){
                  return;
                }else{
                  svg.style('opacity',1);
                }
                pie.pieCenter={
                  x:pieCenterX,
                  y:pieCenterY
                };
                //update transform for all groups
                arcGroup.attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');
                inLabelGroup.attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');
                if (legendCenterDonut) {
                  legendGroup.attr('transform', 'translate(' + (pieCenterX - marginLeft / 2) /*legend.left*/ + ',' + (pieCenterY - marginTop / 2) /*legend.top*/ + ')');
                }

                // outLabelGroup.attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');
               //lineGroup.attr('transform', 'translate(' + pieCenterX + ',' + pieCenterY + ')');

                //update arc
                arc.innerRadius(innerRadius) // Causes center of pie to be hollow
                  .outerRadius(radius);
                paths.attr('d', arc);//update paths
                //update inside label
                sliceLabel.attr('transform', function (d) {
                  //return 'translate(' + arc.centroid(d) + ')';
                  var c = arc.centroid(d);
                  return 'translate(' + c[0]*1.2 +',' + c[1]*1.2 + ')';
                });
                //update out side label
                labels.computeOuterLabelCoords(pie,currData);
                outNameLabel
//                  .transition()
//                  .duration(1000)
                  .attr('transform', function(d, i) {
                    var x,y;
                    x = pie.outerLabelGroupData[i].x;
                    y = pie.outerLabelGroupData[i].y;
                    return 'translate(' + x + ',' + y + ')';
                  });
                //update outside line
                labels.computeLabelLinePositions(pie,currData);
                linePath.data(pie.lineCoordGroups);
                linePath.attr('d', lineFunction);
                //console.log(currData,'rezise')
              };

              var w = angular.element($window);
              var setSizeFn = _.debounce(setSize, 100);
              if(getTotal(currData)>0){
                //adapt size to window changes:
                w.off('resize.'+id);
                w.on('resize.'+id, setSizeFn);
              }
            }else{
              arcGroup.selectAll('path').remove();
              inLabelGroup.selectAll('text').remove();
              outLabelGroup.selectAll('text').remove();
              lineGroup.selectAll('path').remove();
              legendGroup.selectAll('rect').remove();
            }
            //create legend
            var drawLegend=function(currData) {
              var legendRect=legendGroup.selectAll('rect')
                .data(currData);
              legendRect.enter()
                .append('rect')
                .attr('x', function (d, i) {
                  return i * legend.xDistance;
                })
                .attr('y', function (d, i) {
                  return i * legend.yDistance;
                })
                .attr('width', legend.square)
                .attr('height', legend.square)
                .style('fill', function (d, i) {
                  return colorScale(i);
                })
                .style('stroke', function (d, i) {
                  return colorScale(i);
                })
                .attr('color_value', function (d, i) {
                  return colorScale(i);
                })
                .attr('index_value', function (d, i) {
                  return 'index-' + i;
                });
              legendRect.exit().transition().style({opacity: 0}).remove();

              var legendLabel = legendGroup.selectAll('text')
                .data(currData);
              legendLabel.enter()
                .append('text')
                .attr('x', function (d, i) {
                  return i * legend.xDistance + legend.square + legend.textGap;
                })
                .attr('y', function (d, i) {
                  return i * legend.yDistance + legend.square;
                })
                .attr('fill', legend.textColor)
                .style(legend.textStyle)
                .attr('color_value', function (d, i) {
                  return colorScale(i);
                }) // Bar fill color...
                .attr('index_value', function (d, i) {
                  return 'index-' + i;
                });
              legendLabel.on('click',function(d){
                if (scope.onClick) {
                  scope.onClick(d,currData);
                }
              });
              legendLabel.on('mouseover',function(){
                d3.select(this).style('cursor', 'pointer');
               // d3.select(this).style('fill',scope.chartConfig.properties.hoverColor);
              });
//              legendLabel.on('mouseout',function(){
//                d3.select(this).style('fill',legend.textColor);
//              });
              legendLabel.text(function(d) {
                return legend.showValue ? d[name]+ ':' + d[value] :  d[name];
              });
              legendLabel.exit().transition().style({opacity: 0}).remove();
            };
            if (legend.show) {
              drawLegend(currData);
            }
            scope.chartConfig.api.drawChildren=function(i){
              drawChildren(i);
            };
          }
          scope.chartConfig.api.updateChart=function(newData){
            updateGraph(newData);
          };
          // Start by updating graph at root level
         // scope.dataAndColors=[scope.chartData,scope.chartConfig.properties.colors];

          scope.$watch('chartData', function (newVal) {
            if (newVal) {
              updateGraph(newVal);
            }
          });
          scope.$on('chart.resize', function(){
            $(window).trigger('resize.'+id);
          });
          scope.$on('$destroy', function(){
            angular.element($window).off('resize.'+id);
          });
/*          scope.$watch(function(){
            var svgStyles = window.getComputedStyle(svg.node());
            return parseInt(svgStyles.width,10);
          },function(newVal,oldVal){
            if(newVal!==oldVal){
              console.log('resize.......',newVal,oldVal,id);
            }
            if(isNaN(oldVal)||oldVal===100){
              element.find('.ov-pie-chart').css('opacity',0);
            }
            if(!isNaN(newVal)|| newVal===100){
              setTimeout(function(){
                element.find('.ov-pie-chart').css('opacity',1);
              },500);
            }
          });*/
        }
      };
    }]);
})();
