import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { initNav } from './navbar.js';

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = createClient(supabaseUrl, supabaseKey);
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

initNav(supabase); 

if (searchTerm) {
    searchFunction(searchTerm);
} else {
    fetchProperties().then(({ properties, error }) => loadProperties(properties, error));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function renderStars(container, rating) {
    container.innerHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
  
    for (let i = 0; i < fullStars; i++) {
      container.innerHTML += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
      container.innerHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      container.innerHTML += '<i class="far fa-star"></i>';
    }
}

async function searchFunction(searchTerm) {
    const { data: properties, error} = await supabase
        .from('properties')
        .select(`*, property_images(image_path)`)
        .or(`title.ilike.%${searchTerm}%,address->>city.ilike.%${searchTerm}%,address->>region.ilike.%${searchTerm}%`
        );
    if (error) {
        console.error("Error fetching properties:", error.message);
        return [];
    }

    loadProperties(properties, error);
}

async function fetchProperties() {
    let query = supabase.from('properties').select(`*,property_images(image_path)`);
        
    const { data: properties, error } = await query;

    return { properties, error };
}

async function loadProperties(properties, error) {
    // clear the container before loading new properties
    const container = document.getElementById('card-container');

    container.innerHTML = '';
    try {
        if (error) {
            console.error("Error fetching properties:", error.message);
            return;
        }

        if (!properties || properties.length === 0) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.textContent = "No properties found matching your criteria.";
            noResultsMessage.style.gridColumn = "1 / -1";
            noResultsMessage.style.textAlign = "center";
            noResultsMessage.style.padding = "2rem";
            noResultsMessage.style.fontSize = "1.2rem";
            noResultsMessage.style.color = "#666";
            
            container.appendChild(noResultsMessage);
            return;
        }

        const template = document.getElementById('template');

        for (const property of properties) {
            const card = template.content.cloneNode(true);

            card.querySelector('.title').textContent = property.title;
            card.querySelector('.location').textContent = property.address?.city ?? "Unknown City";
            card.querySelector('.rate').textContent = `${formatCurrency(property.price_per_night)} per Night`;
            card.querySelector('.card').dataset.property_id = property.property_id;
            const starContainer = card.querySelector('#property-stars');
            renderStars(starContainer, property.rating);
            const imgContainer = card.querySelector('.img-container');
            
            // Use the first image from the property_images array
            if (property.property_images && property.property_images.length > 0) {
                const imagePath = property.property_images[0].image_path;
                // Add property ID to the path
                const img = document.createElement('img');
                img.src = imagePath;               
                img.alt = property.title;
                img.style.width = '100%';
                img.style.height = '100%';
                imgContainer.appendChild(img);
            } else {
                const placeholderImg = document.createElement('img');
                placeholderImg.src = 'https://placehold.co/600x400'; // Placeholder image URL
                placeholderImg.alt = 'No image available';
                placeholderImg.style.width = '100%';
                placeholderImg.style.height = '100%';
                imgContainer.appendChild(placeholderImg);
            }

            const cardElement = card.querySelector('.card');
            cardElement.dataset.propertyId = property.property_id;

            cardElement.addEventListener('click', () => {
                const id = cardElement.dataset.propertyId;
                window.location.href = `property.html?id=${id}`;
            });

            container.appendChild(card);
        }
    } catch (error) {
        console.error('Error loading properties:', error);
    }
}

async function filterProperties({ maxPrice, city, region, bedrooms, bathrooms }) {
    let query = supabase
        .from('properties')
        .select(`*, property_images(image_path)`);

    if (maxPrice) query = query.lte('price_per_night', maxPrice);
    if (city) query = query.ilike('address->>city', `%${city}%`);
    if (region) query = query.ilike('address->>region', `%${region}%`);
    if (bedrooms) query = query.eq('bedrooms', bedrooms);
    if (bathrooms) query = query.eq('bathrooms', bathrooms);

    const { data: filteredProperties, error } = await query;
    return { properties: filteredProperties, error };
}

document.getElementById('filter-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const filters = {
        maxPrice: document.getElementById('max-price').value,
        city: document.getElementById('city').value,
        region: document.getElementById('region').value,
        bedrooms: document.getElementById('bedrooms').value,
        bathrooms: document.getElementById('bathrooms').value,
    };

    const { properties, error } = await filterProperties(filters);
    loadProperties(properties, error);
});

document.getElementById('clear-filter').addEventListener('click', () => {
    document.getElementById('filter-form').reset();
    fetchProperties().then(({ properties, error }) => loadProperties(properties, error));
});

window.addEventListener('search', (e) => {
    const searchTerm = e.detail;
    searchFunction(searchTerm);
});