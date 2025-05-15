const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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

        console.log("Property images:", images.image_path);

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
        document.getElementById('propertyPriceBox').textContent = rateElement.textContent;  
        const descriptionElement = document.getElementById('propertyDescription');
        const ownerElement = document.getElementById('ownerName');
        const ownerUsername = document.getElementById('ownerUsername');
        
        titleElement.textContent = property.title;
        locationElement.textContent = property.address?.city ?? "Unknown City";
        rateElement.textContent = `Php ${property.price_per_night} per Night`;
        document.getElementById('propertyPriceBox').textContent = rateElement.textContent;
        descriptionElement.textContent = property.description ?? "No description available";

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
        
        const track = document.getElementById('carouselTrack');
        track.innerHTML = '';

        if (images && images.length > 0) {
            images.forEach(img => {
                const imgElem = document.createElement('img');
                imgElem.src = `https://wkbljryfnphbthnfbghj.supabase.co/storage/v1/object/public/property-images/property/${property.property_id}/${img.image_path}`;
                imgElem.alt = property.title;
                track.appendChild(imgElem);
            });
        } else {
            for (let i = 0; i < 5; i++) {
                const placeholderImg = document.createElement('img');
                placeholderImg.src = 'https://placehold.co/1600x900';
                placeholderImg.alt = 'Placeholder Image';
                track.appendChild(placeholderImg);
            }
        }

        // Simple carousel logic
        const prevButton = document.querySelector('.carousel-btn.prev');
        const nextButton = document.querySelector('.carousel-btn.next');
        let currentSlide = 0;

        nextButton.addEventListener('click', () => {
            if (currentSlide < track.children.length - 1) {
                currentSlide++;
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
        });

        prevButton.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
        });

        
        const imagesLoaded = Array.from(track.querySelectorAll('img')).map(img => {
            return new Promise(resolve => {
                if (img.complete) resolve();
                else img.onload = resolve;
            });
        });

        Promise.all(imagesLoaded).then(() => {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        });

        


        

        
    } catch (error) {
        console.error("Error loading property details:", error);
    }
}

loadPropertyDetails();
