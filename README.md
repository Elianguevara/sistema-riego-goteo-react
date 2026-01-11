# 🖥️ Sistema de Riego por Goteo - Frontend (React)

![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)
![React Query](https://img.shields.io/badge/React_Query-v5-FF4154?style=for-the-badge&logo=reactquery)

## 📖 Descripción

Esta aplicación web progresiva (SPA) sirve como la interfaz de control principal para el **Sistema de Gestión de Riego Agrícola**. Diseñada para ser intuitiva y robusta, permite la interacción en tiempo real entre los administradores, analistas y operarios de campo.

La aplicación consume la API RESTful (Spring Boot) y ofrece visualización de datos geoespaciales, gráficos analíticos de consumo hídrico y herramientas operativas para el registro de actividades en campo.

## ✨ Características Clave

### 👥 Experiencia Basada en Roles
La interfaz se adapta dinámicamente según el perfil del usuario (Implementado con `ProtectedRoute` y Lazy Loading):
* **Administrador:** Gestión total de usuarios, auditoría de seguridad y configuración global.
* **Analista:** Acceso a dashboards avanzados, reportes de precipitación y análisis de eficiencia de riego.
* **Operario:** Interfaz simplificada y *mobile-first* para registrar tareas, riegos y mantenimientos en terreno.

### 🗺️ Mapas y Geolocalización
* Visualización interactiva de Fincas y Sectores utilizando **Leaflet & React-Leaflet**.
* Marcado de zonas de cultivo y ubicación de sensores.

### 📊 Dashboard y Analítica
* Gráficos interactivos con **Recharts** para monitorear humedad del suelo y consumo energético.
* Visualización de datos meteorológicos en tiempo real.

### ⚡ Rendimiento y UX
* **Gestión de Estado:** Uso de **TanStack Query (React Query)** para caché, sincronización y actualizaciones en segundo plano.
* **Code Splitting:** Carga diferida de componentes (`React.lazy`) para optimizar el tiempo de carga inicial.
* **Feedback:** Sistema de notificaciones *toast* con **Sonner**.

## 🛠️ Stack Tecnológico

* **Core:** React 19 + TypeScript
* **Build Tool:** Vite
* **Routing:** React Router DOM v7
* **Estado del Servidor:** TanStack React Query v5
* **Mapas:** Leaflet / React-Leaflet
* **Gráficos:** Recharts
* **Estilos & UI:** CSS Modules, Lucide React (Iconos), FontAwesome
* **Utilidades:** JWT Decode (Auth), Sonner (Notificaciones)

## 📸 Capturas de Pantalla

| Dashboard Analista | Mapa de Sectores |
|:------------------:|:----------------:|
| ![Dashboard](https://via.placeholder.com/400x200?text=Dashboard+Analitico) | ![Mapa](https://via.placeholder.com/400x200?text=Mapa+Interactivo) |
| *Visualización de métricas* | *Gestión geoespacial* |

*(Reemplaza estos links con capturas reales de tu aplicación)*

## 🚀 Instalación y Despliegue

### Prerrequisitos
* Node.js 18+
* NPM o Yarn
* Backend API corriendo (ver repositorio del backend)

### 1. Clonar el repositorio
```bash
git clone [https://github.com/elianguevara/sistema-riego-goteo-react.git](https://github.com/elianguevara/sistema-riego-goteo-react.git)
cd sistema-riego-goteo-react
