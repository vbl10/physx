type Key = {
    state: boolean;
    pressed: boolean;
    held: boolean;
    released: boolean;
};

export class Keyboard {
  private keys: {[key: string]: Key} = {};

  bind(elmt: HTMLElement) {
    elmt.addEventListener('keypress', (ev) => {
      this.get(ev.code).state = true;
    });
    elmt.addEventListener('keyup', (ev) => {
      this.get(ev.code).state = false;
    });
  }

  sync() {
    for (let code in this.keys) {
        const k = this.get(code);
        if (k.state) {
          if (!k.held) {
            k.pressed = true;
            k.held = true;
            k.released = false;
          }
          else {
            k.pressed = false;
            k.held = true;
            k.released = false;
          }
        }
        else if (k.held) {
          k.pressed = false;
          k.held = false;
          k.released = true;
        }
        else {
          k.pressed = false;
          k.held = false;
          k.released = false;
        }
      }
  }

  get(code: string): Key {
    if (!this.keys[code]) {
        this.keys[code] = {
            held: false,
            pressed: false,
            released: false,
            state: false
        }
    }
    return this.keys[code];
  }
}
