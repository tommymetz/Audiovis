class SceneGui {

  constructor(parent){
    const mythis = this;
    this.parent = parent;
    this.visible = false;
    this.paused = false;

    //State
    this.state = {

    };

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

  init(){
    const mythis = this;
    this.updateVisibility(true);

    //this.title.innerHTML = this.parent.playlist.name;

    //Menu Buttons
    this.button_stopplay.addEventListener('click', e => {
      e.preventDefault();
      mythis.stopplay();
    });
    this.button_fastforward.addEventListener('click', e => {
      e.preventDefault();
      mythis.fastforward();
    });
    this.button_nextsong.addEventListener('click', e => {
      e.preventDefault();
      mythis.nextsong();
    });
  }


  updateSongTitle(title){
    this.song_title.innerHTML = title;
  }

  updateStopPlayButtonState(paused){
    if(!paused){
      this.button_stopplay.innerHTML = 'stop';
      this.paused = false;
    }else{
      this.button_stopplay.innerHTML = 'play';
      this.paused = true;
    }
  }

  updateVisibility(visible){
    this.visible = visible;
    if(visible){
      this.container.classList.remove('hidden');
    }else{
      this.container.classList.add('hidden');
    }
  }

  stopplay(){
    if(this.paused){
      this.button_stopplay.innerHTML = 'stop';
      this.paused = false;
    }else{
      this.button_stopplay.innerHTML = 'play';
      this.paused = true;
    }
    this.parent.stopplay();
  }

  fastforward(){
    this.button_stopplay.innerHTML = 'stop';
    this.paused = false;
    document.getElementById('playdiv').style.display = 'none';
    this.parent.fastforward();
  }

  nextsong(){
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
}

// Expose to global scope for compatibility
window.SceneGui = SceneGui;








//
