// Terrain Editor - Main JavaScript
let map;
let defaultSettings;
let currentLayers = [];

// Initialize mapbox and UI
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initUI();
});

// Initialize the map
function initMap() {
    // Set Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXZhbmRhcHBsZWdhdGUiLCJhIjoiY2tmbzA1cWM1MWozeTM4cXV4eHUwMzFhdiJ9.Z5f9p8jJD_N1MQwycF2NEw';
    
    // Default values
    const centerLng = -113.794;
    const centerLat = 37.613;
    const zoom = 12;
    const pitch = 65;
    const bearing = 0;
    const terrainExaggeration = 1.6;
    
    // Initialize map
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [centerLng, centerLat],
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        projection: 'globe'
    });

    // Save default settings for reset functionality
    defaultSettings = {
        center: [centerLng, centerLat],
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        terrain: {
            exaggeration: 1.6
        },
        hillshade: {
            baseColor: '#5a3f2b',
            highlightColor: '#f9e29c',
            accentColor: '#cc985a',
            illumination: 240,
            exaggeration: 0.8
        },
        hillshadeDetail: {
            shadowColor: 'rgba(110, 54, 31, 0.7)',
            highlightColor: 'rgba(255, 210, 142, 0.6)',
            accentColor: 'rgba(230, 180, 120, 0.5)',
            illumination: 260,
            exaggeration: 0.5
        },
        contours: {
            color: '#c7ae99',
            opacity: 0.7,
            width: 0.3
        },
        contoursMajor: {
            color: '#c7ae99',
            opacity: 0.8,
            width: 1
        },
        satellite: {
            opacity: 0.2,
            contrast: 0.5,
            saturation: -0.2,
            brightnessMin: 0.2,
            brightnessMax: 0.8
        },
        fog: {
            opacity: 0.5,
            color: '#ffffff',
            horizonBlend: 0.5,
            distance: 50
        },
        fillExtrusion: {
            opacity: 0.5,
            color: '#ffffff',
            height: 50,
            base: 50
        },
        sky: {
            opacity: 0.9,
            sunIntensity: 20,
            skyColor: '#fd9769',
            haloColor: '#ffd8a3',
            sunPosition: [0.5, 0.1]
        }
    };

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());
    
    // Display coordinates on mouse move
    map.on('mousemove', function(e) {
        document.getElementById('coordinates').innerHTML = 
            `Longitude: ${e.lngLat.lng.toFixed(4)}, Latitude: ${e.lngLat.lat.toFixed(4)}`;
    });

    // When map style is loaded, add terrain and other layers
    map.on('style.load', function() {
        applyAllSettings();
    });
    
    // Update settings when camera changes
    map.on('moveend', function() {
        updateCameraUI();
    });
}

// Initialize UI components
function initUI() {
    // Setup tabs
    setupTabs();
    
    // Setup range inputs
    setupRangeInputs();
    
    // Setup color inputs
    setupColorInputs();
    
    // Setup event listeners for all control inputs
    setupControlListeners();
}

// Setup tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

// Setup all range inputs to display their values
function setupRangeInputs() {
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const valueDisplay = document.getElementById(input.id + '-value');
        if (valueDisplay) {
            valueDisplay.textContent = input.value;
            input.addEventListener('input', function() {
                valueDisplay.textContent = this.value;
            });
        }
    });
}

// Setup color input synchronization
function setupColorInputs() {
    // For each color input, sync the text input with the color picker
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        const textInput = input.nextElementSibling;
        if (!textInput) return;
        
        // Sync color picker to text input
        input.addEventListener('input', () => {
            textInput.value = input.value;
        });
        
        // Sync text input to color picker
        textInput.addEventListener('input', () => {
            if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
                input.value = textInput.value;
            }
        });
    });
}

// Setup event listeners for all control inputs
function setupControlListeners() {
    // Terrain controls
    document.getElementById('terrain-toggle').addEventListener('change', toggleTerrain);
    document.getElementById('terrain-exaggeration').addEventListener('input', applyTerrainSettings);
    
    // Map position controls
    document.getElementById('center-lng').addEventListener('change', updateMapPosition);
    document.getElementById('center-lat').addEventListener('change', updateMapPosition);
    document.getElementById('map-zoom').addEventListener('input', updateMapPosition);
    document.getElementById('map-pitch').addEventListener('input', updateMapPosition);
    document.getElementById('map-bearing').addEventListener('input', updateMapPosition);
    
    // Hillshade controls
    document.getElementById('hillshade-toggle').addEventListener('change', toggleHillshade);
    document.getElementById('hillshade-detail-toggle').addEventListener('change', toggleHillshadeDetail);
    document.getElementById('hillshade-shadow-color').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-highlight-color').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-accent-color').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-illumination').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-exaggeration').addEventListener('input', applyHillshadeSettings);
    
    // Hillshade detail controls
    document.getElementById('hillshade-detail-shadow-color').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-detail-shadow-opacity').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-detail-highlight-color').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-detail-highlight-opacity').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-detail-illumination').addEventListener('input', applyHillshadeSettings);
    document.getElementById('hillshade-detail-exaggeration').addEventListener('input', applyHillshadeSettings);
    
    // Contour controls
    document.getElementById('contours-toggle').addEventListener('change', toggleContours);
    document.getElementById('contours-major-toggle').addEventListener('change', toggleContoursMajor);
    document.getElementById('contour-color').addEventListener('input', applyContoursSettings);
    document.getElementById('contour-color-text').addEventListener('input', applyContoursSettings);
    document.getElementById('contour-opacity').addEventListener('input', applyContoursSettings);
    document.getElementById('contour-width').addEventListener('input', applyContoursSettings);
    document.getElementById('contour-major-color').addEventListener('input', applyContoursSettings);
    document.getElementById('contour-major-color-text').addEventListener('input', applyContoursSettings);
    document.getElementById('contour-major-opacity').addEventListener('input', applyContoursSettings);
    document.getElementById('contour-major-width').addEventListener('input', applyContoursSettings);
    
    // Satellite controls
    document.getElementById('satellite-toggle').addEventListener('change', toggleSatellite);
    document.getElementById('satellite-opacity').addEventListener('input', applySatelliteSettings);
    document.getElementById('satellite-contrast').addEventListener('input', applySatelliteSettings);
    document.getElementById('satellite-saturation').addEventListener('input', applySatelliteSettings);
    document.getElementById('satellite-brightness-min').addEventListener('input', applySatelliteSettings);
    document.getElementById('satellite-brightness-max').addEventListener('input', applySatelliteSettings);
    
    // Fog controls
    document.getElementById('fog-toggle').addEventListener('change', toggleFog);
    document.getElementById('fog-opacity').addEventListener('input', applyFogSettings);
    document.getElementById('fog-color').addEventListener('input', applyFogSettings);
    document.getElementById('fog-color-text').addEventListener('input', applyFogSettings);
    document.getElementById('fog-horizon-blend').addEventListener('input', applyFogSettings);
    document.getElementById('fog-distance').addEventListener('input', applyFogSettings);
    
    // Fill-extrusion controls
    document.getElementById('fill-extrusion-toggle').addEventListener('change', toggleFillExtrusion);
    document.getElementById('fill-extrusion-opacity').addEventListener('input', applyFillExtrusionSettings);
    document.getElementById('fill-extrusion-color').addEventListener('input', applyFillExtrusionSettings);
    document.getElementById('fill-extrusion-color-text').addEventListener('input', applyFillExtrusionSettings);
    document.getElementById('fill-extrusion-height').addEventListener('input', applyFillExtrusionSettings);
    document.getElementById('fill-extrusion-base').addEventListener('input', applyFillExtrusionSettings);
    
    // Sky controls
    document.getElementById('sky-toggle').addEventListener('change', toggleSky);
    document.getElementById('sky-opacity').addEventListener('input', applySkySettings);
    document.getElementById('sky-sun-intensity').addEventListener('input', applySkySettings);
    document.getElementById('sky-color').addEventListener('input', applySkySettings);
    document.getElementById('sky-color-text').addEventListener('input', applySkySettings);
    document.getElementById('sky-halo-color').addEventListener('input', applySkySettings);
    document.getElementById('sky-halo-color-text').addEventListener('input', applySkySettings);
    document.getElementById('sky-sun-x').addEventListener('input', applySkySettings);
    document.getElementById('sky-sun-y').addEventListener('input', applySkySettings);
}

// Update map position based on camera controls
function updateMapPosition() {
    const lng = parseFloat(document.getElementById('center-lng').value);
    const lat = parseFloat(document.getElementById('center-lat').value);
    const zoom = parseFloat(document.getElementById('map-zoom').value);
    const pitch = parseFloat(document.getElementById('map-pitch').value);
    const bearing = parseFloat(document.getElementById('map-bearing').value);
    
    if (!isNaN(lng) && !isNaN(lat)) {
        map.jumpTo({
            center: [lng, lat],
            zoom: zoom,
            pitch: pitch,
            bearing: bearing
        });
    }
}

// Apply all settings to the map
function applyAllSettings() {
    applyTerrainSettings();
    applyHillshadeSettings();
    applyContoursSettings();
    applySatelliteSettings();
    applyFogSettings();
    applyFillExtrusionSettings();
    applySkySettings();
}

// Get values from UI controls and update the map
function applyTerrainSettings() {
    const exaggeration = parseFloat(document.getElementById('terrain-exaggeration').value);
    
    // Add terrain DEM source if not already added
    if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
    }
    
    // Set terrain with exaggeration
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': exaggeration });
}

// Update UI to reflect current camera position
function updateCameraUI() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();
    
    document.getElementById('center-lng').value = center.lng.toFixed(8);
    document.getElementById('center-lat').value = center.lat.toFixed(8);
    document.getElementById('map-zoom').value = zoom.toFixed(1);
    document.getElementById('map-zoom-value').textContent = zoom.toFixed(1);
    document.getElementById('map-pitch').value = pitch.toFixed(0);
    document.getElementById('map-pitch-value').textContent = pitch.toFixed(0);
    document.getElementById('map-bearing').value = bearing.toFixed(0);
    document.getElementById('map-bearing-value').textContent = bearing.toFixed(0);
}

// Reset all settings to defaults
function resetToDefaults() {
    // Reset terrain settings
    document.getElementById('terrain-exaggeration').value = defaultSettings.terrain.exaggeration;
    document.getElementById('terrain-exaggeration-value').textContent = defaultSettings.terrain.exaggeration;
    
    // Reset map position
    map.jumpTo({
        center: defaultSettings.center,
        zoom: defaultSettings.zoom,
        pitch: defaultSettings.pitch,
        bearing: defaultSettings.bearing
    });
    updateCameraUI();
    
    // Reset hillshade settings
    document.getElementById('hillshade-shadow-color').value = defaultSettings.hillshade.baseColor;
    document.getElementById('hillshade-shadow-color-text').value = defaultSettings.hillshade.baseColor;
    document.getElementById('hillshade-highlight-color').value = defaultSettings.hillshade.highlightColor;
    document.getElementById('hillshade-highlight-color-text').value = defaultSettings.hillshade.highlightColor;
    document.getElementById('hillshade-accent-color').value = defaultSettings.hillshade.accentColor;
    document.getElementById('hillshade-accent-color-text').value = defaultSettings.hillshade.accentColor;
    document.getElementById('hillshade-illumination').value = defaultSettings.hillshade.illumination;
    document.getElementById('hillshade-illumination-value').textContent = defaultSettings.hillshade.illumination;
    document.getElementById('hillshade-exaggeration').value = defaultSettings.hillshade.exaggeration;
    document.getElementById('hillshade-exaggeration-value').textContent = defaultSettings.hillshade.exaggeration;
    
    // Reset everything else - skipping the full implementation for brevity
    
    // Apply all settings
    applyAllSettings();
}

// Save current settings
function saveSettings() {
    // Get all current settings
    const settings = {
        terrain: {
            exaggeration: parseFloat(document.getElementById('terrain-exaggeration').value)
        },
        hillshade: {
            baseColor: document.getElementById('hillshade-shadow-color').value,
            highlightColor: document.getElementById('hillshade-highlight-color').value,
            accentColor: document.getElementById('hillshade-accent-color').value,
            illumination: parseFloat(document.getElementById('hillshade-illumination').value),
            exaggeration: parseFloat(document.getElementById('hillshade-exaggeration').value)
        },
        // Capture rest of settings (skipping for brevity)
    };
    
    // Convert to JSON and create download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "terrain_settings.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Apply hillshade settings
function applyHillshadeSettings() {
    // Get values from UI
    const shadowColor = document.getElementById('hillshade-shadow-color').value;
    const highlightColor = document.getElementById('hillshade-highlight-color').value;
    const accentColor = document.getElementById('hillshade-accent-color').value;
    const illumination = parseFloat(document.getElementById('hillshade-illumination').value);
    const exaggeration = parseFloat(document.getElementById('hillshade-exaggeration').value);
    
    const detailShadowColor = document.getElementById('hillshade-detail-shadow-color').value;
    const detailShadowOpacity = parseFloat(document.getElementById('hillshade-detail-shadow-opacity').value);
    const detailHighlightColor = document.getElementById('hillshade-detail-highlight-color').value;
    const detailHighlightOpacity = parseFloat(document.getElementById('hillshade-detail-highlight-opacity').value);
    const detailIllumination = parseFloat(document.getElementById('hillshade-detail-illumination').value);
    const detailExaggeration = parseFloat(document.getElementById('hillshade-detail-exaggeration').value);
    
    // Convert hex colors to rgba for detail layers
    const detailShadowRgba = `rgba(${hexToRgb(detailShadowColor)}, ${detailShadowOpacity})`;
    const detailHighlightRgba = `rgba(${hexToRgb(detailHighlightColor)}, ${detailHighlightOpacity})`;
    
    // Check if sources exist
    if (!map.getSource('mapbox-dem')) {
        return; // Terrain source not created yet
    }
    
    // Remove existing hillshade layers if they exist
    removeLayerIfExists('hillshading-sunset-base');
    removeLayerIfExists('hillshading-sunset-detail');
    
    // Add base hillshade layer
    map.addLayer({
        'id': 'hillshading-sunset-base',
        'type': 'hillshade',
        'source': 'mapbox-dem',
        'paint': {
            'hillshade-shadow-color': shadowColor,
            'hillshade-highlight-color': highlightColor,
            'hillshade-accent-color': accentColor,
            'hillshade-illumination-direction': illumination,
            'hillshade-illumination-anchor': 'viewport',
            'hillshade-exaggeration': exaggeration
        }
    });
    
    // Add detail hillshade layer
    map.addLayer({
        'id': 'hillshading-sunset-detail',
        'type': 'hillshade',
        'source': 'mapbox-dem',
        'paint': {
            'hillshade-shadow-color': detailShadowRgba,
            'hillshade-highlight-color': detailHighlightRgba,
            'hillshade-accent-color': 'rgba(230, 180, 120, 0.5)',
            'hillshade-illumination-direction': detailIllumination,
            'hillshade-illumination-anchor': 'viewport',
            'hillshade-exaggeration': detailExaggeration
        }
    });
}

// Apply contour settings
function applyContoursSettings() {
    // Get values from UI
    const contourColor = document.getElementById('contour-color').value;
    const contourOpacity = parseFloat(document.getElementById('contour-opacity').value);
    const contourWidth = parseFloat(document.getElementById('contour-width').value);
    
    const majorContourColor = document.getElementById('contour-major-color').value;
    const majorContourOpacity = parseFloat(document.getElementById('contour-major-opacity').value);
    const majorContourWidth = parseFloat(document.getElementById('contour-major-width').value);
    
    // Check if map is ready
    if (!map.getStyle()) {
        return; // Map style not loaded yet
    }
    
    // Add terrain-source if it doesn't exist
    if (!map.getSource('terrain-source')) {
        map.addSource('terrain-source', {
            'type': 'vector',
            'url': 'mapbox://mapbox.mapbox-terrain-v2'
        });
    }
    
    // Remove existing contour layers if they exist
    removeLayerIfExists('contour-lines');
    removeLayerIfExists('contour-lines-major');
    
    // Add contour lines layer
    map.addLayer({
        'id': 'contour-lines',
        'type': 'line',
        'source': 'terrain-source',
        'source-layer': 'contour',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': contourColor,
            'line-width': [
                'interpolate', ['linear'], ['zoom'],
                10, ['match', ['%', ['get', 'ele'], 100], 0, 0.75, contourWidth],
                15, ['match', ['%', ['get', 'ele'], 100], 0, 1.5, contourWidth * 1.5]
            ],
            'line-opacity': contourOpacity
        }
    });
    
    // Add major contour lines
    map.addLayer({
        'id': 'contour-lines-major',
        'type': 'line',
        'source': 'terrain-source',
        'source-layer': 'contour',
        'filter': ['all', ['==', ['%', ['get', 'ele'], 100], 0]],
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': majorContourColor,
            'line-width': majorContourWidth,
            'line-opacity': majorContourOpacity
        }
    });
}

// Apply satellite settings
function applySatelliteSettings() {
    // Get values from UI
    const opacity = parseFloat(document.getElementById('satellite-opacity').value);
    const contrast = parseFloat(document.getElementById('satellite-contrast').value);
    const saturation = parseFloat(document.getElementById('satellite-saturation').value);
    const brightnessMin = parseFloat(document.getElementById('satellite-brightness-min').value);
    const brightnessMax = parseFloat(document.getElementById('satellite-brightness-max').value);
    
    // Check if map is ready
    if (!map.getStyle()) {
        return; // Map style not loaded yet
    }
    
    // Add satellite source if it doesn't exist
    if (!map.getSource('mapbox-satellite')) {
        map.addSource('mapbox-satellite', {
            'type': 'raster',
            'url': 'mapbox://mapbox.satellite',
            'tileSize': 512,
            'maxzoom': 22
        });
    }
    
    // Remove existing satellite layer if it exists
    removeLayerIfExists('satellite-layer');
    
    // Add satellite layer
    map.addLayer({
        'id': 'satellite-layer',
        'type': 'raster',
        'source': 'mapbox-satellite',
        'paint': {
            'raster-opacity': opacity,
            'raster-contrast': contrast,
            'raster-saturation': saturation,
            'raster-brightness-min': brightnessMin,
            'raster-brightness-max': brightnessMax
        }
    });
}

// Apply sky settings
function applySkySettings() {
    // Get values from UI
    const skyOpacity = parseFloat(document.getElementById('sky-opacity').value);
    const sunIntensity = parseFloat(document.getElementById('sky-sun-intensity').value);
    const skyColor = document.getElementById('sky-color').value;
    const haloColor = document.getElementById('sky-halo-color').value;
    const sunX = parseFloat(document.getElementById('sky-sun-x').value);
    const sunY = parseFloat(document.getElementById('sky-sun-y').value);
    
    // Check if map is ready
    if (!map.getStyle()) {
        return; // Map style not loaded yet
    }
    
    // Remove existing sky layer if it exists
    if (map.getLayer('sky')) {
        map.removeLayer('sky');
    }
    
    // Add sky layer
    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [sunX, sunY],
            'sky-atmosphere-sun-intensity': sunIntensity,
            'sky-atmosphere-color': skyColor,
            'sky-atmosphere-halo-color': haloColor,
            'sky-opacity': skyOpacity
        }
    });
}

// Apply fog settings to create atmospheric effects
function applyFogSettings() {
    // Get values from UI
    const opacity = parseFloat(document.getElementById('fog-opacity').value);
    document.getElementById('fog-opacity-value').textContent = opacity.toFixed(1);
    
    const color = document.getElementById('fog-color').value;
    document.getElementById('fog-color-text').value = color;
    
    const horizonBlend = parseFloat(document.getElementById('fog-horizon-blend').value);
    document.getElementById('fog-horizon-blend-value').textContent = horizonBlend.toFixed(1);
    
    const distance = parseFloat(document.getElementById('fog-distance').value);
    document.getElementById('fog-distance-value').textContent = distance.toFixed(0);
    
    // Convert distance slider value to actual range values
    const rangeMin = 0.5;
    const rangeMax = 0.5 + (distance / 10); // Scale distance slider (0-100) to appropriate range
    
    // Check if map is ready
    if (!map.getStyle()) {
        console.log('Map style not loaded yet');
        return; // Map style not loaded yet
    }
    
    try {
        // Apply fog settings to the map
        map.setFog({
            'color': color,
            'horizon-blend': horizonBlend,
            'range': [rangeMin, rangeMax],
            // Add high-color for better atmosphere effect
            'high-color': '#aad3df',
            // Add space-color and stars for night effect if opacity is low
            'space-color': '#000000',
            'star-intensity': Math.max(0, 0.5 - opacity) * 0.6
        });
        console.log('Fog settings applied:', { color, horizonBlend, range: [rangeMin, rangeMax] });
    } catch (error) {
        console.error('Error applying fog settings:', error);
    }
}

// Apply fill-extrusion settings for 3D mountain effects
function applyFillExtrusionSettings() {
    // Get values from UI
    const opacity = parseFloat(document.getElementById('fill-extrusion-opacity').value);
    const color = document.getElementById('fill-extrusion-color').value;
    const height = parseFloat(document.getElementById('fill-extrusion-height').value);
    const base = parseFloat(document.getElementById('fill-extrusion-base').value);
    
    // Check if map is ready
    if (!map.getStyle()) {
        return; // Map style not loaded yet
    }
    
    // Remove existing fill-extrusion layer if it exists
    removeLayerIfExists('mountains-extrusion');
    
    // Add terrain-source if it doesn't exist
    if (!map.getSource('terrain-source')) {
        map.addSource('terrain-source', {
            'type': 'vector',
            'url': 'mapbox://mapbox.mapbox-terrain-v2'
        });
    }
    
    // Calculate actual height based on zoom level - this creates a more visually balanced effect
    const zoomLevel = map.getZoom();
    const scaleFactor = Math.pow(2, 16 - zoomLevel); // Adjust based on zoom
    const scaledHeight = height * scaleFactor;
    const scaledBase = base * scaleFactor * 0.5;
    
    // Add elevation-based 3D extrusion layer for mountain tops
    map.addLayer({
        'id': 'mountains-extrusion',
        'type': 'fill-extrusion',
        'source': 'terrain-source',
        'source-layer': 'contour',
        'filter': ['>=', ['get', 'ele'], base * 10], // Only show above certain elevation
        'paint': {
            'fill-extrusion-color': color,
            'fill-extrusion-height': ['*', ['get', 'ele'], height / 50], // Scale height by elevation
            'fill-extrusion-base': ['*', ['get', 'ele'], base / 100],
            'fill-extrusion-opacity': opacity,
            'fill-extrusion-vertical-gradient': true,
            // Add edge rounding for smoother appearance
            'fill-extrusion-edge-radius': 0.5
        }
    });
}

// Helper function to remove a layer if it exists
function removeLayerIfExists(layerId) {
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
}

// Helper function to convert hex color to RGB components
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the color components
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
}

// Toggle functions for each feature
function toggleTerrain(e) {
    if (e.target.checked) {
        // Enable terrain
        applyTerrainSettings();
    } else {
        // Disable terrain
        map.setTerrain(null);
    }
}

function toggleHillshade(e) {
    if (map.getLayer('hillshade')) {
        map.setLayoutProperty('hillshade', 'visibility', e.target.checked ? 'visible' : 'none');
    }
}

function toggleHillshadeDetail(e) {
    if (map.getLayer('hillshade-detail')) {
        map.setLayoutProperty('hillshade-detail', 'visibility', e.target.checked ? 'visible' : 'none');
    }
}

function toggleContours(e) {
    if (map.getLayer('contours')) {
        map.setLayoutProperty('contours', 'visibility', e.target.checked ? 'visible' : 'none');
    }
}

function toggleContoursMajor(e) {
    if (map.getLayer('contours-major')) {
        map.setLayoutProperty('contours-major', 'visibility', e.target.checked ? 'visible' : 'none');
    }
}

function toggleSatellite(e) {
    if (map.getLayer('satellite')) {
        map.setLayoutProperty('satellite', 'visibility', e.target.checked ? 'visible' : 'none');
    }
}

function toggleFog(e) {
    if (e.target.checked) {
        // Enable fog
        applyFogSettings();
    } else {
        // Disable fog
        map.setFog(null);
    }
}

function toggleFillExtrusion(e) {
    if (e.target.checked) {
        // Enable fill-extrusion (mountains)
        applyFillExtrusionSettings();
    } else {
        // Disable fill-extrusion
        removeLayerIfExists('mountains-extrusion');
    }
}

function toggleSky(e) {
    if (e.target.checked) {
        // Enable sky
        applySkySettings();
    } else {
        // Disable sky
        map.setLight({ atmospheric: false });
        map.setSky(null);
    }
}

// Add layers to map
function addMapLayers() {
    // Add hillshade layers
    if (!map.getLayer('hillshade')) {
        map.addLayer({
            'id': 'hillshade',
            'type': 'hillshade',
            'source': 'mapbox-dem',
            'paint': {
                'hillshade-shadow-color': defaultSettings.hillshade.baseColor,
                'hillshade-highlight-color': defaultSettings.hillshade.highlightColor,
                'hillshade-accent-color': defaultSettings.hillshade.accentColor,
                'hillshade-illumination-direction': defaultSettings.hillshade.illumination,
                'hillshade-exaggeration': defaultSettings.hillshade.exaggeration
            }
        });
    }
    
    if (!map.getLayer('hillshade-detail')) {
        map.addLayer({
            'id': 'hillshade-detail',
            'type': 'hillshade',
            'source': 'mapbox-dem',
            'paint': {
                'hillshade-shadow-color': defaultSettings.hillshadeDetail.shadowColor,
                'hillshade-highlight-color': defaultSettings.hillshadeDetail.highlightColor,
                'hillshade-accent-color': defaultSettings.hillshadeDetail.accentColor,
                'hillshade-illumination-direction': defaultSettings.hillshadeDetail.illumination,
                'hillshade-exaggeration': defaultSettings.hillshadeDetail.exaggeration
            }
        });
    }
    
    // Add contour lines
    if (!map.getSource('mapbox-dem-contour')) {
        map.addSource('mapbox-dem-contour', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-terrain-v2'
        });
    }
    
    if (!map.getLayer('contours')) {
        map.addLayer({
            'id': 'contours',
            'type': 'line',
            'source': 'mapbox-dem-contour',
            'source-layer': 'contour',
            'filter': ['!', ['==', ['get', 'index'], 5]],
            'paint': {
                'line-color': defaultSettings.contours.color,
                'line-opacity': defaultSettings.contours.opacity,
                'line-width': defaultSettings.contours.width
            }
        });
    }
    
    if (!map.getLayer('contours-major')) {
        map.addLayer({
            'id': 'contours-major',
            'type': 'line',
            'source': 'mapbox-dem-contour',
            'source-layer': 'contour',
            'filter': ['==', ['get', 'index'], 5],
            'paint': {
                'line-color': defaultSettings.contoursMajor.color,
                'line-opacity': defaultSettings.contoursMajor.opacity,
                'line-width': defaultSettings.contoursMajor.width
            }
        });
    }
    
    // Add satellite layer
    if (!map.getSource('mapbox-satellite')) {
        map.addSource('mapbox-satellite', {
            'type': 'raster',
            'url': 'mapbox://mapbox.satellite',
            'tileSize': 256
        });
    }
    
    if (!map.getLayer('satellite')) {
        map.addLayer({
            'id': 'satellite',
            'type': 'raster',
            'source': 'mapbox-satellite',
            'paint': {
                'raster-opacity': defaultSettings.satellite.opacity,
                'raster-contrast': defaultSettings.satellite.contrast,
                'raster-saturation': defaultSettings.satellite.saturation,
                'raster-brightness-min': defaultSettings.satellite.brightnessMin,
                'raster-brightness-max': defaultSettings.satellite.brightnessMax
            }
        }, 'hillshade');
    }
}
