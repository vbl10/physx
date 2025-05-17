import { Matrix } from "../../utils/Matrix";
import { Vector } from "../../utils/Vector";
import { Constraint } from "../constraints/Constraint";

export class RigidBody {
    public readonly constraints: Constraint[] = []
    public readonly prevPos = new Vector();

    constructor(
        public readonly pos: Vector = new Vector(),
        public readonly vel: Vector = new Vector(),
        public readonly acc: Vector = new Vector(),
        public mass: number = 1,
        public angle: number = 0,
        public angularVel: number = 0,
        public angularAcc: number = 0,
        public inertia: number = 1,
    ) {
    }

    collides(other: RigidBody): boolean {
        return this.gjk(other) ? true : false;
    }

    contains(p: Vector): boolean {
        return this.gjk(p) ? true : false;
    }

    collide(other: RigidBody | Vector): { a: Vector, b: Vector, n: Vector, d: number } | null {
        const simplex = this.gjk(other);

        if (simplex) {
            return this.epa(other, simplex);
        }

        return null;
    }

    private supportDiff(dir: Vector, other: RigidBody | Vector) {
        const a = this.support(dir);
        const b = other instanceof RigidBody ? other.support(dir.clone().neg()) : other;
        const v = a.clone().sub(b);
        return {v, a, b}; 
    }

    private gjk(other: RigidBody | Vector): {v: Vector, a: Vector, b: Vector}[] | null {
        
        let dir = (other instanceof RigidBody ? other.pos : other).clone().sub(this.pos).perp().norm();
        let a = this.supportDiff(dir, other);

        dir = a.v.clone().neg().norm();
        let b = this.supportDiff(dir, other);
        
        let ab = b.v.clone().sub(a.v);
        if (ab.len2() == 0) return null;
        dir = ab.clone().tripleCrossProd(a.v.clone().neg(), ab).norm();
        let c = this.supportDiff(dir, other);

        while (true) {
            if (c.v.dot(dir) <= 0) {
                break;
            }
            else {
                // check simplex
                let bc = c.v.clone().sub(b.v);
                let ba = a.v.clone().sub(b.v);
                dir = bc.tripleCrossProd(ba, bc).norm();
                if (dir.dot(b.v) > 0) { // bc contains origin
                    a = c;
                    c = this.supportDiff(dir.neg(), other);
                }
                else {
                    let ca = a.v.clone().sub(c.v);
                    let cb = b.v.clone().sub(c.v);
                    dir = ca.tripleCrossProd(cb, ca).norm();
                    if (dir.dot(c.v) > 0) { //ca contains origin
                        b = c;
                        c = this.supportDiff(dir.neg(), other);
                    }
                    else {
                        return [a, b, c];
                    }
                }
            }
        }

        return null;
    }

    private epa(other: RigidBody | Vector, simplex: {v: Vector, a: Vector, b: Vector}[]): { a: Vector, b: Vector, n: Vector, d: number } {
        while (true) {
            // get normal of closest edge
            let closestEdge = 1;
            let closestDist = Number.MAX_VALUE;
            const closestNorm = new Vector();
            {
                for (let i = 1; i <= simplex.length; i++) {
                    const edge = simplex[i % simplex.length].v.clone().sub(simplex[i - 1].v);
                    const norm = edge.tripleCrossProd(simplex[i - 1].v, edge).norm();
                    const dist = norm.dot(simplex[i - 1].v);
                    if (dist < closestDist) {
                        closestNorm.copy(norm);
                        closestDist = dist;
                        closestEdge = i;
                    }
                }
            }

            // expand in that direction if possible
            const newVertex = this.supportDiff(closestNorm, other);
            if (newVertex.v.dot(closestNorm) - closestDist < 0.000001) {
                // get interpolation factor
                const edgeA = simplex[closestEdge % simplex.length];
                const edgeB = simplex[closestEdge - 1];
                const l = edgeA.v.clone().sub(edgeB.v);
                const alpha = edgeA.v.dot(l)/l.dot(l);

                // interpolate points that originated support points of closest edge to get collision points in global space
                const a = edgeA.a.clone().mult(1 - alpha).add(edgeB.a.clone().mult(alpha));
                const b = edgeA.b.clone().mult(1 - alpha).add(edgeB.b.clone().mult(alpha));
                return { a, b, n: closestNorm, d: closestDist };
            }
            else {
                // expand simplex in that direction
                simplex = simplex
                    .slice(0, closestEdge)
                    .concat(
                        this.supportDiff(closestNorm, other), 
                        simplex.slice(closestEdge)
                    );
            }
        }
    }

    support(dir: Vector): Vector {
        return new Vector();
    }

    draw(ctx: CanvasRenderingContext2D) {
    }
}