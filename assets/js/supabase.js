
// assets/js/supabase.js

// TODO: Replace these with your actual Supabase project URL and Anon Key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize the Supabase client
// We assume the supabase-js library is loaded via CDN in the HTML file
let supabaseClient = null;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('Supabase library not loaded. Make sure to include the script tag.');
}

export { supabaseClient, SUPABASE_URL, SUPABASE_ANON_KEY };
