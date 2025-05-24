const MOVIE_API_BASE = 'https://apimocine.vercel.app/movie';
const TV_API_BASE = 'https://apimocine.vercel.app/tv';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Adjust if apimocine uses a different image base

// Function to fetch and display trending content
async function fetchTrending(type, containerId) {
  try {
    const response = await fetch(`${type === 'movie' ? MOVIE_API_BASE : TV_API_BASE}/popular`);
    if (response.status === 404) {
      document.getElementById(containerId).innerHTML = `<p>${type === 'movie' ? 'Movies' : 'TV shows'} endpoint not found.</p>`;
      return;
    }
    if (response.status === 403) {
      document.getElementById(containerId).innerHTML = `<p>Access to ${type === 'movie' ? 'movies' : 'TV shows'} API is forbidden. Check API permissions.</p>`;
      return;
    }
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const items = data.results || data;
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    items.forEach(item => {
      const img = document.createElement('img');
      img.src = item.poster_path.startsWith('http') ? item.poster_path : `${IMAGE_BASE_URL}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.dataset.id = item.id;
      img.dataset.type = type;
      img.addEventListener('click', () => openModal(item.id, type));
      container.appendChild(img);
    });
  } catch (error) {
    console.error(`Error fetching trending ${type}s:`, error);
    document.getElementById(containerId).innerHTML = `<p>Error loading ${type}s: ${error.message}</p>`;
  }
}

// Function to open modal with item details
async function openModal(id, type) {
  try {
    const response = await fetch(`${type === 'movie' ? MOVIE_API_BASE : TV_API_BASE}/${id}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const item = await response.json();
    const modal = document.getElementById('movie-modal');
    document.getElementById('modal-poster').src = item.poster_path.startsWith('http') ? item.poster_path : `${IMAGE_BASE_URL}${item.poster_path}`;
    document.getElementById('modal-title').textContent = item.title || item.name;
    document.getElementById('modal-overview').textContent = item.overview || 'No description available.';
    document.getElementById('modal-release').textContent = item.release_date || item.first_air_date || 'N/A';
    document.getElementById('modal-rating').textContent = item.vote_average ? `${item.vote_average}/10` : 'N/A';
    document.getElementById('server-1').href = item.streaming_url || '#';
    document.getElementById('server-2').href = item.streaming_url_2 || '#';
    document.getElementById('server-3').href = item.streaming_url_3 || '#';
    modal.style.display = 'flex';
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error);
    alert('Error loading details: ' + error.message);
  }
}

// Function to handle search
async function searchContent(query) {
  try {
    const movieResponse = await fetch(`${MOVIE_API_BASE}/search?q=${encodeURIComponent(query)}`);
    const tvResponse = await fetch(`${TV_API_BASE}/search?q=${encodeURIComponent(query)}`);
    const results = [];
    if (movieResponse.ok) {
      const movieData = await movieResponse.json();
      results.push(...(movieData.results || movieData).map(item => ({ ...item, type: 'movie' })));
    }
    if (tvResponse.ok) {
      const tvData = await tvResponse.json();
      results.push(...(tvData.results || tvData).map(item => ({ ...item, type: 'tv' })));
    }
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    results.forEach(item => {
      const img = document.createElement('img');
      img.src = item.poster_path.startsWith('http') ? item.poster_path : `${IMAGE_BASE_URL}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.dataset.id = item.id;
      img.dataset.type = item.type;
      img.addEventListener('click', () => {
        document.getElementById('search-modal').style.display = 'none';
        openModal(item.id, item.type);
      });
      resultsContainer.appendChild(img);
    });
    document.getElementById('search-modal').style.display = 'flex';
  } catch (error) {
    console.error('Error searching content:', error);
    document.getElementById('search-results').innerHTML = '<p>Error loading search results: ' + error.message + '</p>';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchTrending('movie', 'trending-movies');
  fetchTrending('tv', 'trending-tv');
  document.getElementById('trending-anime').innerHTML = '<p>Anime API not integrated.</p>';
});

document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    document.getElementById('movie-modal').style.display = 'none';
    document.getElementById('search-modal').style.display = 'none';
  });
});

document.querySelector('.search-bar').addEventListener('keypress', e => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    searchContent(e.target.value.trim());
  }
});