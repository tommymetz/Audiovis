"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Triangles = /*#__PURE__*/function () {
  function Triangles(scene, stem, color) {
    _classCallCheck(this, Triangles);
    var mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.color = color;
    this.zeroed = false;
    this.yoffset = 0.15;
    this.initTriangles();
    this.generateTriangleGeometry();
  }
  return _createClass(Triangles, [{
    key: "initTriangles",
    value: function initTriangles() {
      // Guard against undefined centroids (happens when allquietsamples is true)
      if (!this.stem.centroids || !this.stem.centroids[0]) {
        return;
      }
      var CENTROID_LENGTH = this.stem.centroids[0].length;
      var MAX_POINTS = CENTROID_LENGTH * 2;
      var geometry = new THREE.BufferGeometry();
      var positions = new Float32Array(MAX_POINTS * 3);
      var normals = new Float32Array(MAX_POINTS * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      var material = new THREE.MeshBasicMaterial({
        color: this.color,
        side: THREE.DoubleSide,
        wireframe: false
      });
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
  }, {
    key: "generateTriangleGeometry",
    value: function generateTriangleGeometry() {
      var positions = this.triangles.geometry.attributes.position.array;
      var positionlength = positions.length / 3;
      var trianglecount = 10; //positionlength/3;
      var scale = 1;
      var size = 0.5;
      var x;
      var y;
      var z;
      for (var i = 0; i < trianglecount * 3; i++) {
        if (i % 3 === 0) {
          x = 0;
          y = 0;
          z = 0;
        } else {
          x = x + size * (Math.random() - 0.5);
          y = y + size * (Math.random() - 0.5);
          z = 0;
        }
        var index = 3 * i;
        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;
      }
      this.triangles.geometry.attributes.position.needsUpdate = true;
    }
  }, {
    key: "updateTriangles",
    value: function updateTriangles() {
      // Guard against undefined objects (happens when allquietsamples is true)
      if (!this.triangles || !this.stem.volume) {
        return;
      }
      var volume = Math.log10(this.stem.volume[this.stem.frame] / this.stem.multiplyer * this.stem.factor * this.stem.maxvolume) / 1;
      if (volume <= 0.5) {
        if (!this.zeroed) {
          this.generateTriangleGeometry();
          this.zeroed = true;
        }
      } else {
        if (this.zeroed) this.zeroed = false;
      }

      //Scale
      if (volume <= 0) volume = 0.0001;
      this.triangles.scale.set(volume, volume, volume);
      this.trianglesmirror.scale.set(volume, volume, volume);
    }
  }, {
    key: "updateColor",
    value: function updateColor(color) {
      // Guard against undefined objects (happens when allquietsamples is true)
      if (!this.triangles || !this.trianglesmirror) {
        return;
      }
      this.triangles.material.color.set(color);
      this.trianglesmirror.material.color.set(color);
    }

    //
  }]);
}();
//# sourceMappingURL=triangles-compiled.js.map
