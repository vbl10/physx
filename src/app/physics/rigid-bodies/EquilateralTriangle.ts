import { Vector } from "../../utils/Vector";
import { Polygon } from "./Polygon";

export class EquilateralTriangle extends Polygon {
    constructor(
        l: number
    ) {
        const r = l / 2 / Math.cos(Math.PI / 6);
        super(
            [0, 1, 2].map((i) => (new Vector(Math.cos(i * 2 * Math.PI / 3), Math.sin(i * 2 * Math.PI / 3))).mult(r))
        );
    }
}