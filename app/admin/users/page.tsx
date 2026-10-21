"use client";

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { ConvexError } from "convex/values";
import "flag-icons/css/flag-icons.min.css";

export default function UsersManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const data = useQuery(api.adminUsers.listUsers, { searchTerm: search });
  
  // Mutations
  const toggleActivation = useMutation(api.adminUsers.toggleActivation);
  const toggleBan = useMutation(api.adminUsers.toggleBan);
  const approveUserManually = useMutation(api.adminUsers.approveUserManually);
  const deleteUser = useMutation(api.adminUsers.deleteUser);

  // Close dropdown when clicking anywhere else on the screen
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAction = async (action: string, userId: string) => {
    setOpenDropdownId(null); // close dropdown immediately
    try {
      if (action === "activate") {
        await approveUserManually({ userId: userId as any });
      }
      if (action === "deactivate") {
        await toggleActivation({ userId: userId as any, status: "none" });
      }
      if (action === "ban") {
        await toggleBan({ userId: userId as any, isBanned: true });
      }
      if (action === "unban") {
        await toggleBan({ userId: userId as any, isBanned: false });
      }
      if (action === "delete") {
        const confirmed = window.confirm("⚠️ Are you absolutely sure you want to permanently delete this account? This action cannot be undone.");
        if (!confirmed) return;
        await deleteUser({ userId: userId as any });
      }
    } catch (error) {
      console.error("Action failed:", error);
      alert(error instanceof ConvexError ? error.data : "Failed to perform action. Ensure you have admin permissions.");
    }
  };

  if (data === undefined) {
    return <div className="font-bold text-[#112a46] p-8">Loading Users...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl relative">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#112a46]">Users Management</h1>
      </div>

      {/* Top Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-green-100 bg-green-50/40 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Users</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100/50 text-green-600">👥</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold text-[#112a46]">{data.stats.totalUsers}</h2>
          <p className="mt-1 text-xs text-gray-500">+{data.stats.activeThisWeek} joined this week</p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Activated</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100/50 text-orange-600">☑️</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold text-[#112a46]">{data.stats.activatedUsers}</h2>
          <p className="mt-1 text-xs text-gray-500">{data.stats.activationRate}% activation rate</p>
        </div>

        <div className="rounded-2xl border border-yellow-100 bg-yellow-50/40 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active This Week</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-100/50 text-yellow-600">📈</span>
          </div>
          <h2 className="mt-1 text-3xl font-extrabold text-[#112a46]">{data.stats.activeThisWeek}</h2>
          <p className="mt-1 text-xs text-gray-500">of {data.stats.totalUsers} total users</p>
        </div>
      </div>

      {/* Search and Table Area */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        
        {/* Search Bar Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-50 bg-white">
          <div className="relative flex-1 max-w-2xl">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by email or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#1abc9c] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[300px] pb-32">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8fcfb] text-[#112a46]">
              <tr>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Country</th>
                <th className="px-6 py-4 font-bold">Total Earned</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Network</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                data.items.map((user: any) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {user.email}
                      {user.isBanned && (
                        <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 uppercase">Banned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-500">
                        {user.country}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#112a46]">
                      {user.currency} {user.totalEarned?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "Activated" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                          <span className="text-emerald-500">✓</span> Activated
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-[#f97316] px-3 py-1 text-xs font-bold text-white shadow-sm">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedUserId(user._id); }}
                        className="rounded bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200 transition"
                      >
                        View Tree
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          setOpenDropdownId(openDropdownId === user._id ? null : user._id);
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold shadow-sm transition ${
                          openDropdownId === user._id 
                            ? "bg-[#112a46] text-white border-[#112a46]" 
                            : "bg-white text-[#112a46] border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        Manage ▾
                      </button>

                      {/* Floating Actions Dropdown */}
                      {openDropdownId === user._id && (
                        <div 
                          className="absolute right-6 top-12 z-[100] w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-2xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                          }}
                        >
                          {user.status !== "Activated" && (
                            <button onClick={() => handleAction("activate", user._id)} className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-bold text-[#1abc9c] hover:bg-emerald-50 transition">
                              ✅ Approve / Activate
                            </button>
                          )}
                          {user.status === "Activated" && (
                            <button onClick={() => handleAction("deactivate", user._id)} className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-bold text-orange-600 hover:bg-orange-50 transition">
                              ⏸️ Deactivate User
                            </button>
                          )}
                          <div className="my-1 border-t border-gray-100"></div>
                          {user.isBanned ? (
                            <button onClick={() => handleAction("unban", user._id)} className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-bold text-[#3498db] hover:bg-blue-50 transition">
                              🔓 Unban Account
                            </button>
                          ) : (
                            <button onClick={() => handleAction("ban", user._id)} className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-bold text-orange-600 hover:bg-orange-50 transition">
                              🔨 Ban Account
                            </button>
                          )}

                          {/* DELETE BUTTON */}
                          <div className="my-1 border-t border-red-100"></div>
                          <button 
                            onClick={() => handleAction("delete", user._id)} 
                            className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition"
                          >
                            🗑️ Delete Account
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Network Modal Overlay */}
      {selectedUserId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#112a46]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#112a46]">Referral Network</h3>
              <button onClick={() => setSelectedUserId(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500 hover:bg-gray-200">
                ✕
              </button>
            </div>
            <UserNetworkView userId={selectedUserId} />
          </div>
        </div>
      )}
    </div>
  );
}

// --- NETWORK VIEW COMPONENT ---
function UserNetworkView({ userId }: { userId: string }) {
  const network = useQuery(api.adminUsers.getUserNetwork, { userId: userId as any });
  const updateUplink = useMutation(api.adminUsers.updateUplink);

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateUplink({ 
        userId: userId as any, 
        newUplineUsername: newUsername 
      });
      setIsEditing(false);
      setNewUsername("");
    } catch (error) {
      console.error("Uplink update failed:", error);
      alert(error instanceof ConvexError ? error.data : "Failed to update uplink.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (network === undefined) return <div className="text-sm text-gray-500 text-center py-8">Loading network...</div>;
  if (!network) return null;

  return (
    <div className="space-y-6">
      {/* UPLINK */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Referred By (Uplink)</h4>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-[#3498db] hover:underline"
          >
            {isEditing ? "Cancel" : "✏️ Edit"}
          </button>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <input 
              type="text" 
              placeholder="Enter new sponsor's username..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-transparent px-2 py-1 text-sm outline-none"
            />
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="rounded bg-[#112a46] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#1a3a5e] disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        ) : network.upline ? (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition">
            <div className="flex items-center gap-3">
              <span className={`fi fi-${network.upline.country.toLowerCase()} rounded-sm text-xl shadow-sm`} />
              <span className="font-bold text-[#112a46]">{network.upline.name}</span>
            </div>
            <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${network.upline.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
              {network.upline.status}
            </span>
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-500">Joined organically (No referrer)</p>
        )}
        
        {isEditing && (
          <p className="mt-2 text-[10px] text-gray-400">Leave blank and save to completely remove their sponsor.</p>
        )}
      </div>

      {/* DOWNLINE */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Their Referrals (Downline)</h4>
          <span className="text-xs font-bold text-[#1abc9c]">{network.activeReferred} Active / {network.totalReferred} Total</span>
        </div>
        
        <div className="max-h-60 space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
          {network.downline.length > 0 ? (
            network.downline.map((ref: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-transparent p-2 transition hover:border-gray-100 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`fi fi-${ref.country.toLowerCase()} rounded-sm shadow-sm`} />
                  <span className="text-sm font-bold text-[#112a46]">{ref.name}</span>
                </div>
                <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${ref.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                  {ref.status}
                </span>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">This user hasn't referred anyone yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}