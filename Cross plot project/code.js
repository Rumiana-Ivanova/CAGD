const controlPointRaduis = 4;
const controlPolygonWidth = 1.5;
const axesWidth = 2;
const curveWidth = 2;

var addingControlPoints = false;
var drawingControlPolygons = false;
var drawingBezieCurves = false;
var drawingParametricFunctions = false;
var controlPoints = [];
var controlPointsX = [];
var controlPointsY = [];
var axesLenght;

var ctx = null;
var canvas = null;

var movingControlPointIndex = -1;

class point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

function start() 
{
	canvas = document.getElementById("canvas");
	if (!canvas)
	{
		alert("Cannot retrieve canvas!");
		return;
	}

	//ctx = canvas.getContext ("2d", "webgl2", { antialias: true, alpha: true, premultipliedAlpha: true });
    ctx = canvas.getContext ("2d", "webgl2", { antialias: true});
	if (!ctx)
	{
		alert("Cannot load context!");
		return;
	}

	axesLenght = Math.min(canvas.width, canvas.height) * 0.9;
	drawAxes();

	//add event listeners
	canvas.addEventListener("click", handleMouseClick);
	canvas.addEventListener("mousedown", handleMouseDown);
	canvas.addEventListener("mousemove", handleMouseMove);
	canvas.addEventListener("mouseup", handleMouseUp);
}

function handleMouseClick(event)
{
	if (!addingControlPoints){
		return;	
	}

	var point = mousePoint(event);
	controlPoints.push(point);
	if(drawingParametricFunctions){
		calculatePointsOfParametricFunctionsX(controlPoints);
		calculatePointsOfParametricFunctionsY(controlPoints);
	}
	redrawCanvas(false);

}

function handleMouseDown(event)
{
	if (addingControlPoints){
		return;	
	}

	var point = mousePoint(event);
	movingControlPointIndex = -1;

	const tolerance = 5;
	var xsquared, ysquared;

	//check if mouse is within tolarance of one of the control points
	for (var i = 0; i < controlPoints.length; i++)
	{
		xsquared = Math.pow(point.x - controlPoints[i].x, 2);
		ysquared = Math.pow(point.y - controlPoints[i].y, 2);
		if (xsquared + ysquared <= Math.pow(controlPointRaduis, 2) + tolerance)
		{
			movingControlPointIndex = i;
			break;
		}
	}
}


function handleMouseMove(event)
{
	if (movingControlPointIndex < 0){
		return;	
	}

	var point = mousePoint(event);
	controlPoints[movingControlPointIndex] = point;
	calculatePointsOfParametricFunctionsX(controlPoints);
	calculatePointsOfParametricFunctionsY(controlPoints);
	redrawCanvas(false);
}


function handleMouseUp(event)
{
	movingControlPointIndex = -1;
}

function mousePoint(event)
{
	var canvasRect = canvas.getBoundingClientRect();
	var x = event.clientX - canvasRect.left;
	var y = event.clientY - canvasRect.top;

	return new point(x, y);
}

function drawControlPoint(point)
{
	drawCircle(point, controlPointRaduis);
}

function drawControlPoints(points)
{
	for (var i = 0; i < points.length; i++){
		drawControlPoint(points[i]);
	}
}

function redrawCanvas(resetPoints)
{
	clearCanvas(resetPoints);
	if (controlPoints.length > 0)
	{
		drawControlPoints(controlPoints);
		drawParametricFunctions(controlPoints);
		drawControlPolygons();
		drawBezieCurve();
	}

}	


function clearCanvas(resetPoints)
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawAxes();
	if (resetPoints)
	{
		controlPoints = [];
		controlPointsX = [];
		controlPointsY = [];
	}

}

function toggleControlPointsAddingState()
{
	setControlPointsAddingStatesActive(!addingControlPoints);
}

function setControlPointsAddingStatesActive(active)
{
	addingControlPoints = active;

    var button = document.getElementById("adding");
    if (addingControlPoints)
        button.innerHTML = "Stop adding control points";
    else
        button.innerHTML = "Start adding control points";
}

function drawCircle(center, radius)
{
	ctx.beginPath();
	ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
	ctx.lineWidth = controlPointRaduis;
	ctx.fillStyle = "blue";
	ctx.fill();
	ctx.strokeStyle = "blue";
	ctx.stroke();
}

function toggledrawControlPolygons(){
	drawingControlPolygons = !drawingControlPolygons;
	redrawCanvas(false);
}

function drawControlPolygons(){
	if(!drawingControlPolygons){
		return;
	}
	if(controlPoints.length > 0){
		drawControlPolygon(controlPoints);
	}

	if(!drawingParametricFunctions){
		return;
	}
	if(controlPointsX.length > 0){
		drawControlPolygon(controlPointsX);
	}
	if(controlPointsY.length > 0){
		drawControlPolygon(controlPointsY);
	}

}

function drawControlPolygon(points){
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.lineWidth = controlPolygonWidth;

	ctx.moveTo(points[0].x, points[0].y);
	for (var i = 1; i < points.length; i++)
	{
		ctx.lineTo(points[i].x, points[i].y);
		ctx.stroke();
		ctx.moveTo(points[i].x, points[i].y);
	}
}

function drawAxes(){
	const width = canvas.width;
	const height = canvas.height;


	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.lineWidth = axesWidth;

	// X axis
	ctx.moveTo(width/2 - axesLenght/2, height/2);
	ctx.lineTo(width/2 + axesLenght/2, height/2);
	ctx.stroke();
	drawAxesArrow(width/2 - axesLenght/2, height/2, true, 1);
	drawAxesArrow(width/2 + axesLenght/2, height/2, true, -1);

	// Y axis
	ctx.moveTo(width/2, height/2 - axesLenght/2);
	ctx.lineTo(width/2, height/2 + axesLenght/2);
	ctx.stroke();
	drawAxesArrow(width/2, height/2 - axesLenght/2, false, 1);
	drawAxesArrow(width/2, height/2 + axesLenght/2, false, -1);

	var size = 10;
	drawX (width/2 + axesLenght/2 + size , height/2 - size/2, size);
	drawY (width/2 - size/2, height/2 - axesLenght/2 - size*2, size);
	drawT (width/2 - axesLenght/2 - size*2, height/2 - size/2, size);
	drawT (width/2 - size/2, height/2 + axesLenght/2 + size, size);
}

function drawAxesArrow(x, y, changeX, dir){
	
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.lineWidth = axesWidth;

	const size = 10;
	if(changeX){

		ctx.moveTo(x + dir*size, y + size);
		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.moveTo(x, y);
		ctx.lineTo(x + dir*size, y - size);
		ctx.stroke();
	}else{
		ctx.moveTo(x + size, y + dir*size);
		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.moveTo(x, y);
		ctx.lineTo(x - size, y + dir*size);
		ctx.stroke();
	
	}

}

function drawX (x, y, size){
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.lineWidth = axesWidth;

	ctx.moveTo(x, y);
	ctx.lineTo(x + size, y + size);
	ctx.stroke();
	ctx.moveTo(x + size, y);
	ctx.lineTo(x, y + size);
	ctx.stroke();
}

function drawY (x, y, size){
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.lineWidth = axesWidth;

	ctx.moveTo(x, y);
	ctx.lineTo(x + size/2, y + size/2);
	ctx.stroke();
	ctx.moveTo(x + size, y);
	ctx.lineTo(x, y + size);
	ctx.stroke();
}

function drawT (x, y, size){
	ctx.beginPath();
	ctx.strokeStyle = "black";
	ctx.lineWidth = axesWidth;

	ctx.moveTo(x, y);
	ctx.lineTo(x + size, y);
	ctx.stroke();
	ctx.moveTo(x + size/2, y);
	ctx.lineTo(x + size/2, y + size);
	ctx.stroke();
}

function toggledrawParametricFunction(){
	drawingParametricFunctions = !drawingParametricFunctions;
	redrawCanvas(false);
}


function drawParametricFunctions(points){
	if(!drawingParametricFunctions){
		return;
	}
	calculatePointsOfParametricFunctionsX(points)
	drawControlPoints(controlPointsX);
	calculatePointsOfParametricFunctionsY(points)
	drawControlPoints(controlPointsY);
}

function calculatePointsOfParametricFunctionsX(points){

	var n = points.length-1;
	var b = canvas.width/2 - axesLenght/2;
	var a = canvas.width/2 - axesLenght*0.05;
	controlPointsX = [];
	
	for(var i = 0; i <= n; i++){
		controlPointsX.push(new point (a + i*(b-a)/n, points[i].y));
	}

}

function calculatePointsOfParametricFunctionsY(points){
	
	var n = points.length-1;
	var a = canvas.height/2 + axesLenght*0.05;
	var b = canvas.height/2 + axesLenght/2;
	controlPointsY = [];

	for(var i = 0; i <= n; i++){
		controlPointsY.push(new point (points[i].x, a + i*(b-a)/n));
	}


}


function b(r, i, t, points){
	if(r == 0){
		return points[i];
	}
	var x = (1-t) * b(r-1, i, t, points).x + t * b(r-1, i+1, t, points).x;
	var y = (1-t) * b(r-1, i, t, points).y + t * b(r-1, i+1, t, points).y
	return new point(x, y);
}

function calculatePointWithDeCasteljausAlgorithm(minT, maxT, segments, points){
	var newPoints = [];
	var n = points.length - 1;
	var t;
	
	for(var i = 0; i <= segments; i++){
		t = minT + i / segments * (minT + maxT);
		newPoints. push( b(n, 0, t, points));
	}
	return newPoints;
}


function drawCurve (points) {

	
    ctx.beginPath();
	ctx.lineWidth = curveWidth; 
    ctx.strokeStyle = "red"; 

	segments = points.length - 1;
	ctx.moveTo(points[0].x, points[0].y);

    for (var i = 1; i <= segments; i++) {
		ctx.lineTo(points[i].x, points[i].y);
		ctx.stroke();
        ctx.moveTo(points[i].x, points[i].y);
    }
    ctx.closePath();

}

function toggledrawBezieCurve(){
	drawingBezieCurves = !drawingBezieCurves;
	redrawCanvas(false);
}

function drawBezieCurve (){

	if(!drawingBezieCurves){
		return;
	}
	var segments = controlPoints.length * 10;

	if(controlPoints.length > 0){
		drawCurve(calculatePointWithDeCasteljausAlgorithm(0, 1, segments, controlPoints));
	}
	
	if(!drawingParametricFunctions){
		return;
	}
	if(controlPointsX.length > 0){
		drawCurve(calculatePointWithDeCasteljausAlgorithm(0, 1, segments, controlPointsX));
	}

	if(controlPointsY.length > 0){
		drawCurve(calculatePointWithDeCasteljausAlgorithm(0, 1, segments, controlPointsY));
	}
}



