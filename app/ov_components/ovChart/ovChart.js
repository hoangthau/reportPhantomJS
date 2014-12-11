/*global d3:false */
'use strict';
d3.tooltip = {};

d3.tooltip = function(e){
  var tooltipDiv;
  var bodyNode = d3.select('body').node();
  var attrs = {};
  var text = '';
  var styles = {};

  function tooltip(selection){
    if(e === 'click'){
      selection.on('click', function(pD, pI){
        d3.event.stopPropagation();
        // Clean up lost tooltips
        d3.select('body').selectAll('div.ov-chart-tooltip').remove();
        // Append tooltip
        tooltipDiv = d3.select('body').append('div');
        tooltipDiv.attr('class', 'ov-chart-tooltip');
        tooltipDiv.attr(attrs);
        tooltipDiv.style(styles);
        var absoluteMousePos = d3.mouse(bodyNode);

        tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
          .style('top', (absoluteMousePos[1] - 15)+'px')
          .style('position', 'absolute')
          .style('z-index', '1001')
        ;
        // Add text using the accessor function, Crop text arbitrarily
        tooltipDiv.style('width', function(){ return (text(pD, pI).length > 80) ? 'auto' : null; })
          .html(function(){return text(pD, pI);});

        tooltipDiv.on('click', function(){
          d3.event.stopPropagation();
        });
      });
      $('html').on('click touchstart',function(){
        if(tooltipDiv){
          tooltipDiv.remove();
        }
      });
    }else{
      selection.on('mouseover.tooltip', function(pD, pI){
        // Clean up lost tooltips
        d3.select('body').selectAll('div.ov-chart-tooltip').remove();
        // Append tooltip
        tooltipDiv = d3.select('body').append('div');
        tooltipDiv.attr('class', 'ov-chart-tooltip');
        tooltipDiv.attr(attrs);
        tooltipDiv.style(styles);
        var absoluteMousePos = d3.mouse(bodyNode);

        tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
          .style('top', (absoluteMousePos[1] - 15)+'px')
          .style('position', 'absolute')
          .style('z-index', '1001')
        ;
        // Add text using the accessor function, Crop text arbitrarily
        tooltipDiv.style('width', function(){ return (text(pD, pI).length > 80) ? '300px' : null; })
          .html(function(){return text(pD, pI);});
      })
        .on('mousemove.tooltip', function(pD, pI){
          // Move tooltip
          var absoluteMousePos = d3.mouse(bodyNode);
          if(tooltipDiv){
            tooltipDiv.style({
              left: (absoluteMousePos[0] + 10)+'px',
              top: (absoluteMousePos[1] - 15)+'px'
            });
            // Keep updating the text, it could change according to position
            tooltipDiv.html(function(){ return text(pD, pI); });
          }

        })
        .on('click.tooltip', function(){
          // Move tooltip
          if(tooltipDiv){
            tooltipDiv.remove();
          }

        })
        .on('mouseout.tooltip', function(){
          // Remove tooltip
          if(tooltipDiv){
            tooltipDiv.remove();
          }
        });
    }
  }

  tooltip.attr = function(_x){
    if (!arguments.length) {
      return attrs;
    }
    attrs = _x;
    return this;
  };

  tooltip.style = function(_x){
    if (!arguments.length) {
      return styles;
    }
    styles = _x;
    return this;
  };

  tooltip.text = function(_x){
    if (!arguments.length) {
      return text;
    }
    text = d3.functor(_x);
    return this;
  };

  return tooltip;
};