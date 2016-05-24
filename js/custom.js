//public Canvas object to use in all the functions.  
//Main canvas declaration   
var canvas;  
var ctx;  
var x = 75;  
var y = 50;  
//Width and Height of the canvas  
var WIDTH = 1024;  
var HEIGHT = 740; 
var height = 740; 
//    var dragok = false;  
//Global color variable which will be used to store the selected color name.  
var Colors="";  
var newPaint = false;  
var DrawingTypes = "";  
//Circle default radius size  
var radius = 30;  
var radius_New = 30;  
// Rectangle array  
rect = {},  
//drag= false defult to test for the draging  
drag = false;  
// Array to store all the old Shanpes drawing details  
var rectStartXArray = new Array();  
var rectStartYArray = new Array();  
var rectWArray = new Array();  
var rectHArray = new Array();  
var rectColor = new Array();  
var DrawType_ARR = new Array();  
var radius_ARR = new Array();  
var Text_ARR = new Array();  
var arrow = {h: 5, w: 10};
var stPoint, edPoint, stPt, edPt;
var callDraw;
var stPt, edPt, ptArrow;
var flag = false;
var color;
var finalObj = {'canvas': []};
var task;
// Declared for the Free hand pencil Drawing.  
var prevX = 0,  
currX = 0,  
prevY = 0,  
currY = 0;  
//to add the Image

/*
var element = document.getElementById('some-id');
var position = element.getBoundingClientRect();
var x = position.left;
var y = position.top;
*/
  
var imageObj = new Image();  
//Initialize the Canvas and Mouse events for Canvas  
    function init(DrawType) { console.log('In init function');
        clearVars(); 
        newPaint = true;  
        //if(!canvas){
            canvas = document.getElementById("page0");
        //}  
        x =5;  
        y = 5;  
        DrawingTypes = DrawType;  
        if(!ctx){
            ctx = canvas.getContext("2d");
        }  
        
        
        radius = 30;  
        radius_New = radius;  
        canvas.addEventListener('mousedown', mouseDown, false);  
        canvas.addEventListener('mouseup', mouseUp, false);  
        canvas.addEventListener('mousemove', mouseMove, false);  
        imageObj.src = 'images/Afraz.jpg';
        color = document.getElementById('color').value;
        
        //containercanvas = document.getElementById('0');
        //console.log(finalObj.canvas[0].canvas);
        //document.getElementById('0').innerHTML = finalObj.canvas[0].canvas;
        //containercanvas.appendChild(finalObj.canvas[0].canvas);
        //tmpctx = finalObj.canvas[0].ctx;
       // page = finalObj.canvas[0].context;
        //page.render(ctx);
        //console.log(page);
        //page.render(finalObj.canvas[0].renderContext);
        //pdfDoc.getPage(num).then(renderPage);
        
        //return draw();
        callDraw = setInterval(draw, 15);
        return callDraw;  
    } 
    
    //Mouse down event method  
    function mouseDown(e) {  
        rect.startX = e.pageX - this.offsetLeft;  
        rect.startY = e.pageY - this.offsetTop;  
        radius_New = radius;  
        prevX = e.clientX - canvas.offsetLeft;  
        prevY = e.clientY - canvas.offsetTop;  
        currX = e.clientX - canvas.offsetLeft;  
        currY = e.clientY - canvas.offsetTop;  
        drag = true;  
        
    }  
    //Mouse UP event Method  
    function mouseUp() {  
        rectStartXArray[rectStartXArray.length] = rect.startX;  
        rectStartYArray[rectStartYArray.length] = rect.startY;  
        rectWArray[rectWArray.length] = rect.w;  
        rectHArray[rectHArray.length] = rect.h;  
        Colors = document.getElementById("SelectColor").value;  
        rectColor[rectColor.length] = "#" + Colors;  
        DrawType_ARR[DrawType_ARR.length] = DrawingTypes  
        radius_ARR[radius_ARR.length] = radius_New;  
        Text_ARR[Text_ARR.length] = document.getElementById('txtInput').value;  
        drag = false;  
        draw();
        
    }  
  
    //mouse Move Event method  
    function mouseMove(e) {  
        if (drag) {  
            rect.w = (e.pageX - this.offsetLeft) - rect.startX;  
              
             rect.h = (e.pageY - this.offsetTop) - rect.startY;  
             drawx = e.pageX - this.offsetLeft;  
             drawy = e.pageY - this.offsetTop;  
             prevX = currX;  
             prevY = currY;  
             currX = e.clientX - canvas.offsetLeft;  
             currY = e.clientY - canvas.offsetTop;  
            if (drag = true) {  
                radius_New += 2;  
                 
            }  
            if (DrawingTypes == "FreeDraw" || DrawingTypes == "Erase") {  
            }  
            else {  
                //ctx.clearRect(0, 0, canvas.width, canvas.height);
                //ctx.clearRect(rect.startX-arrow.w-arrow.h, rect.startY-arrow.h+arrow.w, rect.w+arrow.w, rect.h+arrow.h);  
            }  
            draw();
             
            var dataURL = canvas.toDataURL();
            var img = new Element('img', {'src':'test.jpg'});
            img.onload = function() {
                ctx.clearRect(0, 0, 600, 400);
                ctx.drawImage(img, 0, 0, 600, 400, 0, 0, 600, 400);  
            } 
             
        }  
        //drawOldShapes();  
    }  
    
    function draw() {  
        clearInterval(callDraw);
        
        ctx.fillStyle = 'transparent'; //rgba(0,0,0,0)'; // or 'transparent'
        ctx.beginPath();  
        Colors = document.getElementById("SelectColor").value;  
        ctx.fillRect(0,2,0,0);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;       
                   
        
        switch (DrawingTypes) {  
            case "FillRect":  
                //ctx.rect(rect.startX, rect.startY, rect.w, rect.h);
                if(!drag){
                    //ctx.rect(rect.startX, rect.startY, rect.w, rect.h);
                    //ctx.stroke();
                    lineP1 = {x: rect.startX-10, y: rect.startY-64, r: 0};
                    lineP2 = {x: rect.startX-10, y: currY-64, r: 0};
                    lineP3 = {x: currX-10, y: currY-64, r: 0};
                    lineP4 = {x: currX-10, y: rect.startY-64, r: 0};
                    drawLine(ctx, lineP1, lineP2);
                    drawLine(ctx, lineP2, lineP3);
                    drawLine(ctx, lineP3, lineP4);
                    drawLine(ctx, lineP4, lineP1);
                }  
                break;  
            case "FillCircle": 
                if(!drag){ 
                    //ctx.arc(rect.startX, rect.startY, radius_New, rect.w, rect.h);
                    //ctx.fill();
                    
                    var h = parseInt(currX-rect.startX); 
                    var k = parseInt(currY-rect.startY);
                    var r = h+k;
                    var step = 2*Math.PI/r;  // see note 1

                    ctx.beginPath();  //tell canvas to start a set of lines

                    for(var theta=0;  theta < 2*Math.PI;  theta+=step)
                    { 
                        var x = h + r*Math.cos(theta);
                        var y = k - r*Math.sin(theta);    //note 2.
                        ctx.lineTo(x+rect.startX,y+rect.startY);
                    }

                    ctx.closePath();     //close the end to the start point
                    ctx.stroke();        //actually draw the accumulated lines
                }  
                break;  
            case "Images":  
                ctx.drawImage(imageObj, rect.startX, rect.startY, rect.w, rect.h);  
                break;  
            case "DrawText":  
                ctx.fillStyle = color; //rgba(0,0,0,0)'; // or 'transparent'
                ctx.font = document.getElementById('fontSize').value+'px Calibri';  
                //ctx.fillText('freeText', rect.startX, rect.startY);
                if(drag) {
                    clearInterval(callDraw);
                    var freeText = prompt("Please enter text", "Sample Text");
                    if (freeText != null) {
                        ctx.fillText(freeText, rect.startX, rect.startY);
                        drag = false;
                    }
                }
                break;  
            case "FreeDraw":  
                ctx.beginPath();
                console.log(prevX)  
                ctx.moveTo(prevX, prevY);  
                ctx.lineTo(currX, currY);  
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#" + Colors;  
                ctx.lineWidth = document.getElementById('selSize').value;  
                ctx.stroke();  
                ctx.closePath();  
//                ctx.beginPath();  
//                ctx.moveTo(drawx, drawy);  
//                ctx.rect(drawx, drawy,  6, 6);  
//                ctx.fill();  
                break;  
            case "Erase":  
                
                ctx.beginPath();  
                ctx.moveTo(prevX, prevY);  
                ctx.lineTo(currX, currY);
                ctx.strokeStyle = "#FFFFFF";  
                ctx.lineWidth = 6;  
                ctx.stroke();  
                ctx.closePath();  
                //                ctx.beginPath();  
                //                ctx.moveTo(drawx, drawy);  
                //                ctx.rect(drawx, drawy,  6, 6);  
                //                ctx.fill();  
                break;
            case "DrawArrows":
                if(drag){
                    console.log('in drag');
                    stPoint = {x: rect.startX, y: rect.startY, r: 0};
                    edPoint = {x: currX, y: currY, r: 0};
                    stPt = getPointOnCircle(stPoint.r, stPoint, edPoint);
                    edPt = getPointOnCircle(edPoint.r, edPoint, stPoint);
                    ptArrow = getPointOnCircle(edPoint.r + arrow.w , edPoint, stPoint);
                    flag = true;
                }
                
                if(!drag && flag){
                    console.log('in not drag');
                    drawLine(ctx, stPt, edPt);
                    drawArrow(ctx, arrow, ptArrow, edPt);
                    flag = false;
                }
                
                break;
             case "DrawLines":
                if(drag){
                    console.log('in drag');
                    stPoint = {x: rect.startX, y: rect.startY, r: 0};
                    edPoint = {x: currX, y: currY, r: 0};
                    stPt = getPointOnCircle(stPoint.r, stPoint, edPoint);
                    edPt = getPointOnCircle(edPoint.r, edPoint, stPoint);
                    ptArrow = getPointOnCircle(edPoint.r + arrow.w , edPoint, stPoint);
                    flag = true;
                }
                
                if(!drag && flag){
                    console.log('in not drag');
                    drawLine(ctx, stPt, edPt);
                    flag = false;
                }
                
                break;
                
               
                  
        }  
        
        
        ctx.fill();  
        //ctx.stroke();  
    } 
    
     function ShanuSaveImage() {   
          var m = confirm("Are you sure to Save ");   
          if (m) {   
              // generate the image data   
              var imgData = document.getElementById("canvas").toDataURL("image/png");   
              //imgData = imgData.replace('data:image/png;base64,', '');  
              
              var doc = new jsPDF('p', 'mm');
              doc.addImage(imgData, 'PNG', 10, 10);
              doc.save('sample-file.png');              
          }        
    } 
    
    function drawArrow(ctx, arrow, ptArrow, endPt) {    
        var angleInDegrees = getAngleBetweenPoints(ptArrow, endPt);

        // first save the untranslated/unrotated context
        ctx.save();        
        
        // move the rotation point to the center of the rect    
        ctx.translate(ptArrow.x, ptArrow.y);        
        // rotate the rect
        ctx.rotate(angleInDegrees*Math.PI/180);

        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo( 0, -arrow.h);
        ctx.lineTo( arrow.w, 0);
        ctx.lineTo( 0, +arrow.h);       
        ctx.closePath();
        ctx.fillStyle = "rgb(72,72,72)";
        ctx.stroke();
        ctx.fill();

        // restore the context to its untranslated/unrotated state
        ctx.restore();
    }
    
    function drawLine(ctx, startPt, endPt) {
        ctx.fillStyle = 'transparent';
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(endPt.x, endPt.y);
        ctx.stroke();
    }

    function getPointOnCircle(radius, originPt, endPt) {
        var angleInDegrees = getAngleBetweenPoints(originPt, endPt);


        // Convert from degrees to radians via multiplication by PI/180        
        var x = radius * Math.cos(angleInDegrees * Math.PI / 180) + originPt.x;
        var y = radius * Math.sin(angleInDegrees * Math.PI / 180) + originPt.y;

        return { x: x, y: y };
    }

    function getAngleBetweenPoints(originPt, endPt) {
        var interPt = { x: endPt.x - originPt.x,
            y: endPt.y - originPt.y
        };

        return Math.atan2(interPt.y, interPt.x) * 180 / Math.PI;
    }
    
    function clearVars() {
        rect = {};  
        radius_New = 0;  
        prevX = 0;  
        prevY = 0;  
        currX = 0;  
        currY = 0;
        drawx = 0;
        drway = 0;
    }
    
    
    // Disable workers to avoid yet another cross-origin issue (workers need the URL of
    // the script to be loaded, and dynamically loading a cross-origin script does
    // not work)
    //
    PDFJS.disableWorker = true;
    //
    // Asynchronous download PDF as an ArrayBuffer
    //
    var pdf = document.getElementById('pdf');
    pdf.onchange = function(ev) {
        //console.log(document.getElementById('pdf').files[0]);
        //pdf.files[0].name = 'test1.pdf';
      if (file = document.getElementById('pdf').files[0]) {
        document.getElementById('loading').textContent = 'Wait while loading PDF file...';
        fileReader = new FileReader();
        fileReader.onload = function(ev) {
          //console.log(ev);
          PDFJS.getDocument(fileReader.result).then(function getPdfHelloWorld(pdf) {
            //
            // Fetch the first page
            //
            //console.log(pdf)
            pdf.getPage(1).then(function getPageHelloWorld(page) {
              var scale = 3;
              var viewport = page.getViewport(scale);
              //
              // Prepare canvas using PDF page dimensions
              //
              canvas = document.getElementById("canvas");
              ctx = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              //
              // Render PDF page into canvas context
              //
              var task = page.render({canvasContext: ctx, viewport: viewport})
              task.promise.then(function(){
                //console.log(canvas.toDataURL('image/jpeg'));
				//alert('hi')
				//document.write(canvas.toDataURL('image/png'));
				
                document.getElementById('loading').textContent = '';
              });
            });
          }, function(error){
            console.log(error);
            document.getElementById('loading').textContent = 'Error while loading PDF.';
          });
        };
        fileReader.readAsArrayBuffer(file);
      }
    }
    
    
    /*var filePath;
    var body;
    var num;
    var options;
    var pdfDoc;
    
    function renderLocalPDF() {
        filePath = "test1.pdf";
        body = document.getElementById("container-wrapper");
        renderPDF(filePath, body);
    }
    
    function Num(num) {
        num = num;

        return function () {
            return num;
        }
    };

    function renderPDF(url, canvasContainer, options) {
        options = options || {
                scale: 1.5
            },          
            //func,
            pdfDoc,
            //def = $.Deferred(),
            //promise = $.Deferred().resolve().promise(),         
            //width, 
            height,
            makeRunner = function(func, args) {
                return function() {
                    return func.call(null, args);
                };
            };

        PDFJS.disableWorker = true;
        //PDFJS.getDocument(url).then(renderPages);
        data = PDFJS.getDocument(url);
        renderPages(data);       
    };
    
    function renderPage(num) {         alert('renderpage') 
        var def = $.Deferred(),
            currPageNum = new Num(num);
        pdfDoc.getPage(currPageNum()).then(function(page) {
            var viewport = page.getViewport(options.scale);
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            if(currPageNum() === 1) {                   
                height = viewport.height;
                width = viewport.width;
            }

            canvas.height = height;
            canvas.width = width;

            canvasContainer.appendChild(canvas);

            page.render(renderContext).then(function() {                                        
                def.resolve();
            });
        })

        return def.promise();
    }

    function renderPages(data) {//alert('rederpages')
    console.log('Data***', data);
        pdfDoc = data;

        var pagesCount = pdfDoc.numPages;
        for (var i = 1; i <= pagesCount; i++) { 
            func = renderPage;
            renderPage(i);
            //promise = promise.then(makeRunner(func, i));
        }
    }
    renderLocalPDF();
  */
var bxslider = '';
function renderPDF(url, canvasContainer, options) {
    var options = options || { scale: 2 };
    document.getElementById('loading').textContent = 'Wait while loading PDF file...';
        
    function renderPage(page) {
        var viewport = page.getViewport(options.scale);
        var wrapper = document.createElement('li');
        var canvas = document.createElement('canvas');
        
        var ctx = canvas.getContext('2d');
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        canvas.setAttribute('id', 'page' + page.pageIndex);
        canvas.height = viewport.height;
        canvas.width = canvasContainer.offsetWidth; //viewport.width;
        
        wrapper.setAttribute('id', page.pageIndex);
        wrapper.appendChild(canvas);
        canvasContainer.appendChild(wrapper);
        
        task = page.render(renderContext);
        task.promise.then(function(){
            //console.log(canvas.toDataURL('image/jpeg'));
            //alert('hi')
            //document.write(canvas.toDataURL('image/png'));
            
            document.getElementById('loading').textContent = '';
            if(bxslider === '') {
                $('.bxslider').bxSlider({
                    minSlides: 1,
                    maxSlides: 1
                });
            }
            bxslider = 1;
        });
    }

    function renderPages(pdfDoc) {
        for(var num = 1; num <= pdfDoc.numPages; num++) 
            pdfDoc.getPage(num).then(renderPage);
    }
    PDFJS.disableWorker = false;
    PDFJS.getDocument(url).then(renderPages);

}   

renderPDF('test.pdf', document.getElementById('container-wrapper'));