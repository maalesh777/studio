# TattooAI:Vision

TattooAI:Vision ist eine revolutionäre KI-gestützte Tattoo-Design-App mit einer futuristischen Ästhetik. Nutzer können ihre Tattoo-Ideen beschreiben, Designvorschläge von einer KI erhalten, diese verfeinern, Bilder der Designs generieren lassen und die Platzierung auf einem Körperteil visualisieren.

## ✨ Hauptfunktionen

-   **KI-gestützte Design-Generierung:** Erhalten Sie einzigartige Tattoo-Vorschläge basierend auf Ihren Beschreibungen, Stilpräferenzen und Schlüsselwörtern.
-   **Bildgenerierung:** Generieren Sie visuelle Darstellungen Ihrer Tattoo-Designs.
-   **Design-Verfeinerung:** Passen Sie generierte Vorschläge mit zusätzlichen Details und Referenzbildern an.
-   **Persönliche Bibliothek:** Speichern und verwalten Sie Ihre favorisierten Tattoo-Designs.
-   **Platzierungs-Visualizer:** Laden Sie ein Design und ein Foto eines Körperteils hoch, um eine Vorschau der Platzierung zu erhalten.
-   **Mehrsprachigkeit:** Unterstützung für Deutsch und Englisch.
-   **Theme-Anpassung:** Heller und dunkler Modus mit dynamischen Hintergründen.

## 🛠️ Tech Stack

-   **Framework:** Next.js (App Router)
-   **Sprache:** TypeScript
-   **Styling:** Tailwind CSS, ShadCN UI Komponenten
-   **KI-Integration:** Genkit (mit Google Gemini)
-   **State Management:** React Context, `react-hook-form`, `useLocalStorage`
-   **Deployment:** Firebase App Hosting

## 🚀 Erste Schritte

### Voraussetzungen

-   Node.js (Version entsprechend `package.json` oder höher)
-   npm oder yarn

### Installation

1.  Klonen Sie das Repository:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  Installieren Sie die Abhängigkeiten:
    ```bash
    npm install
    # oder
    # yarn install
    ```

### Lokale Entwicklung

1.  **Firebase Setup:**
    *   Stellen Sie sicher, dass Sie ein Firebase-Projekt eingerichtet haben.
    *   Konfigurieren Sie die Firebase-Umgebungsvariablen (siehe `apphosting.yaml` für die benötigten Schlüssel) in einer `.env.local` Datei für die lokale Entwicklung. Beispiel:
        ```
        NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
        # ... weitere Firebase Variablen
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
        ```
2.  **Google AI API Key für Genkit:**
    *   Erstellen Sie einen API-Key für Google AI Studio (oder Vertex AI).
    *   Setzen Sie diesen Key in Ihrer `.env.local` Datei:
        ```
        GOOGLE_API_KEY=your_google_ai_api_key
        ```
3.  Starten Sie den Next.js Development Server:
    ```bash
    npm run dev
    ```
    Die Anwendung ist dann normalerweise unter `http://localhost:9002` erreichbar.

4.  Starten Sie den Genkit Development Server (in einem separaten Terminal):
    ```bash
    npm run genkit:dev
    # oder für automatisches Neuladen bei Änderungen
    # npm run genkit:watch
    ```
    Die Genkit Developer UI ist dann unter `http://localhost:4000` erreichbar.

### Build für Produktion

```bash
npm run build
```

### Lokalen Produktionsserver starten

```bash
npm run start
```

## ☁️ Deployment

Diese Anwendung ist für das Deployment mit **Firebase App Hosting** konfiguriert.

1.  **Firebase CLI:** Stellen Sie sicher, dass Sie die [Firebase CLI](https://firebase.google.com/docs/cli) installiert und konfiguriert haben.
2.  **`apphosting.yaml`:** Überprüfen und konfigurieren Sie die `apphosting.yaml` Datei. Insbesondere müssen Sie alle Umgebungsvariablen und Secrets (wie `GOOGLE_API_KEY`) in Ihrem Firebase App Hosting Backend (über die Google Cloud Console oder Firebase Console) einrichten.
3.  **Deployment-Befehl:**
    ```bash
    firebase deploy --only apphosting
    # Oder wenn Sie mehrere Backends haben, spezifizieren Sie es:
    # firebase deploy --only apphosting:tattooai-vision # Ersetzen Sie tattooai-vision mit Ihrer Backend-ID
    ```

## 📄 Lizenz

Dieses Projekt ist unter der [MIT Lizenz](LICENSE.md) lizenziert (falls eine Lizenzdatei hinzugefügt wird).
```