# AR Code Manager

A complete web platform for uploading 3D models (`.glb`), generating unique QR codes, and viewing them in Augmented Reality (AR) directly in the browser.

## 🚀 Features

-   **3D Model Upload**: Support for `.glb` (Binary glTF) files with progress tracking.
-   **AR Viewer**: Built-in web-based AR viewer compatible with modern mobile browsers.
-   **QR Code Generation**: Automatically generates QR codes linking to the AR experience.
-   **Dashboard**: Manage your uploaded models and view their details.
-   **Authentication**: Secure login and signup system.
-   **Responsive Design**: Modern, dark-themed UI optimized for desktop and mobile.

## 🛠️ Tech Stack

**Frontend:**
-   HTML5, CSS3 (Custom Dark Theme)
-   Vanilla JavaScript (ES6+)
-   [Supabase](https://supabase.com/) (Authentication & Database)
-   [QRCode.js](https://github.com/davidshimjs/qrcodejs) (QR Generation)

**Backend:**
-   [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
-   [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) (Local Database)
-   Multer (File Uploads)

**DevOps:**
-   [Docker](https://www.docker.com/) & Docker Compose

## 📦 Installation & Setup

### Option 1: Docker (Recommended)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rgdi/ar-viewer-luciar-.git
    cd ar-viewer-luciar-
    ```

2.  **Run with Docker Compose:**
    ```bash
    docker compose up --build
    ```

3.  **Access the App:**
    -   Frontend/App: `http://localhost:80`
    -   Server API: `http://localhost:3000`

### Option 2: Local Development

1.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    ```

2.  **Start the Server:**
    ```bash
    npm run dev
    ```

3.  **Serve the Frontend:**
    You can use any static file server (e.g., Live Server in VS Code) to serve the root directory.

## 📝 Environment Variables

The application comes with default configuration for development. For production, ensure you update the following in `compose.yaml` or your `.env` file:

-   `CORS_ORIGIN`: Allowed origins for API requests.
-   `JWT_SECRET`: Secret key for signing authentication tokens.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
