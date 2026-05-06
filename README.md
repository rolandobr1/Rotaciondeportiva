# Welcome to Antigravity!

Welcome to your new developer home! Your Firebase Studio project has been successfully migrated to Antigravity.

Antigravity is our next-generation, agent-first IDE designed for high-velocity, autonomous development. Because Antigravity runs locally on your machine, you now have access to powerful local workflows and fully integrated AI editing capabilities that go beyond a cloud-based web IDE.

## Getting Started
- **Run Locally**: Use the **Run and Debug** menu on the left sidebar to start your local development server.
  - Or in a terminal run `npm run dev` and visit `http://localhost:9002`.
- **Deploy**: You can deploy your changes to Firebase App Hosting by using the integrated terminal and standard Firebase CLI commands, just as you did in Firebase Studio.
- **Cleanup**: Cleanup unused artifacts with the @cleanup workflow.

Enjoy the next era of AI-driven development!

File any bugs at https://github.com/firebase/firebase-tools/issues

**Firebase Studio Export Date:** 2026-05-06


---

## Previous README.md contents:

# Firebase Studio

Este es un proyecto de inicio de NextJS en Firebase Studio.

Para empezar, echa un vistazo a `src/app/page.tsx`.

## Desarrollo

Para ejecutar el servidor de desarrollo:

```bash
npm run dev
```

## Despliegue

Esta aplicación está configurada para desplegarse con **Firebase App Hosting**.

Para desplegar tu aplicación, necesitarás la [CLI de Firebase](https://firebase.google.com/docs/cli).

1.  **Inicia sesión en Firebase:**
    ```bash
    firebase login
    ```

2.  **Inicializa App Hosting:**
    Si aún no lo has hecho, ejecuta el siguiente comando. Esto asociará el proyecto con Firebase, creará un backend de App Hosting y actualizará tu archivo `firebase.json` para conectar el hosting con tu aplicación:
    ```bash
    firebase init apphosting
    ```

3.  **Desplegar:**
    Ejecuta el siguiente comando para desplegar tu aplicación:
    ```bash
    firebase deploy --only apphosting
    ```

### Solución de Problemas
Si al desplegar recibes un error que dice `webframeworks is not enabled`, ejecuta el siguiente comando y vuelve a intentarlo:
```bash
firebase experiments:enable webframeworks
```

Después del despliegue, la CLI de Firebase te proporcionará la URL de tu aplicación en vivo.

## Crear una APK (Android App)

Esta aplicación es una **Aplicación Web Progresiva (PWA)**, lo que significa que puedes "instalarla" en tu teléfono para que se comporte como una aplicación nativa, ¡sin necesidad de pasar por la Play Store! Esto te dará un icono en tu pantalla de inicio y abrirá la app a pantalla completa.

Para instalarla en un dispositivo Android:

1.  Abre la URL de tu aplicación desplegada en el navegador **Chrome**.
2.  Toca el menú de tres puntos (⋮) en la esquina superior derecha.
3.  Selecciona la opción **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
4.  Sigue las instrucciones en pantalla.

¡Y listo! Ahora tendrás un icono de "Rotación Deportiva" en tu teléfono para un acceso rápido.

**Nota:** Esto no crea un archivo `.apk` que puedas subir a la Google Play Store. Si ese es tu objetivo, puedes usar herramientas como [PWABuilder](https://www.pwabuilder.com/) para empaquetar tu PWA en un APK listo para la tienda.
