import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Keyboard } from './utils/Keyboard';
import { Vector } from './utils/Vector';
import { Circle } from './physics/rigid-bodies/Circle';
import { Scene } from './physics/Scene';
import { Polygon } from './physics/rigid-bodies/Polygon';
import { RigidBody } from './physics/rigid-bodies/RigidBody';
import { Ellipse } from './physics/rigid-bodies/Ellipse';
import { DistanceToAnchor, DistanceToBody } from './physics/constraints/Distance';
import { Rect } from './physics/rigid-bodies/Rect';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  
  @ViewChild('canvasElmt')
  canvasElmt!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private resizeObserver: ResizeObserver;
  private animationFrameId: number | null = null;
  private tp0 = 0;

  private scene: Scene;
  private grab: {
    obj?: RigidBody,
    constraint: DistanceToAnchor,
  } = {
    constraint: new DistanceToAnchor(new Vector(), 0, 0.1)
  };
  iterationsPerFrame = 0;

  private kbd = new Keyboard();

  collision: {
    a: Vector,
    b: Vector,
    n: Vector,
    d: number,
  } | null = null;

  constructor() {
    this.resizeObserver = new ResizeObserver(entries => {
      this.canvasElmt.nativeElement.width = entries[0].contentRect.width;
      this.canvasElmt.nativeElement.height = entries[0].contentRect.height;
      this.draw();
    });

    this.scene = new Scene(20);
    this.scene.drawConstraints = true;
    this.scene.gravity.y = 0;

    const p1 = new Polygon([
      new Vector(9, 9),
      new Vector(4, 11),
      new Vector(4, 5),
    ]);
    const p2 = new Polygon([
      new Vector(12, 7),
      new Vector(5, 7),
      new Vector(7, 3),
      new Vector(10, 2),
    ]);
    p2.pos.x += 5;

    const c1 = new Circle(1);
    c1.pos.x = 8;
    c1.pos.y = 12;
    
    const e1 = new Ellipse(2, 1);
    e1.pos.x = 10;
    e1.pos.y = 14;

    const c2 = new Circle(1);
    c2.pos.x = 15;
    c2.pos.y = 10;
    c2.mass = 10;

    const walls = [
      new Rect(new Vector(36, 0.1)),
      new Rect(new Vector(36, 0.1)),
      new Rect(new Vector(0.1, 19)),
      new Rect(new Vector(0.1, 19))
    ];
    walls[0].pos.x = 18;
    walls[0].pos.y = 0.05;
    walls[1].pos.x = 18;
    walls[1].pos.y = 19.95;
    walls[2].pos.x = 0.05;
    walls[2].pos.y = 10;
    walls[3].pos.x = 35.95;
    walls[3].pos.y = 10;
    walls.forEach(wall => wall.mass = Number.MAX_VALUE);

    p1.mass = Number.MAX_VALUE;
    p2.mass = Number.MAX_VALUE;
    e1.mass = Number.MAX_VALUE;

    c1.constraints.push(new DistanceToBody(c2, c1.pos.clone().sub(c2.pos).len(), 0));

    this.scene.objects.push(
      ...walls,
      p1, 
      p2,
      e1,
      c1,
      c2,
      ...[0, 1, 2, 3, 4].map(i => { const c = new Circle(1); c.pos.y = 2; c.pos.x = 2 + i * 2.1; return c;})
    );
  }

  ngAfterViewInit(): void {
    const container = this.canvasElmt.nativeElement.parentElement;
    if (!container) throw new Error("Canvas must have a container");
    this.resizeObserver.observe(container);

    const ctx = this.canvasElmt.nativeElement.getContext('2d');
    if (!ctx) throw new Error("Failed to get context from cavnas");
    this.ctx = ctx;

    this.canvasElmt.nativeElement.addEventListener('mousedown', (ev) => {
      const p = this.scene.screenToWorld(ctx, new Vector(ev.clientX, ev.clientY));
      for (let obj of this.scene.objects) {
        if (obj.contains(p)) {
          this.grab.obj = obj;
          this.grab.obj.constraints.push(this.grab.constraint);
          this.grab.constraint.anchor.copy(p);
          break;
        }
      }
    });
    this.canvasElmt.nativeElement.addEventListener('mouseup', () => {
      this.grab.obj?.constraints.splice(this.grab.obj.constraints.findIndex(val => val == this.grab.constraint), 1);
      this.grab.obj = undefined;
    });
    this.canvasElmt.nativeElement.addEventListener('mousemove', (ev) => {
      if (this.grab.obj) {
        this.grab.constraint.anchor.copy(this.scene.screenToWorld(ctx, new Vector(ev.clientX, ev.clientY)));
      }
    });

    this.kbd.bind(document.body);

    this.draw();
  }

  update(dt: number) {
    this.kbd.sync();

    if (this.grab.obj) {
      this.grab.obj.angularVel = 0;
      if (this.kbd.get('KeyM').held) {
        this.grab.obj.angularVel = 1;
      }
      else if (this.kbd.get('KeyN').held) {
        this.grab.obj.angularVel = -1;
      }
    }

    this.collision = null;
    for (let i = 0; i < this.scene.objects.length; i++) {
      for (let j = i + 1; j < this.scene.objects.length; j++) {
        this.collision = this.scene.objects[i].collide(this.scene.objects[j]);
        if (this.collision) {
          i = this.scene.objects.length;
          break;
        }
      }
    }

    this.iterationsPerFrame = this.scene.update(dt, this.kbd);
  }

  draw() {
    const w = this.canvasElmt.nativeElement.width;
    const h = this.canvasElmt.nativeElement.height;
    
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.fillStyle = 'yellow';
    this.scene.draw(this.ctx);

    if (this.collision) {
      const a = this.scene.worldToScreen(this.ctx, this.collision.a);
      const b = this.scene.worldToScreen(this.ctx, this.collision.b);
      this.ctx.strokeStyle = 'white';
      this.ctx.beginPath();
      this.ctx.moveTo(a.x, a.y);
      this.ctx.lineTo(b.x, b.y);
      this.ctx.stroke();
    }
  }

  loop = () => {
    const tp1 = performance.now();
    const dt = (tp1 - this.tp0) / 1000;
    this.tp0 = tp1;

    this.update(dt);
    
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  startLoop() {
    if (!this.animationFrameId) {
      this.tp0 = performance.now();
      this.draw();
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }
  stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
