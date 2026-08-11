# ILO Radiograph Suite

A comprehensive, fully local web application suite for ILO pneumoconiosis classification. 

## Table of Contents
1. [What is ILO Radiography?](#what-is-ilo-radiography)
2. [Distributions (Which one to use?)](#distributions-which-one-to-use)
3. [How to Download from GitHub](#how-to-download-from-github)
4. [How to Run (Windows, Mac, Linux)](#how-to-run-windows-mac-linux)
5. [How to Use the Viewer App](#how-to-use-the-viewer-app)
6. [How to Use the Pusher App](#how-to-use-the-pusher-app)
7. [How to Use PACS](#how-to-use-pacs)

---

## What is ILO Radiography?
The International Labour Organization (ILO) International Classification of Radiographs of Pneumoconioses is a standard system for classifying chest radiographs (X-rays) for pneumoconiosis (dust-induced lung diseases like silicosis, coal worker's pneumoconiosis, and asbestosis). 

Its purpose is to provide a standardized, reproducible way to record the presence and severity of lung abnormalities, which is crucial for epidemiological research, screening, and medical surveillance of workers exposed to hazardous dusts. This software suite provides a digital side-by-side viewer of standard ILO reference images alongside patient DICOM files to assist physicians in grading these conditions.

---

## Distributions (Which one to use?)
This software is provided in three distinct "Distributions" to fit different workflows. Choose the one that matches your role:

1. **Viewer Distribution (`Viewer_Distribution`)**
   - **For:** The Medical Interpreter / Doctor.
   - **Contains:** Only the Viewer App.
   - **Use case:** Send this folder to the doctor. It has a single one-click startup script that opens the full classification suite.

2. **Pusher Distribution (`Pusher_Distribution`)**
   - **For:** The X-Ray Technician / Image Sender.
   - **Contains:** Only the Pusher App.
   - **Use case:** Send this to the person acquiring the X-rays. It provides a simple drag-and-drop web interface to instantly push DICOM images over the local network (or remotely via Tailscale) to the doctor's screen.

3. **Unified Distribution (`Unified_Distribution` or the Root Folder)**
   - **For:** General distribution, or when both the sender and receiver are the same person/machine.
   - **Contains:** Both the Viewer and Pusher apps, linked by an interactive menu script.
   - **Use case:** Distribute this single ZIP file if you want the user to be able to choose their role when they run the startup script.

---

## How to Download from GitHub
1. Go to the main GitHub repository page.
2. Click the green **"Code"** button.
3. Select **"Download ZIP"**.
4. Once downloaded, **Extract/Unzip** the folder completely. (Do not try to run the scripts from inside the ZIP archive).

---

## How to Run (Windows, Mac, Linux)
*Prerequisite: You must have [Node.js](https://nodejs.org/) installed on your computer.*

**Windows:**
1. Open the folder of your chosen distribution.
2. Double-click the `.bat` file (e.g., `start_windows.bat`, `start_viewer_windows.bat`, or `start_pusher_windows.bat`).
3. The script will automatically install dependencies on its first run, boot the server, and open your default web browser.

**Mac / Linux:**
1. Open a terminal and navigate to the folder of your chosen distribution.
2. Make the script executable: `chmod +x start_mac_linux.sh` (or the equivalent script name).
3. Run the script: `./start_mac_linux.sh`
4. The script will install dependencies, boot the server, and open your default web browser.

*Note for Unified Distribution:* If you run the unified startup script, you will be prompted with a terminal menu to press `1` for the Viewer or `2` for the Pusher.

---

## How to Use the Viewer App
1. Launch the Viewer using the instructions above.
2. The browser will open to `http://localhost:3000`.
3. Fill out the **Reporting Wizard** on the left side of the screen.
4. You can click **"POP OUT DUAL VIEWER PANEL"** to open the side-by-side image viewer in a new window (great for dual-monitor setups).
5. Load a patient DICOM file either by using the "Upload" button, connecting to a PACS, or waiting for an image to be pushed from the Pusher App.
6. Compare the patient's X-ray against the ILO Standard Reference Images provided in the app.
7. Generate and save your final PDF report.

---

## How to Use the Pusher App
1. Launch the Pusher using the instructions above.
2. The browser will open to `http://localhost:3002`.
3. Find the IP Address of the doctor's computer (the one running the Viewer App).
   - **Windows**: Open Command Prompt, type `ipconfig` (look for IPv4 Address).
   - **Mac**: Open Terminal, type `ifconfig | grep inet` (or check System Settings > Network).
   - **Linux**: Open Terminal, type `ip a` or `hostname -I`.
   - *Example: `192.168.1.100`*
4. In the Pusher App, enter the target address: `http://192.168.1.100:3000/api/dicom-receiver`
5. Drag and drop a patient's `.dcm` file into the designated area.
6. The image will instantly appear on the doctor's screen without them needing to refresh!

---

## How to Use PACS
If your facility uses a PACS server (like Orthanc) with a DICOMweb endpoint enabled:

1. Open the Viewer App (`http://localhost:3000`).
2. Click the **"Connect to PACS"** button in the patient viewer panel.
3. In the popup, go to the **"Network Setup"** tab and enter your PACS DICOMweb URL (e.g., `http://192.168.1.50:8042/dicom-web`).
4. Provide a Username and Password if your PACS requires authentication.
5. Go to the **"Query / Retrieve"** tab.
6. Enter the Patient Name or ID and click **Search**.
7. Click on any of the resulting studies/series to instantly fetch and render the DICOM files directly from the PACS server!
