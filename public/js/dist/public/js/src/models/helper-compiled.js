"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Helper =
/*#__PURE__*/
function () {
  function Helper(scene, stem) {
    _classCallCheck(this, Helper);

    var mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.initHelper();
  }

  _createClass(Helper, [{
    key: "initHelper",
    value: function initHelper() {
      //Helper
      var text = "".concat(this.stem.order, " - ").concat(this.stem.name);
      var bitmap = document.createElement('canvas');
      var g = bitmap.getContext('2d');
      bitmap.width = 256;
      bitmap.height = 128;
      g.font = '16px Arial';
      g.fillStyle = 'white';
      g.fillText(text, 0, 20); //g.strokeStyle = 'rgba(255, 255, 255, 0.0)';
      //g.strokeText(text, 0, 20);

      var texture = new THREE.Texture(bitmap);
      texture.needsUpdate = true;
      var geometry = new THREE.PlaneGeometry(1, 0.5);
      var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(-1.5, 1, 0.01);
      this.stem.rootobject.add(mesh);
    }
  }, {
    key: "updateHelper",
    value: function updateHelper() {} //

  }]);

  return Helper;
}();
//# sourceMappingURL=helper-compiled.js.map
