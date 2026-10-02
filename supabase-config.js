/*
====================================================
ARIAA JEWELS — SUPABASE CONFIGURATION
====================================================

IMPORTANT:

Replace the two values below with the values
from your Supabase project.

You will get them from:

Supabase Dashboard
→ Project Settings
→ API
====================================================
*/


const SUPABASE_URL =
    "YOUR_SUPABASE_PROJECT_URL";


const SUPABASE_ANON_KEY =
    "YOUR_SUPABASE_ANON_KEY";


/*
====================================================
CREATE SUPABASE CLIENT
====================================================
*/

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/*
Make it available to admin.js
*/

window.supabaseClient =
    supabaseClient;
