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
    "https://naotkducdyuqyvkpztpe.supabase.co";


const SUPABASE_ANON_KEY =
    "sb_publishable_h1gUXjSVxqQMRs1RltZ10A_x5_XiijX";


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
