import Sortable from 'sortablejs';

export class SongGui {

  constructor(parent) {
    this.parent = parent;
    this.visible = false;

    //State
    this.state = {
      location: parent.location,
      order:[],
      colorset:'colorsWarmCold',
      colors:[]
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

  init() {
    const mythis = this;

    this.title.innerHTML = this.parent.mp3file;

    //Menu Buttons
    //this.button_stop.addEventListener('click', e => {
    //  e.preventDefault();
    //  mythis.parent.parent.stop();
    //});
    this.button_load.addEventListener('click', e => {
      e.preventDefault();
      if (this.visible) {
        mythis.loadState();
      } else {
        console.log('fuck off');
      }
    });
    this.button_save.addEventListener('click', e => {
      e.preventDefault();
      if (this.visible) {
        mythis.saveState();
      } else {
        console.log('fuck off');
      }
    });

    //Parameters
    this.state.colors = this.parent.colors;
    this.state.order = this.parent.order;

    //Tracks
    const stemlist = new Array(this.parent.stems.length);
    this.parent.stems.forEach((element, index) => {
      mythis.stems[index] = document.createElement('li');
      mythis.stems[index].setAttribute('data-index', index);

      //Name
      const name = document.createElement('div');
      name.setAttribute('class', 'name');
      name.innerHTML = mythis.parent.stems[index].name;
      mythis.stems[index].appendChild(name);

      //Color
      const color = document.createElement('input');
      color.setAttribute('type', 'color');
      color.setAttribute('value', mythis.state.colors[index]);
      if (!mythis.parent.stems[index].active) color.setAttribute('disabled', true);
      mythis.stems[index].appendChild(color);
      color.addEventListener('input', function(e) {
        mythis.status_changed.innerHTML = '*';
        const elementindex = e.target.parentElement.getAttribute('data-index');
        mythis.state.colors[elementindex] = e.target.value;
        mythis.parent.updateStemColor(elementindex, e.target.value);
      }, false);

      //Solo Checkbox
      const solo = document.createElement('input');
      solo.setAttribute('type', 'checkbox');
      if (!mythis.parent.stems[index].active) solo.setAttribute('disabled', true);
      mythis.stems[index].appendChild(solo);
      solo.addEventListener('change', function(e) {
        const elementindex = e.target.parentElement.getAttribute('data-index');
        mythis.parent.updateSoloing(elementindex, this.checked);
        mythis.updateSoloing(elementindex, this.checked);
      });


      if (!mythis.parent.stems[index].active) mythis.stems[index].className += 'inactive';
      stemlist[element.order] = mythis.stems[index];
    });
    stemlist.forEach(function(element) {
      mythis.stems_list.appendChild(element);
    });

    //Sortable
    Sortable.create(mythis.stems_list, {
    	onEnd: function(evt) {
        const neworder = new Array(evt.target.children.length);
        for (let i = 0; i < evt.target.children.length; ++i) {
          neworder[parseInt(evt.target.children[i].getAttribute('data-index'))] = i;
        }
        mythis.state.order = neworder;
        mythis.parent.updateStemOrder(neworder);
        mythis.status_changed.innerHTML = '*';
    	},
    });
  }

  updateVisibility(visible) {
    this.visible = visible;
    if (visible) {
      this.container.classList.remove('hidden');
    } else {
      this.container.classList.add('hidden');
    }
  }

  updateSoloing(which, checked) {
    if (checked) {
      this.stems.forEach(function(element, index) {
        if (which !== index) element.classList.add('hidden');
      });
    } else {
      this.stems.forEach(function(element) {
        element.classList.remove('hidden');
      });
    }
  }

  loadState() {
    console.log('load state');
  }

  saveState() {
    const mythis = this;
    this.status.innerHTML = 'saving';
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        mythis.status.innerHTML = '';
        mythis.status_changed.innerHTML = '';
        console.log(JSON.parse(this.responseText));
      }
    };
    xhttp.open('POST', '/config/save', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(this.state));
  }
}
