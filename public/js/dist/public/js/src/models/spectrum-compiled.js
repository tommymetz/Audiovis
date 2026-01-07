"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Spectrum = /*#__PURE__*/function () {
  function Spectrum(scene, stem, color) {
    _classCallCheck(this, Spectrum);
    var mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.color = color;
    this.initSpectrum();
  }
  return _createClass(Spectrum, [{
    key: "initSpectrum",
    value: function initSpectrum() {
      //Spectrum Shape
      var CENTROID_LENGTH = this.stem.centroids[0].length;
      var MAX_POINTS = CENTROID_LENGTH * 2;
      var geometry = new THREE.BufferGeometry();
      var positions = new Float32Array(MAX_POINTS * 3);
      var normals = new Float32Array(MAX_POINTS * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      var material = new THREE.MeshBasicMaterial({
        color: this.color,
        wireframe: false,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      }); //side: THREE.DoubleSide,
      this.spectrum = new THREE.Mesh(geometry, material);
      this.spectrum.position.x = 0;
      this.spectrum.position.y = this.stem.offsety;
      //this.spectrum.rotation.y = Math.PI / 1;
      this.stem.rootobject.add(this.spectrum);

      //Create two columns of positions
      var positions = this.spectrum.geometry.attributes.position.array;
      var positionlength = positions.length / 3;
      var trianglecount = positionlength / 3;
      var scale = 1;
      var x;
      var y;
      var z;
      var index = 0;
      var side = 1;
      var trindex = -1;
      var sidecount = 0;
      var trindexdelta = 0;
      for (var i = 0; i < trianglecount * 3; i++) {
        //Set side and trindex values
        if (i % 3 === 0) {
          trindex++;
          side = side == 0 ? 1 : 0;
        }
        trindexdelta = trindex - sidecount;

        //Set postions for each side
        if (side == 0) {
          //SIDE A

          //V1
          if (i % 3 === 0) {
            x = 0;
            y = Math.log10(trindexdelta);
            z = 0;

            //V2
          } else if (i % 3 === 1) {
            x = 1;
            y = Math.log10(trindexdelta);
            z = 0;

            //V3
          } else {
            x = 1;
            y = Math.log10(trindexdelta + 1);
            z = 0;
          }
        } else {
          //SIDE B

          //V1
          if (i % 3 === 0) {
            x = 0;
            y = Math.log10(trindexdelta);
            z = 0;

            //V2
          } else if (i % 3 === 1) {
            x = 0;
            y = Math.log10(trindexdelta - 0.9);
            z = 0;

            //V3
          } else {
            x = 0.9;
            y = Math.log10(trindexdelta);
            z = 0;
            sidecount++;
          }
        }

        //Range
        if (x <= 0) {
          x = 0;
        }
        ;
        if (y <= 0) {
          y = 0;
        }
        ;
        if (z <= 0) {
          z = 0;
        }
        ;

        //Set position
        var index = 3 * i;
        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;
      }

      //Normals
      var normals = this.spectrum.geometry.attributes.normal.array;
      var normalcount = normals.length;
      for (var i = 0; i < normalcount; i++) {
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
  }, {
    key: "updateSpectrum",
    value: function updateSpectrum() {
      var multiplyer = this.stem.json.track.byte_num_range; //255, 65535
      var factor = 100000;
      var vqi = this.stem.centroid_indexes[this.stem.frame];

      // Guard against undefined or out-of-bounds centroids
      if (!this.stem.centroids || vqi === undefined || vqi === null || !this.stem.centroids[vqi]) {
        return;
      }

      //Create two columns of positions
      var positions = this.spectrum.geometry.attributes.position.array;
      var positionlength = positions.length / 3;
      var trianglecount = positionlength / 3;
      var scale = 1;
      var x;
      var y;
      var z;
      var volume;
      var index = 0;
      var side = 1;
      var trindex = -1;
      var sidecount = 0;
      var trindexdelta = 0;
      for (var i = 0; i < trianglecount * 3; i++) {
        //Set side and trindex values
        if (i % 3 === 0) {
          trindex++;
          side = side == 0 ? 1 : 0;
        }
        trindexdelta = trindex - sidecount;

        //Set postions for each side
        if (side == 0) {
          //SIDE A

          //V1
          if (i % 3 === 0) {
            x = 0;
            y = Math.log10(trindexdelta);
            z = 0;

            //V2
          } else if (i % 3 === 1) {
            volume = Math.log10(this.stem.volume[this.stem.frame] / multiplyer * factor) / 10;
            x = Math.log(this.stem.centroids[vqi][trindexdelta] / multiplyer * factor) / 2 * volume;
            y = Math.log10(trindexdelta);
            z = 0;

            //V3
          } else {
            volume = Math.log10(this.stem.volume[this.stem.frame] / multiplyer * factor) / 10;
            x = Math.log(this.stem.centroids[vqi][trindexdelta + 1] / multiplyer * factor) / 2 * volume;
            y = Math.log10(trindexdelta + 1);
            z = 0;
          }
        } else {
          //SIDE B

          //V1
          if (i % 3 === 0) {
            x = 0;
            y = Math.log10(trindexdelta);
            z = 0;

            //V2
          } else if (i % 3 === 1) {
            x = 0;
            y = Math.log10(trindexdelta - 1); //0.9
            z = 0;

            //V3
          } else {
            volume = Math.log10(this.stem.volume[this.stem.frame] / multiplyer * factor) / 10;
            x = Math.log(this.stem.centroids[vqi][trindexdelta] / multiplyer * factor) / 2 * volume * 1; //0.9
            y = Math.log10(trindexdelta);
            z = 0;
            sidecount++;
          }
        }

        //Range
        if (x <= 0) {
          x = 0;
        }
        ;
        if (y <= 0) {
          y = 0;
        }
        ;
        if (z <= 0) {
          z = 0;
        }
        ;

        //Set position
        var index = 3 * i;
        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;
      }
      this.spectrum.geometry.attributes.position.needsUpdate = true;

      //Mirror
      //this.spectrummirror.geometry.attributes.position.array = positions;
      //this.spectrummirror.geometry.attributes.position.needsUpdate = true;
    }
  }, {
    key: "updateColor",
    value: function updateColor(color) {
      this.spectrum.material.color.set(color);
      this.spectrummirror.material.color.set(color);
    }

    //
  }]);
}();
//# sourceMappingURL=spectrum-compiled.js.map
