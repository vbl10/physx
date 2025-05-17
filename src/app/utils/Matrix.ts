import { Vector } from "./Vector";

export class Matrix {
    public mem: number[]; 
    public shape: {I: number, J: number}
    constructor(
        mem: number[] | null = null,
        dim: {I: number, J: number}
    ) {
        this.shape = dim;
        if (mem) this.mem = mem;
        else {
            this.mem = [];
            for (let i = 0; i < this.shape.J*this.shape.I; i++)
                this.mem.push(0);
        }
    }
    
    static makeVector2d(vec: Vector | number) {
        const out = new Matrix(null, {J: 1, I: 3});
        if (typeof vec == 'number') vec = new Vector(vec, vec);
        out.mem[0] = vec.x;
        out.mem[1] = vec.y;
        out.mem[2] = 1;
        return out;
    }
    static makeIdentity2d() {
        const out = new Matrix(null, {J: 3, I: 3});
        out.mem[0] = 1;
        out.mem[4] = 1;
        out.mem[8] = 1;
        return out;
    }
    static makeTranslation2d(translation: Vector | number) {
        const out = new Matrix(null, {J: 3, I: 3});
        if (typeof translation == 'number') translation = new Vector(translation, translation);
        out.mem[0] = 1;
        out.mem[2] = translation.x;
        out.mem[4] = 1;
        out.mem[5] = translation.y;
        out.mem[8] = 1;
        return out;
    }
    static makeScale2d(scale: Vector | number) {
        const out = new Matrix(null, {J: 3, I: 3});
        if (typeof scale == 'number') scale = new Vector(scale, scale);
        out.mem[0] = scale.x;
        out.mem[4] = scale.y;
        out.mem[8] = 1;
        return out;
    }
    static makeRotation2d(angle: number) {
        const out = new Matrix(null, {J: 3, I: 3});
        out.mem[0] = Math.cos(angle);
        out.mem[1] = -Math.sin(angle);
        out.mem[3] = Math.sin(angle);
        out.mem[4] = Math.cos(angle);
        out.mem[8] = 1;
        return out;
    }

    translate2d(translation: Vector | number) {
        return this.mult(Matrix.makeTranslation2d(translation));
    }
    scale2d(scale: Vector | number) {
        return this.mult(Matrix.makeScale2d(scale));
    }
    rotate2d(angle: number) {
        return this.mult(Matrix.makeRotation2d(angle));
    }
    

    toVector2d() {
        return new Vector(this.mem[0], this.mem[1]);
    }

    broadcast(n: number) {
        const out = new Matrix(null, this.shape.J == 1 ? {J: n, I: this.shape.I} : {J: this.shape.J, I: n});
        for (let i = 0; i < out.shape.I; i++) 
            for (let j = 0; j < out.shape.J; j++)
                out.mem[i * out.shape.J + j] = this.mem[(i % this.shape.I) * this.shape.J + (j % this.shape.J)]
        return out;
    }

    mult(other: Matrix | number) {
        if (typeof other == 'number') {
            const out = new Matrix(null, {J: this.shape.J, I: this.shape.I});
            for (let i = 0; i < this.shape.J * this.shape.I; i++) {
                out.mem[i] = this.mem[i] * other;
            }
            return out;
        }
        else {
            if (this.shape.J != other.shape.I) throw new Error("Can't multiply matricies: dimension mismatch");
    
            const out = new Matrix(null, {J: other.shape.J, I: this.shape.I});
    
            const len = this.shape.J;
            for (let i = 0; i < this.shape.I; i++) {
                for (let j = 0; j < other.shape.J; j++) {
                    let elmt = 0;
                    for (let k = 0; k < len; k++) {
                        elmt += this.mem[i * this.shape.J + k] * other.mem[k * other.shape.J + j];
                    }
                    out.mem[i * out.shape.J + j] = elmt;
                }
            }
            return out;
        }
    }
    div(other: Matrix | number) {
        if (typeof other == 'number') {
            const out = new Matrix(null, {J: this.shape.J, I: this.shape.I});
            for (let i = 0; i < this.shape.J * this.shape.I; i++) {
                out.mem[i] = this.mem[i] / other;
            }
            return out;
        }
        else {
            if (this.shape.J != other.shape.I) throw new Error("Can't multiply matricies: dimension mismatch");
    
            const out = new Matrix(null, {J: other.shape.J, I: this.shape.I});
            out.mem = [];
    
            const len = this.shape.J;
            for (let i = 0; i < this.shape.I; i++) {
                for (let j = 0; j < other.shape.J; j++) {
                    let elmt = 0;
                    for (let k = 0; k < len; k++) {
                        elmt += this.mem[i * this.shape.J + k] / other.mem[k * other.shape.J + j];
                    }
                    out.mem;
                }
            }
            return out;
        }
    }
    add(other: Matrix | number) {
        let out = new Matrix(null, {J: this.shape.J, I: this.shape.I});
        if (typeof other == 'number') {
            for (let i = 0; i < this.shape.J*this.shape.I; i++)
                out.mem[i] = this.mem[i] + other;
        }
        else {
            if (other.shape.J == 1 && this.shape.I == other.shape.I)
                other = other.broadcast(this.shape.J);
            else if (other.shape.I == 1 && this.shape.J == other.shape.J)
                other = other.broadcast(this.shape.I);
            else
                throw new Error("Can't add matricies: dimension mismatch");

            for (let i = 0; i < this.shape.I; i++)
                for (let j = 0; j < this.shape.J; j++)
                    out.mem[i * this.shape.J + j] = this.mem[i * this.shape.J + j] + other.mem[i * other.shape.J + j];
        }
        return out;
    }
    minor(_i: number, _j: number) {
        if (this.shape.J != this.shape.I) throw new Error("Can't calculate minor: must be a square matrix");

        const minor = new Matrix(null, {J: this.shape.J - 1, I: this.shape.I - 1});
		for (let i = 0, k = 0; i < this.shape.J; i++) {
			if (i != _i) {
				for (let j = 0, l = 0; j < this.shape.I; j++) {
					if (j != _j) {
						minor.mem[k * minor.shape.J + l] = this.mem[i * this.shape.J + j];
						l++;
					}
				}
				k++;
			}
		}
		return minor;
    }
    det() {
        if (this.shape.J != this.shape.I) throw new Error("Can't calculate determinant: must be a square matrix");

        if (this.shape.J == 0) return 1;
        else if (this.shape.J == 1) return this.mem[0];
        else if (this.shape.J == 2) return this.mem[0] * this.mem[3] - this.mem[1] * this.mem[2];
        else {
            let det = 0.0;
            for (let j = 0; j < this.shape.J; j++)
            {
                det += this.mem[j] * (((j + 1) % 2) * 2 - 1) * this.minor(0, j).det();
            }
            return det;
        }
    }
    transposed() {
        const out = new Matrix(null, {J: this.shape.I, I: this.shape.J});
        for (let i = 0; i < this.shape.I; i++) {
            for (let j = 0; j < this.shape.J; j++) {
                out.mem[j * out.shape.J + i] = this.mem[i * this.shape.J + j];
            }
        }
        return out;
    }
    cofactors() {
        if (this.shape.J != this.shape.I) throw new Error("Can't calculate cofactors: must be a square matrix");

        const out = new Matrix(null, {J: this.shape.J, I: this.shape.I});

        for (let i = 0; i < this.shape.I; i++) {
            for (let j = 0; j < this.shape.J; j++) {
                out.mem[i * this.shape.J + j] = this.minor(i, j).det() * (((i + j + 1) % 2) * 2 - 1);
            }
        }
        return out;
    }
    inv() {
        return this.cofactors().transposed().div(this.det());
    }
    tanh() {
        const out = new Matrix(null, {J: this.shape.J, I: this.shape.I});
        for (let i = 0; i < out.shape.J * out.shape.I; i++)
            out.mem[i] = Math.tanh(this.mem[i]);
        return out;
    }
    sotfmax() {
        const out = new Matrix(null, {J: this.shape.J, I: this.shape.I});
        const max = Math.max(...this.mem);
        let acc = 0;
        for (let i = 0; i < out.shape.J * out.shape.I; i++) {
            out.mem[i] = Math.exp(this.mem[i] - max);
            acc += out.mem[i];
        }
        for (let i = 0; i < out.shape.J * out.shape.I; i++) {
            out.mem[i] /= acc;
        }
        return out;
    }
}