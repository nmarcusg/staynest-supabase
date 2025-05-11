const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const reservation = document.getElementById("reservationDates");
const checkIn = document.getElementById("checkInDate");
const checkOut = document.getElementById("checkOutDate");

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function clearError(id) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
}

function showError(message, id) {
  clearError(id);
  const p = document.createElement("p");
  p.id = id;
  p.textContent = message;
  p.style.color = "red";
  p.style.textAlign = "center";
  reservation.appendChild(p);
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(tomorrow);
dayAfter.setDate(dayAfter.getDate() + 1);

checkIn.value = formatDate(tomorrow);
checkIn.min = formatDate(tomorrow);
checkOut.value = formatDate(dayAfter);
checkOut.min = formatDate(dayAfter);

checkIn.addEventListener("change", () => {
  const selectedCheckIn = new Date(checkIn.value);
  const minCheckIn = new Date(today);
  minCheckIn.setDate(minCheckIn.getDate() + 1);

  if (selectedCheckIn < minCheckIn) {
    showError("Check-in date cannot be in the past.", "checkInError");
    checkIn.value = formatDate(minCheckIn);
  } else {
    clearError("checkInError");
    const nextDay = new Date(selectedCheckIn);
    nextDay.setDate(nextDay.getDate() + 1);
    checkOut.min = formatDate(nextDay);
    if (new Date(checkOut.value) <= selectedCheckIn) {
      checkOut.value = formatDate(nextDay);
    }
  }
});

checkOut.addEventListener("change", () => {
  const checkInDate = new Date(checkIn.value);
  const checkOutDate = new Date(checkOut.value);
  if (checkOutDate <= checkInDate) {
    showError("Check-out must be after check-in.", "checkOutError");
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    checkOut.value = formatDate(nextDay);
  } else {
    clearError("checkOutError");
  }
});


function updateTotalPrice() {
  const checkInDate = new Date(checkIn.value);
  const checkOutDate = new Date(checkOut.value);
  const nights = Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * pricePerNight;

  const priceDisplay = document.getElementById("checkoutPrice");
  if (nights > 0) {
    priceDisplay.textContent = `${nights} night(s) × Php ${pricePerNight} = Php ${totalPrice}`;
  } else {
    priceDisplay.textContent = "";
  }
}

checkIn.addEventListener("change", updateTotalPrice);
checkOut.addEventListener("change", updateTotalPrice);

async function loadPropertyDetails() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get("id");
    const { data: property, error } = await supabase
      .from("properties")
      .select("*")
      .eq("property_id", propertyId)
      .single();
    if (error) return console.error("Error fetching property details:", error.message);
    document.getElementById("propertyName").textContent = property.title;
    document.getElementById("propertyLocation").textContent = property.address?.city ?? "Unknown City";
    document.getElementById("propertyPrice").textContent = `Php ${property.price_per_night} per Night`;
    pricePerNight = property.price_per_night;
  } catch (error) {
    console.error("Error fetching property details:", error);
  }
}

async function loadUserDetails(session) {
  try {
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (error) return console.error("Error fetching user details:", error.message);
    document.getElementById("userName").textContent = `Name: ${user.name_first} ${user.name_last}`;
    document.getElementById("userEmail").textContent = `Email: ${session.user.email}`;
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
}

async function checkSessionAndLoadUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (session) {
    await loadUserDetails(session);
  } else {
    window.location.href = "/login.html";
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    loadUserDetails(session);
  } else {
    window.location.href = "/login.html";
  }
});

checkSessionAndLoadUser();
loadPropertyDetails();
