import React, { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { GovEmblem } from "./GovEmblem.jsx";
import { DEMO_USERS } from "../../data/mockData.js";
import { Bell, LogOut, User, Shield, ChevronDown, Check, Home, Building2, MapPin } from "lucide-react";

export const OfficerHeader = () => {
  const { currentUser, logoutUser, navigateTo, notifications, loginUser } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!currentUser) return null;

  // Unread notifications count for current user
  const unreadCount = notifications.filter(
    (n) =>
      !n.isRead &&
      (n.roleTarget === currentUser.role ||
        n.roleTarget.includes(currentUser.designation) ||
        n.roleTarget === "Central Authority")
  ).length;

  return (
    <header className="bg-[#0f172a] text-white border-b-2 border-amber-600 sticky top-0 z-40 shadow-sm select-none">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Emblem & Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigateTo(currentUser.defaultPage || "central-dashboard")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <GovEmblem className="w-9 h-10" color="text-amber-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                <span>Government of India</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400">DoLR Portal</span>
              </div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>National Land Acquisition Management System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Role Badge + Location + User info + Actions */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Role & Designation Badge */}
          <div className="hidden lg:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2 py-0.5 rounded font-semibold">
                {currentUser.role} {currentUser.designation ? `(${currentUser.designation})` : ""}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>
                {currentUser.state} {currentUser.district && currentUser.district !== "All Districts" ? `• ${currentUser.district}` : ""}
              </span>
            </div>
          </div>

          {/* Quick Role Switcher Dropdown (Essential for testing all 7 roles seamlessly!) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-600 flex items-center gap-1.5 transition-colors"
              title="Switch Demo Role"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Switch Role</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-md shadow-xl border border-slate-300 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 font-bold text-slate-900 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span>Switch Logged-in User / Role</span>
                  <span className="text-[10px] text-slate-500 font-normal">7 Demo Roles</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {DEMO_USERS.map((u) => {
                    const isCurrent = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          loginUser(u);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start justify-between hover:bg-slate-100 transition-colors border-b border-slate-100 ${
                          isCurrent ? "bg-amber-50 font-semibold" : ""
                        }`}
                      >
                        <div>
                          <div className="text-slate-900 font-medium flex items-center gap-1.5">
                            <span>{u.role}</span>
                            {u.designation && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                                {u.designation}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {u.name} • {u.state}
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-amber-600 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => navigateTo("notifications")}
            className="relative p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Button */}
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 text-left transition-colors"
          >
            <div className="w-7 h-7 rounded bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
              {currentUser.avatarInitial || "GO"}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-white leading-tight truncate max-w-[140px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-300 truncate max-w-[140px]">
                {currentUser.email}
              </div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logoutUser}
            className="p-1.5 rounded hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-700/50 transition-colors flex items-center gap-1 text-xs"
            title="Secure Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* User Profile Summary Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-md border border-slate-300 max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#1e3a8a]" />
                Official Officer Profile
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-slate-600 mt-0.5">{currentUser.designation || currentUser.role}</div>
                <div className="text-amber-800 font-medium mt-1">{currentUser.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="border p-2 rounded">
                  <span className="text-slate-500 block">Main Role:</span>
                  <span className="font-semibold text-slate-800">{currentUser.role}</span>
                </div>
                <div className="border p-2 rounded">
                  <span className="text-slate-500 block">Jurisdiction:</span>
                  <span className="font-semibold text-slate-800">{currentUser.state}</span>
                </div>
                <div className="border p-2 rounded">
                  <span className="text-slate-500 block">District:</span>
                  <span className="font-semibold text-slate-800">{currentUser.district || "All"}</span>
                </div>
                <div className="border p-2 rounded">
                  <span className="text-slate-500 block">NIC GovNet Phone:</span>
                  <span className="font-semibold text-slate-800">{currentUser.phone || "+91 11-2338-4501"}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded text-[11px]">
                🔒 <strong>Security Policy:</strong> You are accessing a protected Central Government information system. All transactional actions are digitally logged with IP and timestamp in the immutable audit repository.
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-1.5 bg-[#1e3a8a] text-white rounded text-xs font-semibold hover:bg-blue-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
