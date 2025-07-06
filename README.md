# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Development

To run the development server:

```bash
npm run dev
```

## Deployment

This application is configured for deployment with **Firebase App Hosting**.

To deploy your application, you will need the [Firebase CLI](https://firebase.google.com/docs/cli).

1.  **Login to Firebase:**
    ```bash
    firebase login
    ```

2.  **Initialize App Hosting:**
    If you haven't already, associate this project with your Firebase project:
    ```bash
    firebase init apphosting
    ```

3.  **Deploy:**
    Run the following command to deploy your app:
    ```bash
    firebase deploy --only apphosting
    ```

After deployment, the Firebase CLI will provide you with the URL of your live application.
