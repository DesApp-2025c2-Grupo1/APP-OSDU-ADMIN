import { useState } from "react";
import { getApiErrorMessage, login } from "../services/PortalAdminService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@mediunahur.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await login(email, password);

      if (data.user?.role !== "ADMIN") {
        setError("El usuario no tiene permisos de administración");
        return;
      }

      setAuthUser(data.user);
      navigate("/home");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a380e] via-[#2d591c] to-[#1a380e] px-4 relative overflow-hidden font-sans">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#5FA92C]/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[110px]"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]"></div>
      </div>

      <div className="z-10 w-full max-w-sm bg-[#FBFAEA] backdrop-blur-2xl border border-[#E8DCC8] p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] relative transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(0,0,0,0.15)] hover:bg-[#FDFCF3] hover:border-[#E0D4C0]">
        
        <div className="text-center mb-10 relative">
          <div className="w-56 h-56 mx-auto flex items-center justify-center mb-5">
            <img
              src="/logo.jpg"
              alt="logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 backdrop-blur-md animate-[shake_0.4s_ease-in-out]">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-200 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative group/input">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner group-hover/input:border-slate-600/50"
                placeholder="admin@mediunahur.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative group/input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner group-hover/input:border-slate-600/50"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-100 focus:outline-none focus:text-slate-100 transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-.586M9.88 4.24A9.77 9.77 0 0112 4c5.523 0 10 5.373 10 8 0 1.012-.664 2.408-1.787 3.733M6.61 6.61C3.823 8.2 2 10.843 2 12c0 2.627 4.477 8 10 8 1.52 0 2.96-.407 4.243-1.05" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s4.477-8 10-8 10 8 10 8-4.477 8-10 8S2 12 2 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#5FA92C] to-green-600 hover:from-green-500 hover:to-[#5FA92C] focus:outline-none shadow-[0_0_20px_rgba(95,169,44,0.3)] hover:shadow-[0_0_30px_rgba(95,169,44,0.5)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando...</span>
                </>
              ) : (
                "Acceder al Sistema"
              )}
            </span>
            {/* Glossy overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-2xl pointer-events-none"></div>
            {/* Shimmer effect */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
        </form>
        
        <div className="mt-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6"></div>
          <p className="text-center text-xs text-slate-500 font-medium tracking-wide">
            Autorizado solo para directivos
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { left: -100%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 200%; opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}
