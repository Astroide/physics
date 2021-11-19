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

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    set angle(angle) {
        let magnitude = this.magnitude;
        this.x = Math.cos(angle) * magnitude;
        this.y = Math.sin(angle) * magnitude;
    }

    normalize() {
        let magnitude = this.magnitude;
        this.x /= magnitude;
        this.y /= magnitude;
        return this;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    mul(val) {
        this.x *= val;
        this.y *= val;
        return this;
    }

    vmul(other) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    perpendicular() {
        return new Vector(-this.y, this.x);
    }
}

class Thing {
    constructor(x, y, mass) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.velocity = new Vector(0, 0);
        this.id = Math.floor(Math.random() * 100000);
        this.color = Math.floor(Math.random() * 360);
        this.gracePeriods = {

        };
    }

    get position() {
        return new Vector(this.x, this.y);
    }

    set position(position) {
        this.x = position.x;
        this.y = position.y;
    }

    get radius() {
        return this.radiusOverride || (this.fixed ? 10 : Math.sqrt((this.mass / 100000) / Math.PI));
    }

    draw(ctx) {
        // ctx.fillStyle = this.mass == 10 ? 'blue' : 'red';
        ctx.fillStyle = `hsl(${this.color}deg, 100%, 50%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.fixed ? 10 : this.radius, 0, 2 * Math.PI);
        ctx.fill();
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        if (this.fixed) return;
        ctx.strokeStyle = 'limegreen';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(angle) * this.velocity.magnitude * 20, this.y + Math.sin(angle) * this.velocity.magnitude * 20);
        ctx.stroke();
    }

    clone() {
        let t = new Thing(this.x, this.y, this.mass);
        t.velocity = new Vector(this.velocity.x, this.velocity.y);
        t.id = this.id;
        t.fixed = this.fixed;
        t.color = this.color;
        t.gracePeriods = this.gracePeriods;
        return t;
    }
}
/** @type {Thing[]} */
let bodies = [
    // new Thing(300, 300, 5.972e6),
];
// bodies[0].fixed = true;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const slowMotionInput = document.querySelector('#slow-motion');
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
for (let i = 0; i < 45; i++) {
    let b = new Thing(Math.random() * canvas.width, Math.random() * canvas.height, 1000000);
    const angle = Math.atan2(300 - b.y, 300 - b.x) + Math.PI / 2;
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
    if (e.pageX < canvas.width && e.pageY < canvas.height) {
        startX = e.pageX;
        startY = e.pageY;
        mousePressed = true;
    }
});

addEventListener('mouseup', e => {
    if (e.pageX < canvas.width && e.pageY < canvas.height) {
        if (distance(new Vector(startX, startY), new Vector(e.pageX, e.pageY)) != 0) {
            mousePressed = false;
            if (x) {
                let vec = new Vector(startX - e.pageX, startY - e.pageY);
                vec.normalize();
                vec.x *= -1 * (distance(new Vector(startX, startY), new Vector(e.pageX, e.pageY)) / 75);
                vec.y *= -1 * (distance(new Vector(startX, startY), new Vector(e.pageX, e.pageY)) / 75);
                for (let i = 0; i < 10; i++) {
                    let b = new Thing(startX + Math.random() * 50 - 25, startY + Math.random() * 50 - 25, 1000000);
                    b.velocity = new Vector(vec.x, vec.y);
                    b.velocity.x *= 10;
                    b.velocity.y *= 10;
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
                vec.x *= -1;
                vec.y *= -1;
                if (e.shiftKey) {
                    vec.x *= 2;
                    vec.y *= 2;
                }
                if (e.metaKey) {
                    vec.x *= 2;
                    vec.y *= 2;
                }
                if (a) vec = new Vector(0, 0);
                if (e.altKey) {
                    body.fixed = true;
                }
                body.velocity = vec;
            }
        }
    }
});

let mouseX = 0;
let mouseY = 0;
let meta, alt, shift, x, a, slowMotion;
addEventListener('mousemove', e => {
    if (e.pageX < canvas.width && e.pageY < canvas.height) {

        mouseX = e.pageX;
        mouseY = e.pageY;
        meta = e.metaKey;
        alt = e.altKey;
        shift = e.shiftKey;
        // bodies[0].x = mouseX;
        // bodies[0].y = mouseY;
    }
});
addEventListener('keydown', e => {
    console.log(e.key);
    if (e.key.toLowerCase() == 'x') {
        x = true;
    }
    if (e.key.toLowerCase() == 'a') {
        a = true;
    }
    if (e.key.toLowerCase() == 's') {
        slowMotion = !slowMotion;
    }
    if (e.key.toLowerCase() == 'c') {
        if (collisionMode == 'collide') {
            collisionMode = 'merge';
        } else if (collisionMode == 'merge') {
            collisionMode = 'none';
        } else {
            collisionMode = 'collide';
        }
    }
});
addEventListener('keyup', e => {
    if (e.key.toLowerCase() == 'x') {
        x = false;
    }
    if (e.key.toLowerCase() == 'a') {
        a = false;
    }
});
let fps = 60;
let lastTime = Date.now();
let paused = false;
let trail = true;
/** @type {'merge' | 'collide' | 'none'} */
let collisionMode = 'merge';
addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'p') {
        paused = !paused;
    } else if (e.key.toLowerCase() === 't') {
        trail = !trail;
    }
});
function interpolate(a, b, x) {
    return a + (b - a) * x;
}
/**
 * @param {Thing} body
 * @param {Thing} other
 * @param {number} angle
 */
function getNewSpeed(body, other, angle) {
    let v1 = body.velocity.magnitude;
    let v2 = other.velocity.magnitude;
    let o1 = body.velocity.angle;
    let o2 = other.velocity.angle;
    let m1 = body.mass;
    let m2 = other.mass;
    let v1x = ((v1 * Math.cos(o1 - angle) * (m1 - m2) + 2 * m2 * v2 * Math.cos(o2 - angle)) / (m1 + m2)) * Math.cos(angle) + v1 * Math.sin(o1 - angle) * Math.cos(angle + Math.PI / 2);
    let v1y = ((v1 * Math.cos(o1 - angle) * (m1 - m2) + 2 * m2 * v2 * Math.cos(o2 - angle)) / (m1 + m2)) * Math.sin(angle) + v1 * Math.sin(o1 - angle) * Math.sin(angle + Math.PI / 2);
    return new Vector(v1x, v1y);
}
function main() {
    // if (bodies.length < 2) {
    // return;
    // }
    ctx.fillStyle = trail ? `#00000004` : `#000000`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // let
    // ctx.translate(canvas.width / 2, canvas.height / 2);
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    const newBodies = bodies.map(x => x.clone());
    let dead = [];
    let newObjects = [];
    newBodies.forEach((body, index) => {
        if (paused) return;
        if (dead.includes(body.id)) {
            return;
        }
        for (let id in body.gracePeriods) {
            if (body.gracePeriods.hasOwnProperty(id)) {
                body.gracePeriods[id] -= slowMotion ? (1 / slowMotionInput.value) : 1;
                if (body.gracePeriods[id] <= 0) {
                    delete body.gracePeriods[id];
                }
            }
        }
        let oldBody = bodies[index];
        if (!body.fixed) {
            body.x += body.velocity.x / (slowMotion ? slowMotionInput.value : 1);
            body.y += body.velocity.y / (slowMotion ? slowMotionInput.value : 1);
        }
        //console.log(">" + body.velocity.x);
        bodies.forEach(other => {
            if (other.id == body.id || dead.includes(other.id) || ((body.gracePeriods[other.id] !== undefined && (body.gracePeriods[other.id] > 0)) || ((other.gracePeriods[body.id] !== undefined && (other.gracePeriods[body.id] > 0))))) {
                // //console.log('dupe');
                return;
            }
            let dir = new Vector(other.x - body.x, other.y - body.y);
            // console.log(dir.magnitude);
            let g = 6.67430e-11;
            let force = g * ((body.mass * other.mass) / ((distance(body, other) * 1e-3) ** 2));
            force = 0;
            //console.log(force);
            // force *= this.mass / other.mass;
            force /= 50;
            force /= body.mass;
            dir.magnitude = force / (slowMotion ? slowMotionInput.value : 1);
            // console.log(dir.magnitude);
            body.velocity = body.velocity.add(dir);
            if (distance(oldBody, other) < (oldBody.radius + other.radius) && (body.gracePeriods[other.id] === undefined || body.gracePeriods[other.id] <= 0)) {
                if ((oldBody.fixed || other.fixed) || (oldBody.mass < other.mass && collisionMode == 'merge')) {
                    // ...
                } else {
                    if (collisionMode == 'merge') {
                        oldBody.velocity.x *= body.mass;
                        oldBody.velocity.y *= body.mass;
                        other.velocity.x *= other.mass;
                        other.velocity.y *= other.mass;
                        body.velocity = oldBody.velocity.add(other.velocity);
                        body.mass += other.mass;
                        body.velocity.x /= body.mass;
                        body.velocity.y /= body.mass;
                        let impactPoint = other.position.sub(body.position).mul(body.radius / (body.radius + other.radius)).add(body.position);
                        // body.position = impactPoint;
                        let collisionSpeed = oldBody.velocity.sub(other.velocity).magnitude;
                        let partMass = 1e6;
                        if (collisionSpeed > 2 && (other.mass > 1e7 && oldBody.mass > 1e7)) {
                            let extra = body.mass / 100 * (collisionSpeed / 1e9);
                            body.mass -= extra;
                            // let radius = body.radius;
                            let count = extra / partMass;
                            let newThings = [];
                            for (let i = 0; i < count; i++) {
                                let newObject = new Thing(0, 0, partMass);
                                // console.log('size', radius, newObject.radius);
                                newObject.x = impactPoint.x; //+ Math.cos(Math.PI * 2 * i / count) * (radius + newObject.radius + 10);
                                newObject.y = impactPoint.y; //+ Math.sin(Math.PI * 2 * i / count) * (radius + newObject.radius + 10);
                                newObject.velocity = body.position.clone().sub(other.position).perpendicular().normalize().mul(Math.sign(Math.random() * 2 - 1)).mul(collisionSpeed / 1e9 * 10);
                                // newObject.velocity = (new Vector(Math.cos(Math.PI * 2 * i / count + (Math.random() / 1.1 - 0.5 / 1.1)) * 5 * collisionSpeed / 1e9, Math.sin(Math.PI * 2 * i / count + (Math.random() / 1.1 - 0.5 / 1.1)) * 5 * collisionSpeed / 1e9)).mul(1 - (Math.random() - 0.5) / 1.5).mul(0.8);
                                newObject.velocity.add(body.velocity);
                                newObject.velocity.angle += Math.random() / 1.5 - 1 / 3;
                                body.gracePeriods[newObject.id] = body.radius / 7;
                                for (let i = 0; i < newThings.length; i++) {
                                    const e = newThings[i];
                                    e.gracePeriods[newObject.id] = body.radius / 7;
                                    newObject.gracePeriods[e.id] = body.radius / 7;
                                }
                                newObjects.push(newObject);
                                newThings.push(newObject);
                            }
                        }
                        dead.push(other.id);
                    } else if (collisionMode == 'collide') {
                        // ...
                        console.log('collide');
                        let angle = Math.atan2(other.y - body.y, other.x - body.x);
                        let collisionVector = body.position.clone().sub(other.position).normalize().perpendicular();
                        // console.log(`${distance(body.x, body.y, other.x, other.y)} @@ ${body.radius + other.radius}`);
                        while (distance(body, other) <= (body.radius + other.radius)) {
                            body.x += Math.cos(angle + Math.PI);
                            body.y += Math.sin(angle + Math.PI);
                            other.x += Math.cos(angle);
                            other.y += Math.sin(angle);
                        }

                        body.velocity = getNewSpeed(other, body, collisionVector.angle);
                        body.velocity.angle += Math.PI;
                        other.velocity = getNewSpeed(other, body, collisionVector.angle);
                        other.velocity.angle += Math.PI;
                        let future = newBodies.find(x => x.id == other.id);
                        future.velocity = getNewSpeed(other, body, collisionVector.angle);
                        future.velocity.angle += Math.PI;
                        // let bodyImpactForce = (body.velocity.clone().mul(body.mass).add(other.velocity.clone().mul(other.mass))).mul(0.5);
                        // body.velocity.add(bodyImpactForce.clone().mul(1 / body.mass).vmul(collisionVector).mul(2));
                        // other.velocity.add(bodyImpactForce.clone().mul(1 / other.mass).vmul(collisionVector.mul(-1)).mul(2));
                    } else {
                        // Nothing to do, no collisions
                    }
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
        // if (body.x ** 2 + body.y ** 2 > (canvas.width + 200) ** 2) {
        // body.dead = true;
        // }
    });
    bodies = newBodies;
    bodies = bodies.concat(newObjects);
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
    ctx.clearRect(20, 10, 120, 15);
    ctx.fillText('FPS ' + Math.floor(fps) + (paused ? ' P' : '') + (slowMotion ? ' S ' + slowMotionInput.value : '') + (' (C: ' + collisionMode + ')'), 20, 20);
    if (fps < 30) {
        debugger;
    }
    //console.log("!");
}
setInterval(main, Math.floor(1000 / 50));
