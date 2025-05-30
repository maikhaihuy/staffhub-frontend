import path from "path";
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  // webpack: (config: Configuration) => {
  //   if (config.resolve) {
  //     config.resolve.alias = {
  //       ...(config.resolve.alias || {}),
  //       "@": path.resolve(__dirname, "src"),
  //     };
  //   }
  //   return config;
  // },
};

export default nextConfig;
