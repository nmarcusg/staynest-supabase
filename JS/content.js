import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { initNav } from './navbar.js';

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = createClient(supabaseUrl, supabaseKey);
  
initNav(supabase); 


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

        const template = document.getElementById('template');
        const container = document.getElementById('card-container');

        for (const property of properties) {
            const card = template.content.cloneNode(true);

            card.querySelector('.title').textContent = property.title;
            card.querySelector('.location').textContent = property.address?.city ?? "Unknown City";
            card.querySelector('.rate').textContent = `Php ${property.price_per_night} per Night`;
            card.querySelector('.card').dataset.property_id = property.property_id;
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

fetchProperties().then(({ properties, error }) => loadProperties(properties, error));

