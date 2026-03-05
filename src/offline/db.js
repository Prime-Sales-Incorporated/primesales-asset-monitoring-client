import Dexie from "dexie";

const db = new Dexie("AssetOfflineDB");

db.version(1).stores({
  assets: `
    serialNumber,
    assetName,
    classification,
    description,
    category,
    purchaseDate,
    issuedDate,
    issuedTo,
    assetCost,
    lifeSpan,
    status,
    generateQR,
    unitLocation,
    rentPeriod,
    createdAt,
    updatedAt
  `,
  pendingUpdates: "++id, serialNumber, payload, action",
});
db.version(2).stores({
  assets: `
    serialNumber,
    assetName,
    classification,
    description,
    category,
    purchaseDate,
    issuedDate,
    issuedTo,
    assetCost,
    lifeSpan,
    status,
    generateQR,
    unitLocation,
    rentPeriod,
    createdAt,
    updatedAt
  `,

  pendingUpdates: "++id, serialNumber, payload, action",

  pendingAudits: "++id, serialNumber, payload, createdAt",
});
export default db;
