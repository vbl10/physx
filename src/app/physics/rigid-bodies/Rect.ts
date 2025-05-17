import { Polygon } from "./Polygon";
import { Vector } from "../../utils/Vector";

export class Rect extends Polygon {
    
    constructor(
        dim: Vector
    ) {
        super([
            new Vector(-dim.x/2,-dim.y/2),
            new Vector(+dim.x/2,-dim.y/2),
            new Vector(+dim.x/2,+dim.y/2),
            new Vector(-dim.x/2,+dim.y/2),
        ]);
    }
}