import * as THREE from 'three';
import { Triangles } from './models/triangles.js';
import { Spectrum } from './models/spectrum.js';

export class Stem {
  constructor(location, name, index, order, scene, stemgroup, color) {
    this.location = location;
    this.name = name;
    this.index = index;
    this.order = order;
    this.scene = scene;
    this.stemgroup = stemgroup;
    this.color = color;

    //Variables
    //this.jsonfile = `${this.name}_analysis.json?v=${Math.round(Math.random()*1000)}`;
    this.jsonfile = `${this.name}_analysis.json`;
    //this.datafile = `${this.name}_analysis.data?v=${Math.round(Math.random()*1000)}`;
    this.datafile = `${this.name}_analysis.data`;
    this.steminfo;
    this.datastructure;
    this.loaded = false;
    this.active = true;
    this.visible = false;

    //Stem data
    this.volume;
    this.balance;
    this.width;
    this.centroids;
    this.centroid_indexes;
    this.pitch;

    //onLoaded handler
    this.isLoaded = function() {
      this.loaded = true;
      if (typeof this.onLoaded === 'function') {
        this.onLoaded();
      }
    };

    //Initialize
    this.init();
  }

  init() {
    const mythis = this;

    //Load JSON
    this.json = new Object();
    this.loadJSON(this.location + this.jsonfile, response => {
      mythis.json = JSON.parse(response);

      //If not all quite samples, load the data file. Otherwise deactivate.
      if (!mythis.json.track.allquietsamples) {
        const oReqs = new XMLHttpRequest();
        //oReqs.open("GET", `${mythis.location + mythis.json.track.filename}_analysis.data?v=${Math.round(Math.random()*1000)}`, true);
        oReqs.open('GET', `${mythis.location + mythis.json.track.filename}_analysis.data`, true);
        oReqs.responseType = 'arraybuffer';
        oReqs.onload = function (_oEvent) {
          if (this.response) {
            mythis.parseData(this.response);
          }
        };
        oReqs.send(null);
      } else {
        mythis.active = false;
        setTimeout(() => {
          mythis.isLoaded();
        }, 1000);
      }
    });
  }

  parseData(arrayBuffer) {

    //Extract data array
    const data = new Uint16Array(arrayBuffer);
    let head = 0;
    let splicelen = 0;

    //volume
    splicelen = this.json.structure[0].volume[0];
    this.volume = data.slice(head, head + splicelen);
    head += splicelen;

    //balance
    splicelen = this.json.structure[1].balance[0];
    this.balance = data.slice(head, head + splicelen);
    head += splicelen;

    //width
    splicelen = this.json.structure[2].width[0];
    this.width = data.slice(head, head + splicelen);
    head += splicelen;

    //stft_clusters
    splicelen = this.json.structure[3].centroids[1];
    this.centroids = [];
    for (let i = 0; i < this.json.structure[3].centroids[0]; i++) {
      this.centroids[i] = data.slice(head, head + splicelen);
      head += splicelen;
    }

    //centroid_indexes
    splicelen = this.json.structure[4].centroid_indexes[0];
    this.centroid_indexes = data.slice(head, head + splicelen);
    head += splicelen;

    //harmonics
    splicelen = this.json.structure[5].pitch[0];
    this.pitch = data.slice(head, head + splicelen);
    head += splicelen;

    //Static Parameters
    this.fs = this.json.track.fs;
    this.fftsize = this.json.track.stft_size;
    this.binratio = this.fs / this.fftsize;
    this.multiplyer = this.json.track.byte_num_range; //255, 65535
    this.factor = 100000;
    this.maxvolume = this.json.track.maxvolume;

    this.createObjects();

  }

  createObjects() {
    //Create objects for each track
    this.offsetz = -0.5;
    this.offsety = 0;
    this.spread = -0.1;

    //Root Object
    const rootGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const rootMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent:true, opacity:0.00 } ); //0.03
    this.rootobject = new THREE.Mesh( rootGeometry, rootMaterial );
    this.rootobject.visible = this.visible;
    this.rootobject.name = 'rootobject';
    this.rootobject.position.set(0, this.offsety, (this.spread * this.order) + this.offsetz);
    this.stemgroup.add(this.rootobject);

    //Models
    //this.helper = new Helper(this.scene, this);
    this.triangles = new Triangles(this.scene, this, this.color);
    this.spectrum = new Spectrum(this.scene, this, this.color);

    //Other object
    const otherGeometry = new THREE.SphereGeometry( 0.01, 0.01, 0.01 );
    const otherMaterial = new THREE.MeshBasicMaterial( { color: 0x000000} );
    this.otherobject = new THREE.Mesh( otherGeometry, otherMaterial );
    this.otherobject.visible = false;
    this.rootobject.add( this.otherobject );

    //Report done loading
    this.isLoaded();
  }

  updateVisibility(visible) {
    this.visible = visible;
    if (this.active) {
      this.rootobject.visible = visible;
    }
  }

  updateOrder(order) {
    this.order = order;
    if (this.active) {
      this.rootobject.position.set(0, this.offsety, (this.spread * this.order) + this.offsetz);
    }
  }

  updateColors(color) {
    this.color = color;
    if (this.active) {
      this.triangles.updateColor(color);
      this.spectrum.updateColor(color);
    }
  }

  hide() {
    if (this.active) {
      this.rootobject.visible = false;
    }
  }

  show() {
    if (this.active) {
      this.rootobject.visible = true;
    }
  }

  updateAnimation(frame) {
    this.frame = frame;
    if (this.active) {

      //Update models
      this.triangles.updateTriangles();
      this.spectrum.updateSpectrum();

      //Variables
      //const fs = this.json.track.fs;
      //const fftsize = this.json.track.stft_size;
      //const binratio = fs/fftsize;
      //const multiplyer = this.json.track.byte_num_range; //255, 65535
      //const factor = 100000;
      //const maxvolume = this.json.track.maxvolume;

      //Volume, Width
      let volume = Math.log10(this.volume[this.frame] / this.multiplyer * this.factor * this.maxvolume) / 1;// / multiplyer;// * this.json.track.maxvolume; // * 4 + 1;
      let width = Math.log10(this.width[this.frame] / this.multiplyer * this.factor) / 1;// * this.json.track.maxvolume; // * 10 + 3;
      if (volume <= 0) volume = 0.0001;
      if (width <= 0) width = 0.0001;
      this.otherobject.scale.y = volume;
      this.otherobject.scale.x = volume;
      this.otherobject.scale.z = volume;

      //Panning
      const posx = (this.balance[this.frame] / this.multiplyer - 0.5) * 4;
      this.otherobject.position.x = posx;
      this.rootobject.position.x = posx * 0.5;

      //Pitch
      const pitchmax = this.json.track.pitchmax; //2000
      if (this.pitch[this.frame] >= 30) {
        const thepitch = Math.log10(this.pitch[this.frame] / this.multiplyer * pitchmax * this.factor / this.fs) - 1.2;
        this.otherobject.position.y = thepitch;
      } else {
        this.otherobject.position.y = 0; //Default when pitch < 30Hz
      }
    }
  }

  loadJSON(file, callback) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', file, true);
    xobj.onreadystatechange = () => {
      if (xobj.readyState === 4 && xobj.status === '200') {callback(xobj.responseText);}
    };
    xobj.send(null);
  }
}
