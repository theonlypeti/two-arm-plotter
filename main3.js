const WIDTH = 1600;
const HEIGHT = 800;
const LINE_WIDTH = 5;
let MOUSE_POSITION = null;

const rootDiv = document.getElementById("root");
const canvas = document.createElement("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;
rootDiv.appendChild(canvas);
const ctx = canvas.getContext("2d");

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const POINTS = [new Point(400, 300), new Point(500, 400), new Point(600,500)];


function updateMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    MOUSE_POSITION = [event.pageX - rect.left, event.pageY - rect.top];
}

canvas.addEventListener("mousemove", updateMousePosition, false);



class Arm {
    constructor(startJoint, endJoint) {
        this.startJoint = startJoint;
        this.endJoint = endJoint;
        this.length = Math.sqrt((startJoint.x - endJoint.x) * (startJoint.x - endJoint.x) + (startJoint.y - endJoint.y) * (startJoint.y - endJoint.y));
    }

    // Get the current angle of this arm
    getAngle() {
        return Math.atan2(
            this.endJoint.y - this.startJoint.y,
            this.endJoint.x - this.startJoint.x
        );
    }

    // Position the end joint based on an angle from the start joint
    setAngle(angle) {
        this.endJoint.x = this.startJoint.x + Math.cos(angle) * this.length;
        this.endJoint.y = this.startJoint.y + Math.sin(angle) * this.length;
    }

    // Draw the arm
    draw(ctx) {
        ctx.strokeStyle = "#fbf1c7";
        ctx.lineWidth = LINE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(this.startJoint.x, this.startJoint.y);
        ctx.lineTo(this.endJoint.x, this.endJoint.y);
        ctx.stroke();
    }
}

// Create arms from joints
const ARMS = [];
for (let i = 0; i < POINTS.length - 1; i++) {
    ARMS.push(new Arm(POINTS[i], POINTS[i+1]));
}


// Convert radians to degrees for display
function radToDeg(rad) {
    return Math.round((rad * 180 / Math.PI + 360) % 360);
}

function displayCoordinates(ctx) {
    // Set up text display properties
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";

    const padding = 20;
    let y = padding;
    const lineHeight = 20;

    // Display anchor point coordinates
    const anchor = ARMS[0].startJoint;
    ctx.fillText(`Anchor: (${Math.round(anchor.x)}, ${Math.round(anchor.y)})`, padding, y);
    y += lineHeight;

    // Display end point coordinates
    const end = ARMS[ARMS.length-1].endJoint;
    ctx.fillText(`End: (${Math.round(end.x)}, ${Math.round(end.y)})`, padding, y);
    y += lineHeight;

    // Display target coordinates if available
    if (MOUSE_POSITION !== null) {
        ctx.fillText(`Target: (${Math.round(MOUSE_POSITION[0])}, ${Math.round(MOUSE_POSITION[1])})`, padding, y);
    }
}

function drawFrame() {
    ctx.fillStyle = "#100707";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ARMS.forEach((arm) => {
        arm.draw(ctx);

        // Display arm angle
        const angle = arm.getAngle();
        const degrees = radToDeg(angle);
        const midX = (arm.startJoint.x + arm.endJoint.x) / 2;
        const midY = (arm.startJoint.y + arm.endJoint.y) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.fillText(`${degrees}°`, midX + 15, midY - 10);
    });
    // Display coordinates in corner
    displayCoordinates(ctx);

    // Position arms if target is available
    if (MOUSE_POSITION !== null) {
        const target = new Point(MOUSE_POSITION[0], MOUSE_POSITION[1]);
        positionWithArms(ARMS, target);
    }
}

function step() {
    drawFrame();
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
