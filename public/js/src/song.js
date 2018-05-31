class Song {
  constructor(parent, location, songjsonfile, attributesjson, scene, audiolistener, fps) {
    const mythis = this;
    this.parent = parent;
    this.location = location;
    this.songjsonfile = songjsonfile;
    this.attributesjson = attributesjson;
    this.scene = scene;
    this.audiolistener = audiolistener;
    this.fps = fps;

    //Variables
    this.audiotrack = new THREE.Audio(this.audiolistener);
    this.scene.add(this.audiotrack);
    this.mp3file;
    this.audiotrack;
    this.stemnames = [];
    this.stems = [];
    this.loadingstage = 0;
    this.order = [];

    this.gui = new SongGui(this);

    this.stemgroup = new THREE.Group();
    this.stemgroup.position.set(0,0,1.2);
    this.scene.add(this.stemgroup);

    this.frame = 0;
    this.offset = 0;
    this.startframe = 0;

    //onLoaded handler
    this.isLoaded = function() {
      if(typeof this.onLoaded === "function"){
        this.gui.init();
        this.onLoaded();
      }
    };

    //Load JSON
    mythis.loadJSON(`${mythis.location + mythis.songjsonfile}?v=${Math.round(Math.random()*1000)}`, response => {
      const json = JSON.parse(response);
      mythis.mp3file = json[0].mp3file;
      mythis.stemnames = json[0].audiofiles;

      //Load attributes
      mythis.loadJSON(`${mythis.location + mythis.attributesjson}?v=${Math.round(Math.random()*1000)}`, response => {
        const json = JSON.parse(response);
        mythis.attributes = json;

        //Load mp3file
        const loader = new THREE.AudioLoader();
        loader.load(mythis.location + mythis.mp3file, audioBuffer => {
          mythis.audiotrack.setBuffer( audioBuffer );
          mythis.audiotrack.setLoop(false);
          mythis.audiotrack.setVolume(1.0);
          mythis.order = mythis.attributes.order;

          //Create stems
          for(let i=0; i<mythis.stemnames.length; i++){
            mythis.stems[i] = mythis.createStem(mythis.stemnames[i], i, mythis.order[i]);
          }
        });
      });
    });
  }

  createStem(name, i, order) {
    const mythis = this;

    //Attributes
    //this.colors = new window[this.attributes.colors];
    this.colors = colorsWarmCold;

    //Create the stem
    const thestem = new Stem(this.location, name, i, order, this.scene, this.stemgroup, this.colors);
    thestem.onLoaded = () => {

      //If all stems are loaded
      let loaded = true;
      for(let j=0; j<mythis.stemnames.length; j++){
        if(!mythis.stems[j].loaded){
          loaded = false;
        }
      }
      if(loaded){
        mythis.isLoaded();
      }
    }
    return thestem;
  }

  updateStemOrder(order){
    for(let i=0; i<this.stemnames.length; i++){
      this.stems[i].updateOrder(order[i]);
    }
  }

  play(offset) {
    if(offset) this.offset = offset;
    this.offsetframes = this.offset * this.fps;

    //Play
    this.startframe = this.frame;
    this.audiotrack.offset = this.offset;
    this.audiotrack.play();
  }

  updateAnimation(frame) {
    this.frame = frame;
    var frame = this.frame - this.startframe + this.offsetframes;
    for(let i=0; i<this.stems.length; i++){
      this.stems[i].updateAnimation(frame);
    }
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










  /*



  //Load master json file
  /*var loader = new THREE.FileLoader(this.loadingmanager);
  loader.load(this.songjsonfile + "?v=" + Math.round(Math.random()*1000), function(data){
    mythis.stems = JSON.parse(data)[0].audiofiles;
  });
  */




  //
}
