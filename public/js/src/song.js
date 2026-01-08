class Song {
  constructor(parent, location, songjsonfile, attributesjson, scene, audiolistener, fps, hide_controls=false) {
    const mythis = this;
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
    this.stemgroup.position.set(0,0,1.2);
    this.scene.add(this.stemgroup);

    this.frame = 0;
    this.offset = 0;
    this.starttime = 0;

    //onLoaded handler
    this.isLoaded = function() {
      if(typeof this.onLoaded === "function"){
        this.loaded = true;
        this.gui.init();
        this.onLoaded();
      }
    };

    //Load JSON
    //mythis.loadJSON(`${mythis.location + mythis.songjsonfile}?v=${Math.round(Math.random()*1000)}`, response => {
    mythis.loadJSON(`${mythis.location + mythis.songjsonfile}`, response => {
      const json = JSON.parse(response);
      mythis.mp3file = json[0].mp3file;
      mythis.stemnames = json[0].audiofiles;

      //Load attributes
      //mythis.loadJSON(`${mythis.location + mythis.attributesjson}?v=${Math.round(Math.random()*1000)}`, response => {
      mythis.loadJSON(`${mythis.location + mythis.attributesjson}`, response => {
        const json = JSON.parse(response);
        mythis.attributes = json;

        //Colors
        if(mythis.attributes.colors.length == 0){

          //Populate with colorset
          let colorindex = 0;
          let colorset = eval(mythis.attributes.colorset);
          mythis.stemnames.forEach(function(element, index){
            mythis.colors.push(colorset[colorindex]);
            colorindex++;
            if(index == colorset.length-1) colorindex = 0;
          });
        }else{
          mythis.colors = mythis.attributes.colors;
        }

        //Order
        if(mythis.attributes.order.length == 0){
          mythis.stemnames.forEach(function(element, index){
            mythis.order.push(index);
          });
        }else{
          mythis.order = mythis.attributes.order;
        }

        //Load mp3file
        const loader = new THREE.AudioLoader();
        loader.load(mythis.location + mythis.mp3file, audioBuffer => {
          mythis.audiotrack.setBuffer( audioBuffer );
          mythis.audiotrack.setLoop(false);
          mythis.audiotrack.setVolume(1.0);
          mythis.audiotrack.onEnded = function(){
            if(!mythis.ignoreending){
              if(mythis.visible){
                mythis.updateVisibility(false);
                mythis.parent.nextsong();
              }
            }
          };

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

    //Create the stem
    const thestem = new Stem(this.location, name, i, order, this.scene, this.stemgroup, this.colors[i]);
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

  //////////////////////////////////////////////////////////////////////////////
  //VISUALS/////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  updateVisibility(visible){
    this.visible = visible;
    if(this.hide_controls){
      this.gui.updateVisibility(false);
    }else{
      this.gui.updateVisibility(visible);
    }
    for(let i=0; i<this.stemnames.length; i++){
      this.stems[i].updateVisibility(visible);
    }
  }

  updateStemOrder(order){
    for(let i=0; i<this.stemnames.length; i++){
      this.stems[i].updateOrder(order[i]);
    }
  }

  updateStemColor(which, color){
    this.stems[which].updateColors(color);
  }

  updateSoloing(which, checked){
    if(checked){
      this.stems.forEach(function(element, index){
        if(which != index) element.hide();
      });
    }else{
      this.stems.forEach(function(element, index){
        element.show();
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //PLAYBACK////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  play(offset = 0) {
    var mythis = this;
    this.offset = offset;
    this.offsetframes = this.offset * this.fps;

    //Playback
    if(this.audiotrack.isPlaying) this.audiotrack.stop();
    this.audiotrack.offset = this.offset;
    this.audiotrack.play();
    // Capture the audio context time when play is called
    this.starttime = this.audiotrack.context.currentTime;
    this.updateVisibility(true);
  }

  stop(){
    this.updateVisibility(false);
    if(this.audiotrack.isPlaying) this.audiotrack.stop();
  }

  fastforward(){
    var mythis = this;
    this.ignoreending = true;
    var time = this.audiotrack.context.currentTime + this.audiotrack.offset + 5;
    if(time < this.audiotrack.buffer.duration){
      this.play(time);
      setTimeout(function(){ mythis.ignoreending = false; }, 10); //Revert after ending fired
    }else{
      this.updateVisibility(false);
      this.parent.nextsong();
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //ANIMATE/////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  updateAnimation() {
    if(this.visible){
      var audioframe = (this.audiotrack.context.currentTime - this.starttime) * this.fps;
      this.frame = Math.round(audioframe + this.offsetframes); //1000ms / 24fps = 41.666666666
      
      // Guard against NaN frame values
      if (isNaN(this.frame) || this.frame < 0) {
        return;
      }
      
      for(let i=0; i<this.stems.length; i++){
        this.stems[i].updateAnimation(this.frame);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //UTIL////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  loadJSON(file, callback) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true);
    xobj.onreadystatechange = () => {
      if(xobj.readyState == 4 && xobj.status == "200") {callback(xobj.responseText);}
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
}
