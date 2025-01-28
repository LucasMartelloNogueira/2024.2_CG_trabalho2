export class Vertex {
  constructor(vid, x, y, z, color = [1.0, 1.0, 1.0, 1.0], normal = [0.0, 0.0, 0.0, 0.0]) {
    this.vid = vid;

    this.position = [x, y, z, 1];
    this.normal = normal;

    this.color = color;

    this.he = null;
  }
}

export class HalfEdge {
  constructor(vertex) {
    this.vertex = vertex;

    this.next = null;
    this.face = null;

    this.opposite = null;
  }
}

export class Face {
  constructor(baseHe) {
    this.baseHe = baseHe;
  }
}

export class HalfEdgeDS {
  constructor() {
    this.vertices = [];
    this.halfEdges = [];
    this.faces = [];
  }

  build(coords, trigs, normals) {

    const color = [1.0, 1.0, 1.0, 1.0]

    // construção dos vértices
    for (let vid = 0; vid < coords.length; vid+=3) {
      const x = coords[vid];
      const y = coords[vid + 1];
      const z = coords[vid + 2];

      let normal = [normals[vid], normals[vid+1], normals[vid+2], 0.0]


      // cores erradas / cameras certas
      // const v = new Vertex(vid / 3, x, y, z, normal, color);

      // cores certas / cameras erradas
      const v = new Vertex(vid / 3, x, y, z, color, normal);
      
      this.vertices.push(v);
    }

    // construção das faces & half-edges
    for (let tid = 0; tid < trigs.length; tid+=3) {
      const v0  = this.vertices[ trigs[tid + 0] ];
      const v1  = this.vertices[ trigs[tid + 1] ];
      const v2  = this.vertices[ trigs[tid + 2] ];

      if (v0 === undefined) {
        console.log(`v0 undefined / tid: ${tid} / trigs[tid+0] = ${trigs[tid]}`)
      }

      if (v1 === undefined) {
        console.log(`v1 undefined / tid: ${tid} / trigs[tid+1] = ${trigs[tid+1]}`)
      }

      if (v2 === undefined) {
        console.log(`v2 undefined / tid: ${tid} / trigs[tid+1] = ${trigs[tid+2]}`)
      }

      const he0 = new HalfEdge(v0);
      const he1 = new HalfEdge(v1);
      const he2 = new HalfEdge(v2);

      const face = new Face(he0);
      this.faces.push(face);

      // atribuição das faces das half-edges
      he0.face = face;
      he1.face = face;
      he2.face = face;

      // atribuição das next
      he0.next = he1;
      he1.next = he2;
      he2.next = he0;

      this.halfEdges.push(he0, he1, he2);
    }

    this.computeOpposites();
    this.computeVertexHe();

    // this.computeNormals();

    // colorindo orelha direita
    this.estrela(1345);
    // colorindo orelha esquerda
    this.estrela(7999);

    // console.log(this);
  }

  computeOpposites() {
    const visited = {};

    for (let hid = 0; hid < this.halfEdges.length; hid++) {
      // console.log(this.halfEdges[hid])
      const a = this.halfEdges[hid].vertex.vid;
      const b = this.halfEdges[hid].next.vertex.vid;

      const k = `k${Math.min(a,b)},${Math.max(a,b)}`;

      if (visited[k] !== undefined) {
        const op = visited[k];
        op.opposite = this.halfEdges[hid];
        this.halfEdges[hid].opposite = op;

        delete visited[k];
      }
      else {
        visited[k] = this.halfEdges[hid];
      }
    }
  }

  computeVertexHe() {
    for (let hid = 0; hid < this.halfEdges.length; hid ++) {
      const v = this.halfEdges[hid].vertex;

      if (v.he === null) {
        v.he = this.halfEdges[hid];
      }
      else if(this.halfEdges[hid].opposite === null) {
        v.he = this.halfEdges[hid];
      }
    }
  }

  computeNormals() {
    for (let fId = 0; fId < this.faces.length; fId ++) {
      const he0 = this.faces[fId].baseHe;
      const he1 = this.faces[fId].baseHe.next;
      const he2 = this.faces[fId].baseHe.next.next;

      const v0 = he0.vertex.position;
      const v1 = he1.vertex.position;
      const v2 = he2.vertex.position;

      const vec1 = [v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]]; // v1-v0
      const vec2 = [v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]]; // v2-v0

      const n = [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0]
      ];

      for (let cid = 0; cid < 3; cid++) {
        he0.vertex.normal[cid] += n[cid];
        he1.vertex.normal[cid] += n[cid];
        he2.vertex.normal[cid] += n[cid];
      }
    }
  }

  getVBOs() {
    const coords  = [];
    const colors  = [];
    const normals = [];
    const indices = [];

    for (let vId = 0; vId < this.vertices.length; vId++) {
      const v = this.vertices[vId];

      coords.push(...v.position);
      colors.push(...v.color);
      normals.push(...v.normal);
    }

    for (let hid = 0; hid < this.halfEdges.length; hid++) {
      indices.push(this.halfEdges[hid].vertex.vid);
    }

    return [coords, colors, normals, indices];
  }

  estrela(guess) {
    const iterations = 2300;
    
    // chutar um vertice ate pegar um da orelha 
    // let chute = 1345;
    const red = [1.0, 0.0, 0.0, 1.0]

    // console.log(this.vertices[chute]);

    // const v = this.vertices[chute]
    // console.log(v);
    // v.color = red;

    // const count = this.vertices.filter((v) => v.vid === 1345);
    // console.log(count.length)

    // this.vertices[chute].color = red; 
    // this.vertices[5559].color = red;

    let notVisitedVertices = [this.vertices[guess]];
    let visitedVertices = new Set();
    let stop = false
    let i = 0;

    // pegar os vertices para pintar de vermelho
    while (!stop || notVisitedVertices.length > 0) {

      // console.log(`len: ${notVisitedVertices.length}`)
      
      let newVisitedVertex = notVisitedVertices.pop();
      // console.log(`new vert: ${newVisitedVertex}`)
      
      // pintando o vertice de vermelho
      newVisitedVertex.color = red;
      visitedVertices.add(newVisitedVertex.vid);

      let visitedHE = newVisitedVertex.he;
      let currHE = visitedHE
      i++;

      // verificando se deve parar
      if (i > iterations) {
        stop = true;
      }
      
      // pegando os vertices vizinhos para serem pintados somente se ainda nao parou
      do {
        if (!visitedVertices.has(currHE.next.vertex.vid)) {
              notVisitedVertices.push(currHE.next.vertex);
        }

        currHE = currHE.opposite.next;
      } while (!stop && currHE != visitedHE)

    }

    // console.log(`iterations = ${i}`)
    // console.log(`qnt vert vermelhos: ${visitedVertices.size}`)
  }
}