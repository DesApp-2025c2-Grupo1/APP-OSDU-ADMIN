# Multi-stage build para Frontend React con Vite
FROM node:18-alpine AS builder

# Argumento para recibir la URL del API
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .
RUN npm run build:docker

FROM nginx:alpine

# Instalar tzdata y establecer la zona horaria
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/America/Argentina/Buenos_Aires /etc/localtime \
    && echo "America/Argentina/Buenos_Aires" > /etc/timezone \
    && apk del tzdata

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
