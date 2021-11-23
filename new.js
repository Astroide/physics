class Vector {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = 2n;
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

    /** @param {Vector} other */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /** @param {Vector} other */
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /** @param {number} val */
    mul(val) {
        this.x *= val;
        this.y *= val;
        return this;
    }

    /** @param {Vector} other */
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

class Body {
    /**
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} mass Mass of this body
     * @param {number} size Radius in pixels
     */
    constructor(x, y, mass, size) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.size = size || 10;
    }
}