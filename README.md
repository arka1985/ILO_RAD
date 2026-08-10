# ILO Radiograph Suite

A comprehensive, cross-platform DICOM Radiograph viewer and classification suite designed for ILO standard classification of pneumoconioses.

## Features
- **Pusher App**: Push DICOMs or image files to the viewers and enter patient metadata.
- **Full Viewer**: A detailed, step-by-step wizard for Full ILO Classification.
- **Abbreviated Viewer**: A streamlined wizard for Abbreviated ILO Classification.

---

## 🚀 Quick Start (No Docker Required)

If you just want to run the suite quickly on your computer:

### Prerequisites
- Install **[Node.js](https://nodejs.org/)** (Version 18 or higher)

### Windows
1. Double-click the `start_windows.bat` file in this folder.
2. It will automatically install everything and launch the servers.
3. Keep the terminal window open to keep the servers running.

### Mac / Linux
1. Open your terminal and navigate to this folder.
2. Make the script executable: `chmod +x start_mac_linux.sh`
3. Run the script: `./start_mac_linux.sh`

### Accessing the Apps
Once the servers are running, open your web browser to:
- **Full Viewer**: [http://localhost:3000](http://localhost:3000)
- **Abbreviated Viewer**: [http://localhost:3001](http://localhost:3001)
- **Pusher App**: [http://localhost:3002](http://localhost:3002)

---

## 🐳 Docker Deployment (For IT / Production)

If you prefer to deploy the suite using Docker containers (ideal for hospital IT environments), a full `docker-compose` setup is provided.

### Prerequisites
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (or Docker Engine + Docker Compose)

### Running with Docker
1. Open a terminal in this directory.
2. Run the following command:
   ```bash
   docker-compose up -d --build
   ```
3. The apps will build and launch in detached mode on the same ports (3000, 3001, 3002).
4. To stop the containers, run:
   ```bash
   docker-compose down
   ```

---

## Architecture Overview

The suite consists of three Next.js applications that operate independently but can communicate:
- The **Pusher App** makes HTTP requests directly to the Viewer applications to transfer images and metadata instantly across the network.
- No central database is required. State is handled entirely on the client and via local temporary storage within each app.

## Support
For issues or questions regarding the setup, please consult the IT department or the project maintainers.
