export default class Camera {
  constructor(gl) {
    // Posição da camera
    this.eye = vec3.fromValues(1.5, 0.0, 1.5);
    this.at  = vec3.fromValues(0.0, -0.7, 0.0);
    this.up  = vec3.fromValues(0.0, 1.0, 0.0);

    // Parâmetros da projeção
    this.fovy = Math.PI / 2;
    this.aspect = gl.canvas.width / gl.canvas.height;

    this.left = -2.5;
    this.right = 2.5;
    this.top = 2.5;
    this.bottom = -2.5;

    this.near = 0;
    this.far = 5;

    // Matrizes View e Projection
    this.view = mat4.create();
    this.proj = mat4.create();

    this.perspective = "perspective";
    this.orthogonal = "ortho";

    // tipo da camera
    this.type = this.perspective;

    this.butaoAlteraCam = document.getElementById("camera");
    this.butaoAlteraCam.addEventListener("click", () => this.changeCam())

    // console.log(`tipo camera = ${this.type}`)
  }

  getView() {
    return this.view;
  }

  getProj() {
    return this.proj;
  }

  updateViewMatrix() {
    mat4.identity( this.view );
    mat4.lookAt(this.view, this.eye, this.at, this.up);
  }

  changeCam() {
    if (this.type === this.perspective) {
      this.eye = vec3.fromValues(50, 50.0, 50.0);
      this.type = this.orthogonal;
  
      // this.left = -50;
      // this.right = 50;
      // this.top = 50;
      // this.bottom = -50;
      this.near = 0;
      this.far = 100;
  
    } else {
      this.eye = vec3.fromValues(1.5, 0.0, 1.5);
      this.type = this.perspective;
      // this.near = 0;
      // this.far = 5;
    }
  
    console.log(`tipo camera = ${this.type}`);
    // this.updateCam();
  }
  

  updateProjectionMatrix() {
    mat4.identity( this.proj );

    if (this.type === this.orthogonal) {
      mat4.ortho(this.proj, this.left * 1024/768, this.right * 1024/768, this.bottom , this.top, this.near, this.far);
    } else {
      mat4.perspective(this.proj, this.fovy, this.aspect, this.near, this.far);
    }
  }

  updateCam() {
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }
}