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
      /*this.socket = io.connect('http://localhost:3000');*/
      this.export = false; //Not really working
      this.stop_on_next = false;
      this.hide_controls = true;

      //Scene variables
      this.container = document.getElementById('container');
      this.loadingdiv = document.getElementById('loading');
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.camera = new THREE.PerspectiveCamera(8, window.innerWidth / window.innerHeight, 0.1, 10000);
      this.cameralookat = new THREE.Vector3(0, 1.2, 0);
      this.renderer.shadowMap.enabled = true;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.container.appendChild(this.renderer.domElement);
      this.audiolistener = new THREE.AudioListener();
      this.camera.add(this.audiolistener);

      //Variables
      this.fps = 24;
      this.animationstart = 0;
      this.now;
      this.then = Date.now();
      this.interval = 1000/this.fps;
      this.delta;
      this.frame = 0;
      this.currentsong = 0;

      this.gui = new SceneGui(this);
      //if(this.hide_controls) this.gui.updateVisibility(false);

      //Stats
      this.stats = new Stats();
      this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.bottom = '0px';
      this.stats.domElement.style.zIndex = 100;
      if(!this.hide_controls) this.container.appendChild( this.stats.domElement );

      //Controls
      document.getElementById('game-stop').addEventListener('click', e => {
        e.preventDefault();
        mythis.stopplay();
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

      //Camera
      this.camera.position.set(0, 3, 26); //-15, 10, 20 | 0, 3, 20 | -10, 5, 10
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
      /*const skyBoxGeometry = new THREE.CubeGeometry( 20, 20, 20);
      const skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide } );
      const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
      skyBox.name = 'skybox';
      this.scene.add(skyBox);*/

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

        //Songs
        mythis.songs = [];
        let location = '';

        //Foreach Song, load hidden
        let songcount = mythis.playlist.songs.length;
        //let songcount = 2;
        for(let i=0; i<songcount; i++){
          location = 'content/'+mythis.playlist.songs[i]+'/';
          mythis.songs[i] = new Song(mythis, location, '_analysis_files.json', '_config.json', mythis.scene, mythis.audiolistener, mythis.fps, mythis.hide_controls);
          mythis.songs[i].onLoaded = () => {
            console.log(mythis.songs[i]);

            //Detect when all loaded
            let loaded = true;
            for(let j=0; j<songcount; j++){
              if(!mythis.songs[j].loaded){
                loaded = false;
              }
            }
            if(loaded){
              mythis.preloaded();
            }
          };
        }
      });

    }

    preloaded(){
      var mythis = this;
      this.loadingdiv.style.visibility='hidden';
      setTimeout(function(){
        console.log('preloaded');
        mythis.gui.init();
        mythis.initAnimate();
        mythis.play(mythis.currentsong);
      }, 1000);
    }

    //////////////////////////////////////////////////////////////////////////////
    //PLAYBACK////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    play(which){
      if(which) this.currentsong = which;
      this.songs[this.currentsong].play(0);
    }

    stopplay() {
      var mythis = this;
      if(this.paused){
        this.songs[this.currentsong].play();
        this.paused = false;
        requestAnimationFrame(() => { mythis.animate(); });
      }else{
        this.songs[this.currentsong].stop();
        this.paused = true;
      }
    }

    fastforward(){
      this.songs[this.currentsong].fastforward();
    }

    nextsong(){
      if(this.stop_on_next){
        this.stopplay();
      }else{
        var mythis = this;
        this.songs[this.currentsong].stop();
        setTimeout(function(){
          mythis.currentsong++;
          if(mythis.currentsong == mythis.playlist.songs.length) mythis.currentsong = 0;
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
    initAnimate() {
      const mythis = this;
      this.paused = false;
      this.frame = 0;
      this.animationstart = Date.now();

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(() => {
        mythis.animate();
      });
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
          //this.socket.emit('render-frame', {frame: mythis.frame, file: document.querySelector('canvas').toDataURL()});
        }
        this.stats.update();
        this.frame = Math.round((this.now - this.animationstart) / 41.666666666); //1000ms / 24fps = 41.666666666
      }
    }

    updateScene() {
      this.songs[this.currentsong].updateAnimation();
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
