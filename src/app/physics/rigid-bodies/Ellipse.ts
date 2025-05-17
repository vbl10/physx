import { Matrix } from "../../utils/Matrix";
import { Vector } from "../../utils/Vector";
import { RigidBody } from "./RigidBody";

export class Ellipse extends RigidBody {
    constructor(
        private a = 1,
        private b = 1,
    ) {
        super();
    }

    override support(dir: Vector): Vector {
        const p = (t: number) => {
            return new Vector(this.a * Math.cos(t), this.b * Math.sin(t));
        }
        const dirR = Matrix.makeRotation2d(-this.angle).mult(dir.mat()).toVector2d();
        if (dirR.x == 1) {
            return Matrix.makeRotation2d(this.angle)
                .mult((new Vector(this.a, 0)).mat())
                .toVector2d()
                .add(this.pos);
        }
        else {
            const t0 = Math.atan(this.b/this.a * dirR.y/dirR.x) + (dirR.x < 0 ? Math.PI : 0);
            return Matrix.makeRotation2d(this.angle)
                .mult(p(t0).mat())
                .toVector2d()
                .add(this.pos);
        }
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.ellipse(this.pos.x, this.pos.y, this.a, this.b, this.angle, 0, Math.PI*2);
        ctx.fill();
    }
}