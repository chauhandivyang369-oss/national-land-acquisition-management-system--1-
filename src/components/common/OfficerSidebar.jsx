import React, { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import {
  LayoutDashboard,
  Map,
  Layers,
  FolderPlus,
  FileCheck,
  AlertTriangle,
  Calculator,
  Award,
  CreditCard,
  Building,
  Users,
  ClipboardList,
  HeartHandshake,
  FileSpreadsheet,
  History,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  ChevronDown,
  Coins,
  LogOut
} from "lucide-react";

export const OfficerSidebar = () => {
  const { currentUser, activePage, navigateTo, logoutUser } = useApp();
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  if (!currentUser) return null;

  // Build menu list according to user role and designation
  const getMenuItems = () => {
    const role = currentUser.role;
    const designation = currentUser.designation || "";

    if (role === "Central Authority") {
      return [
        { id: "central-dashboard", label: "National Dashboard", icon: LayoutDashboard },
        {
          group: "Monitoring",
          items: [
            { id: "state-progress", label: "State-wise Progress", icon: Map },
            { id: "project-progress", label: "Project-wise Progress", icon: Layers }
          ]
        },
        {
          group: "Project Oversight",
          items: [
            { id: "project-workflow", label: "Project Workflow", icon: CheckSquare }
          ]
        },
        {
          group: "Approvals",
          items: [
            { id: "project-approvals", label: "Project Approval Requests", icon: FileCheck },
            { id: "rnr-fund-requests", label: "R&R Fund Requests", icon: HeartHandshake }
          ]
        },
        {
          group: "Reports & Analytics",
          items: [
            { id: "analytics", label: "National MIS Reports", icon: FileSpreadsheet }
          ]
        },
        {
          group: "Administration",
          items: [
            { id: "user-management", label: "User & Role Management", icon: Users },
            { id: "audit-logs", label: "Audit Logs", icon: History }
          ]
        },
        { id: "notifications", label: "Notifications", icon: Bell }
      ];
    }

    if (role === "State Authority") {
      return [
        { id: "state-dashboard", label: "State Dashboard", icon: LayoutDashboard },
        {
          group: "Project Management",
          items: [
            { id: "state-approvals", label: "Project Approval Requests", icon: FileCheck },
            { id: "project-progress", label: "State Projects", icon: Layers },
            { id: "district-monitoring", label: "District-wise Progress", icon: Building }
          ]
        },
        {
          group: "Fund Management",
          items: [
            { id: "state-fund-allocation", label: "Fund Allocation & R&R Requests", icon: Coins }
          ]
        },
        {
          group: "Reports",
          items: [
            { id: "state-reports", label: "State Reports & Analytics", icon: FileSpreadsheet }
          ]
        },
        { id: "notifications", label: "Notifications", icon: Bell }
      ];
    }

    if (role === "Requiring Body") {
      return [
        { id: "my-projects", label: "My Projects", icon: Layers },
        { id: "create-project", label: "New Project Proposal", icon: FolderPlus },
        { id: "project-proposal-view", label: "Proposal Document View", icon: FileCheck },
        { id: "land-requirement-summary", label: "Land Requirement Summary", icon: FileSpreadsheet },
        { id: "gis-parcels", label: "GIS Parcel Selection", icon: Map },
        { id: "project-workflow", label: "Project Workflow", icon: CheckSquare },
        { id: "notifications", label: "Notifications", icon: Bell },
        {
          group: "Reference",
          items: [
            { id: "public-gis-map", label: "Public GIS Map", icon: Map },
            { id: "public-project-search", label: "Project Search", icon: Search }
          ]
        }
      ];
    }

    if (role === "District Authority") {
      if (designation.includes("SIA")) {
        return [
          { id: "sia-tasks", label: "My Survey Tasks", icon: ClipboardList },
          { id: "sia-form", label: "SIA Survey Form", icon: FileCheck },
          { id: "project-workflow", label: "Project Workflow", icon: CheckSquare },
          { id: "notifications", label: "Notifications", icon: Bell }
        ];
      }

      if (designation.includes("R&R")) {
        return [
          { id: "rnr-dashboard", label: "R&R Dashboard", icon: HeartHandshake },
          { id: "rnr-entitlements", label: "R&R Scheme & Entitlements", icon: Users },
          { id: "project-workflow", label: "Project Workflow", icon: CheckSquare },
          { id: "notifications", label: "Notifications", icon: Bell }
        ];
      }

      // Default Collector
      return [
        { id: "district-dashboard", label: "District Dashboard", icon: LayoutDashboard },
        { id: "project-workflow", label: "Project Workflow Hub", icon: CheckSquare },
        { id: "land-verification", label: "Land Verification", icon: FileCheck },
        { id: "objections", label: "Objection Management", icon: AlertTriangle },
        { id: "compensation", label: "Compensation Calculator", icon: Calculator },
        { id: "awards", label: "Award Generation", icon: Award },
        { id: "gazette-notifications", label: "Section 11/19 Gazette", icon: FileSpreadsheet },
        { id: "payment", label: "PFMS DBT Payment", icon: CreditCard },
        { id: "possession", label: "Possession Memo", icon: Building },
        { id: "notifications", label: "Notifications", icon: Bell }
      ];
    }

    // Citizen
    if (role === "Citizen") {
      return [
        { id: "citizen-my-land", label: "My Land Status", icon: Map },
        { id: "citizen-compensation", label: "Compensation & R&R", icon: Calculator },
        { id: "citizen-documents", label: "My Documents", icon: FileCheck },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "public-gis-map", label: "Public GIS Map", icon: Map },
        { id: "public-project-search", label: "Project Search", icon: Search }
      ];
    }

    return [];
  };

  const menu = getMenuItems();

  return (
    <aside className="w-64 bg-[#1B365D] text-slate-200 min-h-[calc(100vh-60px)] flex flex-col justify-between border-r border-[#D1D5DB] rounded-md shadow-xs shrink-0 select-none overflow-hidden">
      {/* Top Header inside Sidebar */}
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-3 mb-2 border-b border-slate-500/30">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#C5A059]">
            Administrative Workspace
          </div>
          <div className="text-xs font-bold text-white truncate mt-0.5">
            {currentUser.designation || currentUser.role}
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {menu.map((item, idx) => {
            if (item.group) {
              const isCollapsed = !!collapsedGroups[item.group];
              return (
                <div key={idx} className="pt-2 pb-1">
                  <div
                    onClick={() => toggleGroup(item.group)}
                    className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-300 uppercase tracking-wider cursor-pointer hover:text-white"
                  >
                    <span>{item.group}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="mt-0.5 space-y-0.5 pl-1">
                      {item.items.map((subItem) => {
                        const Icon = subItem.icon;
                        const isActive = activePage === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => navigateTo(subItem.id)}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium flex items-center justify-between transition-all ${
                              isActive
                                ? "bg-[#C5A059] text-white font-bold shadow-xs"
                                : "text-slate-200 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#C5A059]"}`} />
                              <span className="truncate">{subItem.label}</span>
                            </span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full text-left px-3 py-2 rounded text-xs font-medium flex items-center justify-between transition-all ${
                  isActive
                    ? "bg-[#C5A059] text-white font-bold shadow-xs"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#C5A059]"}`} />
                  <span>{item.label}</span>
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Officer Status Box & Logout Button */}
      <div className="p-3 border-t border-slate-500/30 bg-[#12243f] text-[11px] text-slate-300 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NIC GovNet Verified</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {currentUser.role?.slice(0, 7)}
          </span>
        </div>

        <button
          type="button"
          onClick={logoutUser}
          className="w-full py-2 px-3 bg-rose-700/90 hover:bg-rose-600 active:bg-rose-800 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs border border-rose-500/40 hover:shadow-md cursor-pointer"
          title="Sign out and return to landing page"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out / Logout</span>
        </button>
      </div>
    </aside>
  );
};
