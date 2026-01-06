"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Helper = /*#__PURE__*/function () {
  function Helper(scene, stem) {
    _classCallCheck(this, Helper);
    var mythis = this;
    this.scene = scene;
    this.stem = stem;
    this.initHelper();
  }
  return _createClass(Helper, [{
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
      g.fillText(text, 0, 20);
      //g.strokeStyle = 'rgba(255, 255, 255, 0.0)';
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
    value: function updateHelper() {}

    //
  }]);
}();
//# sourceMappingURL=helper-compiled.js.map
