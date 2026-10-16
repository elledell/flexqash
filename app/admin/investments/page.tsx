"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ConvexError } from "convex/values";

export default function AdminInvestmentsPage() {
  const packages = useQuery(api.adminInvestments.getAllPackages);
  const createPackage = useMutation(api.adminInvestments.createPackage);
  const toggleStatus = useMutation(api.adminInvestments.togglePackageStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    dailyRoi: "",
    durationDays: "30",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createPackage({
        name: formData.name,
        cost: Number(formData.cost),
        dailyRoi: Number(formData.dailyRoi),
        durationDays: Number(formData.durationDays),
      });
      setSuccess(`${formData.name} created successfully!`);
      setFormData({ name: "", cost: "", dailyRoi: "", durationDays: "30" });
    } catch (err) {
      setError(err instanceof ConvexError ? err.data as string : "Failed to create package");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: any, currentStatus: boolean) => {
    await toggleStatus({ packageId: id, currentStatus });
  };

  if (packages === undefined) {
    return <div className="p-8 text-center font-bold text-[#112a46]">Loading Packages...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#112a46]">Manage Investments</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Package Form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1 h-fit">
          <h2 className="mb-4 text-lg font-bold text-[#112a46]">Launch New Package</h2>
          
          {error && <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          {success && <div className="mb-4 text-xs font-bold text-[#1abc9c] bg-[#e0f2f1] p-3 rounded-lg">{success}</div>}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Package Name</label>
              <input 
                type="text" required placeholder="e.g. Gold Tier"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-[#112a46] focus:border-[#1abc9c] focus:outline-none focus:ring-1 focus:ring-[#1abc9c]" 
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Cost (Coins / KES)</label>
              <input 
                type="number" required placeholder="1000"
                value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-[#112a46] focus:border-[#1abc9c] focus:outline-none" 
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Daily ROI (%)</label>
              <input 
                type="number" step="0.1" required placeholder="1.5"
                value={formData.dailyRoi} onChange={(e) => setFormData({...formData, dailyRoi: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-[#112a46] focus:border-[#1abc9c] focus:outline-none" 
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Duration (Days)</label>
              <input 
                type="number" required placeholder="30"
                value={formData.durationDays} onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-[#112a46] focus:border-[#1abc9c] focus:outline-none" 
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-[#112a46] py-3 text-sm font-bold text-white shadow-md hover:bg-[#1a3a5e] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Launch Package"}
            </button>
          </form>
        </div>

        {/* Existing Packages Table */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-[#112a46]">Active Packages</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Name</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Cost</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Daily ROI</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Duration</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#112a46]">
                {packages.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400 font-medium">No packages created yet.</td></tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4 font-bold">{pkg.name}</td>
                      <td className="px-4 py-4 font-medium">{pkg.cost.toLocaleString()} Coins</td>
                      <td className="px-4 py-4 font-bold text-[#1abc9c]">{pkg.dailyRoi}%</td>
                      <td className="px-4 py-4 font-medium">{pkg.durationDays} Days</td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => handleToggle(pkg._id, pkg.isActive)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                            pkg.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Hidden"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}