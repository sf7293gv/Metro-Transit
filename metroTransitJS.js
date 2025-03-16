let routeNumberInput = document.querySelector('#routeNumber'); // Input box for route number
let button = document.querySelector('#button'); // Button element
let busMarkers = {}; // Object to store bus markers

let twinCitiesAreaCoordinates = [44.96, -93.2]; // Coordinates for Twin Cities area
let zoomLevel = 11; // Map zoom level

// Initialize Leaflet map
let map = L.map('map', { zoomControl: true }).setView(twinCitiesAreaCoordinates, zoomLevel);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fix gray map issue by forcing a resize update
setTimeout(() => {
    map.invalidateSize();
}, 500);

// Button click event listener
button.addEventListener('click', function () { 
    let routeNumberValue = routeNumberInput.value.trim(); // Get route number from input

    if (!routeNumberValue || isNaN(routeNumberValue) || routeNumberValue < 2 || routeNumberValue > 852) {
        alert("Please enter a valid route number between 2 and 852.");
        return;
    }

    let url = `https://svc.metrotransit.org/nextrip/vehicles/${routeNumberValue}`;

    let updateInterval = 30000; // Refresh API data every 30 seconds

    let busIcon = L.icon({
        iconUrl: 'bus.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    fetchBusData(url, updateInterval, busIcon);
});

// Fetch bus data and update markers
async function fetchBusData(url, updateInterval, busIcon) {
    try {
        let response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        let buses = await response.json();

        if (!buses || buses.length === 0) {
            alert("No buses in service for this route.");
            return;
        }

        console.log("API Response:", buses); // Log response for debugging

        // Remove old markers before updating
        Object.values(busMarkers).forEach(marker => map.removeLayer(marker));
        busMarkers = {};

        // Loop through bus data and update markers
        buses.forEach(bus => {
            let vehicleLat = bus.latitude;
            let vehicleLong = bus.longitude;
            let busRoute = bus.route_id;
            let busDirection = bus.direction || "Unknown"; // Handle undefined direction
            let busTerminal = bus.terminal || "Unknown";

            let markerText = `Bus Route: ${busRoute}<br>Direction: ${busDirection}<br>Terminal: ${busTerminal}`;

            // Create a new marker
            let marker = L.marker([vehicleLat, vehicleLong], { icon: busIcon })
                .bindPopup(markerText)
                .addTo(map);

            // Store marker reference
            busMarkers[bus.trip_id] = marker;
        });

    } catch (error) {
        console.error("Error fetching bus data:", error);
        alert("An error occurred while fetching bus data. Please try again later.");
    } finally {
        setTimeout(() => fetchBusData(url, updateInterval, busIcon), updateInterval);
    }
}
