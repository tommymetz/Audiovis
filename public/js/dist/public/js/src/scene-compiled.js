"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
(function () {
  // WebGL detection function (replaces deprecated Detector.js)
  function isWebGLAvailable() {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  //Detect and start game
  window.onload = function () {
    if (isWebGLAvailable()) {
      var ua = navigator.userAgent;
      //console.log('ua', ua);
      var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
      if (is_ie) {
        document.getElementById('loading').innerHTML = 'Please use a different browser. This site works best in Chrome.';
      } else {
        var theScene = new Scene();
      }
    } else {
      console.log('WebGL is not available in this browser');
      document.getElementById('loading').innerHTML = 'This browser does not support WebGL';
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //GAME INIT////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var Scene = /*#__PURE__*/function () {
    function Scene() {
      _classCallCheck(this, Scene);
      var mythis = this;

      //Backend connection
      /*this.socket = io.connect('http://localhost:3000');*/
      this["export"] = false; //Not really working
      this.stop_on_next = false;
      this.hide_controls = true;

      //Scene variables
      this.container = document.getElementById('container');
      this.loadingdiv = document.getElementById('loading');
      this.playdiv = document.getElementById('playdiv');
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 10000);
      this.cameralookat = new THREE.Vector3(0, 1.2, 0);
      this.renderer.shadowMap.enabled = true;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.container.appendChild(this.renderer.domElement);
      this.audiolistener = new THREE.AudioListener();
      this.camera.add(this.audiolistener);

      //Variables
      this.app_preloaded = false;
      this.fps = 24;
      this.animationstart = 0;
      this.now;
      this.then = Date.now();
      this.interval = 1000 / this.fps;
      this.delta;
      this.frame = 0;
      this.currentsong = 0;
      this.gui = new SceneGui(this);
      //if(this.hide_controls) this.gui.updateVisibility(false);

      //Stats
      this.stats = new Stats();
      this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.bottom = '0px';
      this.stats.domElement.style.zIndex = 100;
      if (!this.hide_controls) this.container.appendChild(this.stats.domElement);

      //Controls
      document.getElementById('game-stop').addEventListener('click', function (e) {
        e.preventDefault();
        mythis.stopplay();
      });
      document.getElementById('playdiv-begin').addEventListener('click', function (e) {
        e.preventDefault();
        mythis.playdiv.style.display = 'none';
        if (!mythis.app_preloaded) {
          mythis.preloaded();
        } else {
          mythis.stopplay();
          mythis.gui.updateStopPlayButtonState(false);
        }
      });

      //Initialize
      this.initScene();
    }
    return _createClass(Scene, [{
      key: "initScene",
      value: function initScene(stage) {
        var mythis = this;

        ////////////////////////////////////////////////////////////////////////////
        //SCENE/////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////

        // CONTROLS
        this.orbitcontrols = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        //Camera
        this.camera.position.set(0, -10, 22); //-15, 10, 20 | 0, 3, 20 | -10, 5, 10
        this.camera.lookAt(this.cameralookat);
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
          mythis.camera.aspect = window.innerWidth / window.innerHeight;
          mythis.camera.updateProjectionMatrix();
          mythis.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        //LIGHT
        /*var light = new THREE.PointLight( 0xffffff, 1);
        light.position.set(0, 1, 3);
        this.scene.add( light );
        var pointLightHelper = new THREE.PointLightHelper(light, 0.1);
        this.scene.add( pointLightHelper );*/

        //LIGHT
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.rotation.set(0, 0, 0);
        directionalLight.position.set(0, 0, 5);
        this.scene.add(directionalLight);
        //var helper = new THREE.DirectionalLightHelper( directionalLight, 1 );
        //this.scene.add( helper );

        //Sky Fog
        /*const skyBoxGeometry = new THREE.CubeGeometry( 20, 20, 20);
        const skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide } );
        const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
        skyBox.name = 'skybox';
        this.scene.add(skyBox);*/

        //Floor
        var geometry = new THREE.PlaneGeometry(2, 4);
        var material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.2
        });
        this.floor = new THREE.Mesh(geometry, material);
        this.floor.position.set(0, 0, 0);
        this.floor.rotation.set(Math.PI / 2, 0, 0);
        this.scene.add(this.floor);

        ////////////////////////////////////////////////////////////////////////////
        //PLAYLIST//////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////

        //Load playlist json
        this.loadJSON('content/_playlist.json', function (response) {
          mythis.playlist = JSON.parse(response);
          //console.log('playlist', mythis.playlist);

          //Songs
          mythis.songs = [];
          var location = '';

          //Foreach Song, load hidden
          var songcount = mythis.playlist.songs.length;
          var songi = 0;
          //songcount = 1;
          for (var i = 0; i < songcount; i++) {
            location = 'content/' + mythis.playlist.songs[i] + '/';
            mythis.songs[i] = new Song(mythis, location, '_analysis_files.json', '_config.json', mythis.scene, mythis.audiolistener, mythis.fps, mythis.hide_controls);
            mythis.songs[i].onLoaded = function () {
              //console.log(mythis.songs[i]);
              songi++;
              mythis.loadingdiv.innerHTML = '<img src="img/loading-icon.gif" width="30" /><br>Loading Interactive Experience<br>Song ' + songi + ' of ' + songcount + ' loaded';

              //Detect when all loaded
              var loaded = true;
              for (var j = 0; j < songcount; j++) {
                if (!mythis.songs[j].loaded) {
                  loaded = false;
                }
              }
              if (loaded) {
                mythis.loadingdiv.style.visibility = 'hidden';
                mythis.playdiv.style.display = 'block';
              }
            };
          }
        });
      }
    }, {
      key: "preloaded",
      value: function preloaded() {
        var mythis = this;
        this.app_preloaded = true;
        this.loadingdiv.style.visibility = 'hidden';
        setTimeout(function () {
          //console.log('preloaded');
          mythis.gui.init();
          mythis.initAnimate();
          mythis.play(mythis.currentsong);
        }, 1000);
      }

      //////////////////////////////////////////////////////////////////////////////
      //PLAYBACK////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////////////////////
    }, {
      key: "play",
      value: function play(which) {
        if (which) this.currentsong = which;
        this.songs[this.currentsong].play(0);
        var title = '"' + this.songs[this.currentsong].mp3file.substring(0, this.songs[this.currentsong].mp3file.length - 4) + '"';
        this.gui.updateSongTitle(title);
      }
    }, {
      key: "stopplay",
      value: function stopplay() {
        var mythis = this;
        if (this.paused) {
          this.songs[this.currentsong].play();
          this.playdiv.style.display = 'none';
          this.paused = false;
          requestAnimationFrame(function () {
            mythis.animate();
          });
        } else {
          this.songs[this.currentsong].stop();
          this.playdiv.style.display = 'block';
          this.paused = true;
        }
      }
    }, {
      key: "fastforward",
      value: function fastforward() {
        this.paused = false;
        this.songs[this.currentsong].fastforward();
      }
    }, {
      key: "nextsong",
      value: function nextsong() {
        this.paused = false;
        if (this.stop_on_next) {
          this.stopplay();
        } else {
          var mythis = this;
          this.songs[this.currentsong].stop();
          setTimeout(function () {
            mythis.currentsong++;
            if (mythis.currentsong == mythis.playlist.songs.length) mythis.currentsong = 0;
            mythis.play();
          }, 0);
        }
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //ANIMATE//////////////////////////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }, {
      key: "initAnimate",
      value: function initAnimate() {
        var mythis = this;
        this.paused = false;
        this.frame = 0;
        this.animationstart = Date.now();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(function () {
          mythis.animate();
        });
      }
    }, {
      key: "animate",
      value: function animate() {
        var mythis = this;
        //if(!this.paused){ requestAnimationFrame(() => { mythis.animate(); }); };
        requestAnimationFrame(function () {
          mythis.animate();
        });

        //Frame quantization
        this.now = Date.now();
        this.delta = this.now - this.then;
        if (this.delta > this.interval) {
          //Update scene
          this.updateScene();

          //Turnaround
          this.then = this.now - this.delta % this.interval;
          this.renderer.render(this.scene, this.camera);
          if (this["export"]) {
            //this.socket.emit('render-frame', {frame: mythis.frame, file: document.querySelector('canvas').toDataURL()});
          }
          this.stats.update();
          this.frame = Math.round((this.now - this.animationstart) / 41.666666666); //1000ms / 24fps = 41.666666666
        }
      }
    }, {
      key: "updateScene",
      value: function updateScene() {
        this.songs[this.currentsong].updateAnimation();
        this.camera.lookAt(this.cameralookat);
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
  }();
})();

//
//# sourceMappingURL=scene-compiled.js.map
