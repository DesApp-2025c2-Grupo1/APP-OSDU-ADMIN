import { useAuth } from "../context/AuthContext";

export function Header() {
  const { logout, isAuthenticated } = useAuth();

  return (
    <header className="flex h-20 px-4 sm:px-6 items-center bg-white border-b border-slate-100 justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-sm text-slate-500">Gestión integral del sistema OSDU</p>
      </div>

      {isAuthenticated && (
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 sm:px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-rose-200"
        >
          <svg className="w-5 h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      )}
    </header>
  );
}
