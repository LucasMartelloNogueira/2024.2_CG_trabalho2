import vertShaderSrc from './phong.vert.js';
import fragShaderSrc from './phong.frag.js';

import Shader from './shader.js';
import { HalfEdgeDS } from './half-edge.js';

export default class Mesh {
  constructor(delta) {
    // model data structure
    this.heds = new HalfEdgeDS();

    // Matriz de modelagem
    this.angle = 0;
    this.delta = delta;
    this.model = mat4.create();

    // Shader program
    this.vertShd = null;
    this.fragShd = null;
    this.program = null;

    // Data location
    this.vaoLoc = -1;
    this.indicesLoc = -1;

    this.uModelLoc = -1;
    this.uViewLoc = -1;
    this.uProjectionLoc = -1;
  }

  async loadMeshV4() {
    const resp = await fetch('bunny.obj');
    const text = await resp.text();

    const data = text.split("\n")

    const coords = [];
    const normals = [];
    const indices = [];
    
    for (let i = 0; i < data.length; i++){
      let line = data[i].trim().split(" ")

      if (line[0] == "v") {
        let x = parseFloat(line[1]) / 100;
        let y = parseFloat(line[2]) / 100;
        let z = parseFloat(line[3]) / 100;
        coords.push(x, y, z)
      }

      if (line[0] == "vn") {
        let x = parseFloat(line[1]);
        let y = parseFloat(line[2]);
        let z = parseFloat(line[3]);
        normals.push(x, y, z)
      }

      if (line[0] == "f") {
        let v1 = parseInt(line[1].split("/")[0] - 1);
        let v2 = parseInt(line[2].split("/")[0] - 1);
        let v3 = parseInt(line[3].split("/")[0] - 1);
        indices.push(v1, v2, v3)
      }
    }

    // console.log(indices);
    this.heds.build(coords, indices, normals);
  }

  createShader(gl) {
    this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
    this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
    this.program = Shader.createProgram(gl, this.vertShd, this.fragShd);

    gl.useProgram(this.program);
  }

  createUniforms(gl) {
    this.uModelLoc = gl.getUniformLocation(this.program, "u_model");
    this.uViewLoc = gl.getUniformLocation(this.program, "u_view");
    this.uProjectionLoc = gl.getUniformLocation(this.program, "u_projection");
  }

  createVAO(gl) {
    const vbos = this.heds.getVBOs();
    // console.log(vbos);

    var coordsAttributeLocation = gl.getAttribLocation(this.program, "position");
    const coordsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[0]));

    var colorsAttributeLocation = gl.getAttribLocation(this.program, "color");
    const colorsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[1]));

    var normalsAttributeLocation = gl.getAttribLocation(this.program, "normal");
    const normalsBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[2]));

    this.vaoLoc = Shader.createVAO(gl,
      coordsAttributeLocation, coordsBuffer, 
      colorsAttributeLocation, colorsBuffer, 
      normalsAttributeLocation, normalsBuffer);

    this.indicesLoc = Shader.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(vbos[3]));
  }  

  init(gl, lights) {
    this.createShader(gl);
    this.createUniforms(gl);
    this.createVAO(gl);

    // console.log(lights)

    for (let light of lights) {
      // console.log(light);
      light.createUniforms(gl, this.program);
    }

    // lights.forEach((light) => {
    //   light.createUniforms(gl, this.program)
    // });

    // light.createUniforms(gl, this.program);
  }

  updateModelMatrix() {
    this.angle += 0.005;

    mat4.identity( this.model );
  
    mat4.rotateY(this.model, this.model, this.angle);
    
    // coordenadas de origem encontrada em test.ipynb
    // se não der para ver essa info no código ir para o arquivo no github: https://github.com/LucasMartelloNogueira/2024.2_CG_trabalho2/blob/main/test.ipynb
    // a info das coordenadas de origem estão no output da celula 6, nas variaveis "origin_x", "origin_y", "origin_z"
    mat4.translate(this.model, this.model, [0.336808, -1.203084, 0.030739000000000072]);
    
    mat4.scale(this.model, this.model, [50.0, 50.0, 50.0]);
  }

  draw(gl, cam) {
    // faces orientadas no sentido anti-horário
    gl.frontFace(gl.CCW);

    // face culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.useProgram(this.program);

    // updates the model transformations
    this.updateModelMatrix();

    const model = this.model;
    const view = cam.getView();
    const proj = cam.getProj();
    
    gl.uniformMatrix4fv(this.uModelLoc, false, model);
    gl.uniformMatrix4fv(this.uViewLoc, false, view);
    gl.uniformMatrix4fv(this.uProjectionLoc, false, proj);

    gl.bindVertexArray(this.vaoLoc);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesLoc);

    gl.drawElements(gl.TRIANGLES, this.heds.faces.length * 3, gl.UNSIGNED_INT, 0);

    gl.disable(gl.CULL_FACE);
  }
}