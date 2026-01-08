class Triangles {
  constructor(scene, stem, color) {
    const mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.color = color;
    this.zeroed = false;
    this.yoffset = 0.15;
    this.initTriangles();
    this.generateTriangleGeometry();
  }

  initTriangles(){
    // Guard against undefined centroids (happens when allquietsamples is true)
    if (!this.stem.centroids || !this.stem.centroids[0]) {
      return;
    }
    const CENTROID_LENGTH = this.stem.centroids[0].length;
    const MAX_POINTS = CENTROID_LENGTH * 2;
    const geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(MAX_POINTS * 3);
    const normals = new Float32Array(MAX_POINTS * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    const material = new THREE.MeshBasicMaterial({color: this.color, side: THREE.DoubleSide, wireframe:false});
    this.triangles = new THREE.Mesh(geometry, material);
    this.triangles.position.x = 0;
    this.triangles.position.y = this.yoffset;
    //this.triangles.position.y = this.stem.offsety;
    this.stem.rootobject.add(this.triangles);

    //Triangles Mirror
    this.trianglesmirror = new THREE.Mesh(geometry, material);
    this.trianglesmirror.position.x = 0;
    this.trianglesmirror.position.y = this.yoffset;
    this.trianglesmirror.rotation.y = Math.PI / 1;
    this.stem.rootobject.add(this.trianglesmirror);
  }

  generateTriangleGeometry(){
    var positions = this.triangles.geometry.attributes.position.array;
    const positionlength = positions.length/3;
    const trianglecount = 10;//positionlength/3;
    const scale = 1;
    const size = 0.5;
    let x;
    let y;
    let z;
    for(let i=0; i<trianglecount*3; i++){
      if ( i % 3 === 0 ) {
          x = 0;
          y = 0;
          z = 0;
      } else {
          x = x + size * ( Math.random() - 0.5 );
          y = y + size * ( Math.random() - 0.5 );
          z = 0;
      }
      const index = 3 * i;
      positions[ index     ] = x;
      positions[ index + 1 ] = y;
      positions[ index + 2 ] = z;
    }
    this.triangles.geometry.attributes.position.needsUpdate = true;
  }

  updateTriangles() {
    // Guard against undefined objects (happens when allquietsamples is true)
    if (!this.triangles || !this.stem.volume) {
      return;
    }
    let volume = Math.log10(this.stem.volume[this.stem.frame] / this.stem.multiplyer * this.stem.factor * this.stem.maxvolume) / 1;
    if(volume <= 0.5){
      if(!this.zeroed){
        this.generateTriangleGeometry();
        this.zeroed = true;
      }
    }else{
      if(this.zeroed) this.zeroed = false;
    }

    //Scale
    if(volume <= 0) volume = 0.0001;
    this.triangles.scale.set(volume,volume,volume);
    this.trianglesmirror.scale.set(volume,volume,volume);
  }

  updateColor(color){
    // Guard against undefined objects (happens when allquietsamples is true)
    if (!this.triangles || !this.trianglesmirror) {
      return;
    }
    this.triangles.material.color.set(color);
    this.trianglesmirror.material.color.set(color);
  }



  //
}

// Expose to global scope for compatibility
window.Triangles = Triangles;
