class Helper {
  constructor(scene, stem) {
    const mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.initHelper();
  }

  initHelper() {

    //Helper
    const text = `${this.stem.order} - ${this.stem.name}`;
    const bitmap = document.createElement('canvas');
    const g = bitmap.getContext('2d');
    bitmap.width = 256;
    bitmap.height = 128;
    g.font = '16px Arial';
    g.fillStyle = 'white';
    g.fillText(text, 0, 20);
    //g.strokeStyle = 'rgba(255, 255, 255, 0.0)';
    //g.strokeText(text, 0, 20);
    const texture = new THREE.Texture(bitmap);
    texture.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(1,0.5);
    const material = new THREE.MeshBasicMaterial({map:texture, transparent:true, side:THREE.DoubleSide});
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(-1.5,1,0.01);
    this.stem.rootobject.add(mesh);

  }

  updateHelper() {

  }





  //
}
