export function Header() {
  return (
    <header className="header">
      {/* Bloque izquierdo: Logo + texto */}
      <div className="header-left">
        <img src="/logo.png" alt="Logo" className="logo" />
        <div className="header-text">
          <h1>MEDIUNAHUR</h1>
          <span>SISTEMA DE GESTIÓN MÉDICA</span>
        </div>
      </div>
    </header>
  );
}