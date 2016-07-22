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
              //var tmpData = JSON.parse(JSON.stringify(this.tmp_raw_undo_list));
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
    };

    factoryObj.event = {
      options: {
        activeTool: ''
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.canvas_coords = this.canvas.getBoundingClientRect();
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.paging();
        this.addCanvasEvents();
      },
      addCanvasEvents: function() {
        this.canvas.addEventListener('mousedown', this.start.bind(this));
        this.canvas.addEventListener('mousemove', this.stroke.bind(this));
        this.canvas.addEventListener('mouseup', this.stop.bind(this));
        this.canvas.addEventListener('mouseout', this.stop.bind(this));
      },
      start: function(evt) {
        if(factoryObj.history.raw_undo_list[factoryObj.history.options.activePage].length > 0) {
          factoryObj.move.init(this.canvas, this.ctx);
          factoryObj.move.start(evt);
        }

        if(factoryObj.move.options.movedObject == -1) {
          if(this.options.activeTool !== '' && this.options.activeTool !== undefined) {
            this.options.activeTool.start(evt);
          }
        }

      },
      stroke: function(evt) {
        if(this.options.activeTool !== '' && this.options.activeTool !== undefined && this.options.activeTool.drawing === true) {
          this.options.activeTool.stroke(evt);
        }
      },
      stop: function(evt) {
        if(this.options.activeTool !== '' && this.options.activeTool !== undefined && this.options.activeTool.drawing === true) {
          this.options.activeTool.stop(evt);
        }
      },
      closepdf: function() {
        factoryObj.options.closeFn();
      },
      savepdf: function() {
          
        var m = confirm("Are you sure to you want to save file?");
        if (m) {
          var doc = new jsPDF('p', 'mm', 'a4');
          for(i = 0; i < parseInt(factoryObj.history.options.totalPage); i++) {
            if(i<2){
              if(factoryObj.history.final_canvas_url.hasOwnProperty(i)) {
                var imgData = factoryObj.history.final_canvas_url[i];
              }
              else {
                var imgData = document.getElementById("page"+i).toDataURL("image/png");
              }
              doc.addImage(imgData, 'PNG', 0, 0, 200, 250, null, 'SLOW');
              if(i<parseInt(factoryObj.history.options.totalPage-1)){
                doc.addPage();
              }
            }
          }

          var dataurl = doc.output('datauristring');
          var blob = this.dataURLtoBlob(dataurl);
          
          if(typeof(factoryObj.options.callbackFn) == "function") {
            factoryObj.options.callbackFn({blob: blob});
          } else {
            doc.save();
          }
        }
      },
      dataURLtoBlob: function(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
      },
      paging: function() {
        factoryObj.history.options.totalPage = factoryObj.history.options.pdfobj.transport.numPages;
        factoryObj.options.toolsObj.activePage.textContent = factoryObj.history.options.activePage + 1;
        factoryObj.options.toolsObj.currentPage.value = factoryObj.history.options.activePage + 1;
        factoryObj.options.toolsObj.totalPage.textContent = factoryObj.history.options.totalPage;
        if(factoryObj.history.options.activePage === 0) {
          //Disable Prev, Enable Next
          factoryObj.options.toolsObj.prevBtn.setAttribute('disabled', 'disabled');
          factoryObj.options.toolsObj.nextBtn.removeAttribute('disabled');
        }
        else if(parseInt(factoryObj.history.options.activePage) === parseInt(factoryObj.history.options.totalPage - 1)) {
          //Disable Next, Enable Prev
          factoryObj.options.toolsObj.nextBtn.setAttribute('disabled', 'disabled');
          factoryObj.options.toolsObj.prevBtn.removeAttribute('disabled');
        }
        else if(factoryObj.history.options.activePage > 0 && parseInt(factoryObj.history.options.activePage) < parseInt(factoryObj.history.options.totalPage - 1)) {
          //enable Next & Prev Btn
          factoryObj.options.toolsObj.prevBtn.removeAttribute('disabled');
          factoryObj.options.toolsObj.nextBtn.removeAttribute('disabled');
        }
      }
    }

    factoryObj.renderPage = function(page) {
       
      var viewport = page.getViewport(factoryObj.options.pdfOptions.scale);
      var canvas_rand = document.createElement('canvas');

      var ctx_rand = canvas_rand.getContext('2d');
      var renderContext = {
        canvasContext: ctx_rand,
        viewport: viewport
      };

      canvas_rand.setAttribute('id', 'page' + page.pageIndex);
      canvas_rand.height = viewport.height;
      canvas_rand.width = viewport.width;//factoryObj.options.canvasContainer.offsetWidth; //viewport.width;

      factoryObj.history.options.canvas_width = canvas_rand.width;
      factoryObj.history.options.canvas_height = canvas_rand.height;
      factoryObj.options.toolsObj.canvasContainer.appendChild(canvas_rand);

      task = page.render(renderContext);
      task.promise.then(function(){
        factoryObj.options.bindCnt++;
        if(factoryObj.options.bindFlag === '' && page.transport.numPages == factoryObj.options.bindCnt) {
          //save pdf object for paging related stuff
          factoryObj.history.options.pdfobj = page;

          factoryObj.bindEvent(0);
          factoryObj.options.bindFlag = 1;
        }
      });
    }

    factoryObj.bindEvent = function(page) {     
      if(factoryObj.options.bindFlag == '') {
        factoryObj.options.bindFlag = 'true';
        factoryObj.history.options.PrevPage = page;
        factoryObj.history.options.activePage = page;
        factoryObj.options.canvas = factoryObj.options.toolsObj.canvas;
        factoryObj.options.ctx = factoryObj.options.canvas.getContext('2d');

        if (!factoryObj.history.initial_canvas_url.hasOwnProperty(page)) {
          var tmpImgObj = document.getElementById('page' + page);
          factoryObj.history.initial_canvas_url[page] = tmpImgObj.toDataURL();
          factoryObj.history.final_canvas_url[factoryObj.history.options.activePage] = factoryObj.history.initial_canvas_url[factoryObj.history.options.activePage];
          factoryObj.options.imgURL = factoryObj.history.initial_canvas_url[factoryObj.history.options.activePage];
        } else {
          factoryObj.options.imgURL = factoryObj.history.final_canvas_url[factoryObj.history.options.activePage];
        }

        factoryObj.options.canvas.height = factoryObj.history.options.canvas_height;
        factoryObj.options.canvas.width = factoryObj.history.options.canvas_width; //viewport.width;

        //var img = new Element('img', {'src': factoryObj.options.imgURL});
        var img = document.createElement("img");
        img.src = factoryObj.options.imgURL;
        img.onload = function () {
          
          factoryObj.options.canvas_coords = factoryObj.options.canvas.getBoundingClientRect();
          factoryObj.history.options.canvas_coords = factoryObj.options.canvas_coords;
          factoryObj.options.ctx.clearRect(0, 0, factoryObj.options.canvas.width, factoryObj.options.canvas.height);
          factoryObj.options.ctx.drawImage(img, 0, 0, factoryObj.options.canvas.width, factoryObj.options.canvas.height);

          factoryObj.options.toolsObj.loading.textContent = '';

          factoryObj.history.saveState(factoryObj.options.canvas);

          if (factoryObj.options.btnFlag === false) {
            factoryObj.options.btnFlag = true;
            factoryObj.options.toolsObj.pencil.addEventListener('click', function () {
              factoryObj.event.options.activeTool = factoryObj.pencil;
              factoryObj.history.manageActiveBtn('pencil');
              factoryObj.pencil.init(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.square.addEventListener('click', function () {
              factoryObj.event.options.activeTool = factoryObj.square;
              factoryObj.history.manageActiveBtn('square');
              factoryObj.square.init(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.circle.addEventListener('click', function () {
              factoryObj.event.options.activeTool = factoryObj.circle;
              factoryObj.history.manageActiveBtn('circle');
              factoryObj.circle.init(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.ellipse.addEventListener('click', function () {
              factoryObj.event.options.activeTool = factoryObj.ellipse;
              factoryObj.history.manageActiveBtn('ellipse');
              factoryObj.ellipse.init(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.text.addEventListener('click', function () {
              factoryObj.event.options.activeTool = factoryObj.text;
              factoryObj.history.manageActiveBtn('text');
              factoryObj.text.init(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.contenteditor.addEventListener('blur', function () {
              factoryObj.options.toolsObj.editor_wrapper.style.display = 'none';
              factoryObj.text.drawTool();
            });

            factoryObj.options.toolsObj.arrow.addEventListener('click', function () {
              factoryObj.event.options.activeTool = factoryObj.arrow;
              factoryObj.history.manageActiveBtn('arrow');
              factoryObj.arrow.init(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.line.addEventListener('click', function () {
              factoryObj.event.options.activeTool = factoryObj.line;
              factoryObj.history.manageActiveBtn('line');
              factoryObj.line.init(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.imageupload.addEventListener('change', function () {
              factoryObj.image.uploadImage(this.files[0]);
              factoryObj.event.options.activeTool = factoryObj.image;
              factoryObj.history.manageActiveBtn('clear_image');
              factoryObj.image.init(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.clear_image.addEventListener('click', function () {
              factoryObj.options.toolsObj.frm_canvas_tool.reset();
            })

            factoryObj.options.toolsObj.undo.addEventListener('click', function () {
              factoryObj.history.undo(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.redo.addEventListener('click', function () {
              factoryObj.history.redo(factoryObj.options.canvas, factoryObj.options.ctx);
            });

            factoryObj.options.toolsObj.save.addEventListener('click', function () {
              factoryObj.event.options.activeTool = '';
              factoryObj.history.manageActiveBtn('');
              factoryObj.event.savepdf();
            });
            
            factoryObj.options.toolsObj.fontsize.addEventListener('change', function () {
              factoryObj.history.options.font_size = this.value;
            });

            factoryObj.options.toolsObj.fillstyle.addEventListener('change', function () {
              factoryObj.history.options.fillStyle = '#' + this.value;
            });

            factoryObj.options.toolsObj.linewidth.addEventListener('change', function () {
              factoryObj.history.options.lineWidth = this.value;
            });

            factoryObj.options.toolsObj.prevBtn.addEventListener('click', function () {
              if (!factoryObj.options.toolsObj.prevBtn.getAttribute('disable')) {
                factoryObj.options.bindFlag = '';
                factoryObj.bindEvent(parseInt(factoryObj.history.options.activePage - 1));
              }
            });

            factoryObj.options.toolsObj.nextBtn.addEventListener('click', function () {
              if (!factoryObj.options.toolsObj.nextBtn.getAttribute('disabled')) {
                factoryObj.options.bindFlag = '';
                factoryObj.bindEvent(parseInt(factoryObj.history.options.activePage + 1));
              }

            });

            factoryObj.options.toolsObj.fontsize.value = factoryObj.history.options.font_size;
            factoryObj.options.toolsObj.fillstyle.value = factoryObj.history.options.fillStyle;
            factoryObj.options.toolsObj.linewidth.value = factoryObj.history.options.lineWidth;
          }

          factoryObj.event.init(factoryObj.options.canvas, factoryObj.options.ctx);
          factoryObj.history.setButtonStyle();
        }
      }
    }

    factoryObj.renderPages = function(pdfDoc) {     
      factoryObj.history.options.numPages = pdfDoc.numPages;
      for(var num = 1; num <= pdfDoc.numPages; num++)
        pdfDoc.getPage(num).then(factoryObj.renderPage);
    }

    factoryObj.renderPDF = function(url, canvasContainer, options) {
      this.options.pdfOptions = options || {scale: 2};
      factoryObj.options.toolsObj.loading.textContent = 'Wait while loading PDF file...';
      
      PDFJS.disableWorker = false;
      PDFJS.getDocument(url).then(factoryObj.renderPages);
    }

    return factoryObj;
  });
  
  module.directive('pdfAnnotation', function (pdfAnnotationFactory) {
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
console.log('In PDF Annotation Directive LInk function');          
        pdfAnnotationFactory.options.closeFn = scope.closeFn;
        pdfAnnotationFactory.options.callbackFn = scope.callbackFn;
        pdfAnnotationFactory.options.toolsObj.loading = angular.element(document.querySelector('#loading'))[0];
        pdfAnnotationFactory.options.toolsObj.pencil = angular.element(document.querySelector('#pencil'))[0];
        pdfAnnotationFactory.options.toolsObj.square = angular.element(document.querySelector('#square'))[0];
        pdfAnnotationFactory.options.toolsObj.circle = angular.element(document.querySelector('#circle'))[0];
        pdfAnnotationFactory.options.toolsObj.ellipse = angular.element(document.querySelector('#ellipse'))[0];
        pdfAnnotationFactory.options.toolsObj.text = angular.element(document.querySelector('#text'))[0];
        pdfAnnotationFactory.options.toolsObj.contenteditor = angular.element(document.querySelector('#contenteditor'))[0];
        pdfAnnotationFactory.options.toolsObj.editor_wrapper = angular.element(document.querySelector('#editor_wrapper'))[0];
        pdfAnnotationFactory.options.toolsObj.arrow = angular.element(document.querySelector('#arrow'))[0];
        pdfAnnotationFactory.options.toolsObj.line = angular.element(document.querySelector('#line'))[0];
        pdfAnnotationFactory.options.toolsObj.imageupload = angular.element(document.querySelector('#imageupload'))[0];
        pdfAnnotationFactory.options.toolsObj.clear_image = angular.element(document.querySelector('#clear_image'))[0];
        pdfAnnotationFactory.options.toolsObj.frm_canvas_tool = angular.element(document.querySelector('#frm_canvas_tool'))[0];
        pdfAnnotationFactory.options.toolsObj.undo = angular.element(document.querySelector('#undo'))[0];
        pdfAnnotationFactory.options.toolsObj.redo = angular.element(document.querySelector('#redo'))[0];
        pdfAnnotationFactory.options.toolsObj.save = angular.element(document.querySelector('#save'))[0];
        pdfAnnotationFactory.options.toolsObj.fontsize = angular.element(document.querySelector('#fontsize'))[0];
        pdfAnnotationFactory.options.toolsObj.fillstyle = angular.element(document.querySelector('#fillstyle'))[0];
        pdfAnnotationFactory.options.toolsObj.linewidth = angular.element(document.querySelector('#linewidth'))[0];
        pdfAnnotationFactory.options.toolsObj.prevBtn = angular.element(document.querySelector('#prevBtn'))[0];
        pdfAnnotationFactory.options.toolsObj.nextBtn = angular.element(document.querySelector('#nextBtn'))[0];
        pdfAnnotationFactory.options.toolsObj.activePage = angular.element(document.querySelector('#activePage'))[0];
        pdfAnnotationFactory.options.toolsObj.currentPage = angular.element(document.querySelector('#currentPage'))[0];
        pdfAnnotationFactory.options.toolsObj.totalPage = angular.element(document.querySelector('#totalPage'))[0];
        pdfAnnotationFactory.options.toolsObj.canvas = angular.element(document.querySelector('#canvas'))[0];
        pdfAnnotationFactory.options.toolsObj.close = angular.element(document.querySelector('#close'))[0];

        pdfAnnotationFactory.options.toolsObj.canvasContainer = angular.element(document.querySelector('#canvas-container'))[0];
        
        pdfAnnotationFactory.options.toolsObj.close.addEventListener('click', function () {
            pdfAnnotationFactory.event.options.activeTool = '';
            pdfAnnotationFactory.history.manageActiveBtn('');
            pdfAnnotationFactory.event.closepdf();
        });

        scope.$watch('options', function(newValue, oldValue) {
          if(scope.options.url !== '') {
            pdfAnnotationFactory.history.initial_canvas_url = [];
            pdfAnnotationFactory.history.final_canvas_url = [];
            pdfAnnotationFactory.history.final_canvas_url = [];
            pdfAnnotationFactory.history.redo_list = [];
            pdfAnnotationFactory.history.undo_list = [];
            pdfAnnotationFactory.history.raw_undo_list = [];
            pdfAnnotationFactory.history.raw_redo_list = [];
            pdfAnnotationFactory.history.raw_undo_ver_list = [];
            pdfAnnotationFactory.history.raw_redo_ver_list = [];
            pdfAnnotationFactory.history.tmp_raw_undo_list = '';
            pdfAnnotationFactory.history.options.activePage = 0;
            pdfAnnotationFactory.history.manageActiveBtn('');
            pdfAnnotationFactory.history.setButtonStyle();

            pdfAnnotationFactory.options.toolsObj.canvasContainer.innerHTML = '';
            pdfAnnotationFactory.options.bindFlag = '';
			pdfAnnotationFactory.options.btnFlag = false;
            pdfAnnotationFactory.options.bindCnt = 0;
            scope.errorURL = false;
console.log('Before renderPDF Call from directive');              
            pdfAnnotationFactory.renderPDF(scope.options.url, pdfAnnotationFactory.options.toolsObj.canvasContainer);
          } else {
            scope.errorURL = true;
          }
        })

        //this.squareObj = angular.element(document.querySelector('#square'));
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