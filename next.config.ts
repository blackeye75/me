import type { NextConfig } from "next";

// Pictures uploaded in the admin panel live in Supabase Storage; allow next/image to serve them.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
  },
};

export default nextConfig;
