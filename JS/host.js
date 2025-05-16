import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = createClient(supabaseUrl, supabaseKey);

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
    console.log('Selected property type:', selectedValue);
    console.log('Selected property type:', selectedValue);
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
        cityInput.name = 'property-city';
        regionInput.name = 'property-region';

        cityInput.value = '';
        regionSelect.value = '';

        citySelect.style.display = 'none';
        regionSelect.style.display = 'none';

        citySelect

        cityInput.style.display = 'flex';
        regionInput.style.display = 'flex';
    }
    else {
        document.getElementById('property-baranggay-container').style.display = 'flex';
        
        citySelect.name = 'property-city';
        regionSelect.name = 'property-region';

        cityInput.value = '';
        regionInput.value = '';

        cityInput.style.display = 'none';
        regionInput.style.display = 'none';

        citySelect.style.display = 'flex';
        regionSelect.style.display = 'flex';

        getLuzonRegion();
    }
};

countryInput.addEventListener('input', handleCountryChange);
countryInput.value = "Philippines";
handleCountryChange();

function getLuzonRegion() {
    fetch('../local-data/luzon-region.json')
        .then(response => response.json())
        .then(data => dropdownRegion(data))
        .catch(error => console.error('Error fetching region data:', error));
}

function dropdownRegion(data) {
    console.log(regionSelect, citySelect);

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
            console.log(cities);
            for (const [key, name] of Object.entries(cities)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = name;
                console.log(option.textContent);
                citySelect.appendChild(option);
            }
        }
    });
}

const form = document.getElementById('host-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    

});