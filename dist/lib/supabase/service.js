"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceClient = createServiceClient;
const supabase_js_1 = require("@supabase/supabase-js");
/**
 * Creates a Supabase client with service role privileges.
 * This bypasses Row Level Security (RLS) and should only be used in secure server contexts.
 * Use this for:
 * - Webhooks that need to insert data without user authentication
 * - Background jobs
 * - Admin operations
 */
function createServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables for service client');
    }
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
