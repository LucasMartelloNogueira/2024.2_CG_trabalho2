import Camera from './camera.js';
import Light from './light.js';
import Mesh from './mesh.js';

class Scene {
  constructor(gl) {
    // Luz
    const white = [1.0, 1.0, 1.0]
    const yellow = [1.0, 1.0, 0.0]

    const light1_coords = [-100.0, 100.0, 0.0]
    const light2_coords = [100.0, 100.0, 0.0]

    const light1 = new Light(light1_coords, white);
    const light2 = new Light(light2_coords, yellow);
    
    this.lights = [light1, light2]
    
    // Camera virtual
    this.cam = new Camera(gl);

    // Mesh
    this.mesh = new Mesh(1.0);
  }

  async init(gl) {
    await this.mesh.loadMeshV4();
    this.mesh.init(gl, this.lights);
  }

  draw(gl) {  
    this.cam.updateCam();
    this.mesh.draw(gl, this.cam);
  }
}

class Main {
  constructor() {
    const canvas = document.querySelector("#glcanvas");

    this.gl = canvas.getContext("webgl2");
    this.setViewport();

    this.scene = new Scene(this.gl);
    this.scene.init(this.gl).then(() => {
      this.draw();
    });
  }

  setViewport() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.gl.canvas.width = 1024 * devicePixelRatio;
    this.gl.canvas.height = 768 * devicePixelRatio;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  draw() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.scene.draw(this.gl);

    requestAnimationFrame(this.draw.bind(this));
  }
}

window.onload = () => {
  const app = new Main();
  app.draw();
}


