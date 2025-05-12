const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


// Monitor authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event);
  console.log(session);
  
  const userInfoDiv = document.getElementById('user-email');
  userInfoDiv.innerHTML = ''; // Clear previous content

  if (session?.user) {
    console.log('User  is logged in:', session.user.email);
    
    const emailParagraph = document.createElement('p');
    emailParagraph.textContent = `You are logged in as: ${session.user.email}`;
    userInfoDiv.appendChild(emailParagraph);
  } else {
    console.log('User  is not logged in');
    window.location.href = './login.html';
  }
});

// Logout button functionality
const logoutButton = document.getElementById('logout');

async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error.message);
    return;
  }
}

logoutButton.addEventListener('click', async () => {
  signOut();
  });

