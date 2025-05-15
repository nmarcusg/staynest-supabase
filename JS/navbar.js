const loginLogoutLink = document.getElementById('logInOut');


supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
        loginLogoutLink.textContent = 'Log Out';
        
        loginLogoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await supabase.auth.signOut();
                window.location.href = '../index.html';
            } catch (error) {
                console.error('Error signing out:', error.message);
            }
        });
    } else {

        loginLogoutLink.textContent = 'Log In';
    }
});