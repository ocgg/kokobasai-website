export class eventsManager {
  constructor(args) {
    // required
    this.listContainerId = args.listContainerId;
    // set in init()
    this.events = null;
    this.map = null;
    this.markers = null;

    this.init();
  }

  // ***** HELPERS *****
  
  getDateStringFrom = (date) => {
    const optionsDate = { weekday: 'short', day: 'numeric', month: 'long' };
    const optionsTime = { hour: '2-digit', minute: '2-digit' };

    const dateString = date.toLocaleDateString('fr-FR', optionsDate);
    const timeString = date.toLocaleTimeString('fr-FR', optionsTime);

    return `${dateString.replace(/[èé]/g,"e")} - ${timeString.replace(':', 'h')}`;
  }
  getDayStringFrom(date) {
    const optionsDate = { day: 'numeric', month: 'long' };
    const dayString = date.toLocaleDateString('fr-FR', optionsDate);
    return dayString;
  }
  getHourFrom(date) {
    const optionsTime = { hour: '2-digit', minute: '2-digit' };
    const timeString = date.toLocaleTimeString('fr-FR', optionsTime);
    return timeString.replace(':', 'h');
  }
  getAddressDataFrom(address) {
    const splitted = address.split(' ');
    const departmentNumber = splitted[splitted.length - 2].substring(0, 2);
    const city = splitted[splitted.length - 1];
    return { department: departmentNumber, city: city };
  }

  // ***** EVENTS LIST HTML *****

  makeList = () => {
    const listContainer = document.getElementById(this.listContainerId);
    const ul = document.createElement('ul');
    
    this.events.forEach((event, index) => {
      const link = event.link
        ? `<a class="text-link" href="${event.link}" target="_blank"><span>V</span>oir l'évènement</a>`
        : '';
      const addressData = this.getAddressDataFrom(event.address);

      const liHtml = `
        <li>
          <input type="checkbox" id="event${index}">
          <label for="event${index}">
            <div><strong>${this.getDayStringFrom(event.date).toUpperCase()}</strong></div>
            <div>${addressData.city} (${addressData.department})</div>
            <div><span class="events-list-dropdown-arrow">▼</span></div>
          </label>
          <div class="events-list-dropdown">
            <p class="event-hour"><strong>${this.getHourFrom(event.date)}</strong></p>
            <p><strong>${event.name}</strong></p>
            <p>${event.address}</p>
            ${link}
          </div>
        </li>
      `
      ul.insertAdjacentHTML('beforeend', liHtml);
    });
    listContainer.appendChild(ul);
  }

  // ***** LEAFLET MAP *****

  async getCoordinatesOf(address) {
    const queryUrl = `https://nominatim.openstreetmap.org/search.php?q=${address}&format=jsonv2&limit=1`;
    try {
      const response = await fetch(queryUrl);
      if (!response.ok) throw new Error('Erreur réseau');
   
      const data = await response.json();
      return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
   
    } catch (error) {
      console.error(error);
      // TODO/TOTRY: reformulate address and recurse
    }
   }

  createMarkers = async () => {
    const markerPromises = this.events.map(async (event) => {
      const coords = await this.getCoordinatesOf(event.address);
      
      const marker = L.marker(coords).addTo(this.map);
      const dateString = this.getDateStringFrom(event.date);
      let popupHtml = `
        <h3>${dateString}</h3>
        <p><strong>${event.name}</strong></p>
        <p>${event.address}</p>
      `
      if (event.link) popupHtml += `<a href="${event.link}" target="_blank">Voir l'évènement</a>`
      marker.bindPopup(popupHtml);
      return marker;
    });
   
    const markers = await Promise.all(markerPromises);
    return markers;
  }
  
  createLeafletMap = () => {
    const map = L.map('leaflet-map');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
  }

  // ***** INIT *****

  fetchEvents = async() => {
    const response = await fetch('events.json');
    const data = await response.json();
    const events =  data.map( event => {
      event.date = new Date(event.date);
      return event;
    });

    let now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcomingEvents = events.filter(event => event.date >= now);
    upcomingEvents.sort((a, b) => a.date - b.date);
    
    return upcomingEvents;
   }
   
  init = async () => {
    this.events = await this.fetchEvents();
    this.map = this.createLeafletMap();
    
    if (this.events.length > 0) {
      this.markers = await this.createMarkers();
      const markersGroup = L.featureGroup(this.markers);
      this.map.fitBounds(markersGroup.getBounds().pad(0.2));
      if (this.events.length === 1) this.map.setZoom(10);
    }
    else {
      const rennesCoords = [48.1113387, -1.6800198];
      const noEventHtml = "<strong>Aucune date prévue pour l'instant</strong>";
      L.popup(rennesCoords).setContent(noEventHtml).openOn(this.map);
      this.map.setView(rennesCoords, 10);
    }

    this.makeList();
  }
}
