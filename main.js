const FPS = 30;
const WIDTH = 1600;
const HEIGHT = 800;
const JOINT_RADIUS = 10;
const LINE_WIDTH = 5;
const IK_TOLERANCE = 0.1;
const IK_ITER = 1000;
const BACKGROUND_COLOR = "#181818";
const JOINT_COLOR = "#fbf1c7";
let MOUSE_POSITION = null;
let RUNNING = false;

class Joint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.fillStyle = JOINT_COLOR;
        ctx.beginPath();
        ctx.arc(this.x, this.y, JOINT_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawConn(ctx, other) {
        ctx.strokeStyle = JOINT_COLOR;
        ctx.lineWidth = LINE_WIDTH;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
    }

    distance(other) {
        return Math.sqrt((other.x - this.x) * (other.x - this.x) + (other.y - this.y) * (other.y - this.y));
    }
}

const JOINTS = [new Joint(100, 100), new Joint(200, 300), new Joint(300, 500)];

const rootDiv = document.getElementById("root");

const canvas = document.createElement("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;
rootDiv.appendChild(canvas);

canvas.addEventListener("mousemove", updateMousePosition, false);
document.addEventListener("keyup", handleKeyUp, false);
canvas.addEventListener("mouseup", appendNewJoint, false);

function updateMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    MOUSE_POSITION = [event.pageX - rect.left, event.pageY - rect.top];
}
function handleKeyUp(event) {
    if (event.key == " " ||
        event.code == "Space" ||
        event.keyCode == 32
    ) {
        RUNNING = !RUNNING;
    }

    if (event.key == "Backspace") {
        JOINTS.pop();
    }
}

function appendNewJoint() {
    if (MOUSE_POSITION !== null) {
        JOINTS.push(new Joint(MOUSE_POSITION[0], MOUSE_POSITION[1]));
    }
}

const ctx = canvas.getContext("2d");

function FABRIK(joints, target, { tol, iter }) {
    if (joints.length <= 1) {
        return;
    }

    const distances = joints.slice(1).map((joint, idx) => joint.distance(joints[idx]));
    const dist = joints[0].distance(target);

    if (dist > distances.reduce((previous, current) => previous + current, 0)) {
        // The target is unreachable
        for (let i = 0; i < joints.length - 1; i++) {
            // Find the distance r i between the target t and the joint
            const rI = target.distance(joints[i]);
            const lambdaI = distances[i] / rI;
            // Find the new joint positions pi
            joints[i + 1].x = (1 - lambdaI) * joints[i].x + lambdaI * target.x;
            joints[i + 1].y = (1 - lambdaI) * joints[i].y + lambdaI * target.y;
        }
    } else {
        // The target is reachable; thus, set as b the initial position of the joint p1
        const b = new Joint(joints[0].x, joints[0].y);

        // Check whether the distance between the end effector pn and the target t is greater than a tolerance.
        let difA = target.distance(joints[joints.length - 1]);
        let it = 0;
        while (difA > tol && it < iter) {
            it += 1;

            // STAGE 1: FORWARD REACHING
            // Set the end effector pn as target t
            joints[joints.length - 1].x = target.x;
            joints[joints.length - 1].y = target.y;

            for (let i = joints.length - 2; i >= 0; i--) {
                // Find the distance r i between the new joint position pi+1 and the joint pi
                const rI = joints[i + 1].distance(joints[i]);
                const lambdaI = distances[i] / rI;
                // Find the new joint positions pi.
                joints[i].x = (1 - lambdaI) * joints[i + 1].x + lambdaI * joints[i].x;
                joints[i].y = (1 - lambdaI) * joints[i + 1].y + lambdaI * joints[i].y;
            }

            // STAGE 2: BACKWARD REACHING
            // Set the root p1 its initial position
            joints[0].x = b.x;
            joints[0].y = b.y;

            for (let i = 0; i < joints.length - 1; i++) {
                // ind the distance ri between the new joint position pi
                const rI = joints[i + 1].distance(joints[i]);
                const lambdaI = distances[i] / rI;
                // Find the new joint positions pi.
                joints[i + 1].x = (1 - lambdaI) * joints[i].x + lambdaI * joints[i + 1].x;
                joints[i + 1].y = (1 - lambdaI) * joints[i].y + lambdaI * joints[i + 1].y;
            }

            difA = target.distance(joints[joints.length - 1]);
        }
    }
}

function drawFrame() {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    JOINTS.forEach((joint, idx) => {
        joint.draw(ctx);
        if (idx > 0) { joint.drawConn(ctx, JOINTS[idx - 1]); }
    });

    if (MOUSE_POSITION !== null && RUNNING) {
        const target = new Joint(MOUSE_POSITION[0], MOUSE_POSITION[1]);
        FABRIK(JOINTS, target, { tol: IK_TOLERANCE, iter: IK_TOLERANCE });
    }
}

function step(timeStamp) {
    drawFrame();

    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
