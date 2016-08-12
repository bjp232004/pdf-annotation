'use strict';

(function (angular, factory) {
  if (typeof define === 'function' && define.amd) {
    define('pdf-annotation', ['angular'], function (angular) {
      return factory(angular);
    });
  } else {
    return factory(angular);
  }
})(typeof angular === 'undefined' ? null : angular, function (angular) {

  var module = angular.module('pdfAnnotation', []);

  'use strict';

  module.factory('pdfAnnotationFactory', function () {
    var factoryObj = {};
    var lineP1, lineP2, lineP3, lineP4, i, m, xPos, yPos;
    factoryObj.options = {
      viewport: '',
      canvas_rand: '',
      ctx_rand: '',
      renderContext: { canvasContext: '', viewport: '' },
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
      },
      pdfWorker: 'src/js/pdf.worker.js'
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
      setStyleElement: function setStyleElement(canvas, ctx) {
        ctx.fillStyle = '#' + this.options.fillStyle.replace('#', '');
        ctx.font = this.options.font_size + 'px Calibri';
        ctx.lineWidth = this.options.lineWidth;
        ctx.strokeStyle = '#' + this.options.fillStyle.replace('#', '');
      },
      resetStyleElement: function resetStyleElement() {
        this.options.fillStyle = document.getElementById('fillstyle').value;
        this.options.font_size = document.getElementById('fontsize').value;
        this.options.lineWidth = document.getElementById('linewidth').value;
      },
      setButtonStyle: function setButtonStyle() {
        if (this.raw_undo_ver_list.length > 0) {
          if (this.raw_undo_ver_list[this.options.activePage].length > 0 || this.raw_undo_list[this.options.activePage].length > 0) {
            factoryObj.options.toolsObj.undo.classList.remove('cur_disable');
          } else {
            factoryObj.options.toolsObj.undo.className += ' cur_disable';
          }

          if (this.raw_redo_ver_list[this.options.activePage].length > 0) {
            factoryObj.options.toolsObj.redo.classList.remove('cur_disable');
          } else {
            factoryObj.options.toolsObj.redo.className += ' cur_disable';
          }
        } else {
          factoryObj.options.toolsObj.undo.className += ' cur_disable';
          factoryObj.options.toolsObj.redo.className += ' cur_disable';
        }
      },
      saveState: function saveState(canvas, list, keep_redo) {
        keep_redo = keep_redo || false;
        if (!keep_redo) {
          this.redo_list = [];
        }

        if (!this.undo_list.hasOwnProperty(this.options.activePage)) {
          this.undo_list[this.options.activePage] = [];
        }

        if (!this.raw_undo_list.hasOwnProperty(this.options.activePage)) {
          this.raw_undo_list[this.options.activePage] = [];
          this.raw_redo_list[this.options.activePage] = [];

          this.raw_undo_ver_list[this.options.activePage] = [];
          this.raw_redo_ver_list[this.options.activePage] = [];
        }

        var canvasData = canvas.toDataURL();
        if (list) {
          if (!list.hasOwnProperty(this.options.activePage)) {
            list[this.options.activePage] = [];
          }
          list[this.options.activePage][0] = canvasData;
        } else {
          this.undo_list[this.options.activePage][0] = canvasData;

          if (factoryObj.event.options.activeTool && factoryObj.event.options.activeTool.name !== 'move') {
            this.saveRawData();
          } else {
            if (this.tmp_raw_undo_list != '') {
              var tmpData = angular.copy(this.tmp_raw_undo_list);
              this.tmp_raw_undo_list = '';
              this.raw_undo_ver_list[this.options.activePage].push(tmpData);
            }
          }
        }
        this.setButtonStyle();
        factoryObj.history.final_canvas_url[factoryObj.history.options.PrevPage] = canvasData;
      },
      saveRawData: function saveRawData() {
        if (!factoryObj.event.options.activeTool.drawing) {
          if (!this.raw_undo_list.hasOwnProperty(this.options.activePage)) {
            this.raw_undo_list[this.options.activePage] = [];
            this.raw_redo_list[this.options.activePage] = [];

            this.raw_undo_ver_list[this.options.activePage] = [];
            this.raw_redo_ver_list[this.options.activePage] = [];
          }

          if (this.raw_undo_list[this.options.activePage].length > 0) {
            var tmpData = angular.copy(this.raw_undo_list[this.options.activePage]);
            this.raw_undo_ver_list[this.options.activePage].push(tmpData);
          }

          var tmpArrUndoData = angular.copy(this.options.arrData);

          if (tmpArrUndoData.name && tmpArrUndoData.name != '') {
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
      setRawData: function setRawData() {
        factoryObj.options.optionArrData.name = factoryObj.event.options.activeTool.name;
        factoryObj.options.optionArrData.startX.push(factoryObj.event.options.activeTool.options.startX);
        factoryObj.options.optionArrData.startY.push(factoryObj.event.options.activeTool.options.startY);
        factoryObj.options.optionArrData.endX.push(factoryObj.event.options.activeTool.options.endX);
        factoryObj.options.optionArrData.endY.push(factoryObj.event.options.activeTool.options.endY);
        factoryObj.options.optionArrData.font_size = this.options.font_size;
        factoryObj.options.optionArrData.fillStyle = this.options.fillStyle;
        factoryObj.options.optionArrData.lineWidth = this.options.lineWidth;

        if (factoryObj.options.optionArrData.name === "text") {
          factoryObj.options.optionArrData.textInfo = factoryObj.event.options.activeTool.options.textInfo;
          factoryObj.options.optionArrData.finalTextInfo = factoryObj.event.options.activeTool.options.finalTextInfo;
        }

        if (factoryObj.options.optionArrData.name === "image") {
          factoryObj.options.optionArrData.imageURL = factoryObj.event.options.activeTool.options.uploadedImage[factoryObj.event.options.activeTool.options.uploadedImage.length - 1];
        }

        if (factoryObj.options.optionArrData.name === "circle") {
          factoryObj.options.optionArrData.radius = factoryObj.event.options.activeTool.options.radius;
        }

        if (factoryObj.options.optionArrData.name === "pencil") {
          factoryObj.options.optionArrData.pencilData.push({ x: factoryObj.event.options.activeTool.options.startX, y: factoryObj.event.options.activeTool.options.startY });
        }

        if (factoryObj.options.optionArrData.name === "line") {
          factoryObj.options.optionArrData.lineAngle = Math.atan2(factoryObj.event.options.activeTool.options.endY - factoryObj.event.options.activeTool.options.startY, factoryObj.event.options.activeTool.options.endX - factoryObj.event.options.activeTool.options.startX);
        }

        if (factoryObj.options.optionArrData.name === "arrow") {
          factoryObj.options.optionArrData.arrowAngle = Math.atan2(factoryObj.event.options.activeTool.options.endY - factoryObj.event.options.activeTool.options.startY, factoryObj.event.options.activeTool.options.endX - factoryObj.event.options.activeTool.options.startX);
        }

        this.options.arrData = angular.copy(factoryObj.options.optionArrData);
      },
      undo: function undo(canvas, ctx) {
        if (this.raw_undo_list.length > 0) {
          this.options.action = 'undo';
          this.restoreStateRawData(this.raw_undo_list, this.raw_redo_list);
          this.redrawState(canvas, ctx);
        }
      },
      redo: function redo(canvas, ctx) {
        if (this.raw_redo_list.length > 0) {
          this.options.action = 'redo';
          this.restoreStateRawData(this.raw_undo_list, this.raw_redo_list);
          factoryObj.move.init(canvas, ctx);
          this.redrawState(canvas, ctx);
        }
      },
      restoreState: function restoreState(canvas, ctx, pop, push) {
        var pageData = pop[this.options.activePage];
        if (pageData.length) {
          if (push && this.options.action == 'undo') {
            this.saveState(canvas, push, true);
          }

          if (this.options.action == 'undo') {
            var restore_state = pageData.pop();
            if (pageData.length) {
              var imgSrc = pageData[pageData.length - 1];
            } else {
              var imgSrc = restore_state;
            }
          } else {
            var restore_state = pageData.pop();
            var imgSrc = restore_state;
            this.undo_list[this.options.activePage].push(restore_state);
          }

          var img = document.createElement("img");
          img.src = imgSrc;
          img.onload = function () {
            ctx.clearRect(0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
            ctx.drawImage(img, 0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
          };
        }
      },
      restoreStateRawData: function restoreStateRawData(pop, push) {
        var pageData = pop[this.options.activePage];
        if (this.options.action == 'undo') {
          if (this.raw_undo_ver_list[this.options.activePage].length > 0) {
            var tmpArrUndoData = angular.copy(pageData);
            this.raw_redo_ver_list[this.options.activePage].push(tmpArrUndoData);
            this.options.redoFlag = true;

            if (this.raw_undo_ver_list[this.options.activePage].length > 0) {
              var undoData = angular.copy(this.raw_undo_ver_list[this.options.activePage].pop());
              this.raw_undo_list[this.options.activePage] = undoData;
            }
          } else {
            if (this.options.undoFlag === true) {
              var tmpArrUndoData = angular.copy(pageData);
              this.raw_redo_ver_list[this.options.activePage].push(tmpArrUndoData);
              this.raw_undo_list[this.options.activePage] = [];
              this.options.undoFlag = false;
            }
          }
          this.setButtonStyle();
        } else {
          if (this.raw_redo_ver_list[this.options.activePage].length > 0) {
            if (this.raw_undo_list[this.options.activePage].length > 0) {
              var tmpArrUndoData = angular.copy(this.raw_undo_list[this.options.activePage]);
              this.raw_undo_ver_list[this.options.activePage].push(tmpArrUndoData);
            }
            this.options.undoFlag = true;

            if (this.raw_redo_ver_list[this.options.activePage].length > 0) {
              var tmpArrRedoData = angular.copy(this.raw_redo_ver_list[this.options.activePage].pop());
              var redoData = tmpArrRedoData;
              this.raw_undo_list[this.options.activePage] = redoData;
            }
          } else {
            if (this.options.redoFlag === true) {
              var tmpArrRedoData = angular.copy(this.raw_redo_ver_list[this.options.activePage].pop());
              var redoData = tmpArrRedoData;
              this.raw_undo_list[this.options.activePage] = redoData;
              this.options.redoFlag = false;
            }
          }
          this.setButtonStyle();
        }
      },
      drawingState: function drawingState(canvas, ctx, pop) {
        if (pop[this.options.activePage].length) {
          var restore_state = pop[this.options.activePage][pop[this.options.activePage].length - 1];
          var img = document.createElement("img");
          img.src = restore_state;
          img.onload = function () {
            ctx.clearRect(0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
            ctx.drawImage(img, 0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
            factoryObj.event.options.activeTool.drawTool();
          };
        }
      },
      redrawState: function redrawState(canvas, ctx) {
        if (this.initial_canvas_url[this.options.activePage]) {
          var restore_state = this.initial_canvas_url[this.options.activePage];
          var img = document.createElement("img");
          img.src = restore_state;
          img.onload = function () {
            ctx.clearRect(0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);
            ctx.drawImage(img, 0, 0, factoryObj.history.options.canvas_width, factoryObj.history.options.canvas_height);

            if (factoryObj.history.raw_undo_list[factoryObj.history.options.activePage].length > 0) {
              factoryObj.move.redrawTool();
            }
          };
        }
      },
      manageActiveBtn: function manageActiveBtn(btn) {
        var activeObj = document.getElementsByClassName('controller active');
        for (var x = 0; x < activeObj.length; x++) {
          activeObj[x].classList.remove('active');
        }
        if (btn !== '') {
          document.getElementById(btn).className += ' active';
          if (btn !== 'clear_image') {
            factoryObj.options.toolsObj.frm_canvas_tool.reset();
          }
        }
      }
    };

    factoryObj.event = {
      options: {
        activeTool: ''
      },
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.canvas_coords = this.canvas.getBoundingClientRect();
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.paging();
        this.addCanvasEvents();
      },
      addCanvasEvents: function addCanvasEvents() {
        this.canvas.addEventListener('mousedown', this.start.bind(this));
        this.canvas.addEventListener('mousemove', this.stroke.bind(this));
        this.canvas.addEventListener('mouseup', this.stop.bind(this));
        this.canvas.addEventListener('mouseout', this.stop.bind(this));
      },
      start: function start(evt) {
        if (factoryObj.history.raw_undo_list[factoryObj.history.options.activePage].length > 0) {
          factoryObj.move.init(this.canvas, this.ctx);
          factoryObj.move.start(evt);
        }

        if (factoryObj.move.options.movedObject == -1) {
          if (this.options.activeTool !== '' && this.options.activeTool !== undefined) {
            this.options.activeTool.start(evt);
          }
        }
      },
      stroke: function stroke(evt) {
        if (this.options.activeTool !== '' && this.options.activeTool !== undefined && this.options.activeTool.drawing === true) {
          this.options.activeTool.stroke(evt);
        }
      },
      stop: function stop(evt) {
        if (this.options.activeTool !== '' && this.options.activeTool !== undefined && this.options.activeTool.drawing === true) {
          this.options.activeTool.stop(evt);
        }
      },
      closepdf: function closepdf() {
        factoryObj.options.closeFn();
      },
      savepdf: function savepdf() {
        var page = 0;
        var m = confirm("Are you sure to you want to save file?");
        if (m) {
          var doc = new jsPDF('p', 'mm', 'a4');
          for (page = 0; page < parseInt(factoryObj.history.options.totalPage); page++) {
            if (page < 2) {
              this.options.isSave = true;
              factoryObj.move.init(this.canvas, this.ctx);
              factoryObj.move.redrawTool();
              if (factoryObj.history.final_canvas_url.hasOwnProperty(page)) {
                var imgData = factoryObj.history.final_canvas_url[page];
              } else {
                var imgData = document.getElementById("page" + page).toDataURL("image/png");
              }
              doc.addImage(imgData, 'PNG', 0, 0, 200, 250, null, 'SLOW');
              if (page < parseInt(factoryObj.history.options.totalPage - 1)) {
                doc.addPage();
              }

              this.options.isSave = false;
            }
          }

          var dataurl = doc.output('datauristring');
          var blob = this.dataURLtoBlob(dataurl);

          if (typeof factoryObj.options.callbackFn == "function") {
            factoryObj.options.callbackFn({ blob: blob });
          } else {
            doc.save();
          }
        }
      },
      dataURLtoBlob: function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      },
      paging: function paging() {
        factoryObj.history.options.totalPage = factoryObj.history.options.pdfobj.transport.numPages;
        factoryObj.options.toolsObj.activePage.textContent = factoryObj.history.options.activePage + 1;
        factoryObj.options.toolsObj.currentPage.value = factoryObj.history.options.activePage + 1;
        factoryObj.options.toolsObj.totalPage.textContent = factoryObj.history.options.totalPage;
        if (factoryObj.history.options.totalPage > 1) {
          if (factoryObj.history.options.activePage === 0) {
            factoryObj.options.toolsObj.prevBtn.setAttribute('disabled', 'disabled');
            factoryObj.options.toolsObj.nextBtn.removeAttribute('disabled');
          } else if (parseInt(factoryObj.history.options.activePage) === parseInt(factoryObj.history.options.totalPage - 1)) {
            factoryObj.options.toolsObj.nextBtn.setAttribute('disabled', 'disabled');
            factoryObj.options.toolsObj.prevBtn.removeAttribute('disabled');
          } else if (factoryObj.history.options.activePage > 0 && parseInt(factoryObj.history.options.activePage) < parseInt(factoryObj.history.options.totalPage - 1)) {
            factoryObj.options.toolsObj.prevBtn.removeAttribute('disabled');
            factoryObj.options.toolsObj.nextBtn.removeAttribute('disabled');
          }
        } else {
          factoryObj.options.toolsObj.nextBtn.setAttribute('disabled', 'disabled');
          factoryObj.options.toolsObj.prevBtn.setAttribute('disabled', 'disabled');
        }
      }
    };

    factoryObj.text = {
      name: 'text',
      options: {
        stroke_color: ['00', '00', '00'],
        fill_color: '#FF0000',
        font: '18px Arial',
        dim: 4,
        lineHeight: 14,
        finalTextInfo: [],
        width: 250,
        height: 250
      },
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
        this.options.flag = true;
      },
      start: function start(evt) {
        if (!this.options.flag) return;
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
      stroke: function stroke(evt) {
        if (!this.options.flag) return;
        if (this.drawing) {
          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;
          this.options.endX = x;
          this.options.endY = y;
        }
      },
      stop: function stop(evt) {
        /*if(this.drawing && this.options.flag && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {*/
        console.log('In text stop event');
        this.drawing = false;
        this.options.flag = false;
        console.log(this.canvas_coords);
        this.options.lineHeight = parseInt(factoryObj.history.options.font_size);
        console.log('In text stop event before style attribute');
        factoryObj.options.toolsObj.editor_wrapper.style.display = 'block';
        factoryObj.options.toolsObj.editor_wrapper.style.top = parseInt(this.options.startY + 90) + 'px';
        factoryObj.options.toolsObj.editor_wrapper.style.left = this.options.startX + 'px';
        factoryObj.options.toolsObj.editor_wrapper.style.width = this.options.width + 'px';
        console.log('In text stop event before focus');
        factoryObj.options.toolsObj.contenteditor.focus();
        factoryObj.options.toolsObj.contenteditor.style.height = 'auto';
        this.options.finalTextInfo = [];
        /*} else {
          this.ctx.closePath();
          this.ctx.stroke();
          this.drawing = false;
        }*/
      },
      drawTool: function drawTool() {
        factoryObj.history.setStyleElement(this.canvas, this.ctx);
        console.log(factoryObj.options.toolsObj.contenteditor.style);
        factoryObj.options.toolsObj.contenteditor.style.fontSize = factoryObj.history.options.font_size;
        factoryObj.options.toolsObj.contenteditor.style.lineHeight = factoryObj.history.options.font_size + 'px';
        factoryObj.options.toolsObj.contenteditor.style.height = factoryObj.options.toolsObj.contenteditor.scrollHeight + "px";
        /*factoryObj.options.toolsObj.contenteditor.style.width = this.options.width + "px";*/

        var contenttext = factoryObj.options.toolsObj.contenteditor.value;
        var enteredTextEncoded = escape(contenttext);
        contenttext = unescape(enteredTextEncoded.replace(/%0A/g, '<br />').replace(/%20/g, ' '));
        factoryObj.options.toolsObj.contenteditor.value = '';

        if (contenttext !== '') {
          var textObj = {
            text: contenttext,
            x: this.options.startX,
            y: this.options.startY,
            boxWidth: (parseInt(factoryObj.options.toolsObj.contenteditor.style.width) > 0) ? parseInt(factoryObj.options.toolsObj.contenteditor.style.width) : this.options.width + "px"
          };
          console.log('before drawstyled');
          this.drawStyledText(textObj);
        }
        this.options.flag = true;
      },
      drawStyledText: function drawStyledText(textInfo) {
        this.options.textInfo = textInfo;
        var text = textInfo.text,
            x = textInfo.x,
            y = textInfo.y;
        var splittedText,
            xAux,
            textLines = [],
            boxWidth = textInfo.boxWidth;
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

            if (this.checkLineBreak(proText, boxWidth + textInfo.x, x)) {
              splittedText = this.trim(proText).split(" ");

              if (splittedText.length == 1) {
                textLines.push({ text: this.trim(proText) + " ", linebreak: true });
              } else {
                xAux = x;
                var line = 0;
                textLines[line] = { text: undefined, linebreak: false };

                for (k = 0; k < splittedText.length; k++) {
                  splittedText[k] += " ";
                  if (!this.checkLineBreak(splittedText[k], boxWidth + textInfo.x, xAux)) {
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

                    textLines[line] = { text: splittedText[k], linebreak: true };
                    xAux += this.ctx.measureText(splittedText[k]).width;
                  }
                }
              }
            }
          }

          if (textLines.length == 0) {
            textLines.push({ text: this.trim(proText) + " ", linebreak: false });
          }

          for (n = 0; n < textLines.length; n++) {
            if (textLines[n].linebreak) {
              y += parseInt(this.options.lineHeight, 10);
              x = textInfo.x;

              this.options.endY = y;
            }
            this.ctx.fillText(textLines[n].text, x, y);
            this.options.finalTextInfo.push({ 'text': textLines[n].text, 'x': x, 'y': y });
            x += this.ctx.measureText(textLines[n].text).width;
          }
        }

        factoryObj.square.canvas = this.canvas;
        factoryObj.square.ctx = this.ctx;
        factoryObj.square.options.startX = this.options.startX - 10;
        factoryObj.square.options.startY = this.options.startY - 20;
        factoryObj.square.options.endX = this.options.startX + parseInt(factoryObj.options.toolsObj.contenteditor.style.width) + 10;
        factoryObj.square.options.endY = y + 10;
        factoryObj.square.drawTool();

        this.options.startX = this.options.startX - 10;
        this.options.startY = this.options.startY - 20;
        this.options.endX = this.options.startX + parseInt(factoryObj.options.toolsObj.contenteditor.style.width) + 10;
        this.options.endY = y + 10;

        this.ctx.stroke();
        factoryObj.history.setRawData();
        factoryObj.history.saveState(this.canvas);
      },
      redrawTool: function redrawTool(obj, diffX, diffY) {
        for (var k = 0; k < obj.length; k++) {
          this.ctx.fillText(obj[k].text, obj[k].x + diffX, obj[k].y + diffY);
        }

        factoryObj.square.canvas = this.canvas;
        factoryObj.square.ctx = this.ctx;
        factoryObj.square.options.startX = this.options.startX;
        factoryObj.square.options.startY = this.options.startY;
        factoryObj.square.options.endX = this.options.endX;
        factoryObj.square.options.endY = this.options.endY;
        factoryObj.square.drawTool();
      },
      checkLineBreak: function checkLineBreak(text, boxWidth, x) {
        return this.ctx.measureText(text).width + x > boxWidth;
      },
      trim: function trim(str) {
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
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.drawing = false;
      },
      start: function start(evt) {
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
      stroke: function stroke(evt) {
        if (this.drawing) {
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);

          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;

          this.options.endX = x;
          this.options.endY = y;

          this.drawTool();
        }
      },
      stop: function stop(evt) {
        if (this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
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
      drawTool: function drawTool() {
        this.ctx.beginPath();

        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        this.options.width = parseInt(this.options.endX - this.options.startX);
        this.options.height = parseInt(this.options.endY - this.options.startY);

        this.ctx.drawImage(this.options.img, this.options.startX, this.options.startY, this.options.width, this.options.height);
        this.ctx.closePath();

        if (!factoryObj.event.options.isSave) {
          this.ctx.beginPath();
          this.ctx.lineWidth = 3;
          this.ctx.strokeStyle = '#000000';
          this.ctx.rect(this.options.startX + 2, this.options.startY + 2, this.options.width - 4, this.options.height - 4);
          this.ctx.stroke();

          this.ctx.closePath();

          this.ctx.beginPath();
          this.ctx.lineWidth = 1;
          this.ctx.fillStyle = '#FFFFFF';
          factoryObj.image.options.endX = factoryObj.image.options.startX + factoryObj.image.options.width;
          factoryObj.image.options.endY = factoryObj.image.options.startY + factoryObj.image.options.height;
          this.ctx.rect(factoryObj.image.options.startX, factoryObj.image.options.startY, 8, 8);
          this.ctx.rect(factoryObj.image.options.startX, factoryObj.image.options.endY - 8, 8, 8);
          this.ctx.rect(factoryObj.image.options.endX - 8, factoryObj.image.options.endY - 8, 8, 8);
          this.ctx.rect(factoryObj.image.options.endX - 8, factoryObj.image.options.startY, 8, 8);

          this.ctx.rect(factoryObj.image.options.endX - factoryObj.image.options.width, factoryObj.image.options.endY - parseInt(factoryObj.image.options.height / 2) - 8, 8, 8);
          this.ctx.rect(factoryObj.image.options.endX - 8, factoryObj.image.options.endY - parseInt(factoryObj.image.options.height / 2) - 8, 8, 8);
          this.ctx.rect(factoryObj.image.options.endX - parseInt(factoryObj.image.options.width / 2) - 8, factoryObj.image.options.endY - 8, 8, 8);
          this.ctx.rect(factoryObj.image.options.endX - parseInt(factoryObj.image.options.width / 2) - 8, factoryObj.image.options.endY - factoryObj.image.options.height, 8, 8);

          this.ctx.fill();
          this.ctx.stroke();
          this.ctx.closePath();
        }
      },
      uploadImage: function uploadImage(frmData) {
        var img = new Image();

        img.onload = function (obj) {
          console.log(obj, this.width, this);
          factoryObj.image.options.startX = 10;
          factoryObj.image.options.startY = 10;
          factoryObj.image.options.endX = this.width;
          factoryObj.image.options.endY = this.height;
          factoryObj.image.ctx.beginPath();
          factoryObj.image.drawing = true;
          factoryObj.history.drawingState(factoryObj.image.canvas, factoryObj.image.ctx, factoryObj.history.undo_list);
          factoryObj.image.drawTool();
          factoryObj.image.ctx.closePath();
          factoryObj.image.ctx.stroke();

          factoryObj.image.drawing = false;
          factoryObj.history.setRawData();
          factoryObj.history.saveState(factoryObj.image.canvas);
        };

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
        arrow: { h: 5, w: 10 },
        headlen: 10
      },
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
      },
      start: function start(evt) {
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
      stroke: function stroke(evt) {
        if (this.drawing) {
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);

          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;

          this.options.endX = x;
          this.options.endY = y;

          this.drawTool();
        }
      },
      stop: function stop(evt) {
        if (this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
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
      drawTool: function drawTool() {
        this.ctx.beginPath();

        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        var angle = Math.atan2(this.options.endY - this.options.startY, this.options.endX - this.options.startX);
        this.ctx.moveTo(this.options.startX, this.options.startY);
        this.ctx.lineTo(this.options.endX, this.options.endY);
        this.ctx.lineTo(this.options.endX - this.options.headlen * Math.cos(angle - Math.PI / 6), this.options.endY - this.options.headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(this.options.endX, this.options.endY);
        this.ctx.lineTo(this.options.endX - this.options.headlen * Math.cos(angle + Math.PI / 6), this.options.endY - this.options.headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
      }
    };

    factoryObj.line = {
      name: 'line',
      options: {
        stroke_color: ['00', '00', '00'],
        dim: 4
      },
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
      },
      start: function start(evt) {
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
      stroke: function stroke(evt) {
        if (this.drawing) {
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);

          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;

          this.options.endX = x;
          this.options.endY = y;

          this.drawTool();
        }
      },
      stop: function stop(evt) {
        if (this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
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
      drawTool: function drawTool() {
        this.ctx.beginPath();

        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        this.ctx.moveTo(this.options.startX, this.options.startY);
        this.ctx.lineTo(this.options.endX, this.options.endY);
        this.ctx.stroke();
      },
      redrawTool: function redrawTool() {
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
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
      },
      start: function start(evt) {
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
      stroke: function stroke(evt) {
        if (this.drawing) {
          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;
          this.options.endX = x;
          this.options.endY = y;
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);
        }
      },
      stop: function stop(evt) {
        if (this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
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
      drawTool: function drawTool() {
        if (this.drawing) {
          factoryObj.history.setStyleElement(this.canvas, this.ctx);

          var h = parseInt(this.options.endX - this.options.startX);
          var k = parseInt(this.options.endY - this.options.startY);
          var r = h + k;
          var step = 2 * Math.PI / r;

          this.options.radius = r;
          this.ctx.beginPath();

          for (var theta = 0; theta < 2 * Math.PI; theta += step) {
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
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.drawing = false;
      },
      start: function start(evt) {
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
      stroke: function stroke(evt) {
        if (this.drawing) {
          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;
          this.options.endX = x;
          this.options.endY = y;
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);
        }
      },
      stop: function stop(evt) {
        if (this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
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
      drawTool: function drawTool() {
        if (this.drawing) {
          factoryObj.history.setStyleElement(this.canvas, this.ctx);

          this.ctx.beginPath();
          for (m = 0 * Math.PI; m < 2 * Math.PI; m += 0.01) {
            xPos = Math.floor(this.options.startX - parseInt(this.options.endX - this.options.startX) * Math.cos(m));
            yPos = Math.floor(this.options.startY + parseInt(this.options.endY - this.options.startY) * Math.sin(m));

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
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.fillStyle;
        this.drawing = false;
      },
      start: function start(evt) {
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
      stroke: function stroke(evt) {
        if (this.drawing) {
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
      stop: function stop(evt) {
        if (this.drawing) {
          this.drawing = false;
          factoryObj.history.saveState(this.canvas);
        }
      },
      drawTool: function drawTool() {},
      redrawTool: function redrawTool() {
        this.ctx.beginPath();

        for (var l = 0; l < this.options.pencilData.length; l++) {

          if (l == 0) {
            this.ctx.moveTo(this.options.pencilData[l].x + this.options.diffX, this.options.pencilData[l].y + this.options.diffY);
          } else {
            this.ctx.lineTo(this.options.pencilData[l].x + this.options.diffX, this.options.pencilData[l].y + this.options.diffY);
          }
        }
        this.ctx.stroke();
      }
    };

    factoryObj.move = {
      name: 'move',
      options: {
        arrTool: ['square', 'circle', 'text', 'image', 'line', 'arrow', 'ellipse'],
        prevTool: '',
        movedObject: -1,
        cursorStyle: 'move',
        isResize: false,
        arrResize: { startX: false, startY: false, endX: false, endY: false },
        resizeMargin: 10
      },
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.canvas_coords = this.canvas.getBoundingClientRect();
        this.ctx = ctx;
        this.drawing = false;
      },
      start: function start(evt) {
        var x = evt.pageX - this.canvas_coords.left;
        var y = evt.pageY - this.canvas_coords.top;
        this.options.startX = x;
        this.options.startY = y;

        this.options.startDiffX = evt.pageX;
        this.options.startDiffY = evt.pageY;
        this.options.cursorStyle = 'move';

        this.hitTest();

        if (this.options.movedObject >= 0) {
          this.options.prevTool = factoryObj.event.options.activeTool;
          factoryObj.event.options.activeTool = factoryObj.move;
        } else {
          return true;
        }
        factoryObj.options.toolsObj.canvas.style.cursor = this.options.cursorStyle;
        this.drawing = true;
      },
      stroke: function stroke(evt) {
        if (this.drawing) {
          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;

          this.options.endX = x;
          this.options.endY = y;

          this.options.endDiffX = evt.pageX;
          this.options.endDiffY = evt.pageY;

          this.options.diffX = this.options.endDiffX - this.options.startDiffX;
          this.options.diffY = this.options.endDiffY - this.options.startDiffY;

          factoryObj.history.redrawState(this.canvas, this.ctx);
        }
      },
      stop: function stop(evt) {
        if (this.drawing) {

          this.drawing = false;

          if (this.options.movedObject >= 0 && (this.options.startX - this.options.endX !== 0 || this.options.startY - this.options.endY !== 0) && this.options.endX != undefined) {
            factoryObj.history.tmp_raw_undo_list = angular.copy(factoryObj.history.raw_undo_list[factoryObj.history.options.activePage]);

            if (this.options.arrTool.indexOf(factoryObj.history.options.arrData.name) > -1) {
              if (this.options.isResize === false) {
                factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startX[0] = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startX[0] + this.options.diffX;
                factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startY[0] = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startY[0] + this.options.diffY;
                factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endX[0] = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endX[0] + this.options.diffX;
                factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endY[0] = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endY[0] + this.options.diffY;
              } else {
                if (this.options.arrResize.startX === true) {
                  factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startX[0] = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startX[0] + this.options.diffX;
                }

                if (this.options.arrResize.startY === true) {
                  factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startY[0] = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startY[0] + this.options.diffY;
                }

                if (this.options.arrResize.endX === true) {
                  factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endX[0] = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endX[0] + this.options.diffX;
                }

                if (this.options.arrResize.endY === true) {
                  factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endY[0] = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endY[0] + this.options.diffY;
                }
              }

              if (factoryObj.history.options.arrData.name == 'text') {
                for (var k = 0; k < factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].finalTextInfo.length; k++) {
                  factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].finalTextInfo[k].x = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].finalTextInfo[k].x + this.options.diffX;
                  factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].finalTextInfo[k].y = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].finalTextInfo[k].y + this.options.diffY;
                }

                factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].textInfo.x += this.options.diffX;
                factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].textInfo.y += this.options.diffY;
              }
            } else {
              for (var k = 0; k < factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].pencilData.length; k++) {
                factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].pencilData[k].x = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].pencilData[k].x + this.options.diffX;
                factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].pencilData[k].y = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].pencilData[k].y + this.options.diffY;
              }
            }
          }

          factoryObj.options.optionArrData = factoryObj.history.options.arrData = {
            startX: [],
            startY: [],
            endX: [],
            endY: [],
            pencilData: []
          };
          factoryObj.history.saveState(this.canvas);
          this.options.movedObject = -1;
          this.options.cursorStyle = 'default';
          factoryObj.options.toolsObj.canvas.style.cursor = this.options.cursorStyle;

          this.options.arrResize = { startX: false, startY: false, endX: false, endY: false };
          this.options.isResize = false;

          if (this.options.prevTool != '') {
            factoryObj.event.options.activeTool = this.options.prevTool;
            this.options.prevTool = '';
          }
        }
      },
      drawTool: function drawTool() {
        this.ctx.beginPath();
        if (this.drawing) {
          var reDrawTool = factoryObj.history.options.arrData.name;
          if (reDrawTool === 'square') {
            factoryObj.square.init(this.canvas, this.ctx);
            factoryObj.square.options.startX = factoryObj.history.options.arrData.startX[0] + this.options.diffX;
            factoryObj.square.options.startY = factoryObj.history.options.arrData.startY[0] + this.options.diffY;
            factoryObj.square.options.endX = factoryObj.history.options.arrData.endX[0] + this.options.diffX;
            factoryObj.square.options.endY = factoryObj.history.options.arrData.endY[0] + this.options.diffY;
            factoryObj.square.drawTool();
          }
        }
        this.ctx.stroke();
      },
      redrawTool: function redrawTool() {
        console.log(factoryObj.history.raw_undo_list[factoryObj.history.options.activePage]);
        var tmpData = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage];
        var cntStart = tmpData.length - 1;

        if (cntStart >= 0) {
          for (i = 0; i <= cntStart; i++) {
            this.ctx.beginPath();

            factoryObj.history.options.font_size = tmpData[i].font_size;
            factoryObj.history.options.fillStyle = tmpData[i].fillStyle;
            factoryObj.history.options.lineWidth = tmpData[i].lineWidth;
            factoryObj.history.setStyleElement(this.canvas, this.ctx);
            if (this.options.arrTool.indexOf(tmpData[i].name) > -1) {
              if (tmpData[i].name === 'square') {
                this.options.currentDrawTool = factoryObj.square;
              }

              if (tmpData[i].name === 'circle') {
                this.options.currentDrawTool = factoryObj.circle;
              }

              if (tmpData[i].name === 'image') {
                this.options.currentDrawTool = factoryObj.image;
                this.options.currentDrawTool.options.img = tmpData[i].imageURL;
                var img = new Image();

                img.onload = function (obj) {};

                img.src = this.options.currentDrawTool.options.img;
                this.options.currentDrawTool.options.img = img;
              }

              if (tmpData[i].name === 'line') {
                this.options.currentDrawTool = factoryObj.line;
              }

              if (tmpData[i].name === 'arrow') {
                this.options.currentDrawTool = factoryObj.arrow;
              }

              if (tmpData[i].name === 'ellipse') {
                this.options.currentDrawTool = factoryObj.ellipse;
              }

              if (tmpData[i].name === 'text') {
                this.options.currentDrawTool = factoryObj.text;
              }

              this.options.currentDrawTool.drawing = true;

              if (this.options.movedObject == i && this.options.isResize === true) {
                if (this.options.arrResize.startX === true) {
                  this.options.currentDrawTool.options.startX = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startX[0] + this.options.diffX;
                } else {
                  this.options.currentDrawTool.options.startX = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startX[0];
                }

                if (this.options.arrResize.startY === true) {
                  this.options.currentDrawTool.options.startY = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startY[0] + this.options.diffY;
                } else {
                  this.options.currentDrawTool.options.startY = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startY[0];
                }

                if (this.options.arrResize.endX === true) {
                  this.options.currentDrawTool.options.endX = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endX[0] + this.options.diffX;
                } else {
                  this.options.currentDrawTool.options.endX = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endX[0];
                }

                if (this.options.arrResize.endY === true) {
                  this.options.currentDrawTool.options.endY = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endY[0] + this.options.diffY;
                } else {
                  this.options.currentDrawTool.options.endY = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endY[0];
                }
              } else if (this.options.movedObject == i) {
                this.options.currentDrawTool.options.startX = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startX[0] + this.options.diffX;
                this.options.currentDrawTool.options.startY = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].startY[0] + this.options.diffY;
                this.options.currentDrawTool.options.endX = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endX[0] + this.options.diffX;
                this.options.currentDrawTool.options.endY = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage][this.options.movedObject].endY[0] + this.options.diffY;
              } else {
                this.options.currentDrawTool.options.startX = tmpData[i].startX[0];
                this.options.currentDrawTool.options.startY = tmpData[i].startY[0];
                this.options.currentDrawTool.options.endX = tmpData[i].endX[0];
                this.options.currentDrawTool.options.endY = tmpData[i].endY[0];
              }

              if (tmpData[i].name === 'text') {
                var tmpDiffX = 0;
                var tmpDiffY = 0;
                if (this.options.movedObject === i) {
                  tmpDiffX = this.options.diffX;
                  tmpDiffY = this.options.diffY;
                }

                this.options.currentDrawTool.redrawTool(tmpData[i].finalTextInfo, tmpDiffX, tmpDiffY);
              } else {
                this.options.currentDrawTool.drawTool();
              }
              this.options.currentDrawTool.drawing = false;
            } else {
              if (tmpData[i].name === 'pencil') {
                this.options.currentDrawTool = factoryObj.pencil;
                this.options.currentDrawTool.options.pencilData = tmpData[i].pencilData;
                if (this.options.movedObject == i) {
                  this.options.currentDrawTool.options.diffX = this.options.endX - this.options.startX;
                  this.options.currentDrawTool.options.diffY = this.options.endY - this.options.startY;
                } else {
                  this.options.currentDrawTool.options.diffX = 0;
                  this.options.currentDrawTool.options.diffY = 0;
                }
              }

              if (this.options.currentDrawTool) {
                this.options.currentDrawTool.drawing = true;
                if (tmpData[i].name === 'pencil') {
                  this.options.currentDrawTool.redrawTool();
                } else {
                  this.options.currentDrawTool.drawTool();
                }
                this.options.currentDrawTool.drawing = false;
              }
            }
            this.ctx.stroke();
          }

          var canvasData = this.canvas.toDataURL();

          if (!factoryObj.event.options.isSave) {
            factoryObj.history.undo_list[factoryObj.history.options.activePage][0] = canvasData;
          } else {
            factoryObj.history.final_canvas_url[factoryObj.history.options.activePage] = canvasData;
          }
          factoryObj.history.resetStyleElement();
        }
      },
      resizeCheck: function resizeCheck(startX, startY, endX, endY) {
        if (this.options.startX >= startX && this.options.startX <= startX + this.options.resizeMargin && this.options.startY >= startY && this.options.startY <= startY + this.options.resizeMargin) {
          this.options.arrResize.startX = true;
          this.options.arrResize.startY = true;
          this.options.arrResize.endX = false;
          this.options.arrResize.endY = false;
          this.options.cursorStyle = 'nwse-resize';
          this.options.isResize = true;
        } else if (this.options.startX <= endX && this.options.startX >= endX - this.options.resizeMargin && this.options.startY <= endY && this.options.startY >= endY - this.options.resizeMargin) {
          this.options.arrResize.startX = false;
          this.options.arrResize.startY = false;
          this.options.arrResize.endX = true;
          this.options.arrResize.endY = true;
          this.options.cursorStyle = 'nwse-resize';
          this.options.isResize = true;
        } else if (this.options.startX >= startX && this.options.startX <= startX + this.options.resizeMargin && this.options.startY <= endY && this.options.startY >= endY - this.options.resizeMargin) {
          this.options.arrResize.startX = true;
          this.options.arrResize.startY = false;
          this.options.arrResize.endX = false;
          this.options.arrResize.endY = true;
          this.options.cursorStyle = 'nesw-resize';
          this.options.isResize = true;
        } else if (this.options.startX <= endX && this.options.startX >= endX - this.options.resizeMargin && this.options.startY >= startY && this.options.startY <= startY + this.options.resizeMargin) {
          this.options.arrResize.startX = false;
          this.options.arrResize.startY = true;
          this.options.arrResize.endX = true;
          this.options.arrResize.endY = false;
          this.options.cursorStyle = 'nesw-resize';
          this.options.isResize = true;
        } else if (this.options.startX >= startX && this.options.startX <= startX + this.options.resizeMargin) {
          this.options.arrResize.startX = true;
          this.options.arrResize.startY = false;
          this.options.arrResize.endX = false;
          this.options.arrResize.endY = false;
          this.options.cursorStyle = 'ew-resize';
          this.options.isResize = true;
        } else if (this.options.startX <= endX && this.options.startX >= endX - this.options.resizeMargin) {
          this.options.arrResize.startX = false;
          this.options.arrResize.startY = false;
          this.options.arrResize.endX = true;
          this.options.arrResize.endY = false;
          this.options.cursorStyle = 'ew-resize';
          this.options.isResize = true;
        } else if (this.options.startY >= startY && this.options.startY <= startY + this.options.resizeMargin) {
          this.options.arrResize.startX = false;
          this.options.arrResize.startY = true;
          this.options.arrResize.endX = false;
          this.options.arrResize.endY = false;
          this.options.cursorStyle = 'ns-resize';
          this.options.isResize = true;
        } else if (this.options.startY <= endY && this.options.startY >= endY - this.options.resizeMargin) {
          this.options.arrResize.startX = false;
          this.options.arrResize.startY = false;
          this.options.arrResize.endX = false;
          this.options.arrResize.endY = true;
          this.options.cursorStyle = 'ns-resize';
          this.options.isResize = true;
        }
      },
      hitTest: function hitTest() {
        var tmpData = factoryObj.history.raw_undo_list[factoryObj.history.options.activePage];
        var cntStart = tmpData.length - 1;
        this.options.movedObject = -1;

        for (i = cntStart; i >= 0; i--) {
          if (this.options.movedObject > -1) {
            break;
          }
          factoryObj.history.options.arrData = tmpData[i];

          if (factoryObj.history.options.arrData.name === 'square') {
            if (this.options.startX >= factoryObj.history.options.arrData.startX[0] && this.options.startX <= factoryObj.history.options.arrData.endX[0] && this.options.startY >= factoryObj.history.options.arrData.startY[0] && this.options.startY <= factoryObj.history.options.arrData.endY[0]) {
              this.options.movedObject = i;
              break;
            }
          }

          if (factoryObj.history.options.arrData.name === 'image') {
            if (this.options.startX >= factoryObj.history.options.arrData.startX[0] && this.options.startX <= factoryObj.history.options.arrData.endX[0] && this.options.startY >= factoryObj.history.options.arrData.startY[0] && this.options.startY <= factoryObj.history.options.arrData.endY[0]) {
              this.options.movedObject = i;
              this.resizeCheck(factoryObj.history.options.arrData.startX[0], factoryObj.history.options.arrData.startY[0], factoryObj.history.options.arrData.endX[0], factoryObj.history.options.arrData.endY[0]);
              break;
            }
          }

          if (factoryObj.history.options.arrData.name === 'text') {
            console.log(factoryObj.history.options.arrData, this.options);
            if (this.options.startX >= factoryObj.history.options.arrData.startX[0] && this.options.startX <= factoryObj.history.options.arrData.endX[0] && this.options.startY >= factoryObj.history.options.arrData.startY[0] && this.options.startY <= factoryObj.history.options.arrData.endY[0]) {
              this.options.movedObject = i;
              break;
            }
          }

          if (factoryObj.history.options.arrData.name === 'pencil') {
            if (factoryObj.history.options.arrData.pencilData.length > 0) {
              for (j = 0; j < factoryObj.history.options.arrData.pencilData.length; j++) {
                if (parseInt(factoryObj.history.options.arrData.pencilData[j].x - 4) <= this.options.startX && parseInt(factoryObj.history.options.arrData.pencilData[j].x + 4) >= this.options.startX && parseInt(factoryObj.history.options.arrData.pencilData[j].y - 4) <= this.options.startY && parseInt(factoryObj.history.options.arrData.pencilData[j].y + 4) >= this.options.startY) {
                  this.options.movedObject = i;
                  break;
                }
              }
            }
          }

          if (factoryObj.history.options.arrData.name === 'circle') {
            var r = tmpData[i].radius;

            var x = tmpData[i].startX[0] - this.options.startX;
            var y = tmpData[i].startY[0] - this.options.startY;

            if (parseInt(x * x + y * y) < parseInt(r * r)) {
              this.options.movedObject = i;
              break;
            }
          }

          if (factoryObj.history.options.arrData.name === 'ellipse') {
            var max = 0;
            var min = 100000000;
            var tmpXPos = 0;
            this.options.startX = Math.floor(this.options.startX);
            for (var j = 0 * Math.PI; j < 2 * Math.PI; j += 0.01) {
              xPos = Math.floor(factoryObj.history.options.arrData.startX[0] - parseInt(factoryObj.history.options.arrData.endX[0] - factoryObj.history.options.arrData.startX[0]) * Math.cos(j));
              yPos = Math.floor(factoryObj.history.options.arrData.startY[0] + parseInt(factoryObj.history.options.arrData.endY[0] - factoryObj.history.options.arrData.startY[0]) * Math.sin(j));

              if (this.options.startX >= xPos - 5 && this.options.startX <= xPos + 5) {

                if (this.options.startX == xPos) {
                  tmpXPos = xPos;
                }
                if (min > yPos) {
                  min = yPos;
                }

                if (max < yPos) {
                  max = yPos;
                }
              }
            }

            if (this.options.startX == tmpXPos && this.options.startY > min && this.options.startY < max) {
              this.options.movedObject = i;
              break;
            }
          }

          if (factoryObj.history.options.arrData.name === 'line') {
            if (factoryObj.history.options.arrData.endX[0] < factoryObj.history.options.arrData.startX[0]) {
              var minX = factoryObj.history.options.arrData.endX[0];
              var maxX = factoryObj.history.options.arrData.startX[0];
            } else {
              var minX = factoryObj.history.options.arrData.startX[0];
              var maxX = factoryObj.history.options.arrData.endX[0];
            }

            if (factoryObj.history.options.arrData.endY[0] < factoryObj.history.options.arrData.startY[0]) {
              var minY = factoryObj.history.options.arrData.endY[0];
              var maxY = factoryObj.history.options.arrData.startY[0];
            } else {
              var minY = factoryObj.history.options.arrData.startY[0];
              var maxY = factoryObj.history.options.arrData.endY[0];
            }

            if (this.options.startX >= minX && this.options.startX <= maxX && this.options.startY >= minY && this.options.startY <= maxY) {
              var newangle = Math.atan2(this.options.startY - factoryObj.history.options.arrData.startY[0], this.options.startX - factoryObj.history.options.arrData.startX[0]);

              var angleDiff = Math.abs(newangle) - Math.abs(factoryObj.history.options.arrData.lineAngle);
              if (Math.abs(angleDiff) < 0.2) {
                this.options.movedObject = i;
                break;
              }
            }
          }

          if (factoryObj.history.options.arrData.name === 'arrow') {
            if (factoryObj.history.options.arrData.endX[0] < factoryObj.history.options.arrData.startX[0]) {
              var minX = factoryObj.history.options.arrData.endX[0];
              var maxX = factoryObj.history.options.arrData.startX[0];
            } else {
              var minX = factoryObj.history.options.arrData.startX[0];
              var maxX = factoryObj.history.options.arrData.endX[0];
            }

            if (factoryObj.history.options.arrData.endY[0] < factoryObj.history.options.arrData.startY[0]) {
              var minY = factoryObj.history.options.arrData.endY[0];
              var maxY = factoryObj.history.options.arrData.startY[0];
            } else {
              var minY = factoryObj.history.options.arrData.startY[0];
              var maxY = factoryObj.history.options.arrData.endY[0];
            }

            if (this.options.startX >= minX && this.options.startX <= maxX && this.options.startY >= minY && this.options.startY <= maxY) {
              var newangle = Math.atan2(this.options.startY - factoryObj.history.options.arrData.startY[0], this.options.startX - factoryObj.history.options.arrData.startX[0]);

              var angleDiff = Math.abs(newangle) - Math.abs(factoryObj.history.options.arrData.arrowAngle);

              if (Math.abs(angleDiff) < 0.2) {
                this.options.movedObject = i;
                break;
              }
            }
          }
        }
      }
    };

    factoryObj.square = {
      name: 'square',
      options: {
        stroke_color: ['00', '00', '00'],
        dim: 4
      },
      init: function init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.drawing = false;
      },
      start: function start(evt) {
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
      stroke: function stroke(evt) {
        if (this.drawing) {
          factoryObj.history.drawingState(this.canvas, this.ctx, factoryObj.history.undo_list);
          this.ctx.beginPath();

          var x = evt.pageX - this.canvas_coords.left;
          var y = evt.pageY - this.canvas_coords.top;

          this.options.endX = x;
          this.options.endY = y;

          this.drawTool();
        }
      },
      stop: function stop(evt) {
        if (this.drawing && this.options.startX !== this.options.endX && this.options.startY !== this.options.endY) {
          this.ctx.beginPath();

          this.options.width = this.options.endX - this.options.startX;
          this.options.height = this.options.endY - this.options.startY;
          this.drawTool();
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
      drawLine: function drawLine(startPt, endPt) {
        factoryObj.history.setStyleElement(this.canvas, this.ctx);

        this.ctx.moveTo(startPt.x, startPt.y);
        this.ctx.lineTo(endPt.x, endPt.y);
        this.ctx.stroke();
      },
      drawTool: function drawTool() {
        lineP1 = { x: this.options.startX, y: this.options.startY, r: 0 };
        lineP2 = { x: this.options.startX, y: this.options.endY, r: 0 };
        lineP3 = { x: this.options.endX, y: this.options.endY, r: 0 };
        lineP4 = { x: this.options.endX, y: this.options.startY, r: 0 };
        this.drawLine(lineP1, lineP2);
        this.drawLine(lineP2, lineP3);
        this.drawLine(lineP3, lineP4);
        this.drawLine(lineP4, lineP1);
      }
    };

    factoryObj.renderPage = function (page) {
      console.log('start: renderPage');
      var viewport = page.getViewport(factoryObj.options.pdfOptions.scale);
      var canvas_rand = document.createElement('canvas');

      var ctx_rand = canvas_rand.getContext('2d');
      var renderContext = {
        canvasContext: ctx_rand,
        viewport: viewport
      };

      canvas_rand.setAttribute('id', 'page' + page.pageIndex);
      canvas_rand.height = viewport.height;
      canvas_rand.width = viewport.width;

      factoryObj.history.options.canvas_width = canvas_rand.width;
      factoryObj.history.options.canvas_height = canvas_rand.height;
      factoryObj.options.toolsObj.canvasContainer.appendChild(canvas_rand);

      var task = page.render(renderContext);
      task.promise.then(function () {
        factoryObj.options.bindCnt++;
        if (factoryObj.options.bindFlag === '' && page.transport.numPages == factoryObj.options.bindCnt) {
          factoryObj.history.options.pdfobj = page;
          console.log('before bindEvent');
          factoryObj.bindEvent(0);
          factoryObj.options.bindFlag = 1;
        }
      });
    };

    factoryObj.bindEvent = function (page) {
      console.log('start: bindEvent');
      if (factoryObj.options.bindFlag == '') {
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
        factoryObj.options.canvas.width = factoryObj.history.options.canvas_width;

        var img = document.createElement("img");
        img.src = factoryObj.options.imgURL;
        img.onload = function () {

          factoryObj.options.canvas_coords = factoryObj.options.canvas.getBoundingClientRect();
          factoryObj.history.options.canvas_coords = factoryObj.options.canvas_coords;
          factoryObj.options.ctx.clearRect(0, 0, factoryObj.options.canvas.width, factoryObj.options.canvas.height);
          factoryObj.options.ctx.drawImage(img, 0, 0, factoryObj.options.canvas.width, factoryObj.options.canvas.height);

          factoryObj.options.toolsObj.loading.textContent = '';

          factoryObj.history.saveState(factoryObj.options.canvas);
          console.log('start binding events for each element: ', factoryObj.options);
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
            });

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
        };
      }
    };

    factoryObj.renderPages = function (pdfDoc) {
      console.log('start: renderPages');
      factoryObj.history.options.numPages = pdfDoc.numPages;
      for (var num = 1; num <= pdfDoc.numPages; num++) {
        pdfDoc.getPage(num).then(factoryObj.renderPage);
      }
    };

    factoryObj.renderPDF = function (url, canvasContainer, options) {
      console.log('start: renderPDF');
      this.options.pdfOptions = options || { scale: 2 };
      factoryObj.options.toolsObj.loading.textContent = 'Wait while loading PDF file...';

      PDFJS.disableWorker = false;
      PDFJS.workerSrc = factoryObj.options.pdfWorker;
      console.log('start: before renderPages called');
      PDFJS.getDocument(url).then(factoryObj.renderPages);
    };

    return factoryObj;
  });

  module.directive('pdfAnnotation', ['pdfAnnotationFactory', function (pdfAnnotationFactory) {
    return {
      restrict: 'E',
      scope: {
        options: '=',
        callbackFn: '&',
        closeFn: '&'
      },
      transclude: true,
      template: '<div id="controllers"><a href="#" id="close" ng-show="options.enableCloseBtn" class="close">&nbsp;</a><span class="controller btn btn-icn" id="pencil" title="Freehand Drawing"></span><span class="controller btn btn-icn" id="square" title="Square"></span><span class="controller btn btn-icn hide" id="circle" title="Circle"></span><span class="controller btn btn-icn" id="ellipse" title="Ellipse"></span><span class="controller btn btn-icn" id="text" title="Text"></span><span class="controller btn btn-icn" id="arrow" title="Arrow"></span><span class="controller btn btn-icn" id="line" title="Line"></span><span class="controller btn btn-icn" id="undo" title="Undo"></span><span class="controller btn btn-icn" id="redo" title="Redo"></span><span class="controller title" id="activePage" disabled="disabled"></span>&nbsp; out of&nbsp;<span class="controller title" id="totalPage" disabled="disabled"></span><span class="controller btn" id="prevBtn"><</span> &nbsp;<input type="text" class="pagenumber" name="currentPage" id="currentPage" />&nbsp;<span class="controller btn" id="nextBtn">></span><span class="controller btn btn-icn" id="save" title="Save"></span><br /><br /><form id="frm_canvas_tool"><input name="imageupload" id="imageupload" class="input_file" type="file" accept="image/*" ><span class="controller btn" id="clear_image">Clear Image</span></form>    Font Size:<select id="fontsize" name="fontsize"><option value="">Select Font Size</option><option value="2">2px</option><option value="5">5px</option><option value="7">7px</option><option value="8">8px</option><option value="9">9px</option><option value="10">10px</option><option value="11">11px</option><option value="12">12px</option><option value="13">13px</option><option value="14">14px</option><option value="16">16px</option><option value="18">18px</option><option value="32">32px</option></select>    Color:<select id="fillstyle" name="fillstyle"><option>Select Color</option><option value="FF0000">Red</option><option value="00FF00">Green</option><option value="0000FF">Blue</option><option value="000000">Black</option><option value="FFFFFF">White</option></select>    Line Width:<select id="linewidth" name="linewidth"><option value="">Select Font Size</option><option value="2">2px</option><option value="5">5px</option><option value="7">7px</option><option value="8">8px</option></select><span class="controller" id="loading"></span></div><div id="canvas-container" class="canvas-container" style="visibility: hidden; height: 0px;"></div><div id="canvas-cont" class="canvas-container"><canvas id="canvas"></canvas><div id="editor_wrapper" style="display:none;"><textarea id="contenteditor"  onkeyup="textAreaAdjust(this)" style="overflow:hidden"></textarea></div></div><div ng-if="errorURL"><h1>URL not found!</h1></div>',
      link: function link(scope, element, attrs, ctrl) {
        console.log('Scope:', scope);
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

        scope.$watch('options', function (newValue, oldValue) {
          if (scope.options.url !== '') {
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
            pdfAnnotationFactory.text.options.finalTextInfo = [];
            pdfAnnotationFactory.options.bindFlag = '';
            pdfAnnotationFactory.options.btnFlag = false;
            pdfAnnotationFactory.options.bindCnt = 0;

            if (scope.options.pdfworker) {
              pdfAnnotationFactory.options.pdfWorker = scope.options.pdfworker;
            }
            scope.errorURL = false;

            pdfAnnotationFactory.renderPDF(scope.options.url, pdfAnnotationFactory.options.toolsObj.canvasContainer);
          } else {
            scope.errorURL = true;
          }
        });
      }
    };
  }]);
});
$(window).scroll(function () {
  var a = 90;
  var pos = $(window).scrollTop();
  if (pos > a) {
    $("#controllers").css({
      position: 'fixed'
    });
  } else {
    $("#controllers").css({
      position: 'relative'
    });
  }
});

function textAreaAdjust(o) {
  o.style.height = "1px";
  o.style.height = 25 + o.scrollHeight + "px";
}