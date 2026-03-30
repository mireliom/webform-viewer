/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configures Next.js to produce a static export (the 'out' directory)
  output: "export",

  images: {
    unoptimized: true,
  },

  env: {
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
    NEXT_PUBLIC_AWS_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY:
      process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_EXISTING_LAMBDA_NAME:
      process.env.NEXT_PUBLIC_EXISTING_LAMBDA_NAME || "screenshot-function",
    NEXT_PUBLIC_LAMBDA_FUNCTION_NAME:
      process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_NAME || "screenshot-function",
    NEXT_PUBLIC_BILLSHARK_API_URL:
      process.env.NEXT_PUBLIC_BILLSHARK_API_URL ||
      "https://api.billshark.com/v1",
    NEXT_PUBLIC_BILLSHARK_API_KEY: process.env.NEXT_PUBLIC_BILLSHARK_API_KEY,
  },
};

export default nextConfig;
