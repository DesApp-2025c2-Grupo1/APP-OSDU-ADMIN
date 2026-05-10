import React, { useState } from "react";

export function FormStylePreview() {
  const [activeStyle, setActiveStyle] = useState<1 | 2 | 3>(1);

  // Estilos de inputs para cada diseño
  const inputClasses = {
    style1: "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400",
    style2: "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400 bg-slate-50",
    style3: "w-full px-3 py-3 text-sm border-b-2 border-slate-200 rounded-none focus:border-teal-600 focus:outline-none text-slate-700 placeholder-slate-400 bg-transparent",
  };

  const labelClasses = {
    style1: "block text-xs font-600 text-slate-600 mb-2",
    style2: "block text-sm font-600 text-slate-700 mb-2.5",
    style3: "block text-xs font-700 text-slate-500 uppercase tracking-wide mb-3",
  };

  // DISEÑO 1: Minimalista limpio
  const Design1 = () => (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-slate-800 mb-2">Crear nuevo afiliado</h1>
        <p className="text-sm text-slate-400">Completa los datos del afiliado titular</p>
      </div>

      <div className="space-y-6">
        {/* Sección 1 */}
        <div>
          <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Datos personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses.style1}>Tipo documento</label>
              <select className={inputClasses.style1}>
                <option>DNI</option>
              </select>
            </div>
            <div>
              <label className={labelClasses.style1}>Número documento *</label>
              <input type="text" placeholder="12345678" className={inputClasses.style1} />
            </div>
            <div>
              <label className={labelClasses.style1}>Nombre *</label>
              <input type="text" placeholder="Juan" className={inputClasses.style1} />
            </div>
            <div>
              <label className={labelClasses.style1}>Apellido *</label>
              <input type="text" placeholder="Pérez" className={inputClasses.style1} />
            </div>
            <div>
              <label className={labelClasses.style1}>Fecha de nacimiento *</label>
              <input type="date" className={inputClasses.style1} />
            </div>
            <div>
              <label className={labelClasses.style1}>Plan médico *</label>
              <select className={inputClasses.style1}>
                <option>Plan Básico</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección 2 */}
        <div>
          <h2 className="text-base font-600 text-slate-800 mb-4 pb-3 border-b border-slate-100">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses.style1}>Email *</label>
              <input type="email" placeholder="juan@example.com" className={inputClasses.style1} />
            </div>
            <div>
              <label className={labelClasses.style1}>Teléfono *</label>
              <input type="tel" placeholder="1234567890" className={inputClasses.style1} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClasses.style1}>Dirección</label>
              <input type="text" placeholder="Calle Principal 123" className={inputClasses.style1} />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-6">
          <button className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button className="px-6 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-600 hover:bg-teal-700 transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );

  // DISEÑO 2: Cards por sección con iconos
  const Design2 = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-700 text-slate-800 mb-2">Crear nuevo afiliado</h1>
        <p className="text-sm text-slate-400">Completa los datos del afiliado titular</p>
      </div>

      {/* Datos personales */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-600 text-slate-800">Datos personales</h3>
            <p className="text-xs text-slate-400">Información básica del afiliado</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses.style2}>Tipo documento</label>
            <select className={inputClasses.style2}>
              <option>DNI</option>
            </select>
          </div>
          <div>
            <label className={labelClasses.style2}>Número documento *</label>
            <input type="text" placeholder="12345678" className={inputClasses.style2} />
          </div>
          <div>
            <label className={labelClasses.style2}>Nombre *</label>
            <input type="text" placeholder="Juan" className={inputClasses.style2} />
          </div>
          <div>
            <label className={labelClasses.style2}>Apellido *</label>
            <input type="text" placeholder="Pérez" className={inputClasses.style2} />
          </div>
          <div>
            <label className={labelClasses.style2}>Fecha de nacimiento *</label>
            <input type="date" className={inputClasses.style2} />
          </div>
          <div>
            <label className={labelClasses.style2}>Plan médico *</label>
            <select className={inputClasses.style2}>
              <option>Plan Básico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-600 text-slate-800">Contacto</h3>
            <p className="text-xs text-slate-400">Email y teléfono</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses.style2}>Email *</label>
            <input type="email" placeholder="juan@example.com" className={inputClasses.style2} />
          </div>
          <div>
            <label className={labelClasses.style2}>Teléfono *</label>
            <input type="tel" placeholder="1234567890" className={inputClasses.style2} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClasses.style2}>Dirección</label>
            <input type="text" placeholder="Calle Principal 123" className={inputClasses.style2} />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
        <button className="px-6 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-600 hover:bg-teal-700 transition-colors">
          Guardar
        </button>
      </div>
    </div>
  );

  // DISEÑO 3: Minimalista con línea inferior
  const Design3 = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-700 text-slate-800 mb-2">Crear nuevo afiliado</h1>
        <p className="text-sm text-slate-400">Completa los datos del afiliado titular</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-8">
        {/* Sección 1 */}
        <div>
          <h2 className="text-sm font-700 text-slate-600 uppercase tracking-wider mb-6">Datos personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses.style3}>Tipo documento</label>
              <select className={inputClasses.style3}>
                <option>DNI</option>
              </select>
            </div>
            <div>
              <label className={labelClasses.style3}>Número documento *</label>
              <input type="text" placeholder="12345678" className={inputClasses.style3} />
            </div>
            <div>
              <label className={labelClasses.style3}>Nombre *</label>
              <input type="text" placeholder="Juan" className={inputClasses.style3} />
            </div>
            <div>
              <label className={labelClasses.style3}>Apellido *</label>
              <input type="text" placeholder="Pérez" className={inputClasses.style3} />
            </div>
            <div>
              <label className={labelClasses.style3}>Fecha de nacimiento *</label>
              <input type="date" className={inputClasses.style3} />
            </div>
            <div>
              <label className={labelClasses.style3}>Plan médico *</label>
              <select className={inputClasses.style3}>
                <option>Plan Básico</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100"></div>

        {/* Sección 2 */}
        <div>
          <h2 className="text-sm font-700 text-slate-600 uppercase tracking-wider mb-6">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses.style3}>Email *</label>
              <input type="email" placeholder="juan@example.com" className={inputClasses.style3} />
            </div>
            <div>
              <label className={labelClasses.style3}>Teléfono *</label>
              <input type="tel" placeholder="1234567890" className={inputClasses.style3} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClasses.style3}>Dirección</label>
              <input type="text" placeholder="Calle Principal 123" className={inputClasses.style3} />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button className="px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-600 text-slate-700 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button className="px-6 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-600 hover:bg-teal-700 transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 min-w-0 w-full bg-slate-50 overflow-y-auto pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-700 text-slate-800">Vista previa de formularios</h1>
          <p className="text-xs text-slate-400">Elige el estilo que más te gusta</p>
        </div>
      </header>

      <div className="p-4 sm:p-8">
        {/* Selector de estilos */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {[1, 2, 3].map((style) => (
            <button
              key={style}
              onClick={() => setActiveStyle(style as 1 | 2 | 3)}
              className={`px-4 py-2.5 rounded-lg font-600 text-sm transition-colors ${
                activeStyle === style
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-teal-300"
              }`}
            >
              Estilo {style}
            </button>
          ))}
        </div>

        {/* Preview del estilo seleccionado */}
        <div className="mb-12">
          {activeStyle === 1 && <Design1 />}
          {activeStyle === 2 && <Design2 />}
          {activeStyle === 3 && <Design3 />}
        </div>
      </div>
    </main>
  );
}
