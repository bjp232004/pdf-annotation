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

  module.directive('pdfAnnotation', function (pdfAnnotationFactory) {
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
            pdfAnnotationFactory.renderPDF(scope.options.url, pdfAnnotationFactory.options.toolsObj.canvasContainer);
          } else {
            scope.errorURL = true;
          }
        })

        //this.squareObj = angular.element(document.querySelector('#square'));
      }
    }
  });

  module.factory('pdfAnnotationFactory', function() {
    var factoryObj = {};

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