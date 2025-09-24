export function Header() {
  return (
    <header className="h-1/2 p-3 flex justify-between items-center p-[0px 24px]
     bg-white shadow-md">
      <div className="flex items-center gap-[12px]">
        <img src="/logo.png" alt="Logo" className="w-[50px] h-[50px] object-contain" />
        <div className="text-[#5fa92c] font-bold text-ms ">
          <h1>MEDIUNAHUR</h1>
          <span className="text-gray-800 text-sm">SISTEMA DE GESTIÓN MÉDICA</span>
        </div>
      </div>
    </header>
  );
}