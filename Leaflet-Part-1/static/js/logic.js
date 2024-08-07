let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


//added this to help with trouble shooting when trying to read the json.
d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
}).catch(function(error) {
    console.error("Error loading or parsing data:", error);
});

function createFeatures(earthquakeData) {
    function styleInfo(feature) {
        return {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
        };
    }

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }

    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circle(latlng, styleInfo(feature));
        },
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}

function getColor(depth) {
    
    if (depth > 90) return "red"; // Red for deep
    else if (depth > 70) return "darkorange"; // Orange-red
    else if (depth > 50) return "orange"; //
    else if (depth > 30) return "lightcoral"; // orange - light
    else if (depth > 10) return "yellow"; // yellow
    else return "lightgreen"; // 
}

function getRadius(magnitude) {
    
    return magnitude * 10000; // Adjust size
}

function createMap(earthquakes) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Initialize the map with the desired layers
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
         
    });

    // Add default layer to the map
    street.addTo(myMap);
    
    // Add earthquakes layer to the map
    earthquakes.addTo(myMap);

    // Add a legend without the layer control
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [0, 10, 30, 50, 70, 90];
        

        div.innerHTML = '<h4>Earthquake Depth (km)</h4>';

        // Add the legend items
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }

        return div;
    };

   
  

    legend.addTo(myMap);
}