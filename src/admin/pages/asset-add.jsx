// src/components/RegisterAsset.jsx
import React, { useState } from "react";
import Header from "../components/header";
import API_BASE_URL from "../../API";

const RegisterAsset = () => {
  const [assetName, setAssetName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [generateQR, setGenerateQR] = useState(false);
  const [classification, setClassification] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [status, setStatus] = useState(""); // new state

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      assetName,
      classification,
      description,
      category,
      serialNumber,
      purchaseDate,
      issuedDate,
      issuedTo,
      status, // add this
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/asset/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Asset saved:", data);
        // Optionally reset the form
        setAssetName("");
        setClassification("");
        setDescription("");
        setCategory("");
        setSerialNumber("");
        setPurchaseDate("");
        setIssuedDate("");
        setIssuedTo("");
        setGenerateQR(false);
        alert("Asset registered successfully!");
      } else {
        console.error("Error saving asset:", data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to save asset. Please try again.");
    }
  };

  return (
    <main className="flex-1 w-full bg-background-light dark:bg-background-dark pb-10">
      <Header />
      <div className="max-w-2xl mx-auto bg-background-light dark:bg-background-dark p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Register New Asset
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Asset Name */}
          <div>
            <label
              htmlFor="asset-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Asset Name
            </label>
            <input
              id="asset-name"
              type="text"
              placeholder='e.g. "Office Laptop"'
              className="w-full px-3 py-2 border rounded-lg text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Enter a detailed description of the asset"
              className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Category & Serial Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Furniture">Furniture</option>
                <option value="Vehicles">Vehicles</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="serial-number"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Serial Number
              </label>
              <input
                id="serial-number"
                type="text"
                placeholder="Enter serial number"
                className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-900 dark:text-white dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label
              htmlFor="purchase-date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Purchase Date
            </label>
            <input
              id="purchase-date"
              type="date"
              className="w-full px-3 py-2 border rounded-lg placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>

          {/* Issued Date */}
          <div>
            <label
              htmlFor="issued-date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Issued Date
            </label>
            <div className="flex items-center gap-3">
              <input
                id="issued-date"
                type="date"
                className="w-full px-3 py-2 border rounded-lg placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <input
                id="same-as-purchase"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                checked={issuedDate === purchaseDate && purchaseDate !== ""}
                onChange={(e) => {
                  if (e.target.checked) {
                    setIssuedDate(purchaseDate);
                  } else {
                    setIssuedDate("");
                  }
                }}
              />
              <label
                htmlFor="same-as-purchase"
                className="text-sm text-slate-700 dark:text-slate-300"
              >
                Same as purchase date
              </label>
            </div>
          </div>

          {/* Issued To */}
          <div>
            <label
              htmlFor="issued-to"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Issued To
            </label>
            <input
              id="issued-to"
              type="text"
              placeholder="Enter the name or department e.g. 'John Doe' or 'IT Department'"
              className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500"
              value={issuedTo}
              onChange={(e) => setIssuedTo(e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Select status</option>
              <option value="Good Condition">Good Condition</option>
              <option value="For Maintenance">For Maintenance</option>
              <option value="For Disposal">For Disposal</option>
            </select>
          </div>

          {/* QR Code */}
          {/* <div className="flex items-center pt-2">
            <input
              id="qr-code"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
              checked={generateQR}
              onChange={(e) => setGenerateQR(e.target.checked)}
            />
            <label
              htmlFor="qr-code"
              className="ml-2 block text-sm text-slate-900 dark:text-slate-100"
            >
              Generate and associate QR code
            </label>
          </div> */}

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center justify-center h-11 px-6 text-sm font-bold text-white rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary"
            >
              <span className="material-symbols-outlined mr-2">save</span>
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default RegisterAsset;
