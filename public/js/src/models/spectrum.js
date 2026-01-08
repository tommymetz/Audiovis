class Spectrum {
  constructor(scene, stem, color) {
    const mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.color = color;

    this.initSpectrum();
  }

  initSpectrum() {
    //Spectrum Shape
    // Guard against undefined centroids (happens when allquietsamples is true)
    if (!this.stem.centroids || !this.stem.centroids[0]) {
      return;
    }
    const CENTROID_LENGTH = this.stem.centroids[0].length;
    const MAX_POINTS = CENTROID_LENGTH * 2;
    const geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(MAX_POINTS * 3);
    var normals = new Float32Array(MAX_POINTS * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    const material = new THREE.MeshBasicMaterial({color: this.color, wireframe:false, side: THREE.DoubleSide, transparent:true, opacity: 0.75}); //side: THREE.DoubleSide,
    this.spectrum = new THREE.Mesh(geometry, material);
    this.spectrum.position.x = 0;
    this.spectrum.position.y = this.stem.offsety;
    //this.spectrum.rotation.y = Math.PI / 1;
    this.stem.rootobject.add(this.spectrum);

    //Create two columns of positions
    var positions = this.spectrum.geometry.attributes.position.array;
    const positionlength = positions.length/3;
    const trianglecount = positionlength/3;
    const scale = 1;
    let x;
    let y;
    let z;
    var index = 0;
    let side = 1;
    let trindex = -1;
    let sidecount = 0;
    let trindexdelta = 0;
    for(var i=0; i<trianglecount*3; i++){

      //Set side and trindex values
      if (i%3 === 0){
        trindex++;
        side = (side == 0 ? 1 : 0);
      }
      trindexdelta = trindex - sidecount;

      //Set postions for each side
      if(side == 0){ //SIDE A

        //V1
        if (i%3 === 0){
          x = 0;
          y = Math.log10(trindexdelta);
          z = 0;

        //V2
        }else if(i%3 === 1){
          x = 1;
          y = Math.log10(trindexdelta);
          z = 0;

        //V3
        }else{
          x = 1;
          y = Math.log10(trindexdelta+1);
          z = 0;
        }


      }else{ //SIDE B

        //V1
        if (i%3 === 0){
          x = 0;
          y = Math.log10(trindexdelta);
          z = 0;

        //V2
        }else if(i%3 === 1){
          x = 0;
          y = Math.log10(trindexdelta-0.9);
          z = 0;

        //V3
        }else{
          x = 0.9;
          y = Math.log10(trindexdelta);
          z = 0;
          sidecount++;
        }

      }

      //Range
      if(x<=0){x=0;};
      if(y<=0){y=0;};
      if(z<=0){z=0;};

      //Set position
      var index = 3 * i;
      positions[ index     ] = x;
      positions[ index + 1 ] = y;
      positions[ index + 2 ] = z;
    }

    //Normals
    var normals = this.spectrum.geometry.attributes.normal.array
    const normalcount = normals.length;
    for(var i=0; i<normalcount; i++){
      normals[i] = -1;
    }
    this.spectrum.geometry.computeVertexNormals();
    //var helper = new THREE.VertexNormalsHelper( this.spectrum, 0.2, 0x00ff00, 1 );
    //this.stem.rootobject.add(helper);


    //Spectrum Shape Mirror
    this.spectrummirror = new THREE.Mesh(geometry, material);
    this.spectrummirror.position.x = 0;
    this.spectrummirror.position.y = this.stem.offsety;
    this.spectrummirror.rotation.y = Math.PI / 1;
    this.stem.rootobject.add(this.spectrummirror);
  }

  updateSpectrum() {
    // Guard against undefined objects (happens when allquietsamples is true)
    if (!this.spectrum || !this.stem.centroids || !this.stem.centroid_indexes) {
      return;
    }
    const multiplyer = this.stem.json.track.byte_num_range; //255, 65535
    const factor = 100000;
    const vqi = this.stem.centroid_indexes[this.stem.frame];

    //Create two columns of positions
    const positions = this.spectrum.geometry.attributes.position.array;
    const positionlength = positions.length/3;
    const trianglecount = positionlength/3;
    const scale = 1;
    let x;
    let y;
    let z;
    let volume;
    var index = 0;
    let side = 1;
    let trindex = -1;
    let sidecount = 0;
    let trindexdelta = 0;
    for(let i=0; i<trianglecount*3; i++){

      //Set side and trindex values
      if (i%3 === 0){
        trindex++;
        side = (side == 0 ? 1 : 0);
      }
      trindexdelta = trindex - sidecount;

      //Set postions for each side
      if(side == 0){ //SIDE A

        //V1
        if (i%3 === 0){
          x = 0;
          y = Math.log10(trindexdelta);
          z = 0;

        //V2
        }else if(i%3 === 1){
          volume = Math.log10(this.stem.volume[this.stem.frame] / multiplyer * factor) / 10;
          x = Math.log(this.stem.centroids[vqi][trindexdelta] / multiplyer * factor) / 2 * volume;
          y = Math.log10(trindexdelta);
          z = 0;

        //V3
        }else{
          volume = Math.log10(this.stem.volume[this.stem.frame] / multiplyer * factor) / 10;
          x = Math.log(this.stem.centroids[vqi][trindexdelta+1] / multiplyer * factor) / 2 * volume;
          y = Math.log10(trindexdelta+1);
          z = 0;
        }


      }else{ //SIDE B

        //V1
        if (i%3 === 0){
          x = 0;
          y = Math.log10(trindexdelta);
          z = 0;

        //V2
        }else if(i%3 === 1){
          x = 0;
          y = Math.log10(trindexdelta-1); //0.9
          z = 0;

        //V3
        }else{
          volume = Math.log10(this.stem.volume[this.stem.frame] / multiplyer * factor) / 10;
          x = Math.log(this.stem.centroids[vqi][trindexdelta] / multiplyer * factor) / 2 * volume * 1; //0.9
          y = Math.log10(trindexdelta);
          z = 0;
          sidecount++;
        }

      }

      //Range
      if(x<=0){x=0;};
      if(y<=0){y=0;};
      if(z<=0){z=0;};

      //Set position
      var index = 3 * i;
      positions[ index     ] = x;
      positions[ index + 1 ] = y;
      positions[ index + 2 ] = z;
    }
    this.spectrum.geometry.attributes.position.needsUpdate = true;

    //Mirror
    //this.spectrummirror.geometry.attributes.position.array = positions;
    //this.spectrummirror.geometry.attributes.position.needsUpdate = true;
  }

  updateColor(color){
    // Guard against undefined objects (happens when allquietsamples is true)
    if (!this.spectrum || !this.spectrummirror) {
      return;
    }
    this.spectrum.material.color.set(color);
    this.spectrummirror.material.color.set(color);
  }



  //
}
