// Green Hydrogen Infrastructure Mapping and Optimization Application

// Sample data from the application requirements
const appData = {
  "hydrogenAssets": [
    {
      "id": "h1", 
      "name": "Northern Green H2 Plant",
      "type": "production",
      "coordinates": [51.5074, -0.1278],
      "capacity": "50 MW",
      "status": "operational",
      "yearBuilt": 2023,
      "operator": "Green Energy Corp"
    },
    {
      "id": "h2", 
      "name": "Thames Valley Storage Hub",
      "type": "storage",
      "coordinates": [51.4816, -0.6110],
      "capacity": "1000 tons",
      "status": "planned",
      "yearPlanned": 2025,
      "operator": "H2 Storage Ltd"
    },
    {
      "id": "h3",
      "name": "East Coast Distribution Center",
      "type": "distribution",
      "coordinates": [52.2053, 0.1218],
      "capacity": "200 vehicles/day", 
      "status": "operational",
      "yearBuilt": 2024,
      "operator": "H2 Logistics"
    },
    {
      "id": "h4",
      "name": "Birmingham H2 Pipeline",
      "type": "pipeline",
      "coordinates": [52.4862, -1.8904],
      "capacity": "500 kg/hr",
      "status": "under construction",
      "yearPlanned": 2024,
      "operator": "UK H2 Network"
    }
  ],
  "renewableEnergy": [
    {
      "id": "r1",
      "name": "Hornsea Wind Farm",
      "type": "wind",
      "coordinates": [53.8771, 1.7688],
      "capacity": "1200 MW",
      "output": "4200 GWh/year",
      "status": "operational"
    },
    {
      "id": "r2",
      "name": "Cleve Hill Solar Park", 
      "type": "solar",
      "coordinates": [51.3656, 0.9013],
      "capacity": "350 MW",
      "output": "315 GWh/year",
      "status": "operational"
    },
    {
      "id": "r3",
      "name": "Dinorwig Pumped Storage",
      "type": "hydro",
      "coordinates": [53.1186, -4.1089], 
      "capacity": "1728 MW",
      "output": "9100 GWh/year",
      "status": "operational"
    }
  ],
  "demandCenters": [
    {
      "id": "d1",
      "name": "London Industrial Zone",
      "type": "industrial",
      "coordinates": [51.5074, -0.1278],
      "demand": "high",
      "consumption": "500 tons/day",
      "industries": ["steel", "chemicals", "transport"]
    },
    {
      "id": "d2",
      "name": "Port of Felixstowe",
      "type": "port",
      "coordinates": [51.9564, 1.3511],
      "demand": "medium", 
      "consumption": "200 tons/day",
      "industries": ["shipping", "logistics"]
    },
    {
      "id": "d3",
      "name": "Manchester Metro Area",
      "type": "city",
      "coordinates": [53.4808, -2.2426],
      "demand": "high",
      "consumption": "300 tons/day", 
      "industries": ["transport", "heating", "power"]
    }
  ],
  "recommendations": [
    {
      "id": "rec1",
      "location": "Yorkshire Coast",
      "coordinates": [54.1792, -0.4130],
      "score": 92,
      "rationale": "Excellent wind resources, proximity to demand centers, existing grid connection",
      "estimatedCost": "£45M",
      "projectedCapacity": "75 MW",
      "carbonReduction": "120,000 tons/year"
    },
    {
      "id": "rec2", 
      "location": "Thames Estuary",
      "coordinates": [51.4816, 0.6110],
      "score": 88,
      "rationale": "Strategic location for industrial demand, good transport links, regulatory support",
      "estimatedCost": "£38M", 
      "projectedCapacity": "60 MW",
      "carbonReduction": "95,000 tons/year"
    }
  ],
  "dashboardMetrics": {
    "totalCostSavings": 145000000,
    "carbonReduction": 850000,
    "infrastructureGrowth": 35,
    "activeProjects": 127,
    "monthlyGrowth": [15, 22, 28, 35, 42, 48],
    "regionalData": {
      "London": 45,
      "Manchester": 32, 
      "Birmingham": 28,
      "Leeds": 22
    },
    "supplyDemand": {
      "supply": 1250,
      "demand": 980,
      "projected2025": 1800
    }
  }
};

// Global variables
let map = null;
let recommendationsMap = null;
let hydrogenLayerGroup = null;
let renewableLayerGroup = null;
let demandLayerGroup = null;
let isLoggedIn = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeModal();
    initializeMap();
    initializeDashboard();
    initializeRecommendations();
    initializeAuth();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            showPage(targetPage);
            
            // Update active nav link
            navLinks.forEach(nl => nl.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Handle CTA button clicks
    const ctaButtons = document.querySelectorAll('[data-page]');
    ctaButtons.forEach(button => {
        if (!button.classList.contains('nav-link')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = button.getAttribute('data-page');
                showPage(targetPage);
                
                // Update active nav link
                navLinks.forEach(nl => nl.classList.remove('active'));
                const targetNavLink = document.querySelector(`.nav-link[data-page="${targetPage}"]`);
                if (targetNavLink) {
                    targetNavLink.classList.add('active');
                }
            });
        }
    });
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Initialize page-specific functionality
        if (pageId === 'map' && map) {
            setTimeout(() => map.invalidateSize(), 100);
        } else if (pageId === 'recommendations' && recommendationsMap) {
            setTimeout(() => recommendationsMap.invalidateSize(), 100);
        }
    }
}

// Map functionality
function initializeMap() {
    // Initialize main map
    map = L.map('map').setView([52.3555, -1.1743], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create layer groups
    hydrogenLayerGroup = L.layerGroup().addTo(map);
    renewableLayerGroup = L.layerGroup().addTo(map);
    demandLayerGroup = L.layerGroup().addTo(map);

    // Add markers
    addHydrogenMarkers();
    addRenewableMarkers();
    addDemandMarkers();

    // Initialize layer controls
    initializeLayerControls();
    initializeMapFilters();
}

function addHydrogenMarkers() {
    const hydrogenIcon = L.divIcon({
        className: 'custom-marker hydrogen-marker',
        html: '<i class="fas fa-industry" style="color: #22c55e; font-size: 20px;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    appData.hydrogenAssets.forEach(asset => {
        const marker = L.marker([asset.coordinates[0], asset.coordinates[1]], {
            icon: hydrogenIcon
        }).addTo(hydrogenLayerGroup);

        const popupContent = `
            <div class="popup-title">${asset.name}</div>
            <div class="popup-details">
                <div class="popup-detail">
                    <span class="popup-label">Type:</span>
                    <span class="popup-value">${asset.type}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Capacity:</span>
                    <span class="popup-value">${asset.capacity}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Status:</span>
                    <span class="popup-value status status--${asset.status.replace(' ', '')}">${asset.status}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Operator:</span>
                    <span class="popup-value">${asset.operator}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Coordinates:</span>
                    <span class="popup-value">${asset.coordinates[0].toFixed(4)}, ${asset.coordinates[1].toFixed(4)}</span>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
    });
}

function addRenewableMarkers() {
    appData.renewableEnergy.forEach(source => {
        let iconClass = 'fas fa-bolt';
        if (source.type === 'wind') iconClass = 'fas fa-fan';
        else if (source.type === 'solar') iconClass = 'fas fa-sun';
        else if (source.type === 'hydro') iconClass = 'fas fa-water';

        const renewableIcon = L.divIcon({
            className: 'custom-marker renewable-marker',
            html: `<i class="${iconClass}" style="color: #f59e0b; font-size: 20px;"></i>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([source.coordinates[0], source.coordinates[1]], {
            icon: renewableIcon
        }).addTo(renewableLayerGroup);

        const popupContent = `
            <div class="popup-title">${source.name}</div>
            <div class="popup-details">
                <div class="popup-detail">
                    <span class="popup-label">Type:</span>
                    <span class="popup-value">${source.type}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Capacity:</span>
                    <span class="popup-value">${source.capacity}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Output:</span>
                    <span class="popup-value">${source.output}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Status:</span>
                    <span class="popup-value status status--${source.status}">${source.status}</span>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
    });
}

function addDemandMarkers() {
    appData.demandCenters.forEach(center => {
        const demandIcon = L.divIcon({
            className: 'custom-marker demand-marker',
            html: '<i class="fas fa-building" style="color: #ef4444; font-size: 20px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([center.coordinates[0], center.coordinates[1]], {
            icon: demandIcon
        }).addTo(demandLayerGroup);

        const popupContent = `
            <div class="popup-title">${center.name}</div>
            <div class="popup-details">
                <div class="popup-detail">
                    <span class="popup-label">Type:</span>
                    <span class="popup-value">${center.type}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Demand:</span>
                    <span class="popup-value">${center.demand}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Consumption:</span>
                    <span class="popup-value">${center.consumption}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Industries:</span>
                    <span class="popup-value">${center.industries.join(', ')}</span>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
    });
}

function initializeLayerControls() {
    const hydrogenToggle = document.getElementById('hydrogenLayer');
    const renewableToggle = document.getElementById('renewableLayer');
    const demandToggle = document.getElementById('demandLayer');

    hydrogenToggle.addEventListener('change', () => {
        if (hydrogenToggle.checked) {
            map.addLayer(hydrogenLayerGroup);
        } else {
            map.removeLayer(hydrogenLayerGroup);
        }
    });

    renewableToggle.addEventListener('change', () => {
        if (renewableToggle.checked) {
            map.addLayer(renewableLayerGroup);
        } else {
            map.removeLayer(renewableLayerGroup);
        }
    });

    demandToggle.addEventListener('change', () => {
        if (demandToggle.checked) {
            map.addLayer(demandLayerGroup);
        } else {
            map.removeLayer(demandLayerGroup);
        }
    });
}

function initializeMapFilters() {
    const searchInput = document.getElementById('mapSearch');
    const assetTypeFilter = document.getElementById('assetTypeFilter');
    const statusFilter = document.getElementById('statusFilter');

    searchInput.addEventListener('input', applyMapFilters);
    assetTypeFilter.addEventListener('change', applyMapFilters);
    statusFilter.addEventListener('change', applyMapFilters);
}

function applyMapFilters() {
    const searchTerm = document.getElementById('mapSearch').value.toLowerCase();
    const assetType = document.getElementById('assetTypeFilter').value;
    const status = document.getElementById('statusFilter').value;

    // Clear existing layers
    hydrogenLayerGroup.clearLayers();
    renewableLayerGroup.clearLayers();
    demandLayerGroup.clearLayers();

    // Re-add filtered markers
    addFilteredHydrogenMarkers(searchTerm, assetType, status);
    addRenewableMarkers(); // Renewables don't need filtering in this context
    addDemandMarkers(); // Demand centers don't need filtering in this context
}

function addFilteredHydrogenMarkers(searchTerm, assetType, status) {
    const hydrogenIcon = L.divIcon({
        className: 'custom-marker hydrogen-marker',
        html: '<i class="fas fa-industry" style="color: #22c55e; font-size: 20px;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    appData.hydrogenAssets
        .filter(asset => {
            const matchesSearch = !searchTerm || asset.name.toLowerCase().includes(searchTerm) || asset.operator.toLowerCase().includes(searchTerm);
            const matchesType = !assetType || asset.type === assetType;
            const matchesStatus = !status || asset.status === status;
            return matchesSearch && matchesType && matchesStatus;
        })
        .forEach(asset => {
            const marker = L.marker([asset.coordinates[0], asset.coordinates[1]], {
                icon: hydrogenIcon
            }).addTo(hydrogenLayerGroup);

            const popupContent = `
                <div class="popup-title">${asset.name}</div>
                <div class="popup-details">
                    <div class="popup-detail">
                        <span class="popup-label">Type:</span>
                        <span class="popup-value">${asset.type}</span>
                    </div>
                    <div class="popup-detail">
                        <span class="popup-label">Capacity:</span>
                        <span class="popup-value">${asset.capacity}</span>
                    </div>
                    <div class="popup-detail">
                        <span class="popup-label">Status:</span>
                        <span class="popup-value status status--${asset.status.replace(' ', '')}">${asset.status}</span>
                    </div>
                    <div class="popup-detail">
                        <span class="popup-label">Operator:</span>
                        <span class="popup-value">${asset.operator}</span>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
        });
}

// Dashboard functionality
function initializeDashboard() {
    animateCounters();
    initializeCharts();
}

function animateCounters() {
    const metrics = appData.dashboardMetrics;
    
    animateCounter('costSavings', 0, metrics.totalCostSavings, (value) => `£${(value / 1000000).toFixed(0)}M`);
    animateCounter('carbonReduction', 0, metrics.carbonReduction, (value) => value.toLocaleString());
    animateCounter('infrastructureGrowth', 0, metrics.infrastructureGrowth, (value) => `${value}%`);
    animateCounter('activeProjects', 0, metrics.activeProjects, (value) => value.toString());
}

function animateCounter(elementId, start, end, formatter) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 2000;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = start + (end - start) * easeOutQuart(progress);
        
        element.textContent = formatter(Math.floor(value));

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

function initializeCharts() {
    initializeGrowthChart();
    initializeSavingsChart();
    initializeSupplyDemandChart();
    initializeCarbonChart();
}

function initializeGrowthChart() {
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Infrastructure Growth (%)',
                data: appData.dashboardMetrics.monthlyGrowth,
                borderColor: '#1FB8CD',
                backgroundColor: '#1FB8CD',
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function initializeSavingsChart() {
    const ctx = document.getElementById('savingsChart');
    if (!ctx) return;

    const regionalData = appData.dashboardMetrics.regionalData;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(regionalData),
            datasets: [{
                label: 'Cost Savings (£M)',
                data: Object.values(regionalData),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '£' + value + 'M';
                        }
                    }
                }
            }
        }
    });
}

function initializeSupplyDemandChart() {
    const ctx = document.getElementById('supplyDemandChart');
    if (!ctx) return;

    const supplyDemand = appData.dashboardMetrics.supplyDemand;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Current Supply', 'Current Demand', 'Gap'],
            datasets: [{
                data: [supplyDemand.supply, supplyDemand.demand, supplyDemand.supply - supplyDemand.demand],
                backgroundColor: ['#5D878F', '#DB4545', '#D2BA4C']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initializeCarbonChart() {
    const ctx = document.getElementById('carbonChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024', '2025', '2026', '2027', '2028', '2029'],
            datasets: [{
                label: 'CO2 Reduction (tons)',
                data: [100000, 250000, 450000, 680000, 850000, 1200000],
                borderColor: '#964325',
                backgroundColor: 'rgba(150, 67, 37, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000) + 'k tons';
                        }
                    }
                }
            }
        }
    });
}

// Recommendations functionality
function initializeRecommendations() {
    const proximitySlider = document.getElementById('proximitySlider');
    const proximityValue = document.getElementById('proximityValue');
    const generateBtn = document.getElementById('generateRecommendations');

    proximitySlider.addEventListener('input', () => {
        proximityValue.textContent = proximitySlider.value;
    });

    generateBtn.addEventListener('click', generateRecommendations);

    // Initialize recommendations map
    initializeRecommendationsMap();
}

function generateRecommendations() {
    const loadingState = document.getElementById('recommendationsLoading');
    const recommendationsList = document.getElementById('recommendationsList');

    // Show loading state
    loadingState.classList.remove('hidden');
    recommendationsList.innerHTML = '';

    // Simulate API call delay
    setTimeout(() => {
        loadingState.classList.add('hidden');
        displayRecommendations();
        updateRecommendationsMap();
    }, 1500);
}

function displayRecommendations() {
    const recommendationsList = document.getElementById('recommendationsList');
    
    appData.recommendations.forEach(rec => {
        const recommendationItem = document.createElement('div');
        recommendationItem.className = 'recommendation-item';
        
        recommendationItem.innerHTML = `
            <div class="recommendation-header">
                <h4>${rec.location}</h4>
                <span class="recommendation-score">${rec.score}/100</span>
            </div>
            <p>${rec.rationale}</p>
            <div class="recommendation-details">
                <div class="detail-item">
                    <span class="detail-value">${rec.estimatedCost}</span>
                    <span class="detail-label">Estimated Cost</span>
                </div>
                <div class="detail-item">
                    <span class="detail-value">${rec.projectedCapacity}</span>
                    <span class="detail-label">Capacity</span>
                </div>
                <div class="detail-item">
                    <span class="detail-value">${rec.carbonReduction}</span>
                    <span class="detail-label">CO2 Reduction</span>
                </div>
            </div>
        `;

        recommendationsList.appendChild(recommendationItem);
    });
}

function initializeRecommendationsMap() {
    recommendationsMap = L.map('recommendationsMap').setView([52.3555, -1.1743], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(recommendationsMap);
}

function updateRecommendationsMap() {
    // Clear existing markers
    recommendationsMap.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            recommendationsMap.removeLayer(layer);
        }
    });

    // Add recommendation markers
    appData.recommendations.forEach(rec => {
        const recommendationIcon = L.divIcon({
            className: 'custom-marker recommendation-marker',
            html: '<i class="fas fa-star" style="color: #f59e0b; font-size: 20px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([rec.coordinates[0], rec.coordinates[1]], {
            icon: recommendationIcon
        }).addTo(recommendationsMap);

        const popupContent = `
            <div class="popup-title">${rec.location}</div>
            <div class="popup-details">
                <div class="popup-detail">
                    <span class="popup-label">Score:</span>
                    <span class="popup-value">${rec.score}/100</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Cost:</span>
                    <span class="popup-value">${rec.estimatedCost}</span>
                </div>
                <div class="popup-detail">
                    <span class="popup-label">Capacity:</span>
                    <span class="popup-value">${rec.projectedCapacity}</span>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
    });
}

// Authentication functionality
function initializeAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const logoutBtn = document.getElementById('logoutBtn');

    loginBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            toggleUserDashboard();
        } else {
            loginModal.classList.remove('hidden');
        }
    });

    closeModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    // Click outside modal to close
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            if (targetTab === 'login') {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
            }
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
    });

    logoutBtn.addEventListener('click', handleLogout);
}

function initializeModal() {
    // Ensure modal starts hidden
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('hidden');
    }
}

function handleLogin() {
    // Simulate login
    isLoggedIn = true;
    currentUser = {
        name: 'John Doe',
        organization: 'Green Energy Corp',
        email: 'john.doe@example.com'
    };

    updateAuthUI();
    document.getElementById('loginModal').classList.add('hidden');
}

function handleSignup() {
    // Simulate signup
    isLoggedIn = true;
    currentUser = {
        name: 'New User',
        organization: 'Energy Company',
        email: 'newuser@example.com'
    };

    updateAuthUI();
    document.getElementById('loginModal').classList.add('hidden');
}

function handleLogout() {
    isLoggedIn = false;
    currentUser = null;
    updateAuthUI();
    document.getElementById('userDashboard').classList.add('hidden');
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    
    if (isLoggedIn) {
        loginBtn.textContent = currentUser.name;
        loginBtn.classList.remove('btn--outline');
        loginBtn.classList.add('btn--primary');
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.classList.remove('btn--primary');
        loginBtn.classList.add('btn--outline');
    }
}

function toggleUserDashboard() {
    const userDashboard = document.getElementById('userDashboard');
    userDashboard.classList.toggle('hidden');
}
