import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { initNav } from './navbar.js';

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = createClient(supabaseUrl, supabaseKey);

initNav(supabase); 

const citySelect = document.getElementById('property-city-select');
const cityInput = document.getElementById('property-city-input');

const regionSelect = document.getElementById('property-region-select');
const regionInput = document.getElementById('property-region-input');


//auth check
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
        console.log('User is logged in:', session.user.email);
    } else {
        console.log('User is not logged in');
        window.location.href = './login.html';
    }
});


//property type check
const propertyType = document.getElementById('property-type');

propertyType.addEventListener('change', () => {
    const selectedValue = propertyType.value;
    if (selectedValue === 'other') {
            document.getElementById('property-type-other').style.display = 'block';
    } else {
        document.getElementById('property-type-other').style.display = 'none';
    }
});


//country/region check
const countryInput = document.getElementById('property-country');
countryInput.value = "philippines";

function handleCountryChange() {
    const countryValue = (countryInput.value).toLowerCase();

    if (countryValue !== "philippines") {
        document.getElementById('property-baranggay-container').value = '';
        document.getElementById('property-baranggay-container').style.display = 'none';
        document.getElementById('property-street').required = false;
        cityInput.name = 'property-city';
        regionInput.name = 'property-region';

        cityInput.value = '';
        regionSelect.value = '';

        citySelect.style.display = 'none';
        regionSelect.style.display = 'none';


        cityInput.style.display = 'flex';
        cityInput.required = true;
        regionInput.required = true;
        regionInput.style.display = 'flex';
    }
    else {
        document.getElementById('property-baranggay-container').style.display = 'flex';
        document.getElementById('property-street').required = true;
        citySelect.name = 'property-city';
        regionSelect.name = 'property-region';

        cityInput.value = '';
        regionInput.value = '';

        cityInput.style.display = 'none';
        regionInput.style.display = 'none';

        citySelect.style.display = 'flex';
        citySelect.required = true;
        regionSelect.style.display = 'flex';
        regionSelect.required = true;
        getLuzonRegion();
    }
};

function getLuzonRegion() {
    fetch('../local-data/luzon-region.json')
        .then(response => response.json())
        .then(data => dropdownRegion(data))
        .catch(error => console.error('Error fetching region data:', error));
}

//dropdown region population
function dropdownRegion(data) {

    regionSelect.innerHTML = '<option value="">Select Region</option>';
    citySelect.innerHTML = '<option value="">Select City/Municipality</option>';

    for (const [key, {name}] of Object.entries(data)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = name;
        regionSelect.appendChild(option);
    }
   
    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        citySelect.innerHTML = '<option value="">Select City/Municipality</option>';
        if (selectedRegion) {
            const cities = data[selectedRegion].cities;
            for (const name of Object.values(cities)) { // Use city name directly
                const option = document.createElement('option');
                option.value = name; // Set value to the city name
                option.textContent = name;
                console.log(option.textContent);
                citySelect.appendChild(option);
            }
        }
    });
}

//country input check
countryInput.addEventListener('input', handleCountryChange);
countryInput.value = "Philippines";
handleCountryChange();

const amenityCheckbox = document.getElementById('amenity-container');
const addAmenityButton = document.getElementById('add-amenity');

//add custom amenities, up to 20 including predefined amenities
addAmenityButton.addEventListener('click', () => {
    
    if (document.querySelectorAll('input[name="property-amenities"]').length < 20) {
    const blankAmenity = document.createElement('input');
    blankAmenity.type = 'text';
    blankAmenity.name = 'property-amenities';
    blankAmenity.classList.add('custom-amenity');
    blankAmenity.placeholder = 'Enter an amenity';
    
    amenityCheckbox.appendChild(blankAmenity);
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.type = 'button';
    removeButton.classList.add('remove-amenity');
    removeButton.addEventListener('click', () => {
        amenityCheckbox.removeChild(blankAmenity);
        amenityCheckbox.removeChild(removeButton);
    }
    );
    amenityCheckbox.appendChild(removeButton);
    }
    else {
        alert("You can only add up to 20 amenities.");
    }
});

//additional images

const propertyImgContainer = document.getElementById('property-image-container');
const addImageButton = document.getElementById('add-image');

//add images, up to 10
addImageButton.addEventListener('click', () => {
    if (propertyImgContainer.querySelectorAll('input.property-image').length < 10) {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.classList.add('property-image');
        imageInput.name = 'property-image';
        imageInput.accept = 'image/*';
        imageInput.required = true;
        
        propertyImgContainer.appendChild(imageInput);
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.type = 'button';
        removeButton.classList.add('remove-image');
        removeButton.addEventListener('click', () => {
            propertyImgContainer.removeChild(imageInput);
            propertyImgContainer.removeChild(removeButton);
        }
        );
        propertyImgContainer.appendChild(removeButton);
    }
    else {
        alert("You can only add up to 10 images.");
    }
})

//form submission
const form = document.getElementById('host-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    //user auth check
    const { data: { user } } = await supabase.auth.getUser();

    //form data fetching
    const visibleRegion = document.querySelector('[data-type="region"]:not([style*="display: none"])')?.value || '';
    const visibleCity = document.querySelector('[data-type="city"]:not([style*="display: none"])')?.value || '';
    const selectedAmenities = [];

    document.querySelectorAll('input[name="property-amenities"]:checked').forEach(cb => {
    selectedAmenities.push(cb.value);
    });

    document.querySelectorAll('.custom-amenity').forEach(input => {
        if (input.value.trim() !== '') {
            selectedAmenities.push(input.value.trim());
        }
    }
    );

    //formData object initialization
    const formData = {
        owner_id : user.id,
        title: document.getElementById('property-name').value,
        description: document.getElementById('property-description').value,
        price_per_night: document.getElementById('property-price').value,
        address: {
            country: document.getElementById('property-country').value,
            region: visibleRegion,
            city: visibleCity,
            baranggay: document.getElementById('property-baranggay').value,
            street: document.getElementById('property-street').value,
        },
        bedrooms: document.getElementById('property-bedroom').value,
        bathrooms: document.getElementById('property-bathroom').value,
        amenities: selectedAmenities,
    }
    console.log('Form data:', formData);
    //insert into supabase 'property' table
    const { data: property, error } = await supabase
    .from('properties')
    .insert([
        formData,
    ])
    .select()

    if (error) {
        console.log("error: ", error);
    } else {
        console.log("success: ", property);
    }

    //get property id for image upload
    const propertyId = property[0].property_id;
    
    const imageInputs = document.querySelectorAll('.property-image');
    console.log('Image inputs found:', imageInputs.length);
    imageInputs.forEach((input, i) => {
    console.log(`Input #${i+1} has ${input.files.length} file(s) selected`);
    });

    //image upload
    const imageFiles = document.querySelectorAll('.property-image');
    let isPrimaryImage = true;

    for (const image of imageFiles){ //cycle to each nodelist of input elements
        const file = image.files[0];
        if (!file) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `property-${propertyId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `properties/${propertyId}/${fileName}`;

        //upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);
        if (uploadError) {
            console.error('Error uploading image:', uploadError.message);
            return;
        }
        
        //get image url
        const { data } = supabase
            .storage
            .from('property-images')
            .getPublicUrl(uploadData.path);

        const imageUrl = data.publicUrl;

        //upload image data to property_images table
        const { data: ImageRow, error: imgError} = await supabase
            .from('property_images')
            .insert([{
                property_id: propertyId,
                image_path: imageUrl,
                is_primary: isPrimaryImage
            }]);
        if (imgError) {
            console.error('Error inserting image data:', imgError.message);
            return;
        }
        console.log('Image data inserted successfully:', data);
        isPrimaryImage = false; // first image is primary
    }

    alert('Property added successfully!');
 });
