const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');
const completeProfileFormContainer = document.getElementById('complete-profile-form-container');
const showRegisterButton = document.getElementById('show-register');
const showLoginButton = document.getElementById('show-login');

function showError(form, message) {
    form.querySelectorAll('p').forEach(p => p.remove());
    const errorElement = document.createElement('p');
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    errorElement.style.textAlign = 'center';
    form.appendChild(errorElement);
}

function switchForms(hideform, showform) {
    hideform.classList.remove('visible');
    hideform.classList.add('fade');

    setTimeout(() => {
       hideform.style.display = 'none';
       showform.style.display = 'block';

       setTimeout(() => {
            showform.classList.remove('fade');
            showform.classList.add('visible');
       }, 500);
    }, 500);
}

showRegisterButton.addEventListener('click', () => switchForms(loginFormContainer, registerFormContainer));
showLoginButton.addEventListener('click', () => switchForms(registerFormContainer, loginFormContainer));

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    console.log('User is logged in:', session.user);
  } else {
    console.log('User is not logged in');
  }
});

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const completeProfileForm = document.getElementById('complete-profile-form');

let newUserId = null;

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = registerForm.regEmail.value;
    const password = registerForm.regPassword.value;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Registration error:', error.message);
        showError(registerForm, error.message);
        return;
    }

    newUserId = data.user.id;
    switchForms(registerFormContainer, completeProfileFormContainer);
});

completeProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = completeProfileForm.firstName.value;
    const lastName = completeProfileForm.lastName.value;
    const username = completeProfileForm.username.value;
    const avatarFile = document.getElementById('avatar').files[0];
    if (!avatarFile) return showError(completeProfileForm, 'Please upload an avatar.');
  
    const filePath = `avatars/${newUserId}`;  
  
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, avatarFile, { cacheControl: '3600', upsert: true });
  
    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return showError(completeProfileForm, uploadError.message);
    }
  
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    const { error: insertError } = await supabase.from('profiles').insert({
      id: newUserId,
      name_first: firstName,
      name_last: lastName,
      username,
      avatar_url: publicUrl,
    });
  
    if (insertError) {
      console.error('Profile insert error:', insertError.message);
      return showError(completeProfileForm, insertError.message);
    }
  
    window.location.href = './loggedIn.html';
  });
  
  

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.logEmail.value;
    const password = loginForm.logPassword.value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Login error:', error.message);
        showError(loginForm, error.message);
        return;
    }

    console.log('Logged in:', data.user);
    window.location.href = './loggedIn.html';
});
