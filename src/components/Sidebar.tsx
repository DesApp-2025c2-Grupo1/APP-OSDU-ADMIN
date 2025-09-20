import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li>
          <NavLink to="/home" end={false}  className={({ isActive }) => (isActive ? "active" : "")}>
            Afiliados
          </NavLink>
        </li>
        <li>
          <NavLink to="/prestadores" className={({ isActive }) => (isActive ? "active" : "")}>
            Prestadores
          </NavLink>
        </li>
        <li>
          <NavLink to="/agenda" className={({ isActive }) => (isActive ? "active" : "")}>
            Agenda
          </NavLink>
        </li>
        <li>
          <NavLink to="/otros" className={({ isActive }) => (isActive ? "active" : "")}>
            Otras Consultas
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}