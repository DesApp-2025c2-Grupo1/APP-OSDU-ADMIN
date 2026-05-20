# front-unahur-admin — Panel de Administración

Frontend del panel administrativo del Portal de Medicina Integral UNAHUR. Permite gestionar afiliados, prestadores, agendas y consultas.

## Tecnologías

- React + TypeScript + Vite
- Tailwind CSS + Material UI
- React Router DOM
- Autenticación via cookie JWT (httpOnly)

## Requisitos previos

- [Node.js v18+](https://nodejs.org/)
- Backend `app-unahur-portal` corriendo en el puerto 9002

## Instalación

```bash
# 1. Clonar el repo
git clone <url-del-repo>
cd front-unahur-admin

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
```

## Variables de entorno

Crear un archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:9002
```

> Debe apuntar a la URL donde corre el backend.

## Ejecutar en desarrollo

```bash
npm run dev
```

El panel queda disponible en **http://localhost:5173**

## Credenciales de acceso

| Campo    | Valor                    |
|----------|--------------------------|
| Email    | admin@mediunahur.com     |
| Password | clave123                 |

## Funcionalidades

- **Afiliados**: alta, baja, edición, búsqueda y grupo familiar
- **Prestadores**: alta, baja, edición con especialidades y lugares de atención
- **Agendas**: creación y gestión de agendas por prestador
- **Consultas**: reportes de afiliados, prestadores y situaciones terapéuticas
