(() => {

  //Detect and start game
  window.onload = () => {
    if(Detector.webgl){
      const theScene = new Scene();
    }else{
      const warning = Detector.getWebGLErrorMessage();
      console.log('webgl warning', warning);
      document.getElementById('game').innerHTML = 'This browser does not support WebGL';
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //GAME INIT////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  class Scene {
    constructor() {
      const mythis = this;

      //Backend connection
      this.socket = io.connect('http://localhost:3000');
      this.export = false;

      //Scene variables
      this.container = document.getElementById('container');
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 10000);
      this.renderer.shadowMap.enabled = true;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.container.appendChild(this.renderer.domElement);
      this.audiolistener = new THREE.AudioListener();
      this.camera.add(this.audiolistener);

      //Scene params
      this.fps = 24;
      this.animationstart = 0;
      this.now;
      this.then = Date.now();
      this.interval = 1000/this.fps;
      this.delta;
      this.frame = 0;

      //Stats
      this.stats = new Stats();
      this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.bottom = '0px';
      this.stats.domElement.style.zIndex = 100;
      this.container.appendChild( this.stats.domElement );

      //Controls
      document.getElementById('game-stop').addEventListener('click', e => {
        e.preventDefault();
        mythis.stop();
      });

      //Initialize
      this.initScene();
    }

    initScene(stage) {
      const mythis = this;

      ////////////////////////////////////////////////////////////////////////////
      //SCENE/////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////

      // CONTROLS
      this.orbitcontrols = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.cameralookat = new THREE.Vector3(0, 1.5, 0);

      //Camera
      this.camera.position.set(-10, 5, 10); //-15, 10, 20 | 0, 3, 20
      this.camera.lookAt(this.cameralookat);
      window.addEventListener('resize', onWindowResize, false);
      function onWindowResize(){
          mythis.camera.aspect = window.innerWidth / window.innerHeight;
          mythis.camera.updateProjectionMatrix();
          mythis.renderer.setSize( window.innerWidth, window.innerHeight );
      }

      //LIGHT
      /*var light = new THREE.PointLight( 0xffffff, 1);
      light.position.set(0, 1, 3);
      this.scene.add( light );
      var pointLightHelper = new THREE.PointLightHelper(light, 0.1);
      this.scene.add( pointLightHelper );*/

      //LIGHT
      const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
      directionalLight.rotation.set(0, 0, 0);
      directionalLight.position.set(0,0,5);
      this.scene.add( directionalLight );
      //var helper = new THREE.DirectionalLightHelper( directionalLight, 1 );
      //this.scene.add( helper );

      //Sky Fog
      const skyBoxGeometry = new THREE.CubeGeometry( 20, 20, 20);
      const skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide } );
      const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
      skyBox.name = 'skybox';
      this.scene.add(skyBox);

      //Floor
      const geometry = new THREE.PlaneGeometry( 2, 4 );
      const material = new THREE.MeshStandardMaterial( {color: 0xffffff, side: THREE.DoubleSide, transparent:true, opacity:0.2} );
      this.floor = new THREE.Mesh( geometry, material );
      this.floor.position.set(0, 0, 0);
      this.floor.rotation.set(Math.PI / 2, 0, 0);
      this.scene.add( this.floor );

      ////////////////////////////////////////////////////////////////////////////
      //PLAYLIST//////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////

      //Load playlist json
      this.loadJSON('content/_playlist.json', response => {
        mythis.playlist = JSON.parse(response);
        console.log('playlist', mythis.playlist);
        //Scene view
        //mythis.gui = new SongGui(mythis);

        //Songs
        mythis.songs = [];
        const location = `content/${mythis.playlist.songs[6]}/`;
        mythis.songs[0] = new Song(mythis, location, '_analysis_files.json', '_config.json', mythis.scene, mythis.audiolistener, mythis.fps); //Details.wav, AudioTestFile.wav
        mythis.songs[0].onLoaded = () => {
          console.log(mythis);

          //Gui
          /*for(var i=0; i<this.stems.length; i++){
            var folder = mythis.gui.gui.addFolder(this.stems[i].name);
            folder.open();
            mythis.gui.ui['displayOutline' + i] = false;
            folder.add(mythis.gui.ui, 'displayOutline' + i);
          }*/

          //Start
          mythis.initAnimate();
          mythis.songs[0].play(0);

        }

      });

    }

    stop() {
      this.songs[0].audiotrack.stop();
      this.paused = true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //ANIMATE//////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    initAnimate() {
      const mythis = this;
      this.paused = false;

      //this.songs[0].audiotrack.play();
      mythis.animationstart = Date.now();

      setTimeout(() => {
        mythis.renderer.render(mythis.scene, mythis.camera);
        requestAnimationFrame(() => {
          mythis.animate();
        });
      }, 10);
    }

    animate() {
      const mythis = this;
      if(!this.paused){ requestAnimationFrame(() => { mythis.animate(); }); };

      //Frame quantization
      this.now = Date.now();
      this.delta = this.now - this.then;
      if(this.delta > this.interval){

        //Update scene
        this.updateScene();

        //Turnaround
        this.then = this.now - (this.delta % this.interval);
        this.renderer.render(this.scene, this.camera);
        if(this.export){
          this.socket.emit('render-frame', {frame: mythis.frame, file: document.querySelector('canvas').toDataURL()});
        }
        this.stats.update();
        this.frame = Math.round((this.now - mythis.animationstart) / 41.666666666); //1000ms / 24fps = 41.666666666
      }
    }

    updateScene() {
      this.songs[0].updateAnimation(this.frame);
      this.camera.lookAt(this.cameralookat);
    }

    loadJSON(file, callback) {
      const xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', file, true);
      xobj.onreadystatechange = () => {
        if(xobj.readyState == 4 && xobj.status == "200") {callback(xobj.responseText);}
      };
      xobj.send(null);
    }
  }
})();













//
