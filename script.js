var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	width = window.innerWidth,
	height = window.innerHeight;

canvas.width = width;
canvas.height = height;

var nb = 1000, size = 1, g = 0.5, fluidity = 200;
var dist2, force, coef, M, x, sy, alpha, averageX, averageY, dt = 1;

class Point {
	constructor(x,y, mass){
		this.x=x;
		this.y=y;
		this.dx=0;
		this.dy=0;
		this.mass = mass;
	}

	draw(){
		context.fillStyle = "white";
		context.beginPath();
		context.arc(this.x,this.y,Math.round(Math.sqrt(this.mass)),0,2*Math.PI, false);
		context.fill();
	}

	update(){
		for (var i = 0; i < points.length; i++) {
			dist2 = (points[i].x-this.x)**2 + (points[i].y-this.y)**2;
			if (dist2!=0){
				if(Math.sqrt(dist2)<=Math.sqrt(this.mass)+Math.sqrt(points[i].mass)){
					this.x = (this.x * this.mass + points[i].x * points[i].mass) / (this.mass + points[i].mass);
					this.y = (this.y * this.mass + points[i].y * points[i].mass) / (this.mass + points[i].mass);
					this.dx = (this.mass * this.dx + points[i].mass * points[i].dx) / (this.mass + points[i].mass);
					this.dy = (this.mass * this.dy + points[i].mass * points[i].dy) / (this.mass + points[i].mass);
					this.mass += points[i].mass;
					points.splice(i, 1);
				}
				else{
					force = g*points[i].mass**3/(dist2);
					//console.log(force.toString());

					alpha=angle(this.x,this.y,points[i].x,points[i].y);
					//console.log(angle(this.x,this.y,points[i].x,points[i].y).toString());

					this.dx += force * Math.cos(alpha);
					this.dy += force * Math.sin(alpha);
				}
			}
		}
		if (!dt)
			dt = 1;

		this.x += this.dx * dt;
		this.y += this.dy * dt;
	}
}

function angle(Xa,Ya,Xb,Yb){
	var angle=Math.atan(Math.abs((Yb-Ya)/(Xb-Xa)));
	sx=(Xb-Xa)/Math.abs(Xb-Xa);
	sy=(Yb-Ya)/Math.abs(Yb-Ya);
	if (sx == -1 && sy == 1) angle=Math.PI-angle;
	else if (sx == -1 && sy == -1) angle += Math.PI;
	else if (sx == 1 && sy == -1) angle = 2*Math.PI-angle;
	return angle;
}



var points = [];

initialize();
animate();


function clear(){
	context.clearRect(0,0,width,height);
	context.fillStyle = "black";
	context.fillRect(0,0,width,height);
}

function focus(){
	averageX = 0, averageY = 0, M = 0;
	for (var i = 0; i<points.length; i++){
		averageX += points[i].x*points[i].mass;
		averageY += points[i].y*points[i].mass;
		M+=points[i].mass;
	}
	averageX /= M;
	averageY /= M;

	averageX -= window.innerWidth/2;
	averageY -= window.innerHeight/2;

	for (var i = 0; i < points.length; i++){
		points[i].x -= averageX;
		points[i].y -= averageY;

		if(points[i].x >= 2*window.innerWidth || points[i].x <= -window.innerWidth || points[i].y >= 2*window.innerHeight || points[i].y <= -window.innerHeight){
			points.splice(i,1);
		}
	}
}

function initialize(){
	for (var i = 0; i < nb; i++) {
		points[i] = new Point(Math.round(Math.random()*width),Math.round(Math.random()*height),Math.random()*size);
	}
}

function draw(){
	clear();
	for (var i = 0; i <points.length; i++) {
		points[i].draw();
	}

	context.fillText(points.length.toString()+" planets",width-60,height-10);
}

function update(){
	for (var i = 0; i < points.length; i++) {
		points[i].update();
	}

	focus();
}

var t1, t2, delay, first_delay;
function animate() {
	t2 = t1;
	t1 = new Date().getTime();
	delay = t1 - t2;
	dt = delay**2 / fluidity**2;
	console.log("cycle-time: " + delay);
	requestAnimationFrame(animate);

	draw();
	update();
}