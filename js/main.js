// Checks if browser supports service workers (as of 8/18 all versions of IE and Opera Mini [Android version of Opera] do not). Navigator.serviceWorker is read-only property that returns ServiceWorkerContainer object for associated document, which provides access to registration, removal, upgrade, and communication with service worker. See https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#Registering_your_worker
if ('serviceWorker' in navigator) {
  // Registers service worker script. Returns a promise
  // then() method returns a promise. It takes up to two arguments: callback functions for the success and failure cases of the Promise
  navigator.serviceWorker.register('../sw.js')
  .then((reg) => console.log('Registration successful'))
  // catch() method returns a promise and deals with rejected cases only. It's equivalent to then(undefined, func), but used in its place for readability
  .catch(err => console.log(`Registration failed with ${err}`));
}

let restaurants;
let neighborhoods;
let cuisines;
var newMap;
var markers = [];

// Fetch neighborhoods and cuisines as soon as the page is loaded
document.addEventListener('DOMContentLoaded', event => {
  initMap(); // Added
  fetchNeighborhoods();
  fetchCuisines();
});

// Fetch all neighborhoods and set their HTML
// Note: Declaring a function variable withouta variable declaration keyword means the variable is declared globally (on the window object)
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

// Set neighborhoods HTML
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

// Fetch all cuisines and set their HTML
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

// Set cuisines HTML
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

// Initialize leaflet map, called from HTML
initMap = () => {
  self.newMap = L.map('map', {
      center: [40.722216, -73.987501],
      zoom: 12,
      scrollWheelZoom: false
    });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiY2F0YWxpZSIsImEiOiJjamw3aGxidTIxMzJlM3BuNWhjaXJ0aW9sIn0.2n08VO6bI2-jvUcVwzzKxQ',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}

// Update page and map for current restaurants
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

// Clear current restaurants, their HTML, and remove their map markers
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

// Create all restaurants HTML and add to webpage
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

// Create restaurant HTML
createRestaurantHTML = restaurant => {
  const li = document.createElement('li');
  let altInfo = restaurant.name + ' restaurant, located in' + restaurant.neighborhood;

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = altInfo;
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View details';
  // Makes restaurant list details buttons tabbed third, after filter options dropdowns (instead of map markers)
  more.tabIndex = '3';
  more.setAttribute('aria-label', `View details of ${restaurant.name}`)
  more.setAttribute('role', 'button');
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li;
}

// Add markers for current restaurants to the map
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
}
