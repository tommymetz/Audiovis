class Triangles {
  constructor(scene, stem, color) {
    const mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.color = color;
    this.initTriangles();
  }

  initTriangles() {

    //Triangles
    const CENTROID_LENGTH = this.stem.centroids[0].length;
    const MAX_POINTS = CENTROID_LENGTH * 2;
    const geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(MAX_POINTS * 3);
    const normals = new Float32Array(MAX_POINTS * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    const material = new THREE.MeshBasicMaterial({color: this.color, side: THREE.DoubleSide, wireframe:false});
    this.triangles = new THREE.Mesh(geometry, material);
    this.triangles.position.x = 0;
    this.triangles.position.y = this.stem.offsety;
    this.stem.rootobject.add(this.triangles);

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
    let volume = Math.log10(this.stem.volume[this.stem.frame] / this.stem.multiplyer * this.stem.factor * this.stem.maxvolume) / 1;
    if(volume <= 0) volume = 0.0001;
    this.triangles.scale.set(volume,volume,volume);
  }

  updateColor(color){
    this.triangles.material.color.set(color);
  }



  //
}
