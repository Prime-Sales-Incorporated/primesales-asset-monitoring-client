// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";

// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: "autoUpdate",
//       manifest: {
//         name: "Inventory Scanner",
//         short_name: "Scanner",
//         theme_color: "#ffffff",
//         icons: [
//           {
//             src: "/icon.png",
//             sizes: "192x192",
//             type: "image/png",
//           },
//         ],
//       },

//       workbox: {
//         runtimeCaching: [
//           {
//             urlPattern: ({ request }) =>
//               request.destination === "script" ||
//               request.destination === "style" ||
//               request.destination === "document",

//             handler: "NetworkFirst",
//             options: {
//               cacheName: "app-shell",
//             },
//           },
//         ],
//       },
//     }),
//   ],
// });
