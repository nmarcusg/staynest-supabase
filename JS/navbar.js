export function initNav(supabase) {

    const loginLogoutLink = document.getElementById('logInOut');
    const profileImgContainer = document.getElementById('profile-image-container');


    async function loadUserDetails(session) {
        const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();

        if (userError) {
            console.error("Error fetching user details:", userError.message);
            return null;
        }

        return user;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
            loginLogoutLink.textContent = 'Log Out';

            const user = await loadUserDetails(session);
            const profileImg = document.createElement('img');
            profileImg.src = user.avatar_url;
            profileImg.alt = 'Profile Image';

            profileImgContainer.appendChild(profileImg);
            profileImgContainer
            
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
}

