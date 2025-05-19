import { RigidBody } from "./rigid-bodies/RigidBody";
import { Vector } from "../utils/Vector";
import { Polygon } from "./rigid-bodies/Polygon";
import { Circle } from "./rigid-bodies/Circle";
import { Keyboard } from "../utils/Keyboard";

export class Scene {
    public objects: RigidBody[] = [];
    
    constructor(
        public height: number = 100,
        public gravity: Vector = new Vector(0, 9.81),
        public drawConstraints = false,
    ) {
    }

    update(_dt: number, kbd: Keyboard) {
        let dt = 1/3600;
        const iters = Math.floor(_dt / dt);
        dt = _dt / iters;
        for (let iter = 0; iter < iters; iter++) {
            // pre solve
            for (let obj of this.objects) {
                obj.vel.add(obj.acc.clone().add(this.gravity).mult(dt));
                obj.prevPos.copy(obj.pos);
                obj.pos.add(obj.vel.clone().mult(dt));
                obj.angularVel += obj.angularAcc * dt;
                obj.angle += obj.angularVel * dt;
            }

            // solve
            for (let i = 0; i < this.objects.length; i++) {
                let one = this.objects[i];

                // collisions
                for (let j = i + 1; j < this.objects.length; j++) {
                    let other = this.objects[j];
                    if (one != other) {
                        const collision = one.collide(other);
                        if (collision) {
                            const alpha = 0.0001 / dt / dt;
                            const ba = collision.a.clone().sub(collision.b);
                            const w1 = 1 / one.mass;
                            const w2 = 1 / other.mass;
                            
                            if (collision.d > 0) {
                                const grad = ba.clone().div(collision.d);
                                const C = collision.d - 0;
                                const s = -C / (w1 + w2 + alpha);
                                
                                one.pos.add(grad.clone().mult(s * w1));
                                other.pos.add(grad.mult(-s * w2));
                            }
                        }
                    }
                }

                for (let constraint of one.constraints) {
                    constraint.solve(one, dt);
                }
            }

            // post solve
            for (let obj of this.objects) {
                // update velocity
                if (dt != 0)
                    obj.vel.copy(obj.pos.clone().sub(obj.prevPos).div(dt));
            }
        }
        return iters;
    }

    screenToWorld(ctx: CanvasRenderingContext2D, s: Vector): Vector {
        return s.clone().mult(this.height / ctx.canvas.height);
    }
    worldToScreen(ctx: CanvasRenderingContext2D, w: Vector): Vector {
        return w.clone().mult(ctx.canvas.height / this.height);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const scale = ctx.canvas.height / this.height;
        ctx.scale(scale, scale);
        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            ctx.save();
            for (let j = 0; j < this.objects.length; j++) {
                if (j != i) {
                    if (obj.collides(this.objects[j])) {
                        ctx.fillStyle = 'red';
                    }
                }
            }
            obj.draw(ctx);

            ctx.save();
            ctx.fillStyle = 'black';
            ctx.font = '30px sans-serif';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillText(i.toString(), obj.pos.x * scale, obj.pos.y * scale);
            ctx.restore();

            ctx.restore();
            if (this.drawConstraints) {
                for (let constraint of obj.constraints) {
                    if (constraint.draw) constraint.draw(obj, ctx);
                }
            }
        }
        ctx.restore();
    }
}