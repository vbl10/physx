import { Matrix } from "./Matrix";

export class Vector {
    constructor(
        public x = 0,
        public y = 0
    ) {
    }

    clone(): Vector {
        return new Vector(this.x, this.y);
    }
    copy(other: Vector): Vector {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    add(other: Vector | number): Vector {
        if (typeof other == 'number') other = new Vector(other, other);
        this.x += other.x; 
        this.y += other.y;
        return this;
    }
    sub(other: Vector | number): Vector {
        if (typeof other == 'number') other = new Vector(other, other);
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    mult(other: Vector | number): Vector {
        if (typeof other == 'number') other = new Vector(other, other);
        this.x *= other.x;
        this.y *= other.y;
        return this;
    }
    div(other: Vector | number): Vector {
        if (typeof other == 'number') other = new Vector(other, other);
        this.x /= other.x;
        this.y /= other.y;
        return this;
    }

    neg(): Vector {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    inv(): Vector {
        this.x = 1 / this.x;
        this.y = 1 / this.y;
        return this;
    }

    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }

    perp(): Vector {
        const aux = -this.y; 
        this.y = this.x;
        this.x = aux;
        return this;
    }

    tripleCrossProd(b: Vector, c: Vector): Vector {
        return this.copy(b.clone().mult(c.dot(this)).sub(this.clone().mult(c.dot(b))));
    }

    len2(): number {
        return this.dot(this);
    }
    len(): number {
        return Math.sqrt(this.len2());
    }

    norm(): Vector {
        return this.div(this.len());
    }

    mat(): Matrix {
        return new Matrix([this.x, this.y, 1], {I: 3, J: 1});
    }
};