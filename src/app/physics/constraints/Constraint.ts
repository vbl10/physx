import { RigidBody } from "../rigid-bodies/RigidBody";

export interface Constraint {
    solve(rigidBody: RigidBody, dt: number): void;
    draw?: (rigidBody: RigidBody, ctx: CanvasRenderingContext2D) => void;
};