export function initNav(supabase) {

    const loginLogoutLink = document.getElementById('logInOut');
    const profileImgContainer = document.getElementById('profile-image-container');
    const navList = document.querySelector('.main-nav ul'); // Adjust selector if needed

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

            // Add profile image
            const profileImg = document.createElement('img');
            profileImg.src = user.avatar_url;
            profileImg.alt = 'Profile Image';
            profileImg.classList.add('profile-picture');
            profileImgContainer.appendChild(profileImg);

            // Add Dashboard link
            const dashboardLi = document.createElement('li');
            const dashboardLink = document.createElement('a');
            dashboardLink.href = '../HTML/dashboard.html';
            dashboardLink.textContent = 'Dashboard';
            dashboardLi.appendChild(dashboardLink);
            navList.insertBefore(dashboardLi, loginLogoutLink.parentElement);

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

const menuButton = document.querySelector(".mobile-menu-button");
const mainNav = document.querySelector(".main-nav");

menuButton.addEventListener("click", () => {
    menuButton.classList.toggle("active");
    mainNav.classList.toggle("active");
});

const searchForm = document.getElementById('searchForm');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchQuery = searchInput.value.trim();
    if (!searchQuery) return;

    const params = new URLSearchParams();
    params.set('search', searchQuery);

    const isOnContentPage = window.location.pathname.includes('content.html');

    if (isOnContentPage) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('search', searchQuery);
        window.history.pushState({}, '', newUrl);

        window.dispatchEvent(new CustomEvent('search', { detail: searchQuery }));
    } else {
        // Redirect to content page with search param
        window.location.href = `/HTML/content.html?${params.toString()}`;
    }
});
