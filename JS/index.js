import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { initNav } from './navbar.js';

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = createClient(supabaseUrl, supabaseKey);

initNav(supabase);

window.onload = function () {
    const firstImg = document.querySelector(".recommended-column img");
    if (firstImg) {
        myFunction(firstImg);
    }
};

const menuButton = document.querySelector(".mobile-menu-button");
const mainNav = document.querySelector(".main-nav");

menuButton.addEventListener("click", () => {
    menuButton.classList.toggle("active");
    mainNav.classList.toggle("active");
});