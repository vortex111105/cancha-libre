# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Notas de Progreso - Portal de Canchas
- **Etapa 1 (auth + dashboard + disponibilidad):** Rol `cancha_owner` en cl_users. Nuevo grupo `(cancha-onboarding)` y `(cancha-portal)` con 5 tabs. Tabla `cl_field_slots`. Auth routing por rol en `app/_layout.tsx`.
- **Etapa 2 (chat equipo↔cancha):** Tablas `cl_cancha_conversations` y `cl_cancha_messages`. Pantalla compartida `app/cancha-chat/[id].tsx`. Botón "Consultar" en `challenge/new.tsx`. Sección "Con canchas" en `chat.tsx`.

## Notas de Progreso - Fase 3
- **Geolocalización y Mapas**: Integrados `expo-location` y `react-native-maps`. El componente `MapContainer` interactivo muestra los equipos cercanos. Se agregó un toggle en la pantalla de Búsqueda (Lista/Mapa). Al crear un equipo en Supabase (`cl_teams`), se captura la ubicación del usuario (`lat`/`lng`).
- **Notificaciones Push (MVP)**: Instalado `expo-notifications`. Creado hook `usePushNotifications` para solicitar permisos y obtener el Expo Push Token nativo. Integrado en el layout principal para guardar automáticamente el token en Supabase (`cl_users.push_token`) al detectar la sesión.
- **Rating Post-Partido**: Modificado el esquema para guardar promedios en `cl_teams` (`rating_count`) y rastrear calificaciones en `cl_challenges` (`is_completed`, `rating_from_team`, `rating_to_team`). Creada la pantalla modal `app/challenge/rate.tsx` para calificar partidos (1 a 5 estrellas) con lógica para calcular promedios en Supabase.
