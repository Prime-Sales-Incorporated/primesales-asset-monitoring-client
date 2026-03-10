import React, { useState } from "react";

export default function AuditHistoryModal({ audit, onClose }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!audit) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl max-w-5xl w-full max-h-[90%] overflow-auto shadow-lg">
          {/* Header */}
          <header className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center border-b border-primary/20 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-xl text-white">
                <span className="material-symbols-outlined text-3xl">
                  precision_manufacturing
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight dark:text-white">
                  Forklift Inspection
                </h1>
                <p className="text-primary font-medium">
                  Audit ID: #{audit._id.slice(-8)} •{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    {new Date(audit.createdAt).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-auto flex items-center justify-center rounded-xl h-10 px-0 bg-red- text-white font-bold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-xl text-gray-500 ">
                close
              </span>{" "}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column: Photos */}

            <div className="lg:col-span-1 space-y-4">
              {audit.photos.length > 0 ? (
                <div className="space-y-2 grid grid-cols-1 gap-2">
                  {audit.photos.map((p, i) => (
                    <img
                      key={i}
                      src={p.preview}
                      alt={`Audit photo ${i + 1}`}
                      className="w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer"
                      onClick={() => setSelectedPhoto(p.preview)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-slate-500">
                  No photos available
                </div>
              )}
            </div>

            {/* Right Column: Checklist */}
            <div className="lg:col-span-2 space-y-4">
              {audit.audit?.items &&
                Object.entries(audit.audit.items).map(([section, data]) => (
                  <section
                    key={section}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                  >
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
                      <h2 className="text-lg font-bold dark:text-white">
                        {section}
                      </h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {Object.entries(data.checklist).map(([item, checked]) => (
                        <div
                          key={item}
                          className={`flex items-center justify-between p-4 ${
                            checked
                              ? "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                              : "bg-red-50/50 dark:bg-red-900/10"
                          } transition-colors`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold dark:text-white">
                              {item}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                              checked
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {checked ? "check_circle" : "cancel"}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {checked ? "Pass" : "Fail"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {data.note && (
                        <p className="p-4 italic text-slate-500 dark:text-slate-400">
                          Note: {data.note}
                        </p>
                      )}
                    </div>
                  </section>
                ))}
              {/* Signature */}
              {audit.audit?.signature && (
                <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold dark:text-white">
                      Signature
                    </h2>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">
                      {audit.audit.signature}
                    </p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Preview"
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
}
