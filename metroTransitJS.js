let routeNumberInput = document.querySelector('#routeNumber') // the container of the input box of the route
let button = document.querySelector('#button') // the container of a button
let busMarkers = []; // an array that will contain markers of bus(es)

let twinCitiesAreaCoordiantes = [44.96, -93.2]; // the coordinates of the twin cities area
let zoomLevel = 11; // the map's zoom level

let map = L.map('map').setView(twinCitiesAreaCoordiantes, zoomLevel); // a variable that contains a leaflet map

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // a function from the leaflet library that is used to build tiles on the map
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


let url; // a variable that will contain the url of a metro transit api

button.addEventListener('click', function () { // an event listener for the button
    let routeNumberValue = routeNumberInput.value; // the value of the input box container

    if (routeNumberValue.length == 0 || (routeNumberValue < 2 || routeNumberValue > 852)) { // an if statement (if there is no number, or the number entered is not between 2 and 852);
        alert("Please enter a route number between 2 and 852"); // show this alert message
    } else { // other than that
        url = `https://svc.metrotransit.org/NexTrip/VehicleLocations/${routeNumberValue}?format=json`; // the url of the api with the route number value at its end

        let update = 30000; // a number that will be used as a time to when to fetch from the api again (30 secs)
        let maxFailedAttempts = 3; // if the page fails after this amount of times; the page will stop requesting from the api

        let busIcon = L.icon({ // the bus icon that will be used as a marker
            iconUrl: 'bus.png',
            iconSize: [40, 40],
            iconAnchor: [25, 25]
        })


        mtro(maxFailedAttempts) // call the mtro function with the amount of maximum failed attempts allowed

        // let twinCitiesAreaCoordiantes = [44.96, -93.2]; // the coordinates of the twin cities area
        // let zoomLevel = 11; // the map's zoom level
        //
        // let map = L.map('map').setView(twinCitiesAreaCoordiantes, zoomLevel); // a variable that contains a leaflet map
        //
        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // a function from the leaflet library that is used to build tiles on the map
        //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // }).addTo(map);

        function mtro(attempts) { // a function that will be used to fetch data from the api
            if (attempts <= 0) { // if the attempts value becomes 0 or less,
                alert('Failed after several attempts') // show this message
                return; // do not proceed
            }
            fetch(url).then((res) => { // pass the the url to the function and store its response in the res variable
                return res.json() // store the json version of the response in the variable beneath
            }).then((routeBussesResponse) => {
                if (routeBussesResponse.length == 0) { // if the object's length is 0;
                    alert("There aren't any busses in service for this route") // show this message
                } else { // else
                    console.log(routeBussesResponse);
                    // mctcNorthboundStopResponse.forEach(function (object) {
                    //     // console.log(object)
                    //     let direction = "";
                    //     if (object["Direction"] == 0) {
                    //         // console.log("Northbound")
                    //         direction = "Northbound"
                    //     }
                    //     if (object["Direction"] == 1) {
                    //         // console.log("Southbound")
                    //         direction = "Southbound"
                    //     }
                    //
                    //     let busRoute = object["Route"]
                    //     let busTerminal = object["Terminal"]
                    //     let vehicleLat = object["VehicleLatitude"];
                    //     let vehicleLong = object["VehicleLongitude"]
                    //     let marketText = `Bus route: ${busRoute}<br>Direction: ${direction}<br>Terminal: ${busTerminal}`
                    //     if (!busMarker) {
                    //         busMarker = L.marker([vehicleLat, vehicleLong], {icon: busIcon}).bindPopup(marketText).addTo(map);
                    //     } else {
                    //         busMarker.setLatLng([vehicleLat, vehicleLong])
                    //     }
                    //
                    //
                    // });



                    for (let i = 0; i < routeBussesResponse.length; i++) { // loop over the object's parameters

                        let direction = ""; // a variable that will contain a direction (0 means north and 1 means south)
                        if (routeBussesResponse[i]["Direction"] == 0) { // if the bus object returns 0;
                            // console.log("Northbound")
                            direction = "Northbound" // store this value in the direction variable
                        }
                        if (routeBussesResponse[i]["Direction"] == 1) { // if the bus object returns 1;
                            // console.log("Southbound")
                            direction = "Southbound" // store this value in the direction variable
                        }

                        let busRoute = routeBussesResponse[i]["Route"] // a variable that will contain the bus's route response
                        let busTerminal = routeBussesResponse[i]["Terminal"] // a variable that will contain the bus's terminal response
                        let vehicleLat = routeBussesResponse[i]["VehicleLatitude"]; // a variable that will contain the bus's Lat response
                        let vehicleLong = routeBussesResponse[i]["VehicleLongitude"] // a variable that will contain the bus's Long response

                        let marketText = `Bus route: ${busRoute}<br>Direction: ${direction}<br>Terminal: ${busTerminal}` // a variable that will contain the marker's text

                        if (busMarkers[i] == null) { // if the element i in the busMarkers array is null;
                            busMarkers[i] = L.marker([vehicleLat, vehicleLong], {icon: busIcon}).bindPopup(marketText).addTo(map) // add this
                        }
                        if (busMarkers[i] != null) { // if it is not null;
                            busMarkers[i].setLatLng([vehicleLat, vehicleLong]); // do not add another marker, just update its location
                        }
                    }

                }
            }).catch((error) => { // catch any errors
                attempts--; // subtract 1 from the attempts variable
                console.log('Error', error) // show this message in the console
            }).finally(() => {
                setTimeout(mtro, update, attempts);
            });
        }

    }
});



// fetch(url).then((res) => {
//     return res.json()
// }).then((mctcNorthboundStopResponse) => {
//     console.log(mctcNorthboundStopResponse)
// });