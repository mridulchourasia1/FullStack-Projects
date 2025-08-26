mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2t2b3Z1b3ZxMGV0dTJ2cGZ1b3Z3b3Z6byJ9.abcdef1234567890abcdef1234567890'; // Replace with your Mapbox access token

const map = new mapboxgl.Map({
  container: 'listing-map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [78.9629, 20.5937], // Default center (India)
  zoom: 10
});

map.addControl(new mapboxgl.NavigationControl());

if (listingData.location) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(listingData.location)}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        map.setCenter([lng, lat]);

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h3>${listingData.title}</h3><p>${listingData.location}</p>`
        );

        new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
      }
    })
    .catch(err => {
      console.error('Geocoding error:', err);
    });
}
