import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";

const navItems = [
  {
    id: "afiliados",
    label: "Afiliados",
    to: "/home",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM4 20h16a2 2 0 002-2v-2a6 6 0 00-6-6H10a6 6 0 00-6 6v2a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "prestadores",
    label: "Prestadores",
    to: "/prestadores",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-6.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    id: "agenda",
    label: "Agenda",
    to: "/agenda",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    to: "/solicitudes",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h8m-8 4h5M6 3h9l3 3v15H6V3z" />
      </svg>
    ),
  },
  {
    id: "reintegros",
    label: "Reintegros",
    to: "/reintegros",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-4-8h6a2 2 0 010 4h-4a2 2 0 000 4h6M7 7l-3 3 3 3m10-2 3 3-3 3" />
      </svg>
    ),
  },
  {
    id: "consultas",
    label: "Consultas",
    to: "/consultas",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getActivePage = () => {
    const path = location.pathname;
    const item = navItems.find(item => path.startsWith(item.to));
    return item?.id || "";
  };

  const activePage = getActivePage();

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-slate-100 shadow-sm
        transition-all duration-300 ease-in-out flex-shrink-0
        fixed md:sticky bottom-0 md:bottom-auto top-auto md:top-0 left-0 right-0 md:right-auto z-[70]
        w-full md:w-auto h-16 md:h-screen border-t md:border-t-0 pb-0
        ${collapsed ? "md:w-16" : "md:w-60"}
      `}
    >
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-4 py-5 border-b border-slate-100">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="mediunahur logo"
              className="w-9 h-9 object-contain flex-shrink-0"
            />
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">OSDU</p>
              <p className="text-xs text-slate-400 leading-tight">Administración</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center mx-auto">
            <img src="/logo.png" alt="mediunahur logo" className="w-8 h-8 object-contain" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ${
            collapsed ? "mx-auto" : ""
          }`}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {collapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full px-1 md:px-3 py-2 md:py-4 md:space-y-1 grid grid-cols-6 md:block items-center md:justify-start overflow-hidden md:overflow-visible">
        {!collapsed && (
          <p className="hidden md:block text-xs font-600 text-slate-400 uppercase tracking-wider px-2 mb-3 col-span-4">
            Menú principal
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-3 py-2 md:py-2.5 rounded-xl text-[10px] sm:text-[11px] md:text-sm font-500 transition-all duration-150 min-w-0",
                isActive || activePage === item.id
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                collapsed ? "md:justify-center" : ""
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <span
              className={`flex-shrink-0 ${
                activePage === item.id ? "text-teal-600" : ""
              }`}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <span className="truncate text-center md:text-left max-w-full md:max-w-none">
                {item.label}
              </span>
            )}
            {!collapsed && activePage === item.id && (
              <span className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
