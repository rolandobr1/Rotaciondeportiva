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
    Si aún no lo has hecho, asocia este proyecto con tu proyecto de Firebase:
    ```bash
    firebase init apphosting
    ```

3.  **Desplegar:**
    Ejecuta el siguiente comando para desplegar tu aplicación:
    ```bash
    firebase deploy --only apphosting
    ```

Después del despliegue, la CLI de Firebase te proporcionará la URL de tu aplicación en vivo.
