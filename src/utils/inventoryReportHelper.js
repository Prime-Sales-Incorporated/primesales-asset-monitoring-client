// Normalize condition into 3 types (BASED ON YOUR ACTUAL DATA)
export const normalizeCondition = (status) => {
  if (!status) return "Maintenance";

  const s = status.toLowerCase();

  if (s.includes("good")) return "Good";
  if (s.includes("maintenance")) return "Maintenance";
  if (s.includes("disposal")) return "Disposal";

  return "Maintenance";
};

// Total Assets
export const getTotalAssets = (assets) => assets.length;

// Total Value
export const getTotalValue = (assets) =>
  assets.reduce((sum, a) => sum + (Number(a.assetCost) || 0), 0);

// Group by Category
export const groupByCategory = (assets) => {
  return assets.reduce((acc, asset) => {
    const category = asset.category || "Uncategorized";

    if (!acc[category]) acc[category] = [];
    acc[category].push(asset);

    return acc;
  }, {});
};

// Category Condition Stats
export const getCategoryConditionStats = (assets) => {
  const grouped = groupByCategory(assets);

  return Object.keys(grouped).map((category) => {
    const items = grouped[category];

    let good = 0;
    let maintenance = 0;
    let disposal = 0;

    items.forEach((item) => {
      const condition = normalizeCondition(item.status); // ✅ CORRECT FIELD

      if (condition === "Good") good++;
      else if (condition === "Maintenance") maintenance++;
      else if (condition === "Disposal") disposal++;
    });

    const total = items.length;

    return {
      category,
      total,
      goodPercent: total ? (good / total) * 100 : 0,
      maintenancePercent: total ? (maintenance / total) * 100 : 0,
      disposalPercent: total ? (disposal / total) * 100 : 0,
    };
  });
};

// ✅ CRITICAL ASSETS (THIS IS YOUR FIX)
export const getCriticalAssets = (assets) => {
  return assets.filter((a) => {
    const c = normalizeCondition(a.status); // ✅ USE STATUS
    return c !== "Good"; // ONLY GOOD IS SAFE
  });
};

export const getOverallHealth = (assets) => {
  if (!assets.length) return 0;

  const goodCount = assets.filter(
    (a) => normalizeCondition(a.status) === "Good",
  ).length;

  return Math.round((goodCount / assets.length) * 100);
};

// Helper: Asset Category Health
export const getAssetCategoryHealth = (assets) => {
  const grouped = assets.reduce((acc, asset) => {
    const category = asset.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(asset);
    return acc;
  }, {});

  return Object.keys(grouped).map((category) => {
    const items = grouped[category];

    let good = 0;
    let maintenance = 0;
    let disposal = 0;

    items.forEach((asset) => {
      const status = asset.status?.toLowerCase() || "maintenance";
      if (status.includes("good")) good++;
      else if (status.includes("maintenance")) maintenance++;
      else if (status.includes("disposal")) disposal++;
    });

    const total = items.length;
    const goodPercent = total ? Math.round((good / total) * 100) : 0;
    const maintenancePercent = total
      ? Math.round((maintenance / total) * 100)
      : 0;
    const disposalPercent = total ? Math.round((disposal / total) * 100) : 0;

    return {
      category,
      totalUnits: total,
      averageHealth: goodPercent, // for the table & bar
      maintenanceStatus:
        maintenance + disposal > 0
          ? `${maintenance + disposal} require attention`
          : "Up to date",
      breakdown: {
        goodPercent,
        maintenancePercent,
        disposalPercent,
      },
    };
  });
};

export const formatCriticalAssets = (assets) => {
  return assets.map((asset) => {
    let status = "Good";
    let statusColor = "emerald";
    let action = "View Details";

    // Example logic (adjust based on your schema)
    if (asset.status === "For Disposal" || asset.health <= 50) {
      status = "Critical";
      statusColor = "rose";
      action = "Request Replacement";
    } else if (asset.status === "For Maintenance" || asset.health <= 70) {
      status = "Warning";
      statusColor = "amber";
      action = "Schedule Maintenance";
    }

    return {
      id: asset._id,
      name: asset.assetName,
      assetTag: asset.serialNumber,
      issue: asset.issue || "No issue description provided.",
      assignedTo: asset.issuedTo || "Unassigned",
      issuedDate: asset.issuedDate || "Unknown",
      status,
      statusColor,
      action,
    };
  });
};
