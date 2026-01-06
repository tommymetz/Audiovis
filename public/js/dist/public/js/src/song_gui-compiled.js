"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var SongGui = /*#__PURE__*/function () {
  function SongGui(parent) {
    _classCallCheck(this, SongGui);
    var mythis = this;
    this.parent = parent;
    this.visible = false;

    //State
    this.state = {
      location: parent.location,
      order: [],
      colorset: 'colorsWarmCold',
      colors: []
    };

    //Gui Container
    this.container = document.createElement('div');
    this.parent.parent.container.appendChild(this.container);
    this.container.setAttribute('class', 'song-gui gui-container hidden');

    //Menu Bar
    this.menu = document.createElement('div');
    this.container.appendChild(this.menu);
    this.menu.setAttribute('class', 'gui-menu');

    //Song Title
    this.title = document.createElement('div');
    this.menu.appendChild(this.title);
    this.title.setAttribute('class', 'gui-item gui-item_title');

    //Changed
    this.status_changed = document.createElement('div');
    this.menu.appendChild(this.status_changed);
    this.status_changed.setAttribute('class', 'gui-item gui-item_changed');

    //Loading
    this.status = document.createElement('div');
    this.menu.appendChild(this.status);
    this.status.setAttribute('class', 'gui-item gui-item_status');

    //Stop
    //this.button_stop = document.createElement('a');
    //this.menu.appendChild(this.button_stop);
    //this.button_stop.setAttribute('class', 'gui-item');
    //this.button_stop.setAttribute('href', '#');
    //this.button_stop.innerHTML = 'stop';

    //Load
    this.button_load = document.createElement('a');
    this.menu.appendChild(this.button_load);
    this.button_load.setAttribute('class', 'gui-item');
    this.button_load.setAttribute('href', '#');
    this.button_load.innerHTML = 'load';

    //Save
    this.button_save = document.createElement('a');
    this.menu.appendChild(this.button_save);
    this.button_save.setAttribute('class', 'gui-item');
    this.button_save.setAttribute('href', '#');
    this.button_save.innerHTML = 'save';

    //Stems - https://github.com/RubaXa/Sortable
    this.stems = [];
    this.stems_list = document.createElement('ul');
    this.container.appendChild(this.stems_list);
    this.stems_list.setAttribute('class', 'gui-list');
  }
  return _createClass(SongGui, [{
    key: "init",
    value: function init() {
      var _this = this;
      var mythis = this;
      this.title.innerHTML = this.parent.mp3file;

      //Menu Buttons
      //this.button_stop.addEventListener('click', e => {
      //  e.preventDefault();
      //  mythis.parent.parent.stop();
      //});
      this.button_load.addEventListener('click', function (e) {
        e.preventDefault();
        if (_this.visible) {
          mythis.loadState();
        } else {
          console.log('fuck off');
        }
      });
      this.button_save.addEventListener('click', function (e) {
        e.preventDefault();
        if (_this.visible) {
          mythis.saveState();
        } else {
          console.log('fuck off');
        }
      });

      //Parameters
      this.state.colors = this.parent.colors;
      this.state.order = this.parent.order;

      //Tracks
      var stemlist = new Array(this.parent.stems.length);
      this.parent.stems.forEach(function (element, index) {
        var order = element.order;
        mythis.stems[index] = document.createElement('li');
        mythis.stems[index].setAttribute('data-index', index);

        //Name
        var name = document.createElement('div');
        name.setAttribute('class', 'name');
        name.innerHTML = mythis.parent.stems[index].name;
        mythis.stems[index].appendChild(name);

        //Color
        var color = document.createElement('input');
        color.setAttribute('type', 'color');
        color.setAttribute('value', mythis.state.colors[index]);
        if (!mythis.parent.stems[index].active) color.setAttribute('disabled', true);
        mythis.stems[index].appendChild(color);
        color.addEventListener('input', function (e) {
          mythis.status_changed.innerHTML = '*';
          var elementindex = e.target.parentElement.getAttribute('data-index');
          mythis.state.colors[elementindex] = e.target.value;
          mythis.parent.updateStemColor(elementindex, e.target.value);
        }, false);

        //Solo Checkbox
        var solo = document.createElement('input');
        solo.setAttribute('type', 'checkbox');
        if (!mythis.parent.stems[index].active) solo.setAttribute('disabled', true);
        mythis.stems[index].appendChild(solo);
        solo.addEventListener('change', function (e) {
          var elementindex = e.target.parentElement.getAttribute('data-index');
          mythis.parent.updateSoloing(elementindex, this.checked);
          mythis.updateSoloing(elementindex, this.checked);
        });
        if (!mythis.parent.stems[index].active) mythis.stems[index].className += 'inactive';
        stemlist[element.order] = mythis.stems[index];
      });
      stemlist.forEach(function (element, index) {
        mythis.stems_list.appendChild(element);
      });

      //Sortable
      var sortable = Sortable.create(mythis.stems_list, {
        onEnd: function onEnd(evt) {
          var neworder = new Array(evt.target.children.length);
          for (var i = 0; i < evt.target.children.length; ++i) {
            neworder[parseInt(evt.target.children[i].getAttribute('data-index'))] = i;
          }
          mythis.state.order = neworder;
          mythis.parent.updateStemOrder(neworder);
          mythis.status_changed.innerHTML = '*';
        }
      });
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
    key: "updateSoloing",
    value: function updateSoloing(which, checked) {
      if (checked) {
        this.stems.forEach(function (element, index) {
          if (which != index) element.classList.add('hidden');
        });
      } else {
        this.stems.forEach(function (element, index) {
          element.classList.remove('hidden');
        });
      }
    }
  }, {
    key: "loadState",
    value: function loadState() {
      console.log('load state');
    }
  }, {
    key: "saveState",
    value: function saveState() {
      var mythis = this;
      this.status.innerHTML = 'saving';
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          mythis.status.innerHTML = '';
          mythis.status_changed.innerHTML = '';
          console.log(JSON.parse(this.responseText));
        }
      };
      xhttp.open("POST", "/config/save", true);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send(JSON.stringify(this.state));
    }
  }]);
}(); //
//# sourceMappingURL=song_gui-compiled.js.map
