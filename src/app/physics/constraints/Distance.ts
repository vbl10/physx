import { Vector } from "../../utils/Vector";
import { RigidBody } from "../rigid-bodies/RigidBody";
import { Constraint } from "./Constraint";

class Distance implements Constraint {
    constructor(
        public anchor: Vector,
        public restLen: number,
    ) {
    }

    solve(rigidBody: RigidBody, dt: number): void {
    }

    draw(rigidBody: RigidBody, ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.strokeStyle = 'red';
        const worldToScreen = ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath();
        const A = worldToScreen.multiply(new DOMMatrix([0, 0, 0, 0, rigidBody.pos.x, rigidBody.pos.y]));
        const B = worldToScreen.multiply(new DOMMatrix([0, 0, 0, 0, this.anchor.x, this.anchor.y]));
        ctx.moveTo(A.e, A.f);
        ctx.lineTo(B.e, B.f);
        ctx.stroke();
        ctx.restore();
    }
}

export class DistanceToAnchor extends Distance {
    constructor(
        anchor: Vector,
        restLen: number,
        public compliance: number,
    ) {
        super(anchor, restLen);
    }

    override solve(rigidBody: RigidBody, dt: number): void {
        const alpha = this.compliance / dt / dt;
        const anchorToRigidBody = rigidBody.pos.clone().sub(this.anchor);
        const w = 1 / rigidBody.mass;
        const len = anchorToRigidBody.len();
        if (len == 0) return;
        const grad = anchorToRigidBody.clone().div(len);
        const C = len - this.restLen;
        const s = -C / (w + alpha);
        rigidBody.pos.add(grad.mult(s * w));
    }
}

export class DistanceToBody extends Distance {
    constructor(
        public targetBody: RigidBody,
        restLen: number,
        public compliance: number,
    ) {
        super(targetBody.pos, restLen);
    }

    override solve(body: RigidBody, dt: number): void {
        const alpha = this.compliance / dt / dt;
        const targetBodyToBody = body.pos.clone().sub(this.targetBody.pos);
        const w1 = 1 / body.mass;
        const w2 = 1 / this.targetBody.mass;
        const len = targetBodyToBody.len();
        if (len == 0) return;
        const grad = targetBodyToBody.clone().div(len);
        const C = len - this.restLen;
        const s = -C / (w1 + w2 + alpha);
        body.pos.add(grad.clone().mult(s * w1));
        this.targetBody.pos.add(grad.mult(-s * w2));
    }
}