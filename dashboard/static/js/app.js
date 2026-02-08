// API Base URL
const API_URL = window.location.origin;

// Chart.js default config
Chart.defaults.color = '#a8a8b8';
Chart.defaults.borderColor = '#2a2a3e';
Chart.defaults.font.family = "'Outfit', sans-serif";

// Global state
let allMovies = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    await loadMovies();
    await loadCharts();
    initializeEventListeners();
});

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/stats`);
        const data = await response.json();
        
        // Animate numbers
        animateValue('totalMovies', 0, data.total_movies, 1500);
        animateValue('avgTomatometer', 0, data.avg_tomatometer, 1500, '%');
        animateValue('avgAudience', 0, data.avg_audience, 1500, '%');
        animateValue('maxScore', 0, data.max_tomatometer, 1500, '%');
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Animate number counting
function animateValue(id, start, end, duration, suffix = '') {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = Math.round(end) + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current) + suffix;
        }
    }, 16);
}

// Load movies
async function loadMovies() {
    try {
        const response = await fetch(`${API_URL}/api/movies`);
        allMovies = await response.json();
        displayMovies(allMovies);
    } catch (error) {
        console.error('Error loading movies:', error);
        document.getElementById('moviesGrid').innerHTML = 
            '<div class="loading">Erreur lors du chargement des films</div>';
    }
}

// Display movies
function displayMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    
    if (movies.length === 0) {
        grid.innerHTML = '<div class="loading">Aucun film trouvé</div>';
        return;
    }
    
    grid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-scores">
                <div class="score-item">
                    <span class="score-label">🍅 Tomatometer</span>
                    <span class="score-value tomatometer">${movie.tomatometer}%</span>
                </div>
                <div class="score-item">
                    <span class="score-label">👥 Audience</span>
                    <span class="score-value audience">${movie.audience_score}%</span>
                </div>
            </div>
            <a href="${movie.url}" target="_blank" class="movie-link">
                Voir sur RT →
            </a>
        </div>
    `).join('');
}

// Load and create charts
async function loadCharts() {
    try {
        // Load distribution data
        const distResponse = await fetch(`${API_URL}/api/distribution`);
        const distData = await distResponse.json();
        
        // Load top movies data
        const topResponse = await fetch(`${API_URL}/api/top-movies/10`);
        const topData = await topResponse.json();
        
        // Load comparison data
        const compResponse = await fetch(`${API_URL}/api/comparison`);
        const compData = await compResponse.json();
        
        // Create charts
        createDistributionChart('tomatometerChart', distData.tomatometer, 'Tomatometer');
        createDistributionChart('audienceChart', distData.audience, 'Score Audience');
        createTopMoviesChart(topData);
        createComparisonChart(compData);
        
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

// Create distribution chart
function createDistributionChart(canvasId, data, label) {
    const ctx = document.getElementById(canvasId);
    
    const labels = data.map(d => {
        const range = d._id;
        if (range < 20) return '0-20%';
        if (range < 40) return '20-40%';
        if (range < 60) return '40-60%';
        if (range < 80) return '60-80%';
        return '80-100%';
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Nombre de films - ${label}`,
                data: data.map(d => d.count),
                backgroundColor: 'rgba(255, 90, 95, 0.7)',
                borderColor: 'rgba(255, 90, 95, 1)',
                borderWidth: 2,
                borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    titleColor: '#e8e8f0',
                    bodyColor: '#a8a8b8',
                    borderColor: '#ff5a5f',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(42, 42, 62, 0.5)',
                    },
                    ticks: {
                        stepSize: 10
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create top movies chart
function createTopMoviesChart(movies) {
    const ctx = document.getElementById('topMoviesChart');
    
    // Shorten titles for better display
    const labels = movies.map(m => {
        const title = m.title.replace(/\s*\(\d{4}\)\s*$/, '');
        return title.length > 25 ? title.substring(0, 25) + '...' : title;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tomatometer',
                    data: movies.map(m => m.tomatometer),
                    backgroundColor: 'rgba(250, 50, 10, 0.7)',
                    borderColor: 'rgba(250, 50, 10, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                },
                {
                    label: 'Score Audience',
                    data: movies.map(m => m.audience_score),
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    titleColor: '#e8e8f0',
                    bodyColor: '#a8a8b8',
                    borderColor: '#ff5a5f',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: (items) => movies[items[0].dataIndex].title,
                        label: (context) => `${context.dataset.label}: ${context.parsed.x}%`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(42, 42, 62, 0.5)',
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create comparison scatter chart
function createComparisonChart(movies) {
    const ctx = document.getElementById('comparisonChart');
    
    const data = movies.map(m => ({
        x: m.tomatometer,
        y: m.audience_score,
        title: m.title
    }));
    
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Films',
                data: data,
                backgroundColor: 'rgba(255, 90, 95, 0.6)',
                borderColor: 'rgba(255, 90, 95, 1)',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    titleColor: '#e8e8f0',
                    bodyColor: '#a8a8b8',
                    borderColor: '#ff5a5f',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: (items) => data[items[0].dataIndex].title,
                        label: (context) => [
                            `Tomatometer: ${context.parsed.x}%`,
                            `Audience: ${context.parsed.y}%`
                        ]
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tomatometer Score (%)',
                        color: '#a8a8b8',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(42, 42, 62, 0.5)',
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Audience Score (%)',
                        color: '#a8a8b8',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(42, 42, 62, 0.5)',
                    }
                }
            }
        }
    });
}

// Event listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allMovies.filter(movie => 
            movie.title.toLowerCase().includes(query)
        );
        displayMovies(filtered);
    });
    
    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        const sorted = sortMovies([...allMovies], sortBy);
        displayMovies(sorted);
    });
    
    // Smooth scroll for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Smooth scroll
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Sort movies
function sortMovies(movies, sortBy) {
    switch(sortBy) {
        case 'tomatometer-desc':
            return movies.sort((a, b) => b.tomatometer - a.tomatometer);
        case 'tomatometer-asc':
            return movies.sort((a, b) => a.tomatometer - b.tomatometer);
        case 'audience-desc':
            return movies.sort((a, b) => b.audience_score - a.audience_score);
        case 'audience-asc':
            return movies.sort((a, b) => a.audience_score - b.audience_score);
        case 'title':
            return movies.sort((a, b) => a.title.localeCompare(b.title));
        default:
            return movies;
    }
}

// Smooth scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements on load
setTimeout(() => {
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });
}, 100);
