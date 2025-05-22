import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { initNav } from './navbar.js';

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = createClient(supabaseUrl, supabaseKey);

initNav(supabase);

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  }).format(amount);
}

const checkInInput = document.getElementById("checkInDate");
const checkOutInput = document.getElementById("checkOutDate");
const confirmBtn = document.getElementById("confirmReservationButton");
const reservationDiv = document.getElementById("reservationDates");
const priceDisplay = document.getElementById("checkoutPrice");
const propertyId = new URLSearchParams(window.location.search).get("id");

let currentUserId = null;
let pricePerNight = 0;

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function clearMessage(id) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
}

function showMessage(message, id, color = "red") {
  clearMessage(id);
  const p = document.createElement("p");
  p.id = id;
  p.textContent = message;
  p.style.color = color;
  p.style.textAlign = "center";
  reservationDiv.appendChild(p);
}

(function initializeDates() {
  const today = new Date();
  const checkInDate = new Date(today);
  checkInDate.setDate(checkInDate.getDate() + 1);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 1);

  checkInInput.value = formatDate(checkInDate);
  checkInInput.min = formatDate(checkInDate);
  checkOutInput.value = formatDate(checkOutDate);
  checkOutInput.min = formatDate(checkOutDate);
})();

checkInInput.addEventListener("change", () => {
  const selected = new Date(checkInInput.value);
  const min = new Date();
  min.setDate(min.getDate() + 1);

  if (selected < min) {
    showMessage("Check-in date cannot be in the past.", "checkInError");
    checkInInput.value = formatDate(min);
  } else {
    clearMessage("checkInError");
    const nextDay = new Date(selected);
    nextDay.setDate(nextDay.getDate() + 1);
    checkOutInput.min = formatDate(nextDay);

    if (new Date(checkOutInput.value) <= selected) {
      checkOutInput.value = formatDate(nextDay);
    }
  }

  updateTotalPrice();
});

checkOutInput.addEventListener("change", () => {
  const checkIn = new Date(checkInInput.value);
  const checkOut = new Date(checkOutInput.value);

  if (checkOut <= checkIn) {
    showMessage("Check-out must be after check-in.", "checkOutError");
    const nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);
    checkOutInput.value = formatDate(nextDay);
  } else {
    clearMessage("checkOutError");
  }

  updateTotalPrice();
});

function updateTotalPrice() {
  const checkIn = new Date(checkInInput.value);
  const checkOut = new Date(checkOutInput.value);
  const nights = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const total = nights * pricePerNight;

  priceDisplay.textContent = nights > 0
    ? `${nights} night(s) × Php ${formatCurrency(pricePerNight)} = Php ${formatCurrency(total)}`
    : "";
}

async function loadPropertyDetails() {
  try {
    const { data: property, error } = await supabase
      .from("properties")
      .select("*")
      .eq("property_id", propertyId)
      .single();

    if (error || !property) {
      console.warn("Property not found. Redirecting to content.html...");
      window.location.href = "/HTML/content.html";
      return;
    }

    document.getElementById("propertyName").textContent = property.title;
    document.getElementById("propertyLocation").textContent = property.address?.city ?? "Unknown City";
    document.getElementById("propertyPrice").textContent = `${formatCurrency(property.price_per_night)} per Night`;
    pricePerNight = property.price_per_night;

    updateTotalPrice();
  } catch (err) {
    console.error("Error fetching property:", err.message);
    window.location.href = "/HTML/content.html"; // Fallback on unexpected errors
  }
}


async function loadUnavailableDates() {
  try {
    const { data: bookings, error } = await supabase
      .from('reservations')
      .select('check_in_date, check_out_date')
      .eq('property_id', propertyId)
      .gte('check_out_date', formatDate(new Date())) 
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    const listEl = document.getElementById('unavailable-dates-list');
    listEl.innerHTML = '';

    bookings.forEach(({ check_in_date, check_out_date }) => {
      const end = new Date(check_out_date);
      end.setDate(end.getDate());

      const li = document.createElement('li');
      li.textContent = `${check_in_date} -  ${formatDate(end)}`;
      listEl.appendChild(li);
    });

  } catch (err) {
    console.error('Could not load unavailable dates:', err.message);
  }
}

async function loadUserDetails(session) {
  try {
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) throw error;

    currentUserId = session.user.id;
    document.getElementById("userName").textContent = `Name: ${user.name_first} ${user.name_last}`;
    document.getElementById("userEmail").textContent = `Email: ${session.user.email}`;
  } catch (err) {
    console.error("Error loading user:", err.message);
  }
}

async function checkSessionAndLoadUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await loadUserDetails(session);
  } else {
    window.location.href = "./login.html";
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    loadUserDetails(session);
  } else {
    window.location.href = "./login.html";
  }
});


confirmBtn.addEventListener("click", async () => {
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Submitting…";

  clearMessage("reservationError");
  clearMessage("reservationSuccess");

  const checkIn = checkInInput.value;
  const checkOut = checkOutInput.value;

  try {
    const { data: overlapping, error: overlapErr } = await supabase
      .from("reservations")
      .select("id")
      .eq("property_id", propertyId)
      .gte("check_out_date", checkIn)
      .lte("check_in_date", checkOut);

    if (overlapErr) throw overlapErr;
    if (overlapping.length) {
      showMessage("Those dates are already booked.", "reservationError");
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirm Reservation";
      return;
    }

    const nights = Math.floor(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    const total = nights * pricePerNight;

    const { error: insertErr } = await supabase
      .from("reservations")
      .insert([{
        property_id: propertyId,
        guest_id: currentUserId,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_price: total,
      }])
      .single();

    if (insertErr) throw insertErr;

    showMessage("Rese rvation confirmed! Waiting for owner approval", "reservationSuccess", "green");
    //redirect to the dashboard
    setTimeout(() => {
      window.location.href = "/HTML/dashboard.html";
    }
    , 2000);
  } catch (err) {
    console.error(err);
    showMessage("Failed to create reservation. Please try again.", "reservationError");
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Confirm Reservation";
  }
});

checkSessionAndLoadUser();
loadPropertyDetails();
loadUnavailableDates();