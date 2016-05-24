/*!
 *  PDF Annotation V1.0
 */

(function($) {
  var tool;
  var canvas, ctx;
  
  var history = {
    options: {
      canvas_width: '',
      canvas_height: '',
      activePage: 0,
      totalPage: 1,
      enablePrevBtn: false,
      enableNextBtn: false,
      font_size: 14,
      fillStyle: '#FF0000',
      lineWidth: 2
    },
    initial_canvas_url: [],
    final_canvas_url: [],
    redo_list: [],
    undo_list: [],
    setStyleElement: function(canvas, ctx) {
      ctx.fillStyle = this.options.fillStyle; //rgba(0,0,0,0)'; // or 'transparent'
      ctx.font = this.options.font_size+'px Calibri';
      ctx.lineWidth = this.options.lineWidth;
      ctx.strokeStyle = this.options.fillStyle;
    },
    saveState: function(canvas, list, keep_redo) {
      keep_redo = keep_redo || false;
      if(!keep_redo) {
        this.redo_list = [];
      }
      
      if(!this.undo_list.hasOwnProperty(this.options.activePage)) {
        this.undo_list[this.options.activePage] = [];
      }
      
      var canvasData = canvas.toDataURL();
      if(list) {
        if(!list.hasOwnProperty(this.options.activePage)) {
          list[this.options.activePage] = [];    
        }
        list[this.options.activePage].push(canvasData);
      } else {
        this.undo_list[this.options.activePage].push(canvasData);    
      }
      
      history.final_canvas_url[history.options.PrevPage] = canvasData;
      //(list[this.options.activePage] || this.undo_list[this.options.activePage]).push(canvas.toDataURL());
    },
    undo: function(canvas, ctx) {
      this.options.action = 'undo';
      this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
    },
    redo: function(canvas, ctx) {
      this.options.action = 'redo';
      this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
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
        
        var img = new Element('img', {'src':imgSrc});
        img.onload = function() {
          ctx.clearRect(0, 0, history.options.canvas_width, history.options.canvas_height);
          ctx.drawImage(img, 0, 0, history.options.canvas_width, history.options.canvas_height);  
        }
      }
    },
    drawingState: function(canvas, ctx,  pop) {
      if(pop[this.options.activePage].length) {//console.log('inside drawing pop', pop);
        var restore_state = pop[this.options.activePage][pop[this.options.activePage].length-1];
        var img = new Element('img', {'src':restore_state});
        img.onload = function() {
          ctx.clearRect(0, 0, history.options.canvas_width, history.options.canvas_height);
          ctx.drawImage(img, 0, 0, history.options.canvas_width, history.options.canvas_height);
          event.options.activeTool.drawTool();
        }
      }
    }
  }
  
  var event = {
      options: {
          activeTool: pencil
      },
      init: function(canvas, ctx) {
        this.canvas = canvas;
        this.canvas_coords = this.canvas.getCoordinates();
        this.ctx = ctx;
        this.ctx.strokeColor = this.options.stroke_color;
        this.paging();
        this.addCanvasEvents();    
      },
      addCanvasEvents: function() {//console.log('In event');
        this.canvas.addEvent('mousedown', this.start.bind(this));
        this.canvas.addEvent('mousemove', this.stroke.bind(this));
        this.canvas.addEvent('mouseup', this.stop.bind(this));
        this.canvas.addEvent('mouseout', this.stop.bind(this));
      },
      start: function(evt) {//console.log('In event start', evt);
        if(this.options.activeTool !== undefined) {
          this.options.activeTool.start(evt);
        }
      },
      stroke: function(evt) {//console.log('In event stroke', evt);
        if(this.options.activeTool !== undefined) {
          this.options.activeTool.stroke(evt);
        }
      },
      stop: function(evt) {//console.log('In event stop', evt);
        if(this.options.activeTool !== undefined) {
          this.options.activeTool.stop(evt);
        }
      },
      savepdf: function() {
          console.log(history.options.pdfobj);
        var m = confirm("Are you sure to Save ");   
        if (m) {   
          // generate the image data   
          //var imgData = document.getElementById("canvas").toDataURL("image/png");   
          //imgData = imgData.replace('data:image/png;base64,', '');  
              
          var doc = new jsPDF('p', 'mm', 'a4');
          for(i = 0; i < parseInt(history.options.totalPage); i++) {
            if(i<2){    
            if(history.final_canvas_url.hasOwnProperty(i)) {//console.log('In if',i)
              var imgData = history.final_canvas_url[i];
            }
            else {//console.log('In else',i)
              var imgData = document.getElementById("page"+i).toDataURL("image/png");  
            }
            doc.addImage(imgData, 'PNG', 0, 0, 200, 250);
            if(i<parseInt(history.options.totalPage-1)){
            doc.addPage();
            }
            console.log(doc);
            }
          }
          doc.save('sample-file.pdf');              
        }  
      },
      paging: function() {
        history.options.totalPage = history.options.pdfobj.transport.numPages;
        document.getElementById('activePage').textContent = history.options.activePage + 1;
        document.getElementById('currentPage').value = history.options.activePage + 1;
        document.getElementById('totalPage').textContent = history.options.totalPage;
        if(history.options.activePage === 0) {
          //Disable Prev, Enable Next
          document.getElementById('prevBtn').setAttribute('disabled', 'disabled');
          document.getElementById('nextBtn').removeAttribute('disabled');
        }
        else if(parseInt(history.options.activePage) === parseInt(history.options.totalPage - 1)) {
          //Disable Next, Enable Prev
          document.getElementById('nextBtn').setAttribute('disabled', 'disabled');
          document.getElementById('prevBtn').removeAttribute('disabled');
        }
        else if(history.options.activePage > 0 && parseInt(history.options.activePage) < parseInt(history.options.totalPage - 1)) {
          //enable Next & Prev Btn  
          //console.log('In last condition for both enabled')
          document.getElementById('prevBtn').removeAttribute('disabled');
          document.getElementById('nextBtn').removeAttribute('disabled');
        }
      }
  }
  
  var textold = {
    options: {
      stroke_color: ['00', '00', '00'],
      fill_color: 'red',
      font: '21px Calibri',
      dim: 4
    },
    init: function(canvas, ctx) {//console.log('circle init')
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.ctx.fillStyle = 'rgba(0,0,0,0)'; // or 'transparent'
      this.drawing = false;
      this.options.flag = true;
    },
    start: function(evt) {//console.log('in circle start')
      var x = evt.page.x - this.canvas_coords.left;
      var y = evt.page.y - this.canvas_coords.top;
      
      this.options.startX = x;
      this.options.startY = y;
      this.ctx.fillStyle = this.options.fill_color; //rgba(0,0,0,0)'; // or 'transparent'
      this.ctx.font = this.options.font;  
                
      this.ctx.beginPath();
      //history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {//console.log('in circle stroke')
      if(this.drawing) {
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        this.options.endX = x;
        this.options.endY = y;
      }
    },
    stop: function(evt) {//console.log('in circle stop')
      if(this.drawing && this.options.flag) {
        this.options.flag = false;
        var freeText = prompt("Please enter text", "Sample Text");
        if (freeText != null) {
          history.setStyleElement(this.canvas, this.ctx);
      
          this.ctx.fillText(freeText, this.options.startX, this.options.startY);
          this.ctx.stroke();        //actually draw the accumulated lines
          history.saveState(this.canvas);
        }
        this.drawing = false;
      }
    },
    drawTool: function() {//console.log('Inside circle drawtool')
      
    }  
  };
  
  var text = {
    options: {
      stroke_color: ['00', '00', '00'],
      fill_color: 'red',
      font: '14px Calibri',
      dim: 4,
      lineHeight: 14
    },
    init: function(canvas, ctx) {//console.log('circle init')
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.ctx.fillStyle = 'rgba(0,0,0,0)'; // or 'transparent'
      this.drawing = false;
      this.options.flag = true;
    },
    start: function(evt) {//console.log('in circle start')
      if(!this.options.flag) return;
      var x = evt.page.x - this.canvas_coords.left;
      var y = evt.page.y - this.canvas_coords.top;
      
      this.options.startX = x;
      this.options.startY = y;
      this.ctx.fillStyle = this.options.fill_color; //rgba(0,0,0,0)'; // or 'transparent'
      this.ctx.font = this.options.font;  
                
      this.ctx.beginPath();
      //history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {//console.log('in circle stroke')
      if(!this.options.flag) return;
      if(this.drawing) {
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        this.options.endX = x;
        this.options.endY = y;
      }
    },
    stop: function(evt) {
      if(this.drawing && this.options.flag) {console.log('inside stop if drwing');
        this.drawing = false;
        this.options.flag = false;
        
        this.options.lineHeight = parseInt(history.options.font_size); 
        
        document.getElementById('editor_wrapper').style.display = 'block';
        document.getElementById('editor_wrapper').style.top = this.options.startY + this.canvas_coords.top - 10;
        document.getElementById('editor_wrapper').style.left = this.options.startX + this.canvas_coords.left;
        document.getElementById('editor_wrapper').style.width = this.options.endX - this.options.startX;
        
        document.getElementById('contenteditor').focus();
        document.getElementById('contenteditor').style.minHeight = parseInt(this.options.endY - this.options.startY);
        console.log(history.options.font_size); 
      }
    },
    drawTool: function() {console.log('Inside circle drawtool')
      history.setStyleElement(this.canvas, this.ctx);
      //history.drawingState(this.canvas, this.ctx, history.undo_list);
      
      document.getElementById('contenteditor').style.fontSize = history.options.font_size;
      document.getElementById('contenteditor').style.lineHeight = history.options.font_size+'px';
      document.getElementById('contenteditor').style.height = (document.getElementById('contenteditor').scrollHeight)+"px";
      
      var contenttext = document.getElementById('contenteditor').value;
      var enteredTextEncoded = escape(contenttext);
      contenttext = unescape(enteredTextEncoded.replace(/%0A/g, '<br />').replace(/%20/g, ' '));
      document.getElementById('contenteditor').value = '';
      if(contenttext !== '') {
        var textObj = {
          text:contenttext,
          x: this.options.startX,
          y: this.options.startY,
          boxWidth: this.options.endX - this.options.startX
        };
        
        this.drawStyledText(textObj);  
      }
       
    },
    drawStyledText: function (textInfo) {
        // Save the textInfo into separated vars to work more comfortably.
        var text = textInfo.text, x = textInfo.x, y = textInfo.y;
        // Needed vars for automatic line break;
        var splittedText, xAux, textLines = [], boxWidth = textInfo.boxWidth;
        // Declaration of needed vars.
        var proFont = [], properties, property, propertyName, propertyValue, atribute;
        var classDefinition, proColor, proText, proShadow;
        // Loop vars
        var i, j, k, n;

        // The main regex. Looks for <style>, <class> or <br /> tags.
        var match = text.match(/<\s*br\s*\/>|<\s*class=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/class\s*\>|<\s*style=["|']([^"|']+)["|']\s*\>([^>]+)<\s*\/style\s*\>|[^<]+/g);
        var innerMatch = null;

        // Let's draw something for each match found.
        for (i = 0; i < match.length; i++) {
            
            if (/<\s*br\s*\/>/i.test(match[i])) {
                // Check if current fragment is a line break.
                y += parseInt(this.options.lineHeight, 10) * 1.5;
                x = textInfo.x;
                continue;
            } else {
                // Text without special style.
                proText = match[i];
            }

            // Reset textLines;
            textLines = [];
            // Clear javascript code line breaks.
            proText = proText.replace(/\s*\n\s*/g, " ");

            // Automatic Line break
            if (boxWidth !== undefined) {

                // If returns true, it means we need a line break.
                if (this.checkLineBreak(proText, (boxWidth+textInfo.x), x)) {
                    // Split text by words.
                    splittedText = this.trim(proText).split(" ");

                    // If there's only one word we don't need to make more checks.
                    if (splittedText.length == 1) {
                        textLines.push({text: this.trim(proText) + " ", linebreak: true});
                    } else {
                        // Reset vars.
                        xAux = x;
                        var line = 0;
                        textLines[line] = {text: undefined, linebreak: false};

                        // Loop words.
                        for (k = 0; k < splittedText.length; k++) {
                            splittedText[k] += " ";
                            // Check if the current text fits into the current line.
                            if (!this.checkLineBreak(splittedText[k], (boxWidth+textInfo.x), xAux)) {
                                // Current text fit into the current line. So we save it
                                // to the current textLine.
                                if (textLines[line].text == undefined) {
                                    textLines[line].text = splittedText[k];
                                } else {
                                    textLines[line].text += splittedText[k];
                                }
                                
                                xAux += this.ctx.measureText(splittedText[k]).width;
                            } else {
                                // Current text doesn't fit into the current line.
                                // We are doing a line break, so we reset xAux
                                // to initial x value.
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

            // if textLines.length == 0 it means we doesn't need a linebreak.
            if (textLines.length == 0) {
                textLines.push({text: this.trim(proText) + " ", linebreak: false});
            }

            // Let's draw the text
            for (n = 0; n < textLines.length; n++) {
                // Start a new line.
                if (textLines[n].linebreak) {
                    y += parseInt(this.options.lineHeight, 10);
                    x = textInfo.x;
                    
                    this.options.endY = y
                }
                this.ctx.fillText(textLines[n].text, x, y);
                // Increment X position based on current text measure.
                x += this.ctx.measureText(textLines[n].text).width;
            }
            
            this.ctx.stroke();        //actually draw the accumulated lines
            history.saveState(this.canvas);

            //this.bufferContext.restore();
        }
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
  
  var image = {
    options: {
       activeImage: '',
       uploadedImage: [],
       width: '',
       height: '',
       wdthHghtRatio: '',
       img: ''
    },
    init: function(canvas, ctx) {//console.log('arrow init')
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.drawing = false;
    },
    start: function(evt) {//console.log('in arrow start')
      var x = evt.page.x - this.canvas_coords.left;
      var y = evt.page.y - this.canvas_coords.top;
      
      this.options.startX = x;
      this.options.startY = y;
      
      this.ctx.beginPath();
      //history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {//console.log('in arrow stroke')
      if(this.drawing) {
        history.drawingState(this.canvas, this.ctx, history.undo_list);
        
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        
        this.options.endX = x;
        this.options.endY = y;
        
        this.drawTool();
      }
    },
    stop: function(evt) {//console.log('in arrow stop')
      if(this.drawing) {
        this.ctx.beginPath();  
        this.drawTool();
        this.ctx.closePath();     //close the end to the start point
        this.ctx.stroke();        //actually draw the accumulated lines
        history.saveState(this.canvas);
        this.drawing = false;
      }
    },
    drawTool: function() {//console.log('Inside arrow drawtool')
      this.ctx.beginPath();
      
      history.setStyleElement(this.canvas, this.ctx);
      
      this.options.width = parseInt(this.options.endX - this.options.startX);
      this.options.height = parseInt(this.options.endY - this.options.startY);
      
      this.ctx.drawImage(this.options.img , this.options.startX, this.options.startY, this.options.width, this.options.height);             
    },
    uploadImage: function(frmData) {
      var img = new Image;
      
      img.onload = function(obj) {
          
      }
      
      img.src = URL.createObjectURL(frmData);
      this.options.uploadedImage.push(img.src);
      this.options.img = img;
    }
  };
  
  var arrow = {
    options: {
      stroke_color: ['00', '00', '00'],
      dim: 4,
      arrow: {h: 5, w: 10},
      headlen: 10 
    },
    init: function(canvas, ctx) {//console.log('arrow init')
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.ctx.fillStyle = 'rgba(0,0,0,0)'; // or 'transparent'
      this.drawing = false;
    },
    start: function(evt) {//console.log('in arrow start')
      var x = evt.page.x - this.canvas_coords.left;
      var y = evt.page.y - this.canvas_coords.top;
      
      this.options.startX = x;
      this.options.startY = y;
      
      this.ctx.beginPath();
      //history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {//console.log('in arrow stroke')
      if(this.drawing) {
        history.drawingState(this.canvas, this.ctx, history.undo_list);
        
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        
        this.options.endX = x;
        this.options.endY = y;
        
        this.drawTool();
      }
    },
    stop: function(evt) {//console.log('in arrow stop')
      if(this.drawing) {
        this.ctx.beginPath();  
        this.drawTool();
        this.ctx.closePath();     //close the end to the start point
        this.ctx.stroke();        //actually draw the accumulated lines
        history.saveState(this.canvas);
        this.drawing = false;
      }
    },
    drawTool: function() {//console.log('Inside arrow drawtool')
      this.ctx.beginPath();
      
      history.setStyleElement(this.canvas, this.ctx);
      
      var angle = Math.atan2(this.options.endY - this.options.startY, this.options.endX - this.options.startX);
      this.ctx.moveTo(this.options.startX, this.options.startY);
      this.ctx.lineTo(this.options.endX, this.options.endY);
      this.ctx.lineTo(this.options.endX - this.options.headlen*Math.cos(angle - Math.PI/6), this.options.endY - this.options.headlen*Math.sin(angle - Math.PI/6));
      this.ctx.moveTo(this.options.endX, this.options.endY);
      this.ctx.lineTo(this.options.endX - this.options.headlen*Math.cos(angle+Math.PI/6), this.options.endY - this.options.headlen*Math.sin(angle+Math.PI/6));
      this.ctx.stroke();              
    }
  };
  
  var line = {
    options: {
      stroke_color: ['00', '00', '00'],
      dim: 4 
    },
    init: function(canvas, ctx) {//console.log('arrow init')
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.ctx.fillStyle = 'rgba(0,0,0,0)'; // or 'transparent'
      this.drawing = false;
    },
    start: function(evt) {//console.log('in arrow start')
      var x = evt.page.x - this.canvas_coords.left;
      var y = evt.page.y - this.canvas_coords.top;
      
      this.options.startX = x;
      this.options.startY = y;
      
      this.ctx.beginPath();
      //history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {//console.log('in arrow stroke')
      if(this.drawing) {
        history.drawingState(this.canvas, this.ctx, history.undo_list);
        
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        
        this.options.endX = x;
        this.options.endY = y;
        
        this.drawTool();
      }
    },
    stop: function(evt) {//console.log('in arrow stop')
      if(this.drawing) {
        this.ctx.beginPath();  
        this.drawTool();
        this.ctx.closePath();     //close the end to the start point
        this.ctx.stroke();        //actually draw the accumulated lines
        history.saveState(this.canvas);
        this.drawing = false;
      }
    },
    drawTool: function() {//console.log('Inside arrow drawtool')
      this.ctx.beginPath();
      
      history.setStyleElement(this.canvas, this.ctx);
      
      var angle = Math.atan2(this.options.endY - this.options.startY, this.options.endX - this.options.startX);
      this.ctx.moveTo(this.options.startX, this.options.startY);
      this.ctx.lineTo(this.options.endX, this.options.endY);
      this.ctx.stroke();              
    }
  };
  
  var circle = {
    options: {
      stroke_color: ['00', '00', '00'],
      dim: 4
    },
    init: function(canvas, ctx) {//console.log('circle init')
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.ctx.fillStyle = 'rgba(0,0,0,0)'; // or 'transparent'
      this.drawing = false;
    },
    start: function(evt) {//console.log('in circle start')
      var x = evt.page.x - this.canvas_coords.left;
      var y = evt.page.y - this.canvas_coords.top;
      
      this.options.startX = x;
      this.options.startY = y;
      
      this.ctx.beginPath();
      //history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {//console.log('in circle stroke')
      if(this.drawing) {
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        this.options.endX = x;
        this.options.endY = y;
        history.drawingState(this.canvas, this.ctx, history.undo_list);
      }
    },
    stop: function(evt) {//console.log('in circle stop')
      if(this.drawing) {
        this.drawTool();
        this.ctx.closePath();     //close the end to the start point
        this.ctx.stroke();        //actually draw the accumulated lines
        history.saveState(this.canvas);
        this.drawing = false;
      }
    },
    drawTool: function() {//console.log('Inside circle drawtool')
      if(this.drawing) {
        history.setStyleElement(this.canvas, this.ctx);
          
        var h = parseInt(this.options.endX - this.options.startX); 
        var k = parseInt(this.options.endY - this.options.startY);
        var r = h+k;
        var step = 2*Math.PI/r;  // see note 1

        this.ctx.beginPath();  //tell canvas to start a set of lines

        for(var theta=0;  theta < 2*Math.PI;  theta+=step)
        {
            var x = h + r * Math.cos(theta);
            var y = k - r * Math.sin(theta);    //note 2.
            this.ctx.lineTo(x + this.options.startX, y + this.options.startY);
        }
        this.ctx.stroke();
        //this.ctx.restore();
      }
    }
  };
  
  var pencil = {
    options: {
      stroke_color: ['00', '00', '00'],
      dim: 4
    },
    init: function(canvas, ctx) {//console.log('pencil init')
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.fillStyle;
      this.drawing = false;
      
      history.setStyleElement(this.canvas, this.ctx);
    },
    start: function(evt) {//console.log('in pencil start')
      var x = evt.page.x - this.canvas_coords.left;
      var y = evt.page.y - this.canvas_coords.top;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      //history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {//console.log('in pencil stroke')
      if(this.drawing) {
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
      }
    },
    stop: function(evt) {//console.log('in pencil stop')
      if(this.drawing) {
        history.saveState(this.canvas);  
        this.drawing = false;
      }
    },
    drawTool: function() {
        
    }
  };
  
  var square = {
    options: {
      stroke_color: ['00', '00', '00'],
      dim: 4
    },
    init: function(canvas, ctx) {//console.log('in square init', canvas);
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getCoordinates();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.drawing = false;   
    },
    start: function(evt) {//console.log('square start');
      var x = evt.page.x - this.canvas_coords.left;
      var y = evt.page.y - this.canvas_coords.top;
      this.options.startX = x;
      this.options.startY = y;
      
      this.ctx.beginPath();
      //history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {//console.log('square stroke');
      if(this.drawing) {
        history.drawingState(this.canvas, this.ctx, history.undo_list);
        this.ctx.beginPath();
      
        var x = evt.page.x - this.canvas_coords.left;
        var y = evt.page.y - this.canvas_coords.top;
        //console.log('after drawing state')
        this.options.endX = x;
        this.options.endY = y;
        //this.options.width = this.options.endX - this.options.startX;
        //this.options.height = this.options.endY - this.options.startY;
        
        this.drawTool();
        //this.ctx.rect(this.options.startX, this.options.startY, this.options.width, this.options.height);
        
        //this.ctx.stroke();
      }
    },
    stop: function(evt) {//console.log('square stop');
      if(this.drawing) {
        this.ctx.beginPath();
      
        this.options.width = this.options.endX - this.options.startX;
        this.options.height = this.options.endY - this.options.startY;
        //console.log(this.options.endX, this.options.endY, this.options.startX, this.options.startY)
        this.drawTool();
        //this.ctx.rect(this.options.startX, this.options.startY, this.options.width, this.options.height);
        this.ctx.stroke();  
        
        history.saveState(this.canvas);
        this.drawing = false;
      }
    },
    drawLine: function (startPt, endPt) {
      history.setStyleElement(this.canvas, this.ctx);
      
      this.ctx.moveTo(startPt.x, startPt.y);
      this.ctx.lineTo(endPt.x, endPt.y);
      this.ctx.stroke();
    },
    drawTool: function () {
      lineP1 = {x: this.options.startX, y: this.options.startY, r: 0};
      lineP2 = {x: this.options.startX, y: this.options.endY, r: 0};
      lineP3 = {x: this.options.endX, y: this.options.endY, r: 0};
      lineP4 = {x: this.options.endX, y: this.options.startY, r: 0};
      this.drawLine(lineP1, lineP2);
      this.drawLine(lineP2, lineP3);
      this.drawLine(lineP3, lineP4);
      this.drawLine(lineP4, lineP1);
    }
  };
  
  var bindFlag = '';
  var bindCnt = 0;
  var btnFlag = false;
  function renderPDF(url, canvasContainer, options) {
    var options = options || { scale: 2 };
    document.getElementById('loading').textContent = 'Wait while loading PDF file...';
        
    function renderPage(page) {
        var viewport = page.getViewport(options.scale);
        //var wrapper = document.createElement('li');
        var canvas_rand = document.createElement('canvas');
        
        var ctx_rand = canvas_rand.getContext('2d');
        var renderContext = {
            canvasContext: ctx_rand,
            viewport: viewport
        };
        
        canvas_rand.setAttribute('id', 'page' + page.pageIndex);
        canvas_rand.height = viewport.height;
        canvas_rand.width = canvasContainer.offsetWidth; //viewport.width;
        
        history.options.canvas_width = canvas_rand.width;
        history.options.canvas_height = canvas_rand.height;
        //history.initial_canvas_url.push(canvas.toDataURL());
        
        //wrapper.setAttribute('id', page.pageIndex);
        //wrapper.appendChild(canvas);
        canvasContainer.appendChild(canvas_rand);
        
        task = page.render(renderContext);
        task.promise.then(function(){
            ////console.log(canvas.toDataURL('image/jpeg'));
            //alert('hi')
            //document.write(canvas.toDataURL('image/png'));
            
            //document.getElementById('loading').textContent = '';
            bindCnt++;
            //console.log(bindCnt, page.transport.numPages);
            if(bindFlag === '' && page.transport.numPages == bindCnt) {
              //save pdf object for paging related stuff
              history.options.pdfobj = page;
              console.log(page);
            
              bindEvent(0);
              bindFlag = 1;    
            }
        });
        
    }
    
    
    function bindEvent(page) {
        
        ////console.log(bindCnt, totalPage.transport.numPages);
        if(bindFlag == '') {//console.log('inside bind flag')
          bindFlag = 'true';
          history.options.PrevPage = page;
          history.options.activePage = page;
          canvas = document.getElementById('canvas');
          ctx = canvas.getContext('2d');
          
          if(!history.initial_canvas_url.hasOwnProperty(page)) {
              var tmpImgObj = document.getElementById('page'+page);
              history.initial_canvas_url[page] = tmpImgObj.toDataURL();
              history.final_canvas_url[history.options.activePage] = history.initial_canvas_url[history.options.activePage];
              imgURL = history.initial_canvas_url[history.options.activePage];
          } else {
              imgURL = history.final_canvas_url[history.options.activePage];
          }
          
          canvas.height = history.options.canvas_height;
          canvas.width = history.options.canvas_width; //viewport.width;
          
          var img = new Element('img', {'src': imgURL});
          img.onload = function() {
            canvas_coords = canvas.getCoordinates();
            history.options.canvas_coords = canvas_coords;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            document.getElementById('loading').textContent = '';
        
            history.saveState(canvas);

            if(btnFlag === false) {
                btnFlag = true;
                document.getElementById('pencil').addEventListener('click', function() {
                    event.options.activeTool = pencil;
                    pencil.init(canvas, ctx);
                });
                
                document.getElementById('square').addEventListener('click', function() {
                    event.options.activeTool = square;
                    square.init(canvas, ctx);
                });
                
                document.getElementById('circle').addEventListener('click', function() {
                    event.options.activeTool = circle;
                    circle.init(canvas, ctx);
                });
                
                document.getElementById('text').addEventListener('click', function() {
                    event.options.activeTool = text;
                    text.init(canvas, ctx);
                });
                
                document.getElementById('contenteditor').addEventListener('blur', function() {
                    document.getElementById('editor_wrapper').style.display = 'none';
                    text.drawTool();
                });
                
                document.getElementById('arrow').addEventListener('click', function() {
                    event.options.activeTool = arrow;
                    arrow.init(canvas, ctx);
                });
                
                document.getElementById('line').addEventListener('click', function() {
                    event.options.activeTool = line;
                    line.init(canvas, ctx);
                });
                
                document.getElementById('imageupload').addEventListener('change', function() {
                    console.log(this.files[0]);
                    image.uploadImage(this.files[0]);
                    event.options.activeTool = image;
                    image.init(canvas, ctx);
                });
                
                document.getElementById('clear_image').addEventListener('click', function() {
                    document.getElementById('frm_canvas_tool').reset();
                })
                
                document.getElementById('undo').addEventListener('click', function() {
                    history.undo(canvas, ctx);
                });
                
                document.getElementById('redo').addEventListener('click', function() {
                    history.redo(canvas, ctx);
                });
                
                document.getElementById('save').addEventListener('click', function() {
                    event.savepdf();
                });
                
                document.getElementById('fontsize').addEventListener('change', function() {
                    history.options.font_size = this.value;
                    //history.setStyleElement(canvas, ctx);
                });
                
                document.getElementById('fillstyle').addEventListener('change', function() {
                    history.options.fillStyle = '#'+this.value;
                    //history.setStyleElement(canvas, ctx);
                });
                
                document.getElementById('linewidth').addEventListener('change', function() {
                    history.options.lineWidth = this.value;
                    //history.setStyleElement(canvas, ctx);
                });
                
                document.getElementById('prevBtn').addEventListener('click', function() {
                    if(!document.getElementById('prevBtn').getAttribute('disable')) {
                      //var tmpImgObj = document.getElementById('canvas');
                      //console.log(history.options.PrevPage);
                      //history.final_canvas_url[history.options.PrevPage] = tmpImgObj.toDataURL();
                        
                      bindFlag = '';
                      bindEvent(parseInt(history.options.activePage - 1));    
                    }
                });
                
                document.getElementById('nextBtn').addEventListener('click', function() {
                    if(!document.getElementById('nextBtn').getAttribute('disabled')) {
                      //var tmpImgObj = document.getElementById('canvas');
                      //console.log(history.options.PrevPage);
                      //history.final_canvas_url[history.options.PrevPage] = tmpImgObj.toDataURL();
                        
                      bindFlag = '';
                      bindEvent(parseInt(history.options.activePage + 1));    
                    }
                    
                });
            }
            
            event.init(canvas, ctx);
          }  
        }
        
        /*if(bxslider === '') {
            $('.bxslider').bxSlider({
                minSlides: 1,
                maxSlides: 1
            });
        }
        bxslider = 1;*/
    }

    function renderPages(pdfDoc) {
        history.options.numPages = pdfDoc.numPages;
        for(var num = 1; num <= pdfDoc.numPages; num++) 
            pdfDoc.getPage(num).then(renderPage);
    }
    PDFJS.disableWorker = false;
    PDFJS.getDocument(url).then(renderPages);

  }   

  renderPDF('demo.pdf', document.getElementById('canvas-container'));
    
  
})(document.id)

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