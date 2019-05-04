var canvas = document.getElementById('canvas'),
    panel = canvas.getContext('2d'),
    bsSize = 2,
    isEraser = false

setCanvasSize()
drawCanvas()
btnBind()

function setCanvasSize(){
  setSize()
  window.onresize = function(){
    setSize()
  }
  function setSize(){
    canvas.width = document.documentElement.clientWidth
    canvas.height = document.documentElement.clientHeight
  }
}

function btnBind(){
  black.onclick = function(){ toggleClass(this,".brush-color li","black") }
  grey.onclick = function(){ toggleClass(this,".brush-color li","grey") }
  white.onclick = function(){ toggleClass(this,".brush-color li","white") }
  red.onclick = function(){ toggleClass(this,".brush-color li","red") }
  orange.onclick = function(){ toggleClass(this,".brush-color li","orange") }
  yellow.onclick = function(){ toggleClass(this,".brush-color li","yellow") }
  lime.onclick = function(){ toggleClass(this,".brush-color li","lime") }
  aqua.onclick = function(){ toggleClass(this,".brush-color li","aqua") }
  blue.onclick = function(){ toggleClass(this,".brush-color li","blue") }
  purple.onclick = function(){ toggleClass(this,".brush-color li","purple") }
  dodgerblue.onclick = function(){ toggleClass(this,".brush-color li","dodgerblue") }
  brown.onclick = function(){ toggleClass(this,".brush-color li","brown") }
  size2.onclick = function(){
    toggleClass(this,".brush-size li")
    bsSize = 2
  }
  size4.onclick = function(){
    toggleClass(this,".brush-size li")
    bsSize = 4
  }
  size8.onclick = function(){
    toggleClass(this,".brush-size li")
    bsSize = 8
  }
  size16.onclick = function(){
    toggleClass(this,".brush-size li")
    bsSize = 16
  }

  brush.onclick = function(){
    isEraser = false
    this.classList.add("active")
    eraser.classList.remove("active")
  }
  eraser.onclick = function(){
    isEraser = true
    this.classList.add("active")
    brush.classList.remove("active")
  }
  clear.onclick = function(){
    panel.clearRect(0, 0, canvas.width, canvas.height)
  }
  save.onclick = function(){      
    var a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = "images"
    a.click();
  }

  function toggleClass(_this,select,$color){
    if (select === ".brush-color li") {
      panel.fillStyle = $color
      panel.strokeStyle = $color
    }
    var arry = document.querySelectorAll(select)
    for(var i = 0 ; i < arry.length ; i++){
      arry[i].classList.remove("active")
    }
    _this.classList.add("active")
  }
}

function drawCanvas(){
  var isUsing = false,
      pointObj = [],
      firstPoint = {x: 0, y : 0}

  if (document.body.ontouchstart !== undefined) {
    canvas.ontouchstart = function(e){
      drawdown(e.touches[0])
    }
    canvas.ontouchmove = function(e){
      e.preventDefault()
      drawMove(e.touches[0])
    }
    canvas.ontouchend = function(e){
      isUsing = false
    }
  }else {
    canvas.onmousedown = function(e){
      drawdown(e)
    }
    canvas.onmousemove = function(e){
      drawMove(e)
    }
    canvas.onmouseup = function(){
      isUsing = false
    }
  }

  function drawdown(e){
    var x = e.clientX , 
        y = e.clientY,
        w = bsSize*4
    if (isEraser) {
      panel.clearRect(x - w/2, y - w/2, w, w)
    }else {
      firstPoint.x = x
      firstPoint.y = y
      drawPoint(x,y)
      pointObj.push({x, y})
    }
    isUsing = true
  }
  function drawMove(e){
    var x = e.clientX,
        y = e.clientY,
        w = bsSize*4
    if (!isUsing) {return}
    if (isEraser) {
      panel.clearRect(x - w/2, y - w/2, w, w)
    }else {
      drawPoint(x,y)
      pointObj.push({x, y})
      if (pointObj.length > 2) {
        var lastTwoPoints = pointObj.slice(-2)
        var controlPoint = lastTwoPoints[0]
        var endPoint = lastTwoPoints[1]
        drawLine(firstPoint, controlPoint, endPoint)
        firstPoint = endPoint
      }
    }
  }
  function drawPoint(x,y){
    panel.beginPath()
    panel.arc(x, y, bsSize - .4, 0, Math.PI * 2)
    panel.fill()
    panel.closePath()
  }
  function drawLine(first,control,end){
    panel.beginPath()
    panel.lineWidth = bsSize*2
    panel.moveTo(first.x, first.y)
    panel.quadraticCurveTo(control.x, control.y, end.x, end.y)
    panel.stroke()
    panel.closePath()
  }
}

