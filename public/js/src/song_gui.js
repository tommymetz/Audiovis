class SongGui {

  constructor(parent){
    const mythis = this;
    this.parent = parent;

    //State
    this.state = {
      order:[],
      colorset:'',
    };

    //Gui Container
    this.container = document.createElement('div');
    this.parent.parent.container.appendChild(this.container);
    this.container.setAttribute('class', 'song-gui-container');

      //Menu Bar
      this.menu = document.createElement('div');
      this.container.appendChild(this.menu);
      this.menu.setAttribute('class', 'song-gui-menu');

        //Changed

        //Song Title

        //Stop
        this.button_stop = document.createElement('a');
        this.menu.appendChild(this.button_stop);
        this.button_stop.setAttribute('class', 'song-gui-item');
        this.button_stop.setAttribute('href', '#');
        this.button_stop.innerHTML = 'stop';

        //Load
        this.button_load = document.createElement('a');
        this.menu.appendChild(this.button_load);
        this.button_load.setAttribute('class', 'song-gui-item');
        this.button_load.setAttribute('href', '#');
        this.button_load.innerHTML = 'load';

        //Save
        this.button_save = document.createElement('a');
        this.menu.appendChild(this.button_save);
        this.button_save.setAttribute('class', 'song-gui-item');
        this.button_save.setAttribute('href', '#');
        this.button_save.innerHTML = 'save';


      //Stems - https://github.com/RubaXa/Sortable
      this.stems = [];
      this.stems_list = document.createElement('ul');
      this.container.appendChild(this.stems_list);
      this.stems_list.setAttribute('class', 'song-gui-list');

        //this.tracks[0] = document.createElement('li');
        //this.tracks_list.appendChild(this.tracks[0]);
        //this.tracks[0].innerHTML = 'itemm';

  }

  init(){
    const mythis = this;
    this.button_stop.addEventListener('click', e => {
      e.preventDefault();
      mythis.parent.parent.stop();
    });
    this.button_load.addEventListener('click', e => {
      e.preventDefault();
      mythis.loadState();
    });
    this.button_save.addEventListener('click', e => {
      e.preventDefault();
      mythis.saveState();
    });

    //Tracks
    this.parent.stems.forEach(function(element, index){
      const order = element.order;
      mythis.stems[index] = document.createElement('li');
      mythis.stems[index].setAttribute('data-index', order);
      if(!mythis.parent.stems[order].active) mythis.stems[index].className += 'inactive';
      mythis.stems_list.appendChild(mythis.stems[index]);
      mythis.stems[index].innerHTML = mythis.parent.stems[order].name;
    });

    //Sortable
    var sortable = Sortable.create(mythis.stems_list, {
    	onEnd: function(evt){
        let neworder = new Array(evt.target.children.length);
        for (var i = 0; i < evt.target.children.length; ++i) {
          neworder[parseInt(evt.target.children[i].getAttribute('data-index'))] = i;
        }
        mythis.state.order = neworder;
        mythis.parent.updateStemOrder(neworder);
    	},
    });
  }

  loadState(){
    console.log('load state');
  }

  saveState(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(JSON.parse(this.responseText));
      }
    };
    xhttp.open("POST", "/config/save", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(this.state));
  }
}


//const SongGui = function(parent){
  //const mythis = this;
  //this.parent = parent;






  //this.ui = {
    //stop() {
    //  mythis.parent.stop();
    //},
    //trackorder: '0,1,2,3,4,5,6,7,8,9,10',
    //displayOutline: false,
    //maxSize: 6.0,
    //speed: 5,
    //height: 10,
    //noiseStrength: 10.2,
    //growthSpeed: 0.2,
    //type: 'three',

    //color0: "#ffae23", // CSS string
    //color1: [ 0, 128, 255 ], // RGB array
    //color2: [ 0, 128, 255, 0.3 ], // RGB with alpha
    //color3: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
  //};

  //this.gui = new dat.gui.GUI();
  //this.gui.remember(this.ui);
  //this.gui.add(this.ui, 'stop');
  //this.trackorder = this.gui.add(this.ui, 'trackorder');




//};



/*gui.add(ui, 'displayOutline');
gui.add(ui, 'maxSize').min(-10).max(10).step(0.25);
gui.add(ui, 'height').step(5); // Increment amount
// Choose from accepted values
gui.add(ui, 'type', [ 'one', 'two', 'three' ] );
// Choose from named values
gui.add(ui, 'speed', { Stopped: 0, Slow: 0.1, Fast: 5 } );
var f1 = gui.addFolder('Colors');
f1.open();
f1.addColor(ui, 'color0');
f1.addColor(ui, 'color1');
f1.addColor(ui, 'color2');
f1.addColor(ui, 'color3');
var f2 = gui.addFolder('Another Folder');
f2.add(ui, 'noiseStrength');
var f3 = f2.addFolder('Nested Folder');
f3.add(ui, 'growthSpeed');*/

//onLoaded handler
/*this.stop = function() {
  if(typeof this.onStop === "function"){
    this.onStop();
  }
};*/

//
