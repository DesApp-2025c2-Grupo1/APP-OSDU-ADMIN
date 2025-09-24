import { NavLink } from "react-router-dom";

export function Sidebar() {
  const baseLink =
    "block w-full rounded px-2 py-2 text-base  transition-colors duration-200";
  const activeLink = "bg-[#5fa92c] text-white font-medium";
  const inactiveLink =
    "text-gray-700 hover:bg-gray-100 hover:text-black";
  const containerItem = "flex justify-center gap-2";

  const links = [
    { to: "/home", label: "Afiliados" },
    { to: "/prestadores", label: "Prestadores" },
    { to: "/agenda", label: "Agenda" },
    { to: "/consultas", label: "Consultas" },
  ];

  return (
    <nav className="w-[250px] p-2 mt-0.5 border-r-2 border-gray-200 bg-white">
      <ul className="flex flex-col gap-2 p-4">
        {links.map(({ to, label }) => (
          <li key={to} className={containerItem}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
