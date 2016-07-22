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
          factoryObj.options.toolsObj.prevBtn.setAttribute('disabled', 'disabled');
          factoryObj.options.toolsObj.nextBtn.removeAttribute('disabled');
        }
        else if(parseInt(factoryObj.history.options.activePage) === parseInt(factoryObj.history.options.totalPage - 1)) {
          factoryObj.options.toolsObj.nextBtn.setAttribute('disabled', 'disabled');
          factoryObj.options.toolsObj.prevBtn.removeAttribute('disabled');
        }
        else if(factoryObj.history.options.activePage > 0 && parseInt(factoryObj.history.options.activePage) < parseInt(factoryObj.history.options.totalPage - 1)) {
          factoryObj.options.toolsObj.prevBtn.removeAttribute('disabled');
          factoryObj.options.toolsObj.nextBtn.removeAttribute('disabled');
        }
      }
    }

    factoryObj.text = {
      name: 'text',
      options: {
        stroke_color: ['00', '00', '00'],
        fill_color: '#FF0000',
        font: '18px Arial',
        dim: 4,
        lineHeight: 14,
        finalTextInfo: []
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
        this.options.flag = true;
      },
      start: function(evt) {
        if(!this.options.flag) return;
        this.canvas_coords = this.canvas.getBoundingClientRect();
        var x = evt.pageX - this.canvas_coords.left;
        var y = evt.pageY - this.canvas_coords.top;

        this.options.startX = x;
        this.options.startY = y;

        this.options.endX = x;
        this.options.endY = y;

        this.ctx.fillStyle = this.options.fill_color;
        this.ctx.font = this.options.font;

        this.ctx.beginPath();
        this.drawing = true;
      },
      stroke: function(evt) {
        if(!this.options.flag) return;
        if(this.drawing) {
          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;
          this.options.endX = x;
          this.options.endY = y;
        }
      },
      stop: function(evt) {
        if(this.drawing && this.options.flag && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
          this.drawing = false;
          this.options.flag = false;

          this.options.lineHeight = parseInt(factoryObj.history.options.font_size);

          factoryObj.options.toolsObj.editor_wrapper.style.display = 'block';
          factoryObj.options.toolsObj.editor_wrapper.style.top = this.options.startY + this.canvas_coords.top - 10;
          factoryObj.options.toolsObj.editor_wrapper.style.left = this.options.startX + this.canvas_coords.left;
          factoryObj.options.toolsObj.editor_wrapper.style.width = this.options.endX - this.options.startX;

          factoryObj.options.toolsObj.contenteditor.focus();
          factoryObj.options.toolsObj.contenteditor.style.minHeight = parseInt(this.options.endY - this.options.startY);
        } else {
          this.ctx.closePath();
          this.ctx.stroke();
          this.drawing = false;
        }
      },
      drawTool: function() {
        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        factoryObj.options.toolsObj.contenteditor.style.fontSize = factoryObj.history.options.font_size;
        factoryObj.options.toolsObj.contenteditor.style.lineHeight = factoryObj.history.options.font_size+'px';
        factoryObj.options.toolsObj.contenteditor.style.height = (factoryObj.options.toolsObj.contenteditor.scrollHeight)+"px";

        var contenttext = factoryObj.options.toolsObj.contenteditor.value;
        var enteredTextEncoded = escape(contenttext);
        contenttext = unescape(enteredTextEncoded.replace(/%0A/g, '<br />').replace(/%20/g, ' '));
        factoryObj.options.toolsObj.contenteditor.value = '';
        if(contenttext !== '') {
          var textObj = {
            text:contenttext,
            x: this.options.startX,
            y: this.options.startY,
            boxWidth: this.options.endX - this.options.startX
          };

          this.drawStyledText(textObj);
          this.options.flag = true;
        }

      },
      drawStyledText: function (textInfo) {
        this.options.textInfo = textInfo;
        var text = textInfo.text, x = textInfo.x, y = textInfo.y;
        var splittedText, xAux, textLines = [], boxWidth = textInfo.boxWidth;
        var proText, k, n, m;

        var match = text.match(/<\s*br\s*\/>|<\s*class=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/class\s*\>|<\s*style=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/style\s*\>|[^<]+/g);
        
        for (m = 0; m < match.length; m++) {

          if (/<\s*br\s*\/>/i.test(match[m])) {
            y += parseInt(this.options.lineHeight, 10) * 1.5;
            x = textInfo.x;
            continue;
          } else {
            proText = match[m];
          }

          textLines = [];
          proText = proText.replace(/\s*\n\s*/g, " ");

          if (boxWidth !== undefined) {

            if (this.checkLineBreak(proText, (boxWidth+textInfo.x), x)) {
              splittedText = this.trim(proText).split(" ");

              if (splittedText.length == 1) {
                textLines.push({text: this.trim(proText) + " ", linebreak: true});
              } else {
                xAux = x;
                var line = 0;
                textLines[line] = {text: undefined, linebreak: false};

                for (k = 0; k < splittedText.length; k++) {
                  splittedText[k] += " ";
                  if (!this.checkLineBreak(splittedText[k], (boxWidth+textInfo.x), xAux)) {
                    if (textLines[line].text == undefined) {
                      textLines[line].text = splittedText[k];
                    } else {
                      textLines[line].text += splittedText[k];
                    }

                    xAux += this.ctx.measureText(splittedText[k]).width;
                  } else {
                    xAux = textInfo.x;
                    if (textLines[line].text !== undefined) {
                      line++;
                    }

                    textLines[line] = {text: splittedText[k], linebreak: true};
                    xAux += this.ctx.measureText(splittedText[k]).width;
                  }
                }
              }
            }
          }

          if (textLines.length == 0) {
            textLines.push({text: this.trim(proText) + " ", linebreak: false});
          }

          for (n = 0; n < textLines.length; n++) {
            if (textLines[n].linebreak) {
              y += parseInt(this.options.lineHeight, 10);
              x = textInfo.x;

              this.options.endY = y
            }
            this.ctx.fillText(textLines[n].text, x, y);
            this.options.finalTextInfo.push({'text': textLines[n].text, 'x': x, 'y': y});
            x += this.ctx.measureText(textLines[n].text).width;
          }
        }

        factoryObj.square.canvas = this.canvas;
        factoryObj.square.ctx = this.ctx;
        factoryObj.square.options.startX = this.options.startX-10;
        factoryObj.square.options.startY = this.options.startY-15;
        factoryObj.square.options.endX = this.options.endX;
        factoryObj.square.options.endY = this.options.endY+10;
        factoryObj.square.drawTool();

        this.ctx.stroke();
        factoryObj.history.setRawData();
        factoryObj.history.saveState(this.canvas);
      },
      redrawTool: function(obj, diffX, diffY) {
        for(var k=0; k < obj.length; k++) {
          this.ctx.fillText(obj[k].text, obj[k].x+diffX, obj[k].y+diffY);
        }

        factoryObj.square.canvas = this.canvas;
        factoryObj.square.ctx = this.ctx;
        factoryObj.square.options.startX = this.options.startX-10;
        factoryObj.square.options.startY = this.options.startY-15;
        factoryObj.square.options.endX = this.options.endX;
        factoryObj.square.options.endY = this.options.endY+10;
        factoryObj.square.drawTool();
      },
      checkLineBreak: function (text, boxWidth, x) {
        return (this.ctx.measureText(text).width + x > boxWidth);
      },
      trim: function (str) {
        var ws, i;
        str = str.replace(/^\s\s*/, '');
        ws = /\s/;
        i = str.length;
        while (ws.test(str.charAt(--i))) {
          continue;
        }
        return str.slice(0, i + 1);
      }
    };
    
    factoryObj.image = {
      name: 'image',
      options: {
        activeImage: '',
        uploadedImage: [],
        width: '',
        height: '',
        wdthHghtRatio: '',
        img: ''
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.drawing = false;
      },
      start: function(evt) {
        this.canvas_coords = this.canvas.getBoundingClientRect();
        var x = evt.pageX - this.canvas_coords.left;
        var y = evt.pageY - this.canvas_coords.top;

        this.options.startX = x;
        this.options.startY = y;

        this.options.endX = x;
        this.options.endY = y;

        this.ctx.beginPath();
        this.drawing = true;
      },
      stroke: function(evt) {
        if(this.drawing) {
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);

          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;

          this.options.endX = x;
          this.options.endY = y;

          this.drawTool();
        }
      },
      stop: function(evt) {
        if(this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
          this.ctx.beginPath();
          this.drawTool();
          this.ctx.closePath();
          this.ctx.stroke();

          this.drawing = false;
          factoryObj.history.setRawData();
          factoryObj.history.saveState(this.canvas);
        } else {
          this.ctx.closePath();
          this.ctx.stroke();
          this.drawing = false;
        }
      },
      drawTool: function() {
        this.ctx.beginPath();

        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        this.options.width = parseInt(this.options.endX - this.options.startX);
        this.options.height = parseInt(this.options.endY - this.options.startY);

        this.ctx.drawImage(this.options.img , this.options.startX, this.options.startY, this.options.width, this.options.height);
          
          
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#000000';  
        this.ctx.rect(this.options.startX+2, this.options.startY+2, this.options.width-4, this.options.height-4);
        this.ctx.stroke();
        
        this.ctx.closePath();
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#FFFFFF';
        factoryObj.image.options.endX = factoryObj.image.options.startX + factoryObj.image.options.width;
        factoryObj.image.options.endY = factoryObj.image.options.startY + factoryObj.image.options.height;
        this.ctx.rect(factoryObj.image.options.startX, factoryObj.image.options.startY, 8, 8);
        this.ctx.rect(factoryObj.image.options.startX, factoryObj.image.options.endY-8, 8, 8);
        this.ctx.rect(factoryObj.image.options.endX-8, factoryObj.image.options.endY-8, 8, 8);
        this.ctx.rect(factoryObj.image.options.endX-8, factoryObj.image.options.startY, 8, 8);
          
        this.ctx.rect(factoryObj.image.options.endX-factoryObj.image.options.width, factoryObj.image.options.endY-parseInt(factoryObj.image.options.height/2)-8, 8, 8);
        this.ctx.rect(factoryObj.image.options.endX-8, factoryObj.image.options.endY-parseInt(factoryObj.image.options.height/2)-8, 8, 8);
        this.ctx.rect(factoryObj.image.options.endX-parseInt(factoryObj.image.options.width/2)-8, factoryObj.image.options.endY-8, 8, 8);
        this.ctx.rect(factoryObj.image.options.endX-parseInt(factoryObj.image.options.width/2)-8, factoryObj.image.options.endY-factoryObj.image.options.height, 8, 8);
          
        this.ctx.fill();  
        this.ctx.stroke();  
        this.ctx.closePath();
      },
      uploadImage: function(frmData) {
        var img = new Image;

        img.onload = function(obj) {
          factoryObj.image.options.startX = 10;
          factoryObj.image.options.startY = 10;
          factoryObj.image.options.endX = obj.path[0].width;
          factoryObj.image.options.endY = obj.path[0].height;
          factoryObj.image.ctx.beginPath();
          factoryObj.image.drawing = true;
          factoryObj.history.drawingState(factoryObj.image.canvas, factoryObj.image.ctx, factoryObj.history.undo_list);
          factoryObj.image.drawTool();
          factoryObj.image.ctx.closePath();
          factoryObj.image.ctx.stroke();

          factoryObj.image.drawing = false;
          factoryObj.history.setRawData();
          factoryObj.history.saveState(factoryObj.image.canvas);
        }

        img.src = URL.createObjectURL(frmData);
        this.options.uploadedImage.push(URL.createObjectURL(frmData));
        this.options.img = img;
      }
    };

    factoryObj.arrow = {
      name: 'arrow',
      options: {
        stroke_color: ['00', '00', '00'],
        dim: 4,
        arrow: {h: 5, w: 10},
        headlen: 10
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
      },
      start: function(evt) {
        this.canvas_coords = this.canvas.getBoundingClientRect();
        var x = evt.pageX - this.canvas_coords.left;
        var y = evt.pageY - this.canvas_coords.top;

        this.options.startX = x;
        this.options.startY = y;

        this.options.endX = x;
        this.options.endY = y;

        this.ctx.beginPath();
        this.drawing = true;
      },
      stroke: function(evt) {
        if(this.drawing) {
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);

          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;

          this.options.endX = x;
          this.options.endY = y;

          this.drawTool();
        }
      },
      stop: function(evt) {
        if(this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
          this.ctx.beginPath();
          this.drawTool();
          this.ctx.closePath();
          this.ctx.stroke();

          this.drawing = false;
          factoryObj.history.setRawData();
          factoryObj.history.saveState(this.canvas);
        } else {
          this.ctx.closePath();
          this.ctx.stroke();
          this.drawing = false;
        }
      },
      drawTool: function() {
        this.ctx.beginPath();

        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        var angle = Math.atan2(this.options.endY - this.options.startY, this.options.endX - this.options.startX);
        this.ctx.moveTo(this.options.startX, this.options.startY);
        this.ctx.lineTo(this.options.endX, this.options.endY);
        this.ctx.lineTo(this.options.endX - this.options.headlen*Math.cos(angle - Math.PI/6), this.options.endY - this.options.headlen*Math.sin(angle - Math.PI/6));
        this.ctx.moveTo(this.options.endX, this.options.endY);
        this.ctx.lineTo(this.options.endX - this.options.headlen*Math.cos(angle+Math.PI/6), this.options.endY - this.options.headlen*Math.sin(angle+Math.PI/6));
        this.ctx.stroke();
      }
    };

    factoryObj.line = {
      name: 'line',
      options: {
        stroke_color: ['00', '00', '00'],
        dim: 4
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
      },
      start: function(evt) {
        this.canvas_coords = this.canvas.getBoundingClientRect();
        var x = evt.pageX - this.canvas_coords.left;
        var y = evt.pageY - this.canvas_coords.top;

        this.options.startX = x;
        this.options.startY = y;

        this.options.endX = x;
        this.options.endY = y;

        this.ctx.beginPath();
        this.drawing = true;
      },
      stroke: function(evt) {
        if(this.drawing) {
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);

          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;

          this.options.endX = x;
          this.options.endY = y;

          this.drawTool();
        }
      },
      stop: function(evt) {
        if(this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
          this.ctx.beginPath();
          this.drawTool();
          this.ctx.closePath();
          this.ctx.stroke();

          this.drawing = false;
          factoryObj.history.setRawData();
          factoryObj.history.saveState(this.canvas);
        } else {
          this.ctx.closePath();
          this.ctx.stroke();
          this.drawing = false;
        }
      },
      drawTool: function() {
        this.ctx.beginPath();

        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        this.ctx.moveTo(this.options.startX, this.options.startY);
        this.ctx.lineTo(this.options.endX, this.options.endY);
        this.ctx.stroke();
      },
      redrawTool: function() {
        this.ctx.beginPath();

        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        this.ctx.moveTo(this.options.startX, this.options.startY);
        this.ctx.lineTo(this.options.endX, this.options.endY);
        this.ctx.stroke();
      }
    };
    
    factoryObj.circle = {
      name: 'circle',
      options: {
        stroke_color: ['00', '00', '00'],
        dim: 4
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
      },
      start: function(evt) {
        this.canvas_coords = this.canvas.getBoundingClientRect();
        var x = evt.pageX - this.canvas_coords.left;
        var y = evt.pageY - this.canvas_coords.top;

        this.options.startX = x;
        this.options.startY = y;

        this.options.endX = x;
        this.options.endY = y;

        this.ctx.beginPath();
        this.drawing = true;
      },
      stroke: function(evt) {
        if(this.drawing) {
          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;
          this.options.endX = x;
          this.options.endY = y;
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);
        }
      },
      stop: function(evt) {
        if(this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
          this.drawTool();
          this.ctx.closePath();
          this.ctx.stroke();

          this.drawing = false;
          factoryObj.history.setRawData();
          factoryObj.history.saveState(this.canvas);

        } else {
          this.ctx.closePath();
          this.ctx.stroke();
          this.drawing = false;
        }
      },
      drawTool: function() {
        if(this.drawing) {
          factoryObj.history.setStyleElement(this.canvas, this.ctx);

          var h = parseInt(this.options.endX - this.options.startX);
          var k = parseInt(this.options.endY - this.options.startY);
          var r = h+k;
          var step = 2*Math.PI/r;

          this.options.radius = r;
          this.ctx.beginPath();

          for(var theta=0;  theta < 2*Math.PI;  theta+=step)
          {
            var x = h + r * Math.cos(theta);
            var y = k - r * Math.sin(theta);
            this.ctx.lineTo(x + this.options.startX, y + this.options.startY);
          }
          this.ctx.stroke();
        }
      }
    };

    factoryObj.ellipse = {
      name: 'ellipse',
      options: {
        stroke_color: ['00', '00', '00'],
        dim: 4
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
      },
      start: function(evt) {
        this.canvas_coords = this.canvas.getBoundingClientRect();
        var x = evt.pageX - this.canvas_coords.left;
        var y = evt.pageY - this.canvas_coords.top;

        this.options.startX = x;
        this.options.startY = y;

        this.options.endX = x;
        this.options.endY = y;

        this.ctx.beginPath();
        this.drawing = true;
      },
      stroke: function(evt) {
        if(this.drawing) {
          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;
          this.options.endX = x;
          this.options.endY = y;
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);
        }
      },
      stop: function(evt) {
        if(this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
          this.drawTool();
          this.ctx.closePath();
          this.ctx.stroke();

          this.drawing = false;
          factoryObj.history.setRawData();
          factoryObj.history.saveState(this.canvas);

        } else {
          this.ctx.closePath();
          this.ctx.stroke();
          this.drawing = false;
        }
      },
      drawTool: function() {
        if(this.drawing) {
          factoryObj.history.setStyleElement(this.canvas, this.ctx);

          this.ctx.beginPath();
          for (m = 0 * Math.PI; m < 2 * Math.PI; m += 0.01 ) {
            xPos = Math.floor(this.options.startX - (parseInt(this.options.endX - this.options.startX) * Math.cos(m)));
            yPos = Math.floor(this.options.startY + (parseInt(this.options.endY - this.options.startY) * Math.sin(m)));

            if (m == 0) {
              this.ctx.moveTo(xPos, yPos);
            } else {
              this.ctx.lineTo(xPos, yPos);
            }
          }

          this.ctx.stroke();
        }
      }
    };

    factoryObj.pencil = {
      name: 'pencil',
      options: {
        stroke_color: ['00', '00', '00'],
        dim: 4
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.fillStyle;
        this.drawing = false;
      },
      start: function(evt) {
        factoryObj.history.setStyleElement(this.canvas, this.ctx);
        this.canvas_coords = this.canvas.getBoundingClientRect();
        var x = evt.pageX - this.canvas_coords.left;
        var y = evt.pageY - this.canvas_coords.top;
        this.options.startX = x;
        this.options.startY = y;

        this.options.endX = 0;
        this.options.endY = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(this.options.startX, this.options.startY);
        factoryObj.history.setRawData();
        this.drawing = true;
      },
      stroke: function(evt) {
        if(this.drawing) {
          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;
          this.options.startX = x;
          this.options.startY = y;
          this.options.endX = 0;
          this.options.endY = 0;
          this.ctx.lineTo(this.options.startX, this.options.startY);
          factoryObj.history.setRawData();
          this.ctx.stroke();
        }
      },
      stop: function(evt) {
        if(this.drawing) {
          this.drawing = false;
          factoryObj.history.saveState(this.canvas);
        }
      },
      drawTool: function() {

      },
      redrawTool: function() {
        this.ctx.beginPath();

        for(var l=0; l<this.options.pencilData.length; l++) {

          if(l==0) {
            this.ctx.moveTo(this.options.pencilData[l].x + this.options.diffX, this.options.pencilData[l].y + this.options.diffY);
          } else {
            this.ctx.lineTo(this.options.pencilData[l].x + this.options.diffX, this.options.pencilData[l].y + this.options.diffY);
          }
        }
        this.ctx.stroke();
      }
    };

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