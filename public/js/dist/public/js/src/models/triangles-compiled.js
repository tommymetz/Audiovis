"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Triangles =
/*#__PURE__*/
function () {
  function Triangles(scene, stem, color) {
    _classCallCheck(this, Triangles);

    var mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.color = color;
    this.initTriangles();
  }

  _createClass(Triangles, [{
    key: "initTriangles",
    value: function initTriangles() {
      //Triangles
      var CENTROID_LENGTH = this.stem.centroids[0].length;
      var MAX_POINTS = CENTROID_LENGTH * 2;
      var geometry = new THREE.BufferGeometry();
      var positions = new Float32Array(MAX_POINTS * 3);
      var normals = new Float32Array(MAX_POINTS * 3);
      geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
      var material = new THREE.MeshBasicMaterial({
        color: this.color,
        side: THREE.DoubleSide,
        wireframe: false
      });
      this.triangles = new THREE.Mesh(geometry, material);
      this.triangles.position.x = 0;
      this.triangles.position.y = this.stem.offsety;
      this.stem.rootobject.add(this.triangles);
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
      var volume = Math.log10(this.stem.volume[this.stem.frame] / this.stem.multiplyer * this.stem.factor * this.stem.maxvolume) / 1;
      if (volume <= 0) volume = 0.0001;
      this.triangles.scale.set(volume, volume, volume);
    }
  }, {
    key: "updateColor",
    value: function updateColor(color) {
      this.triangles.material.color.set(color);
    } //

  }]);

  return Triangles;
}();
//# sourceMappingURL=triangles-compiled.js.map
