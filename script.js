class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    set magnitude(magnitude) {
        const oldMagnitude = this.magnitude;
        if (oldMagnitude === 0) {
            this.x = 0;
            this.y = 0;
        } else {
            const ratio = magnitude / oldMagnitude;
            this.x *= ratio;
            this.y *= ratio;
        }
    }

    normalize() {
        let magnitude = this.magnitude;
        this.x /= magnitude;
        this.y /= magnitude;
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }
}

class Thing {
    constructor(x, y, mass) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.velocity = new Vector(0, 0);
        this.id = Math.floor(Math.random() * 100000);
        this.color = 0;
        while (this.color < 50) {
            this.color = Math.floor(Math.random() * 0xFFFFFF);
        }
        this.radius = Math.sqrt((this.mass / 100000) / Math.PI);
    }

    draw(ctx) {
        this.radius = Math.sqrt((this.mass / 100000) / Math.PI);
        // ctx.fillStyle = this.mass == 10 ? 'blue' : 'red';
        ctx.fillStyle = '#' + this.color.toString(16).padStart('0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.fixed ? 10 : this.radius, 0, 2 * Math.PI);
        ctx.fill();
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        if (this.fixed) return;
        ctx.strokeStyle = 'limegreen';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(angle) * this.velocity.magnitude / 2e6, this.y + Math.sin(angle) * this.velocity.magnitude / 2e6);
        ctx.stroke();
    }

    clone() {
        let t = new Thing(this.x, this.y, this.mass);
        t.velocity = new Vector(this.velocity.x, this.velocity.y);
        t.id = this.id;
        t.fixed = this.fixed;
        t.color = this.color;
        return t;
    }
}

let bodies = [
    // new Thing(250, 250, 5.972e6),
];
// bodies[0].fixed = true;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
for (let i = 0; i < 45; i++) {
    let b = new Thing(Math.random() * canvas.width, Math.random() * canvas.height, 1000000);
    const angle = Math.atan2(250 - b.y, 250 - b.x) + Math.PI / 2;
    b.velocity = new Vector(Math.cos(angle) / 2, Math.sin(angle) / 2);
    // bodies.push(b);
}

// addEventListener('click', e => {
//     const b = canvas.getBoundingClientRect();
//     e.clientX -= b.left;
//     e.clientY -= b.top;
//     bodies.push(new Thing(e.clientX, e.clientY, 10000));
//     bodies.slice(-1)[0].velocity = new Vector(0.25, 0);
//     bodies.slice(-1)[0].velocity.normalize();
// });


/**
 * @param {Thing} a
 * @param {Thing} b
 */
function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
let mousePressed = false;
let startX = 0;
let startY = 0;

addEventListener('mousedown', e => {
    startX = e.pageX;
    startY = e.pageY;
    mousePressed = true;
});

addEventListener('mouseup', e => {
    mousePressed = false;
    if (x) {
        let vec = new Vector(startX - e.pageX, startY - e.pageY);
        vec.normalize();
        vec.x *= -20000 * (distance(new Vector(startX, startY), new Vector(e.pageX, e.pageY)) / 75);
        vec.y *= -20000 * (distance(new Vector(startX, startY), new Vector(e.pageX, e.pageY)) / 75);
        for (let i = 0; i < 10; i++) {
            let b = new Thing(startX + Math.random() * 50 - 25, startY + Math.random() * 50 - 25, 20000);
            b.velocity = new Vector(vec.x, vec.y);
            bodies.push(b);
        }
    } else {
        let size = distance(new Vector(startX, startY), new Vector(e.pageX, e.pageY));
        size *= size;
        size *= Math.PI;
        size *= 100000;
        let body = new Thing(startX, startY, size);
        bodies.push(body);
        let vec = new Vector(body.x - e.pageX, body.y - e.pageY);
        vec.normalize();
        vec.x *= -body.mass;
        vec.y *= -body.mass;
        if (e.shiftKey) {
            vec.x *= 2;
            vec.y *= 2;
        }
        if (e.metaKey) {
            vec.x *= 2;
            vec.y *= 2;
        }
        if (e.altKey) {
            body.fixed = true;
        }
        body.velocity = vec;
    }
});

let mouseX = 0;
let mouseY = 0;
let meta, alt, shift, x;
addEventListener('mousemove', e => {
    mouseX = e.pageX;
    mouseY = e.pageY;
    meta = e.metaKey;
    alt = e.altKey;
    shift = e.shiftKey;
    // bodies[0].x = mouseX;
    // bodies[0].y = mouseY;
});
addEventListener('keydown', e => {
    console.log(e.key);
    if (e.key.toLowerCase() == 'x') {
        x = true;
    }
});
addEventListener('keyup', e => {
    if (e.key.toLowerCase() == 'x') {
        x = false;
    }
});
let fps = 60;
let lastTime = Date.now();
let paused = false;
addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'p') {
        paused = !paused;
    }
});
function main() {
    // if (bodies.length < 2) {
    // return;
    // }
    ctx.fillStyle = `#00000004`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // let
    // ctx.translate(canvas.width / 2, canvas.height / 2);
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    const newBodies = bodies.map(x => x.clone());
    let dead = [];
    newBodies.forEach(body => {
        if (paused) return;
        if (dead.includes(body.id)) {
            return;
        }
        if (!body.fixed) {
            body.x += body.velocity.x / body.mass;
            body.y += body.velocity.y / body.mass;
        }
        //console.log(">" + body.velocity.x);
        bodies.forEach(other => {
            if (other.id == body.id || dead.includes(other.id)) {
                // //console.log('dupe');
                return;
            }
            let dir = new Vector(other.x - body.x, other.y - body.y);
            // console.log(dir.magnitude);
            let g = 6.67430e-11;
            let force = g * ((body.mass * other.mass) / ((distance(body, other) * 1e-3) ** 2));
            //console.log(force);
            // force *= this.mass / other.mass;
            force /= 50;
            dir.magnitude = force;
            // console.log(dir.magnitude);
            body.velocity = body.velocity.add(dir);
            if (distance(body, other) < (body.radius + other.radius)) {
                if ((body.fixed || other.fixed) || body.mass < other.mass) {
                    // ...
                } else {
                    body.velocity.x *= body.mass;
                    body.velocity.y *= body.mass;
                    other.velocity.x *= other.mass;
                    other.velocity.y *= other.mass;
                    body.velocity.add(other.velocity);
                    body.mass += other.mass;
                    body.velocity.x /= body.mass;
                    body.velocity.y /= body.mass;
                    dead.push(other.id);
                }
            }
        });
        // if (body.x >= canvas.width) {
        // body.x = 0;
        // } else if (body.x < 0) {
        // body.x = canvas.width - 1;
        // }

        // if (body.y >= canvas.height) {
        // body.y = 0;
        // } else if (body.y < 0) {
        // body.y = canvas.height - 1;
        // }
        if (body.x ** 2 + body.y ** 2 > (canvas.width + 200) ** 2) {
            body.dead = true;
        }
    });
    bodies = newBodies;
    bodies = bodies.filter(x => !dead.includes(x.id));
    bodies.forEach(body => {
        body.draw(ctx);
    });
    if (mousePressed) {
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'blue';
        if (!x) {
            let size = distance(new Vector(startX, startY), new Vector(mouseX, mouseY));
            ctx.beginPath();
            if (!alt) {
                ctx.moveTo(startX, startY);
            }
            ctx.lineWidth = 1 + (shift ? 1 : 0) + (meta ? 1 : 0);
            ctx.save();
            ctx.translate(startX, startY);
            ctx.rotate(Math.atan2(mouseY - startY, mouseX - startX));
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.lineWidth = 1;
            ctx.restore();
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouseX, mouseY);
            ctx.lineWidth = 1 + (shift ? 1 : 0) + (meta ? 1 : 0);
            ctx.stroke();
        }
    }
    fps *= 20;
    fps += 1000 / (Date.now() - lastTime);
    fps /= 21;
    lastTime = Date.now();
    ctx.fillStyle = 'black';
    ctx.clearRect(20, 10, 80, 20);
    ctx.fillText('FPS ' + Math.floor(fps) + (paused ? ' P' : ''), 20, 20);
    if (fps < 30) {
        debugger;
    }
    //console.log("!");
}
setInterval(main, Math.floor(1000 / 50));
