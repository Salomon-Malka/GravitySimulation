var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	width = window.innerWidth,
	height = window.innerHeight;

canvas.width = width;
canvas.height = height;

var nb = 1000, size = 1, g = 0.5, fluidity = 200;
var r2, rx, ry, dt, M, averageX, averageY, force, points = [];

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
			rx = points[i].x-this.x; 
			ry = points[i].y-this.y;
			r2 = rx**2+ry**2;
			if (r2!=0){
				//Merge two stars when they collide
				if(Math.sqrt(r2)<=Math.sqrt(this.mass)+Math.sqrt(points[i].mass)){
					this.x = (this.x * this.mass + points[i].x * points[i].mass) / (this.mass + points[i].mass);
					this.y = (this.y * this.mass + points[i].y * points[i].mass) / (this.mass + points[i].mass);
					this.dx = (this.mass * this.dx + points[i].mass * points[i].dx) / (this.mass + points[i].mass);
					this.dy = (this.mass * this.dy + points[i].mass * points[i].dy) / (this.mass + points[i].mass);
					this.mass += points[i].mass;
					points.splice(i, 1);
				}
				//Calculate the force applied by the other stars
				else{
					force = g*points[i].mass**3/r2;
					this.dx += force * rx/(r2**(1/2));
					this.dy += force * ry/(r2**(1/2));
				}
			}
		}

		//dt is responsible for the speed and thus the accuracy of the simulation
		//It is proportional to the speed on a frame in the computer
		if (!dt) dt = 1;

		//Apply the force to the movement
		this.x += this.dx * dt;
		this.y += this.dy * dt;
	}
}


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
	//calculate the delay between two frame and compute dt as a function of the fluidity variable
	t2 = t1;
	t1 = new Date().getTime();
	delay = t1 - t2;
	dt = delay**2 / fluidity**2;
	console.log("cycle-time: " + delay);

	draw();
	update();

	
	requestAnimationFrame(animate);
}