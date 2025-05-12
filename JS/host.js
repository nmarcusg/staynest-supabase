import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://wkbljryfnphbthnfbghj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmxqcnlmbnBoYnRobmZiZ2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MzQyODEsImV4cCI6MjA2MTIxMDI4MX0.W8Tcg8whyMUqS0yvOenEaNU6wrFzLr1vWNRhJ6rNOac";
const supabase = createClient(supabaseUrl, supabaseKey);

supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
        console.log('User is logged in:', session.user.email);
    } else {
        console.log('User is not logged in');
        window.location.href = './login.html';
    }
});