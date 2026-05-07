import { useAuth } from "../context/AuthContext";

export function Header() {
  const { logout, isAuthenticated } = useAuth();

  return (
    <header className="p-3 flex justify-between items-center bg-white shadow-md z-10 w-full" style={{ padding: "0 24px", minHeight: "74px" }}>
      <div className="flex items-center gap-[12px]">
        <img src="/logo.png" alt="Logo" className="w-[50px] h-[50px] object-contain" />
        <div className="text-[#5fa92c] font-bold leading-tight">
          <h1 className="text-base md:text-lg">MEDIUNAHUR</h1>
          <span className="text-gray-800 text-xs md:text-sm font-normal hidden sm:inline-block">SISTEMA DE GESTIÓN MÉDICA</span>
        </div>
      </div>
      
      {isAuthenticated && (
        <button
          onClick={logout}
          className="flex flex-row items-center gap-2 text-red-500 font-semibold hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded transition-colors text-sm md:text-base border border-transparent hover:border-red-200"
        >
          <svg className="w-5 h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      )}
    </header>
  );
}
