import { memo, useEffect, useId, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";

const MOBILE_BAR_H = 74;

type SidebarProps = {
  headerRight?: React.ReactNode;
};

const LINKS = Object.freeze([
  { to: "/home", label: "Afiliados" },
  { to: "/prestadores", label: "Prestadores" },
  { to: "/agenda", label: "Agenda" },
  { to: "/consultas", label: "Consultas" },
]);

const baseLink =
  "block w-full rounded px-3 py-2 text-base transition-colors duration-200";
const activeLink = "bg-[#5fa92c] text-white font-medium";
const inactiveLink = "text-gray-700 hover:bg-gray-100 hover:text-black";

const MenuIcon = ({ open }: { open: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    {open ? (
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    )}
  </svg>
);

const NavLinks = memo(function NavLinks({ onClick }: { onClick: () => void }) {
  const items = useMemo(() => LINKS, []);
  return (
    <ul className="flex flex-col gap-2">
      {items.map(({ to, label }) => (
        <li key={to}>
          <NavLink
            to={to}
            className={({ isActive }) => clsx(baseLink, isActive ? activeLink : inactiveLink)}
            onClick={onClick}
          >
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
});

function DefaultCompactHeader() {
  return (
    <div className="flex-1 flex items-center gap-3 overflow-hidden">
      <img src="/logo.png" alt="Logo" className="w-[50px] h-[50px] object-contain" />
      <div className="text-[#5fa92c] font-bold leading-tight">
        <h1 className="text-base">MEDIUNAHUR</h1>
        <span className="text-gray-800 text-sm font-normal">SISTEMA DE GESTIÓN MÉDICA</span>
      </div>
    </div>
  );
}

export function Sidebar({ headerRight }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const location = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const body = document.body;
    if (open) {
      const prev = body.style.overflow;
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-3 flex items-center gap-3"
        style={{ height: MOBILE_BAR_H }}
      >
        <button
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded hover:bg-gray-100"
        >
          <MenuIcon open={open} />
        </button>

        {headerRight ?? <DefaultCompactHeader />}
      </div>

      <nav className="hidden md:block w-[250px] p-2 mt-0.5 border-r-2 border-gray-200 bg-white">
        <NavLinks onClick={() => setOpen(false)} />
      </nav>

      <div className="md:hidden fixed inset-0 z-40 pointer-events-none">
        <div
          className={clsx(
            "absolute left-0 right-0 bg-black/40 transition-opacity duration-200",
            open ? "opacity-100 pointer-events-auto" : "opacity-0"
          )}
          style={{ top: MOBILE_BAR_H, bottom: 0 }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        <aside
          id={panelId}
          role="dialog"
          aria-modal="true"
          className={clsx(
            "absolute left-0 w-64 bg-white border-r shadow transition-transform duration-200 pointer-events-auto",
            open ? "translate-x-0" : "-translate-x-full",
            "flex flex-col" ,"w-fit min-w-[10rem] max-w-[16rem]"
          )}
          style={{ top: MOBILE_BAR_H, bottom: 0 }} 
        >
          <div className="flex-1 overflow-y-auto">
            <NavLinks onClick={() => setOpen(false)} />
          </div>
        </aside>
      </div>
    </>
  );
}
