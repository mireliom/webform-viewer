/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    NEXT_PUBLIC_LAMBDA_NAME: process.env.NEXT_PUBLIC_LAMBDA_NAME,
    EXISTING_LAMBDA_NAME: process.env.EXISTING_LAMBDA_NAME,
  },
};

export default nextConfig;
