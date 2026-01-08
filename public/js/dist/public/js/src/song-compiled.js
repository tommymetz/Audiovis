"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Song = /*#__PURE__*/function () {
  function Song(parent, location, songjsonfile, attributesjson, scene, audiolistener, fps) {
    var hide_controls = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
    _classCallCheck(this, Song);
    var mythis = this;
    this.parent = parent;
    this.location = location;
    this.songjsonfile = songjsonfile;
    this.attributesjson = attributesjson;
    this.scene = scene;
    this.audiolistener = audiolistener;
    this.fps = fps;
    this.hide_controls = hide_controls;

    //Variables
    this.active = false;
    this.audiotrack = new THREE.Audio(this.audiolistener);
    this.scene.add(this.audiotrack);
    this.mp3file;
    this.firststarttime = 0;
    this.ignoreending = false;
    this.stemnames = [];
    this.stems = [];
    this.loadingstage = 0;
    this.order = [];
    this.colors = [];
    this.loaded = false;
    this.visible = false;
    this.gui = new SongGui(this);
    this.stemgroup = new THREE.Group();
    this.stemgroup.position.set(0, 0, 1.2);
    this.scene.add(this.stemgroup);
    this.frame = 0;
    this.offset = 0;
    this.starttime = 0;

    //onLoaded handler
    this.isLoaded = function () {
      if (typeof this.onLoaded === "function") {
        this.loaded = true;
        this.gui.init();
        this.onLoaded();
      }
    };

    //Load JSON
    //mythis.loadJSON(`${mythis.location + mythis.songjsonfile}?v=${Math.round(Math.random()*1000)}`, response => {
    mythis.loadJSON("".concat(mythis.location + mythis.songjsonfile), function (response) {
      var json = JSON.parse(response);
      mythis.mp3file = json[0].mp3file;
      mythis.stemnames = json[0].audiofiles;

      //Load attributes
      //mythis.loadJSON(`${mythis.location + mythis.attributesjson}?v=${Math.round(Math.random()*1000)}`, response => {
      mythis.loadJSON("".concat(mythis.location + mythis.attributesjson), function (response) {
        var json = JSON.parse(response);
        mythis.attributes = json;

        //Colors
        if (mythis.attributes.colors.length == 0) {
          //Populate with colorset
          var colorindex = 0;
          var colorset = eval(mythis.attributes.colorset);
          mythis.stemnames.forEach(function (element, index) {
            mythis.colors.push(colorset[colorindex]);
            colorindex++;
            if (index == colorset.length - 1) colorindex = 0;
          });
        } else {
          mythis.colors = mythis.attributes.colors;
        }

        //Order
        if (mythis.attributes.order.length == 0) {
          mythis.stemnames.forEach(function (element, index) {
            mythis.order.push(index);
          });
        } else {
          mythis.order = mythis.attributes.order;
        }

        //Load mp3file
        var loader = new THREE.AudioLoader();
        loader.load(mythis.location + mythis.mp3file, function (audioBuffer) {
          mythis.audiotrack.setBuffer(audioBuffer);
          mythis.audiotrack.setLoop(false);
          mythis.audiotrack.setVolume(1.0);
          mythis.audiotrack.onEnded = function () {
            if (!mythis.ignoreending) {
              if (mythis.visible) {
                mythis.updateVisibility(false);
                mythis.parent.nextsong();
              }
            }
          };

          //Create stems
          for (var i = 0; i < mythis.stemnames.length; i++) {
            mythis.stems[i] = mythis.createStem(mythis.stemnames[i], i, mythis.order[i]);
          }
        });
      });
    });
  }
  return _createClass(Song, [{
    key: "createStem",
    value: function createStem(name, i, order) {
      var mythis = this;

      //Create the stem
      var thestem = new Stem(this.location, name, i, order, this.scene, this.stemgroup, this.colors[i]);
      thestem.onLoaded = function () {
        //If all stems are loaded
        var loaded = true;
        for (var j = 0; j < mythis.stemnames.length; j++) {
          if (!mythis.stems[j].loaded) {
            loaded = false;
          }
        }
        if (loaded) {
          mythis.isLoaded();
        }
      };
      return thestem;
    }

    //////////////////////////////////////////////////////////////////////////////
    //VISUALS/////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
  }, {
    key: "updateVisibility",
    value: function updateVisibility(visible) {
      this.visible = visible;
      if (this.hide_controls) {
        this.gui.updateVisibility(false);
      } else {
        this.gui.updateVisibility(visible);
      }
      for (var i = 0; i < this.stemnames.length; i++) {
        this.stems[i].updateVisibility(visible);
      }
    }
  }, {
    key: "updateStemOrder",
    value: function updateStemOrder(order) {
      for (var i = 0; i < this.stemnames.length; i++) {
        this.stems[i].updateOrder(order[i]);
      }
    }
  }, {
    key: "updateStemColor",
    value: function updateStemColor(which, color) {
      this.stems[which].updateColors(color);
    }
  }, {
    key: "updateSoloing",
    value: function updateSoloing(which, checked) {
      if (checked) {
        this.stems.forEach(function (element, index) {
          if (which != index) element.hide();
        });
      } else {
        this.stems.forEach(function (element, index) {
          element.show();
        });
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    //PLAYBACK////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
  }, {
    key: "play",
    value: function play() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var mythis = this;
      this.offset = offset;
      this.offsetframes = this.offset * this.fps;

      //Playback
      if (this.audiotrack.isPlaying) this.audiotrack.stop();
      this.audiotrack.offset = this.offset;
      this.audiotrack.play();
      // Capture the audio context time when play is called
      this.starttime = this.audiotrack.context.currentTime;
      this.updateVisibility(true);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.updateVisibility(false);
      if (this.audiotrack.isPlaying) this.audiotrack.stop();
    }
  }, {
    key: "fastforward",
    value: function fastforward() {
      var mythis = this;
      this.ignoreending = true;
      var time = this.audiotrack.context.currentTime + this.audiotrack.offset + 5;
      if (time < this.audiotrack.buffer.duration) {
        this.play(time);
        setTimeout(function () {
          mythis.ignoreending = false;
        }, 10); //Revert after ending fired
      } else {
        this.updateVisibility(false);
        this.parent.nextsong();
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    //ANIMATE/////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
  }, {
    key: "updateAnimation",
    value: function updateAnimation() {
      if (this.visible) {
        var audioframe = (this.audiotrack.context.currentTime - this.starttime) * this.fps;
        this.frame = Math.round(audioframe + this.offsetframes); //1000ms / 24fps = 41.666666666

        // Guard against NaN frame values
        if (isNaN(this.frame) || this.frame < 0) {
          return;
        }
        for (var i = 0; i < this.stems.length; i++) {
          this.stems[i].updateAnimation(this.frame);
        }
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    //UTIL////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
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

    //var audioframe = Math.round((this.audiotrack.context.currentTime - this.audiotrack.startTime) * this.fps) - this.startframe + this.offsetframes; //1000ms / 24fps = 41.666666666

    /*
    
    //Load master json file
    /*var loader = new THREE.FileLoader(this.loadingmanager);
    loader.load(this.songjsonfile + "?v=" + Math.round(Math.random()*1000), function(data){
      mythis.stems = JSON.parse(data)[0].audiofiles;
    });
    */

    //
  }]);
}();
//# sourceMappingURL=song-compiled.js.map
