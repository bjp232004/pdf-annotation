(function(angular, factory) {
  if (typeof define === 'function' && define.amd) {
    define('pdf-annotation', ['angular'], function(angular) {
      return factory(angular);
    });
  } else {
    return factory(angular);
  }
}(typeof angular === 'undefined' ? null : angular, function(angular) {

  var module = angular.module('pdfAnnotation', []);

  'use strict';

  module.factory('pdfAnnotationFactory', function() {
    var factoryObj = {};

    factoryObj.options = {
      viewport: '',
      canvas_rand: '',
      ctx_rand: '',
      renderContext: {canvasContext: '', viewport: ''},
      bindFlag: '',
      btnFlag: false,
      bindCnt: 0,
      pdfOptions: {},
      toolsObj: {},
      optionArrData: {
        startX: [],
        startY: [],
        endX: [],
        endY: [],
        pencilData: []
      }
    };

    factoryObj.history = {
      options: {
        canvas_width: '',
        canvas_height: '',
        activePage: 0,
        totalPage: 1,
        enablePrevBtn: false,
        enableNextBtn: false,
        font_size: 18,
        fillStyle: 'FF0000',
        lineWidth: 2,
        undoFlag: false,
        redoFlag: false,
        arrData: {
          startX: [],
          startY: [],
          endX: [],
          endY: [],
          pencilData: []
        }
      },
      initial_canvas_url: [],
      final_canvas_url: [],
      redo_list: [],
      undo_list: [],
      raw_undo_list: [],
      raw_redo_list: [],
      raw_undo_ver_list: [],
      raw_redo_ver_list: [],
      tmp_raw_undo_list: '',
      setStyleElement: function(canvas, ctx) {
        ctx.fillStyle = '#' + this.options.fillStyle.replace('#', '');
        ctx.font = this.options.font_size+'px Calibri';
        ctx.lineWidth = this.options.lineWidth;
        ctx.strokeStyle = '#' + this.options.fillStyle.replace('#', '');
      },
      resetStyleElement: function() {
        this.options.fillStyle = document.getElementById('fillstyle').value;
        this.options.font_size = document.getElementById('fontsize').value;
        this.options.lineWidth = document.getElementById('linewidth').value;
      },
      setButtonStyle: function() {
        if(this.raw_undo_ver_list.length > 0) {
          if(this.raw_undo_ver_list[this.options.activePage].length > 0 || this.raw_undo_list[this.options.activePage].length > 0) {
            factoryObj.options.toolsObj.undo.classList.remove('cur_disable');
          } else {
            factoryObj.options.toolsObj.undo.className += ' cur_disable';
          }

          if(this.raw_redo_ver_list[this.options.activePage].length > 0) {
            factoryObj.options.toolsObj.redo.classList.remove('cur_disable');
          } else {
            factoryObj.options.toolsObj.redo.className += ' cur_disable';
          }
        } else {
          factoryObj.options.toolsObj.undo.className += ' cur_disable';
          factoryObj.options.toolsObj.redo.className += ' cur_disable';
        }
      },
      saveState: function(canvas, list, keep_redo) {
        keep_redo = keep_redo || false;
        if(!keep_redo) {
          this.redo_list = [];
        }

        if(!this.undo_list.hasOwnProperty(this.options.activePage)) {
          this.undo_list[this.options.activePage] = [];
        }

        if(!this.raw_undo_list.hasOwnProperty(this.options.activePage)) {
          this.raw_undo_list[this.options.activePage] = [];
          this.raw_redo_list[this.options.activePage] = [];

          this.raw_undo_ver_list[this.options.activePage] = [];
          this.raw_redo_ver_list[this.options.activePage] = [];
        }

        var canvasData = canvas.toDataURL();
        if(list) {
          if(!list.hasOwnProperty(this.options.activePage)) {
            list[this.options.activePage] = [];
          }
          list[this.options.activePage][0] = canvasData;
        } else {
          this.undo_list[this.options.activePage][0] = canvasData;

          if(factoryObj.event.options.activeTool && factoryObj.event.options.activeTool.name !== 'move') {
            this.saveRawData();
          } else {
            if(this.tmp_raw_undo_list != '') {
              var tmpData = angular.copy(this.tmp_raw_undo_list);
              this.tmp_raw_undo_list = '';
              this.raw_undo_ver_list[this.options.activePage].push(tmpData);
            }
          }
        }
        this.setButtonStyle();
        factoryObj.history.final_canvas_url[factoryObj.history.options.PrevPage] = canvasData;
      },
      saveRawData: function() {
        if(!factoryObj.event.options.activeTool.drawing) {
          if(!this.raw_undo_list.hasOwnProperty(this.options.activePage)) {
            this.raw_undo_list[this.options.activePage] = [];
            this.raw_redo_list[this.options.activePage] = [];

            this.raw_undo_ver_list[this.options.activePage] = [];
            this.raw_redo_ver_list[this.options.activePage] = [];
          }

          if(this.raw_undo_list[this.options.activePage].length > 0) {
            //var tmpData = JSON.parse(JSON.stringify(this.raw_undo_list[this.options.activePage]));
            var tmpData = angular.copy(this.raw_undo_list[this.options.activePage]);
            this.raw_undo_ver_list[this.options.activePage].push(tmpData);
          }

          //var tmpArrUndoData = JSON.parse(JSON.stringify(this.options.arrData));
          var tmpArrUndoData = angular.copy(this.options.arrData);

          if(tmpArrUndoData.name && tmpArrUndoData.name != '') {
            this.raw_undo_list[this.options.activePage][this.raw_undo_list[this.options.activePage].length] = tmpArrUndoData;
            this.options.undoFlag = true;
          }

          factoryObj.options.optionArrData = this.options.arrData = {
            startX: [],
            startY: [],
            endX: [],
            endY: [],
            pencilData: []
          };
        }

      },
      setRawData: function() {
        factoryObj.options.optionArrData.name = factoryObj.event.options.activeTool.name;
        factoryObj.options.optionArrData.startX.push(factoryObj.event.options.activeTool.options.startX);
        factoryObj.options.optionArrData.startY.push(factoryObj.event.options.activeTool.options.startY);
        factoryObj.options.optionArrData.endX.push(factoryObj.event.options.activeTool.options.endX);
        factoryObj.options.optionArrData.endY.push(factoryObj.event.options.activeTool.options.endY);
        factoryObj.options.optionArrData.font_size = this.options.font_size;
        factoryObj.options.optionArrData.fillStyle = this.options.fillStyle;
        factoryObj.options.optionArrData.lineWidth = this.options.lineWidth;

        if(factoryObj.options.optionArrData.name === "text") {
          factoryObj.options.optionArrData.textInfo = factoryObj.event.options.activeTool.options.textInfo;
          factoryObj.options.optionArrData.finalTextInfo = factoryObj.event.options.activeTool.options.finalTextInfo;
        }

        if(factoryObj.options.optionArrData.name === "image") {
          factoryObj.options.optionArrData.imageURL = factoryObj.event.options.activeTool.options.uploadedImage[factoryObj.event.options.activeTool.options.uploadedImage.length-1];
        }

        if(factoryObj.options.optionArrData.name === "circle") {
          factoryObj.options.optionArrData.radius = factoryObj.event.options.activeTool.options.radius;
        }

        if(factoryObj.options.optionArrData.name === "pencil") {
          factoryObj.options.optionArrData.pencilData.push({x:factoryObj.event.options.activeTool.options.startX, y:factoryObj.event.options.activeTool.options.startY});
        }

        if(factoryObj.options.optionArrData.name === "line") {
          factoryObj.options.optionArrData.lineAngle = Math.atan2(factoryObj.event.options.activeTool.options.endY - factoryObj.event.options.activeTool.options.startY, factoryObj.event.options.activeTool.options.endX - factoryObj.event.options.activeTool.options.startX);
        }

        if(factoryObj.options.optionArrData.name === "arrow") {
          factoryObj.options.optionArrData.arrowAngle = Math.atan2(factoryObj.event.options.activeTool.options.endY - factoryObj.event.options.activeTool.options.startY, factoryObj.event.options.activeTool.options.endX - factoryObj.event.options.activeTool.options.startX);
        }

        //this.options.arrData = JSON.parse(JSON.stringify(factoryObj.options.optionArrData))
        this.options.arrData = angular.copy(factoryObj.options.optionArrData);

      },
      undo: function(canvas, ctx) {
        this.options.action = 'undo';
        this.restoreStateRawData(this.raw_undo_list, this.raw_redo_list);
        this.redrawState(canvas, ctx);
      },
      redo: function(canvas, ctx) {
        this.options.action = 'redo';
        this.restoreStateRawData(this.raw_undo_list, this.raw_redo_list);
        factoryObj.move.init(canvas, ctx);
        this.redrawState(canvas, ctx);
      },
      restoreState: function(canvas, ctx,  pop, push) {
        var pageData = pop[this.options.activePage];
        if(pageData.length) {
          if(push && this.options.action == 'undo') {
            this.saveState(canvas, push, true);
          }

          if(this.options.action == 'undo') {
            var restore_state = pageData.pop();
            if(pageData.length) {
              var imgSrc = pageData[pageData.length - 1];
            } else {
              var imgSrc = restore_state;
            }
          } else {
            var restore_state = pageData.pop();
            var imgSrc = restore_state;
            this.undo_list[this.options.activePage].push(restore_state);
          }

          //var img = new Element('img', {'src':imgSrc});
          var img = document.createElement("img");
          img.src = imgSrc;
          img.onload = function() {
            ctx.clearRect(0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
            ctx.drawImage(img, 0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
          }
        }
      },
      restoreStateRawData: function(pop, push) {
        var pageData = pop[this.options.activePage];
        if(this.options.action == 'undo') {
          if(this.raw_undo_ver_list[this.options.activePage].length > 0) {
            //var tmpArrUndoData = JSON.parse(JSON.stringify(pageData));
            var tmpArrUndoData = angular.copy(pageData);
            this.raw_redo_ver_list[this.options.activePage].push(tmpArrUndoData);
            this.options.redoFlag = true;


            if(this.raw_undo_ver_list[this.options.activePage].length > 0) {
              //var undoData = JSON.parse(JSON.stringify(this.raw_undo_ver_list[this.options.activePage].pop()));
              var undoData = angular.copy(this.raw_undo_ver_list[this.options.activePage].pop());
              this.raw_undo_list[this.options.activePage] = undoData;
            }
          } else {
            if(this.options.undoFlag === true) {
              //var tmpArrUndoData = JSON.parse(JSON.stringify(pageData));
              var tmpArrUndoData = angular.copy(pageData);
              this.raw_redo_ver_list[this.options.activePage].push(tmpArrUndoData);
              this.raw_undo_list[this.options.activePage] = [];
              this.options.undoFlag = false;
            }
          }
          this.setButtonStyle();
        } else {
          if(this.raw_redo_ver_list[this.options.activePage].length > 0) {
            if(this.raw_undo_list[this.options.activePage].length > 0) {
              //var tmpArrUndoData = JSON.parse(JSON.stringify(this.raw_undo_list[this.options.activePage]));
              var tmpArrUndoData = angular.copy(this.raw_undo_list[this.options.activePage]);
              this.raw_undo_ver_list[this.options.activePage].push(tmpArrUndoData);
            }
            this.options.undoFlag = true;

            if(this.raw_redo_ver_list[this.options.activePage].length > 0) {
              //var tmpArrRedoData = JSON.parse(JSON.stringify(this.raw_redo_ver_list[this.options.activePage].pop()));
              var tmpArrRedoData = angular.copy(this.raw_redo_ver_list[this.options.activePage].pop());
              var redoData = tmpArrRedoData;
              this.raw_undo_list[this.options.activePage] = redoData;
            }
          } else {
            if(this.options.redoFlag === true) {
              //var tmpArrRedoData = JSON.parse(JSON.stringify(this.raw_redo_ver_list[this.options.activePage].pop()));
              var tmpArrRedoData = angular.copy(this.raw_redo_ver_list[this.options.activePage].pop());
              var redoData = tmpArrRedoData;
              this.raw_undo_list[this.options.activePage] = redoData;
              this.options.redoFlag = false;
            }
          }
          this.setButtonStyle();
        }
      },
      drawingState: function(canvas, ctx,  pop) {
        if(pop[this.options.activePage].length) {
          var restore_state = pop[this.options.activePage][pop[this.options.activePage].length-1];
          //var img = new Element('img', {'src':restore_state});
          var img = document.createElement("img");
          img.src = restore_state;
          img.onload = function() {
            ctx.clearRect(0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
            ctx.drawImage(img, 0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
            factoryObj.event.options.activeTool.drawTool();
          }
        }
      },
      redrawState: function(canvas, ctx) {
        if(this.initial_canvas_url[this.options.activePage]) {
          var restore_state = this.initial_canvas_url[this.options.activePage];
          //var img = new Element('img', {'src':restore_state});
          var img = document.createElement("img");
          img.src = restore_state;
          img.onload = function() {
            ctx.clearRect(0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
            ctx.drawImage(img, 0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);

            if(factoryObj.history.raw_undo_list[factoryObj.history.options.activePage].length > 0) {
              factoryObj.move.redrawTool();
            }
          }
        }
      },
      manageActiveBtn: function(btn) {
        var activeObj = document.getElementsByClassName('controller active');
        for(var x=0; x<activeObj.length; x++) {
          activeObj[x].classList.remove('active');
        }
        if(btn !== '') {
          document.getElementById(btn).className += ' active';
          if(btn !== 'clear_image') {
            factoryObj.options.toolsObj.frm_canvas_tool.reset();
          }
        }
      }
    }

    return factoryObj;
  });

  module.directive('pdfAnnotation', function () {
      console.log('In PDF Annotation Directive');
    return {
      restrict: 'E',
      scope: {
        options: '=',
        callbackFn: '&',
        closeFn: '&'
      },
      transclude: true,
      templateUrl: 'bower_components/pdf-annotation/src/directives/directive.html',
      link: function (scope, element, attrs, ctrl) {
        console.log('In link function');
      }
    }
  });

}));
$(window).scroll(function(){ 
  var a = 90;
  var pos = $(window).scrollTop();
  if(pos > a) {
    $("#controllers").css({
        position: 'fixed'
      });
    }
    else {
      $("#controllers").css({
        position: 'relative'
      });
    }
});