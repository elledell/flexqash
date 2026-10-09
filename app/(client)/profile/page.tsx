"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import "flag-icons/css/flag-icons.min.css";

export default function ProfilePage() {
  const profile = useQuery(api.users.getProfile);

  if (profile === undefined) {
    return <div className="flex min-h-screen items-center justify-center font-bold text-[#112a46]">Loading profile...</div>;
  }

  if (profile === null) {
    return <div className="p-8 text-center text-red-500 font-bold">Error loading profile data.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#112a46]">Profile</h1>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          ACCOUNT » <span className="text-[#1abc9c]">MY PROFILE</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-[#112a46] to-[#1a3a5e] px-8 py-10 text-white flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1abc9c] text-3xl font-extrabold uppercase shadow-lg border-4 border-white/20">
            {profile.username.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-[#1abc9c] font-medium">@{profile.username}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
              profile.status === "Active" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
            }`}>
              {profile.status} MEMBER
            </span>
          </div>
        </div>

        {/* Profile Details List */}
        <div className="p-8">
          <h3 className="mb-6 border-l-4 border-[#1abc9c] pl-3 font-bold text-[#112a46] uppercase tracking-wide">
            Account Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
              <p className="font-bold text-[#112a46] truncate">{profile.email}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
              <p className="font-bold text-[#112a46]">{profile.phone}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Country</p>
              <p className="font-bold text-[#112a46] flex items-center gap-2">
                <span className={`fi fi-${profile.country.toLowerCase()} rounded-sm drop-shadow-sm`} />
                {profile.country}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invited By (Upline)</p>
              <p className="font-bold text-[#1abc9c]">@{profile.invitedBy}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 md:col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
              <p className="font-bold text-[#112a46]">{new Date(profile.joinDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}