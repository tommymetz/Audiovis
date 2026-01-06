"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var SceneGui = /*#__PURE__*/function () {
  function SceneGui(parent) {
    _classCallCheck(this, SceneGui);
    var mythis = this;
    this.parent = parent;
    this.visible = false;
    this.paused = false;

    //State
    this.state = {};

    //Gui Container
    this.container = document.createElement('div');
    this.parent.container.appendChild(this.container);
    this.container.setAttribute('class', 'scene-gui gui-container hidden');

    //Menu Bar
    this.menu = document.createElement('div');
    this.container.appendChild(this.menu);
    this.menu.setAttribute('class', 'gui-menu');

    //Playlist Title
    /*this.title = document.createElement('div');
    this.menu.appendChild(this.title);
    this.title.setAttribute('class', 'gui-item gui-item_title hidden');
     //Changed
    this.status_changed = document.createElement('div');
    this.menu.appendChild(this.status_changed);
    this.status_changed.setAttribute('class', 'gui-item gui-item_changed');
     //Loading
    this.status = document.createElement('div');
    this.menu.appendChild(this.status);
    this.status.setAttribute('class', 'gui-item gui-item_status');*/

    //Stop Play
    this.button_stopplay = document.createElement('a');
    this.menu.appendChild(this.button_stopplay);
    this.button_stopplay.setAttribute('class', 'gui-item');
    this.button_stopplay.setAttribute('href', '#');
    this.button_stopplay.innerHTML = 'stop';

    //Fast Forward
    this.button_fastforward = document.createElement('a');
    this.menu.appendChild(this.button_fastforward);
    this.button_fastforward.setAttribute('class', 'gui-item');
    this.button_fastforward.setAttribute('href', '#');
    this.button_fastforward.innerHTML = 'ff';

    //Next Song
    this.button_nextsong = document.createElement('a');
    this.menu.appendChild(this.button_nextsong);
    this.button_nextsong.setAttribute('class', 'gui-item');
    this.button_nextsong.setAttribute('href', '#');
    this.button_nextsong.innerHTML = 'next';

    //Buy
    this.button_buy = document.createElement('a');
    this.menu.appendChild(this.button_buy);
    this.button_buy.setAttribute('class', 'gui-item');
    this.button_buy.setAttribute('href', 'http://multidim.net/releases/horizon');
    this.button_buy.setAttribute('target', '_blank');
    this.button_buy.innerHTML = 'get';

    //Stems - https://github.com/RubaXa/Sortable
    /*this.stems = [];
    this.stems_list = document.createElement('ul');
    this.container.appendChild(this.stems_list);
    this.stems_list.setAttribute('class', 'gui-list');*/

    //Song Title
    this.song_title = document.createElement('div');
    this.container.appendChild(this.song_title);
    this.song_title.setAttribute('class', 'gui-song-title');
    this.song_title.innerHTML = 'Glissline - Horizon';
  }
  return _createClass(SceneGui, [{
    key: "init",
    value: function init() {
      var mythis = this;
      this.updateVisibility(true);

      //this.title.innerHTML = this.parent.playlist.name;

      //Menu Buttons
      this.button_stopplay.addEventListener('click', function (e) {
        e.preventDefault();
        mythis.stopplay();
      });
      this.button_fastforward.addEventListener('click', function (e) {
        e.preventDefault();
        mythis.fastforward();
      });
      this.button_nextsong.addEventListener('click', function (e) {
        e.preventDefault();
        mythis.nextsong();
      });
    }
  }, {
    key: "updateSongTitle",
    value: function updateSongTitle(title) {
      this.song_title.innerHTML = title;
    }
  }, {
    key: "updateStopPlayButtonState",
    value: function updateStopPlayButtonState(paused) {
      if (!paused) {
        this.button_stopplay.innerHTML = 'stop';
        this.paused = false;
      } else {
        this.button_stopplay.innerHTML = 'play';
        this.paused = true;
      }
    }
  }, {
    key: "updateVisibility",
    value: function updateVisibility(visible) {
      this.visible = visible;
      if (visible) {
        this.container.classList.remove('hidden');
      } else {
        this.container.classList.add('hidden');
      }
    }
  }, {
    key: "stopplay",
    value: function stopplay() {
      if (this.paused) {
        this.button_stopplay.innerHTML = 'stop';
        this.paused = false;
      } else {
        this.button_stopplay.innerHTML = 'play';
        this.paused = true;
      }
      this.parent.stopplay();
    }
  }, {
    key: "fastforward",
    value: function fastforward() {
      this.button_stopplay.innerHTML = 'stop';
      this.paused = false;
      document.getElementById('playdiv').style.display = 'none';
      this.parent.fastforward();
    }
  }, {
    key: "nextsong",
    value: function nextsong() {
      this.button_stopplay.innerHTML = 'stop';
      this.paused = false;
      document.getElementById('playdiv').style.display = 'none';
      this.parent.nextsong();
    }

    //loadState(){
    //  console.log('load scene');
    //}

    //saveState(){
    //  console.log('save scene');
    /*var mythis = this;
    this.status.innerHTML = 'saving';
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        mythis.status.innerHTML = '';
        mythis.status_changed.innerHTML = '';
        console.log(JSON.parse(this.responseText));
      }
    };
    xhttp.open("POST", "/config/save", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(this.state));*/
    //}
  }]);
}(); //
//# sourceMappingURL=scene_gui-compiled.js.map
