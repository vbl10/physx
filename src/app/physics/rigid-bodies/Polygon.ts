import { Matrix } from "../../utils/Matrix";
import { RigidBody } from "./RigidBody";
import { Vector } from "../../utils/Vector";

export class Polygon extends RigidBody {
    private verts: Vector[];
    constructor(
        private model: Vector[],
    ) {
        super();

        this.verts = [];
        for (let v of model) {
            this.verts.push(v.clone());
            this.pos.add(v);
        }
        this.pos.div(model.length);
        for (let v of this.model) {
            v.sub(this.pos);
        }
    }

    updateMesh() {
        const mat = Matrix.makeTranslation2d(this.pos).rotate2d(this.angle);
        for (let i = 0 ; i < this.verts.length; i++) {
            this.verts[i].copy(mat.mult(this.model[i].mat()).toVector2d());
        }
    }

    override support(dir: Vector): Vector {
        const furthest = this.verts[0].clone().sub(this.pos);
        let furthestDot = furthest.dot(dir);
        for (let i = 1; i < this.verts.length; i++) {
            const p = this.verts[i].clone().sub(this.pos);
            const dot = p.dot(dir);
            if (dot > furthestDot) {
                furthest.copy(p);
                furthestDot = dot;
            }
        }
        return furthest.add(this.pos);
    }

    override draw(ctx: CanvasRenderingContext2D) {
        this.updateMesh();

        ctx.beginPath();
        ctx.moveTo(this.verts[0].x, this.verts[0].y);
        for (let i = 1; i < this.verts.length; i++) {
            ctx.lineTo(this.verts[i].x, this.verts[i].y);
        }
        ctx.closePath();
        ctx.fill();
    }
}