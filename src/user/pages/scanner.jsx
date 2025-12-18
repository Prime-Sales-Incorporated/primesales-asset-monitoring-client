import React, { useState } from "react";
import Header from "../components/header";

const AssetScanner = () => {
  const [scanResult, setScanResult] = useState("");
  const [manualId, setManualId] = useState("");

  const handleScanInput = (e) => {
    setScanResult(e.target.value);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      setScanResult(manualId);
      setManualId("");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Hardware Scanner
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Use the connected hardware scanner to quickly identify assets.
            </p>
          </div>

          {/* Scanner Input */}
          <div className="mt-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-gray-400">
                  qr_code_scanner
                </span>
              </div>
              <input
                id="scanner-input"
                name="scanner-input"
                type="text"
                placeholder="Waiting for scan..."
                value={scanResult}
                onChange={handleScanInput}
                className="block w-full rounded-xl border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 py-6 pl-12 pr-4 text-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Scan Result */}
            <div className="mt-6 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 flex items-center justify-center">
              <div className="text-center">
                {scanResult ? (
                  <p className="text-xl font-medium text-primary">
                    {scanResult}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Scan result will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Manual Input */}
          <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              If scanning fails, you can enter the asset ID manually.
            </p>

            <form
              onSubmit={handleManualSubmit}
              className="mt-4 flex max-w-md mx-auto items-start gap-4"
            >
              <div className="flex-1">
                <label htmlFor="asset-id" className="sr-only">
                  Enter Asset ID manually
                </label>
                <input
                  id="asset-id"
                  name="asset-id"
                  type="text"
                  placeholder="Enter Asset ID"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 bg-background-light px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-background-dark dark:text-white dark:placeholder-gray-400 dark:focus:border-primary dark:focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetScanner;
