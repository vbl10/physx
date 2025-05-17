import { Vector } from "../../utils/Vector";
import { RigidBody } from "./RigidBody";

export class Circle extends RigidBody {
    constructor(
        private radius: number = 0
    ) {
        super();
    }

    override support(dir: Vector): Vector {
        return dir.clone().mult(this.radius).add(this.pos);
    }

    override draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.pos.x + this.radius, this.pos.y);
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }
}