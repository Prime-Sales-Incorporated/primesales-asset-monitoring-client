import API_BASE_URL from "../API";
import db from "../offline/db";

export const fetchAssetsService = async () => {
  try {
    let data = [];

    if (navigator.onLine) {
      const res = await fetch(`${API_BASE_URL}/api/asset/get/all`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });

      data = await res.json();

      await db.assets.clear();
      await db.assets.bulkPut(data);
    } else {
      data = await db.assets.toArray();
    }

    return data;
  } catch (err) {
    console.error("Fetch failed, using cache:", err);
    return await db.assets.toArray();
  }
};
