function initMap() {
  const mapOptions = {
    zoom: 4,
    center: { lat: 20.5937, lng: 78.9629 } // Default center (India)
  };

  // Initialize a map for each listing
  listingsData.forEach(listing => {
    if (!listing.location) return;

    const mapContainerId = `map-${listing._id}`;
    const map = new google.maps.Map(document.getElementById(mapContainerId), mapOptions);

    // Use Google Maps Geocoder to get coordinates from location string
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: listing.location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(10);

        const marker = new google.maps.Marker({
          map: map,
          position: location,
          title: listing.title
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<h3><a href="/listings/listing/${listing._id}">${listing.title}</a></h3><p>${listing.location}</p>`
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  });
}

window.initMap = initMap;
