import react from "react";

const Warehouse = () => {
  return (
    <main>
      <div className=" w-full h-screen p-8">
        <div>
          <h1 className="text-slate-900 font-bold text-3xl">
            Warehouse Parts Inventory
          </h1>
          <p className="text-gray-400">
            Generate and manage system-wide asset intelligence reports.
          </p>
        </div>

        <div className="grid grid-cols-1  w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg text-emerald-50 flex items-center justify-center">
            s
          </div>
          <div className="bg-white border rounded-lg text-emerald-50">s</div>
          <div className="bg-white border rounded-lg text-emerald-50">s</div>
        </div>
      </div>
    </main>
  );
};

export default Warehouse;
