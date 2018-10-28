"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Stem =
/*#__PURE__*/
function () {
  function Stem(location, name, index, order, scene, stemgroup, color) {
    _classCallCheck(this, Stem);

    this.location = location;
    this.name = name;
    this.index = index;
    this.order = order;
    this.scene = scene;
    this.stemgroup = stemgroup;
    this.color = color; //Variables
    //this.jsonfile = `${this.name}_analysis.json?v=${Math.round(Math.random()*1000)}`;

    this.jsonfile = "".concat(this.name, "_analysis.json"); //this.datafile = `${this.name}_analysis.data?v=${Math.round(Math.random()*1000)}`;

    this.datafile = "".concat(this.name, "_analysis.data");
    this.steminfo;
    this.datastructure;
    this.loaded = false;
    this.active = true;
    this.visible = false; //Stem data

    this.volume;
    this.balance;
    this.width;
    this.centroids;
    this.centroid_indexes;
    this.pitch; //onLoaded handler

    this.isLoaded = function () {
      this.loaded = true;

      if (typeof this.onLoaded === "function") {
        this.onLoaded();
      }
    }; //Initialize


    this.init();
  }

  _createClass(Stem, [{
    key: "init",
    value: function init() {
      var mythis = this; //Load JSON

      this.json = new Object();
      this.loadJSON(this.location + this.jsonfile, function (response) {
        mythis.json = JSON.parse(response); //If not all quite samples, load the data file. Otherwise deactivate.

        if (!mythis.json.track.allquietsamples) {
          var oReqs = new XMLHttpRequest(); //oReqs.open("GET", `${mythis.location + mythis.json.track.filename}_analysis.data?v=${Math.round(Math.random()*1000)}`, true);

          oReqs.open("GET", "".concat(mythis.location + mythis.json.track.filename, "_analysis.data"), true);
          oReqs.responseType = "arraybuffer";

          oReqs.onload = function (oEvent) {
            if (this.response) {
              mythis.parseData(this.response);
            }
          };

          oReqs.send(null);
        } else {
          mythis.active = false;
          setTimeout(function () {
            mythis.isLoaded();
          }, 1000);
        }
      });
    }
  }, {
    key: "parseData",
    value: function parseData(arrayBuffer) {
      //Extract data array
      var data = new Uint16Array(arrayBuffer);
      var head = 0;
      var splicelen = 0; //volume

      splicelen = this.json.structure[0].volume[0];
      this.volume = data.slice(head, head + splicelen);
      head += splicelen; //balance

      splicelen = this.json.structure[1].balance[0];
      this.balance = data.slice(head, head + splicelen);
      head += splicelen; //width

      splicelen = this.json.structure[2].width[0];
      this.width = data.slice(head, head + splicelen);
      head += splicelen; //stft_clusters

      splicelen = this.json.structure[3].centroids[1];
      this.centroids = [];

      for (var i = 0; i < this.json.structure[3].centroids[0]; i++) {
        this.centroids[i] = data.slice(head, head + splicelen);
        head += splicelen;
      } //centroid_indexes


      splicelen = this.json.structure[4].centroid_indexes[0];
      this.centroid_indexes = data.slice(head, head + splicelen);
      head += splicelen; //harmonics

      splicelen = this.json.structure[5].pitch[0];
      this.pitch = data.slice(head, head + splicelen);
      head += splicelen; //Static Parameters

      this.fs = this.json.track.fs;
      this.fftsize = this.json.track.stft_size;
      this.binratio = this.fs / this.fftsize;
      this.multiplyer = this.json.track.byte_num_range; //255, 65535

      this.factor = 100000;
      this.maxvolume = this.json.track.maxvolume;
      this.createObjects();
    }
  }, {
    key: "createObjects",
    value: function createObjects() {
      var mythis = this; //Create objects for each track

      this.offsetz = -0.5;
      this.offsety = 0;
      this.spread = -0.1; //Root Object

      var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.03
      });
      this.rootobject = new THREE.Mesh(geometry, material);
      this.rootobject.visible = this.visible;
      this.rootobject.name = 'rootobject';
      this.rootobject.position.set(0, this.offsety, this.spread * this.order + this.offsetz);
      this.stemgroup.add(this.rootobject); //Models
      //this.helper = new Helper(this.scene, this);

      this.triangles = new Triangles(this.scene, this, this.color);
      this.spectrum = new Spectrum(this.scene, this, this.color); //Other object

      var geometry = new THREE.SphereGeometry(0.01, 0.01, 0.01);
      var material = new THREE.MeshBasicMaterial({
        color: 0x000000
      });
      this.otherobject = new THREE.Mesh(geometry, material);
      this.rootobject.add(this.otherobject); //Report done loading

      this.isLoaded();
    }
  }, {
    key: "updateVisibility",
    value: function updateVisibility(visible) {
      this.visible = visible;

      if (this.active) {
        this.rootobject.visible = visible;
      }
    }
  }, {
    key: "updateOrder",
    value: function updateOrder(order) {
      this.order = order;

      if (this.active) {
        this.rootobject.position.set(0, this.offsety, this.spread * this.order + this.offsetz);
      }
    }
  }, {
    key: "updateColors",
    value: function updateColors(color) {
      this.color = color;

      if (this.active) {
        this.triangles.updateColor(color);
        this.spectrum.updateColor(color);
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      if (this.active) {
        this.rootobject.visible = false;
      }
    }
  }, {
    key: "show",
    value: function show() {
      if (this.active) {
        this.rootobject.visible = true;
      }
    }
  }, {
    key: "updateAnimation",
    value: function updateAnimation(frame) {
      this.frame = frame;

      if (this.active) {
        //Update models
        this.triangles.updateTriangles();
        this.spectrum.updateSpectrum(); //Variables
        //const fs = this.json.track.fs;
        //const fftsize = this.json.track.stft_size;
        //const binratio = fs/fftsize;
        //const multiplyer = this.json.track.byte_num_range; //255, 65535
        //const factor = 100000;
        //const maxvolume = this.json.track.maxvolume;
        //Volume, Width

        var volume = Math.log10(this.volume[this.frame] / this.multiplyer * this.factor * this.maxvolume) / 1; // / multiplyer;// * this.json.track.maxvolume; // * 4 + 1;

        var width = Math.log10(this.width[this.frame] / this.multiplyer * this.factor) / 1; // * this.json.track.maxvolume; // * 10 + 3;

        if (volume <= 0) volume = 0.0001;
        if (width <= 0) width = 0.0001;
        this.otherobject.scale.y = volume;
        this.otherobject.scale.x = volume;
        this.otherobject.scale.z = volume; //Panning

        var posx = (this.balance[this.frame] / this.multiplyer - 0.5) * 4;
        this.otherobject.position.x = posx;
        this.rootobject.position.x = posx * 0.5; //Pitch

        var pitchmin = this.json.track.pitchmin; //50

        var pitchmax = this.json.track.pitchmax; //2000

        if (this.pitch[this.frame] >= 30) {
          var thepitch = Math.log10(this.pitch[this.frame] / this.multiplyer * pitchmax * this.factor / this.fs) - 1.2;
          this.otherobject.position.y = thepitch;
        } else {
          this.otherobject.position.y = 0; //Math.log10(pitchmin);
        }
      }
    }
  }, {
    key: "loadJSON",
    value: function loadJSON(file, callback) {
      var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', file, true);

      xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          callback(xobj.responseText);
        }
      };

      xobj.send(null);
    }
  }]);

  return Stem;
}();
//# sourceMappingURL=stem-compiled.js.map
