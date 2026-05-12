import API_BASE_URL from "../API";
import db from "../offline/db";

// Paginated fetch — for list/table views
export const fetchAssetsService = async (params = {}) => {
  try {
    if (navigator.onLine) {
      const queryObj = {
        limit: params.limit || 20,
        page: params.page || 1,
      };

      if (params.category) queryObj.category = params.category;
      if (params.status) queryObj.status = params.status;
      if (params.search) queryObj.search = params.search;

      const res = await fetch(
        `${API_BASE_URL}/api/asset/get/all?${new URLSearchParams(queryObj)}`,
        { headers: { "ngrok-skip-browser-warning": "true" } },
      );

      const data = await res.json();

      // Cache page 1 for offline use
      if (!params.page || params.page === 1) {
        await db.assets.clear();
        await db.assets.bulkPut(data.assets ?? []);
      }

      return data; // { assets, total, totalPages, currentPage }
    } else {
      // Offline — filter and paginate from Dexie cache
      let all = await db.assets.toArray();

      if (params.category)
        all = all.filter((a) => a.category === params.category);
      if (params.status) all = all.filter((a) => a.status === params.status);
      if (params.search) {
        const q = params.search.toLowerCase();
        all = all.filter(
          (a) =>
            a.assetName?.toLowerCase().includes(q) ||
            a.serialNumber?.toLowerCase().includes(q),
        );
      }

      const page = params.page || 1;
      const limit = params.limit || 20;
      const start = (page - 1) * limit;

      return {
        assets: all.slice(start, start + limit),
        total: all.length,
        totalPages: Math.ceil(all.length / limit),
        currentPage: page,
      };
    }
  } catch (err) {
    console.error("Fetch failed, using cache:", err);
    const all = await db.assets.toArray();
    return { assets: all, total: all.length, totalPages: 1, currentPage: 1 };
  }
};

// Fetch ALL assets — only for depreciation dashboard
export const fetchAllAssetsService = async () => {
  try {
    if (navigator.onLine) {
      const res = await fetch(`${API_BASE_URL}/api/asset/get/all?limit=10000`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const data = await res.json();
      return data.assets ?? [];
    } else {
      return await db.assets.toArray();
    }
  } catch (err) {
    console.error("Fetch failed, using cache:", err);
    return await db.assets.toArray();
  }
};
