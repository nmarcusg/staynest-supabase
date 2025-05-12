import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');
const reserveButton = document.getElementById('reserveButton');
let redirect = '#';

console.log(`Property ID: ${propertyId}`);

reserveButton.disabled = true;

supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
        console.log('User is logged in:', session.user.email);
        reserveButton.innerHTML = 'Reserve Now';
        redirect = `./reserve.html?id=${propertyId}`;
    } else {
        console.log('User is not logged in');
        reserveButton.innerHTML = 'Login to Reserve';
        redirect = `./login.html?id=${propertyId}`;
    }

    reserveButton.disabled = false;
});

reserveButton.addEventListener('click', () => {
    window.location.href = redirect;
});

async function loadPropertyDetails() {
    try {
        const { data: property, error } = await supabase
            .from('properties')
            .select('*')
            .eq('property_id', propertyId)
            .single();

        if (error) throw error;
        const { data: images } = await supabase
            .from('property_images')
            .select('image_path')
            .eq('property_id', propertyId);
        
        console.log("Full property data:", property);


        console.log("Property images:", images);

        const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('username, name_first, name_last, avatar_url')
            .eq('id', property.owner_id)
            .single();
            
        if (ownerError) {
            console.error("Error fetching owner details:", ownerError.message);
        } else {
            console.log("Owner data:", ownerData);
        }
        

        const titleElement = document.getElementById('propertyName');
        const locationElement = document.getElementById('propertyLocation');
        const rateElement = document.getElementById('propertyPrice');
        const descriptionElement = document.getElementById('propertyDescription');
        const ownerElement = document.getElementById('ownerName');
        const ownerUsername = document.getElementById('ownerUsername');
        const amenityList = document.getElementById('amenitiesList');
        titleElement.textContent = property.title;
        locationElement.textContent = property.address?.city ?? "Unknown City";
        rateElement.textContent = `Php ${property.price_per_night} per Night`;
        descriptionElement.textContent = property.description ?? "No description available";

        for (const amenity of property.amenities) {
            const amenityElement = document.createElement('li');
            amenityElement.textContent = amenity;
            amenityList.appendChild(amenityElement);
        }

        if (ownerData) {
            ownerElement.textContent = `${ownerData.name_first} ${ownerData.name_last}`;
            ownerUsername.textContent = `@${ownerData.username}`;
            if (ownerData.avatar_url) {
                const avatarImg = document.getElementById('ownerAvatar');
                avatarImg.src = ownerData.avatar_url;
                avatarImg.alt = `${ownerData.name_first} ${ownerData.name_last}'s Avatar`;
                avatarImg.srcset = ownerData.avatar_url;
            }
        }

        const imgContainer = document.getElementById('imageContainer');

        if (images && images.length > 0) {
            for (const image of images) {
                const img = document.createElement('img');
                img.src = image.image_path;
                img.alt = property.title;
                img.style.width = '100%';
                img.style.height = 'auto';
                console.log(img)
                imgContainer.appendChild(img);
            }
        } else {
            console.warn(`No images found for property ID ${propertyId}`);
            const placeholderImg = document.createElement('img');
            placeholderImg.src = 'https://via.placeholder.com/150';
            placeholderImg.alt = 'No image available';
            placeholderImg.style.width = '100%';
            placeholderImg.style.height = 'auto';
            imgContainer.appendChild(placeholderImg);
        }

    } catch (error) {
        console.error("Error loading property details:", error);
    }
}

loadPropertyDetails();
