'use strict';
const form = document.querySelector('form');
let inputDistance = document.querySelector('.distance');
let inputDuration = document.querySelector('.duration');
let inputCadence = document.querySelector('.cadence');
let inputOptions = document.querySelector('.options');
let inputElevent = document.querySelector('.elevent');

let workoutList = document.querySelector('.list');
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-8);
  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
}
class Running extends Workout {
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.type = 'running';
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
  }
}
class Cycling extends Workout {
  constructor(distance, duration, coords, elevent) {
    super(distance, duration, coords);
    this.elevent = elevent;
    this.type = 'cycling';
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}
const run1 = new Running(5.2, 24, [39, -12], 178);
const cycling1 = new Cycling(27, 95, [39, -12], 523);

/////////////////////////////////
// main App
class App {
  #map;
  #mapEvent;
  #workOut = [];

  constructor() {
    this._getPosition();
    inputOptions.addEventListener('change', this._toggleEleventField);
    form.addEventListener('keydown', this._newWorkout.bind(this));
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('sorry we cannot get your location');
      }
    );
  }
  _loadMap(posistion) {
    const { latitude } = posistion.coords;
    const { longitude } = posistion.coords;
    const cords = [latitude, longitude];
    this.#map = L.map('map').setView(cords, 13);
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mabE) {
    this.#mapEvent = mabE;

    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleEleventField() {
    inputElevent.closest('.flex-div').classList.toggle('hidden-inp');
    inputCadence.closest('.flex-div').classList.toggle('hidden-inp');
  }

  _newWorkout(key) {
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const positive = (...inputs) => inputs.every((inp) => inp > 0);
    const { lat, lng } = this.#mapEvent.latlng;
    const showpopup = (color) => {
      L.marker([lat, lng])
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 120,
            autoClose: false,
            closeOnClick: false,
            className: color,
          })
        )
        .setPopupContent(updateUiMap(this.#workOut))
        .openPopup();
    };
    const updateUiMap = (arr) => {
      const workOut = arr.slice().pop(-1);
      const icon = workOut.type === 'running' ? '🏃‍♂️' : '🚴‍♀️';
      const date = new Intl.DateTimeFormat(navigator.language, {
        month: 'long',
        day: 'numeric',
      }).format(workOut.date);
      const workoutType = workOut.type === 'running' ? 'Running' : 'Cycling';
      return `${icon} ${workoutType} on ${date}`;
    };
    const updatUi = (arr) => {
      const workOut = arr.slice().pop(-1);
      const icon = workOut.type === 'running' ? '🦶🏼' : '⛰';
      const typeOfWorkout =
        workOut.type === 'running' ? workOut.pace : workOut.speed;
      const typeOfSpeed =
        workOut.type === 'running' ? workOut.cadence : workOut.elevent;
      const color =
        workOut.type === 'running' ? 'test-running' : 'test-cycling';
      const typeIcon = workOut.type === 'running' ? '🏃‍♂️' : '🚴‍♀️';
      const date = new Intl.DateTimeFormat(navigator.language, {
        month: 'long',
        day: 'numeric',
      }).format(workOut.date);
      const html = `  <div class="test ${color}">
      <h3>${workOut.type} on ${date}</h3>
      <ul>
        <li><span class="icon">${typeIcon}</span> ${workOut.distance} <span>km</span></li>
        <li><span class="icon">⏱</span> ${workOut.duration} <span>min</span></li>
        <li><span class="icon">⚡</span> ${typeOfWorkout} <span>km</span></li>
        <li><span class="icon">${icon}</span> ${typeOfSpeed} <span>spm</span></li>
      </ul>
    </div>`;
      workoutList.insertAdjacentHTML('beforeend', html);
      console.log(workOut);
    };

    // get data from form
    const type = inputOptions.value;
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;

    // if workout running , create running object
    const inputsEmpty = () => {
      inputDistance.value =
        inputDuration.value =
        inputCadence.value =
        inputElevent.value =
          '';
    };
    if (key.key === 'Enter') {
      if (type === 'running') {
        const cadence = +inputCadence.value;
        // check if data is valid
        if (
          !validInputs(distance, duration, cadence) ||
          !positive(distance, duration, cadence)
        ) {
          return alert('Inputs have to be positive number');
        } else {
          const running = new Running(distance, duration, [lat, lng], cadence);
          // console.log(running);
          // render workout on map as a marker
          this.#workOut.push(running);
          showpopup(`${type}-green`);
          inputsEmpty();
          form.classList.toggle('hidden');
          updatUi(this.#workOut);
          updateUiMap(this.#workOut);
        }
      }
      // if workout cycling , create cycling object
      if (type === 'cycling') {
        const elevent = +inputElevent.value;
        // check if data is valid
        if (
          !validInputs(distance, duration, elevent) ||
          !positive(distance, duration)
        ) {
          return alert('Inputs have to be positive number');
        } else {
          const cycling = new Cycling(distance, duration, [lat, lng], elevent);

          // render workout on map as a marker
          this.#workOut.push(cycling);
          showpopup(`${type}-orange`);
          inputsEmpty();
          form.classList.toggle('hidden');
          updatUi(this.#workOut);
          updateUiMap(this.#workOut);
        }
      }
      // console.log(this.#workOut[0].id);
    }
    //  // cleaer input fields
  }

  // clearFiled() {
  //   inputDistance.value =
  //     inputDuration.value =
  //     inputCadence.value =
  //     inputElevent.value =
  //       '';
  // }
}
const app = new App();
