let map;
let allMarkers = [];

const defaultCenter = { lat: 3.139, lng: 101.6869 };
const defaultZoom = 12;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: defaultZoom,
    center: defaultCenter,
  });

  // Fetch and display
  fetchOutlets();
}

function fetchOutlets() {
  fetch("/api/outlets")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data fetched:", data);

      clearMarkers();

      data.forEach((outlet) => {
        if (!outlet.latitude || !outlet.longitude) {
          console.error("Invalid latitude or longitude for outlet:", outlet);
          return;
        }

        const marker = new google.maps.Marker({
          position: {
            lat: parseFloat(outlet.latitude),
            lng: parseFloat(outlet.longitude),
          },
          map: map,
          title: outlet.name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div><strong>${outlet.name}</strong><br>
            ${outlet.address}<br>
            ${outlet.operating_hours}<br>
            <a href="${outlet.waze_link}" target="_blank">Waze Link</a><br></div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        allMarkers.push(marker);
      });

      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
    })
    .catch((error) => {
      console.error("Error fetching outlets:", error);
    });
}

function clearMarkers() {
  allMarkers.forEach((marker) => marker.setMap(null));
  allMarkers = [];
}

function searchOutletByKeyword(keyword) {
  $.ajax({
    url: `/api/outlets/search/?keyword=${encodeURIComponent(keyword)}`,
    method: "GET",
    success: function (data) {
      clearMarkers();

      data.forEach((outlet) => {
        const marker = new google.maps.Marker({
          position: {
            lat: parseFloat(outlet.latitude),
            lng: parseFloat(outlet.longitude),
          },
          map: map,
          title: outlet.name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div><strong>${outlet.name}</strong><br>
            ${outlet.address}<br>
            ${outlet.operating_hours}<br>
            <a href="${outlet.waze_link}" target="_blank">Waze Link</a><br></div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });

      if (data.length > 0) {
        // Center map on the first result
        map.setCenter({
          lat: parseFloat(data[0].latitude),
          lng: parseFloat(data[0].longitude),
        });
        map.setZoom(14);
      } else {
        alert("No outlets found for the given keyword.");
      }
    },
    error: function (error) {
      console.error("Error fetching outlets:", error);
      alert("Error searching for outlets");
    },
  });
}

function handleEnterKeyPress(event) {
  if (event.key === "Enter") {
    const keyword = $("#outletName").val();
    if (keyword) {
      searchOutletByKeyword(keyword);
    }
  }
}

$(document).ready(function () {
  $("#searchButton").on("click", function () {
    const keyword = $("#outletName").val();
    if (keyword) {
      searchOutletByKeyword(keyword);
    }
  });

  $("#resetButton").on("click", function () {
    clearMarkers();
    fetchOutlets();
  });

  $("#outletName").on("keypress", handleEnterKeyPress);

  initMap();
});
