import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadDashboard() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    window.location.href = "/HTML/login.html";
    return;
  }

  const userId = user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return;
  }

  document.getElementById("username").textContent = profile.username;
  document.getElementById("fullname").textContent =
    `${profile.name_first} ${profile.name_last}`;

  const { data: reservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("*, properties(property_id, address, title)")
    .eq("guest_id", userId);

  const reservationsList = document.getElementById("reservations-list");
  const noReservations = document.getElementById("no-reservations");

  if (reservationsError || !reservations || reservations.length === 0) {
    noReservations.style.display = "block";
  } else {
    reservations.forEach((res) => {
      const li = document.createElement("li");
      const address = res.properties?.address;
      const propertyId = res.property_id;
      const propertyTitle = res.properties?.title || "View Property";

      li.innerHTML = `
        <div>
          <p>
            <strong>${propertyTitle}</strong><br>
            From <strong>${res.check_in_date}</strong> to <strong>${res.check_out_date}</strong><br>
            Address: ${formatAddress(address)}
          </p>
          <button class="action-button view-property-button" onclick="window.location.href='property.html?id=${propertyId}'">
            View Property
          </button>
          <button class="action-button cancel-button cancel-reservation-button" data-reservation-id="${res.id}">
            Cancel Reservation
          </button>
        </div>
      `;
      

      li.querySelector(".cancel-reservation-button").addEventListener("click", async () => {
        const confirmed = confirm("Are you sure you want to cancel this reservation?");
        if (confirmed) {
          const { error: deleteError } = await supabase
            .from("reservations")
            .delete()
            .eq("id", res.id);

          if (deleteError) {
            alert("Failed to cancel reservation.");
            console.error(deleteError);
          } else {
            li.remove();
            if (reservationsList.children.length === 0) {
              noReservations.style.display = "block";
            }
          }
        }
      });

      reservationsList.appendChild(li);
    });
  }

  const { data: hostedProperties, error: hostError } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", userId);

  const hostedList = document.getElementById("hosted-properties-list");
  const noHosted = document.getElementById("no-hosted-properties");

  if (hostError || !hostedProperties || hostedProperties.length === 0) {
  noHosted.style.display = "block";
} else {
  hostedProperties.forEach((prop) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${prop.title} — ₱${prop.price_per_night}/night
      <button class="action-button view-property-button" onclick="window.location.href='property.html?id=${prop.property_id}'">
        View
      </button>
      <button class="action-button cancel-button delete-property-button" data-property-id="${prop.property_id}">
        Delete
      </button>
    `;

    // Add event listener for delete button
    li.querySelector(".delete-property-button").addEventListener("click", async () => {
      const confirmed = confirm(`Are you sure you want to delete "${prop.title}"? This action cannot be undone.`);
      if (!confirmed) return;

      const { error: deleteError } = await supabase
        .from("properties")
        .delete()
        .eq("property_id", prop.property_id);

      if (deleteError) {
        alert("Failed to delete the property.");
        console.error(deleteError);
      } else {
        li.remove();
        if (hostedList.children.length === 0) {
          noHosted.style.display = "block";
        }
      }
    });

    hostedList.appendChild(li);
  });
}
}

function formatAddress(addressJson) {
  if (!addressJson || typeof addressJson !== "object") return "Unknown";
  const { street, city, country } = addressJson;
  return [street, city, country].filter(Boolean).join(", ");
}

document.getElementById("hostPropertyBtn").addEventListener("click", () => {
  window.location.href = "host.html";
});

loadDashboard();
