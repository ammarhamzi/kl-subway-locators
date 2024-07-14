let map;
let allMarkers = [];
let circles = [];
let allOutletsCircles = [];
let blueMarkers = []; // Track blue markers
let isAllOutletsRadiusVisible = false;
const defaultCenter = { lat: 3.139, lng: 101.6869 };
const defaultZoom = 12;
const radius = 5000;
const highlightColor = "#FF0000";

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: defaultZoom,
    center: defaultCenter,
  });

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
      clearCircles();
      clearAllOutletsCircles();
      clearBlueMarkers(); // Ensure blue markers are cleared on fetch

      const positions = [];

      data.forEach((outlet) => {
        if (!outlet.latitude || !outlet.longitude) {
          console.error("Invalid latitude or longitude for outlet:", outlet);
          return;
        }

        const position = {
          lat: parseFloat(outlet.latitude),
          lng: parseFloat(outlet.longitude),
        };

        positions.push(position);

        const marker = new google.maps.Marker({
          position: position,
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

        const circle = new google.maps.Circle({
          map: map,
          radius: radius,
          center: position,
          fillColor: highlightColor,
          fillOpacity: 0.2,
          strokeColor: highlightColor,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          visible: false,
        });

        circles.push(circle);
        allOutletsCircles.push(circle);
      });

      highlightIntersections(); // Optional: Comment out if you don't want intersections highlighted initially

      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
    })
    .catch((error) => {
      console.error("Error fetching outlets:", error);
    });
}

function toggleAllOutletsRadius() {
  isAllOutletsRadiusVisible = !isAllOutletsRadiusVisible;
  allOutletsCircles.forEach((circle) =>
    circle.setVisible(isAllOutletsRadiusVisible)
  );
}

function highlightIntersections() {
  const overlapMarkers = [];

  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const circleA = circles[i];
      const circleB = circles[j];
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        circleA.getCenter(),
        circleB.getCenter()
      );

      if (distance < radius * 2) {
        circleA.setOptions({
          fillColor: highlightColor,
          strokeColor: highlightColor,
        });
        circleB.setOptions({
          fillColor: highlightColor,
          strokeColor: highlightColor,
        });

        overlapMarkers.push(circleA.getCenter());
        overlapMarkers.push(circleB.getCenter());
      }
    }
  }
}

function clearMarkers() {
  allMarkers.forEach((marker) => marker.setMap(null));
  allMarkers = [];
}

function clearCircles() {
  circles.forEach((circle) => circle.setMap(null));
  circles = [];
}

function clearAllOutletsCircles() {
  allOutletsCircles.forEach((circle) => circle.setMap(null));
  allOutletsCircles = [];
}

function clearBlueMarkers() {
  blueMarkers.forEach((marker) => marker.setMap(null));
  blueMarkers = [];
}

function searchOutletByKeyword(keyword) {
  $.ajax({
    url: `/api/outlets/search/?keyword=${encodeURIComponent(keyword)}`,
    method: "GET",
    success: function (data) {
      clearMarkers();
      clearCircles();
      clearBlueMarkers(); // Clear blue markers on search

      const positions = [];

      data.forEach((outlet) => {
        const position = {
          lat: parseFloat(outlet.latitude),
          lng: parseFloat(outlet.longitude),
        };

        positions.push(position);

        const marker = new google.maps.Marker({
          position: position,
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

        const circle = new google.maps.Circle({
          map: map,
          radius: radius,
          center: position,
          fillColor: highlightColor,
          fillOpacity: 0.2,
          strokeColor: highlightColor,
          strokeOpacity: 0.8,
          strokeWeight: 2,
        });

        circles.push(circle);
      });

      // Add blue markers for intersections
      const overlapMarkers = [];

      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          const circleA = circles[i];
          const circleB = circles[j];
          const distance =
            google.maps.geometry.spherical.computeDistanceBetween(
              circleA.getCenter(),
              circleB.getCenter()
            );

          if (distance < radius * 2) {
            overlapMarkers.push(circleA.getCenter());
            overlapMarkers.push(circleB.getCenter());
          }
        }
      }

      overlapMarkers.forEach((position) => {
        const marker = new google.maps.Marker({
          position: position,
          map: map,
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });
        blueMarkers.push(marker);
      });

      if (data.length > 0) {
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

function handleQuery() {
  const question = $("#query").val();
  if (question) {
    $.ajax({
      url: "/api/query",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ question: question }),
      success: function (response) {
        if (response.answer) {
          $("#answer").html(`
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Answer</h5>
                                <p class="card-text">${response.answer}</p>
                            </div>
                        </div>
                    `);
        } else {
          $("#answer").html(`
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Answer</h5>
                                <p class="card-text">No answer found.</p>
                            </div>
                        </div>
                    `);
        }
      },
      error: function (error) {
        console.error("Error processing query:", error);
        alert("Error processing query");
      },
    });
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
    clearCircles();
    clearBlueMarkers(); // Ensure blue markers are cleared on reset
    $("#outletName").val(""); // Clear text in search box
    fetchOutlets(); // Re-fetch outlets
  });

  $("#outletName").on("keypress", handleEnterKeyPress);

  $("#queryButton").on("click", handleQuery);

  initMap();
});
