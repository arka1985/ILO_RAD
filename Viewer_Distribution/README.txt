===================================================
      ILO RAD SUITE - VIEWER APPS
      ILO Radiography System for Pneumoconiosis Classification
===================================================

This package contains the standalone Viewer Applications (Full Viewer and Abbreviated Viewer) designed for the medical interpreter. 

REQUIREMENTS:
-------------
- Node.js must be installed on your computer. If you don't have it, download and install it from: https://nodejs.org/

HOW TO RUN:
-----------
1. Ensure the folder is unzipped (extracted) on your computer.
2. If you are on Windows:
   - Double-click the `start_viewer_windows.bat` file.
3. If you are on Mac or Linux:
   - Open a terminal in this folder and run: `./start_viewer_mac_linux.sh`
   - (Note: You may need to run `chmod +x start_viewer_mac_linux.sh` first to make it executable).

USAGE:
------
The script will install all necessary dependencies on its first run and then automatically open your default browser to:
- http://localhost:3000 (Full Viewer)
- http://localhost:3001 (Abbreviated Viewer)

You can use the PACS Connection module within the app to connect to an external DICOMweb server, or use the Pusher App (on the source computer) to push images directly to this viewer.

Keep the black terminal window open while you are using the app. When you're done, simply close the window (or press Ctrl+C).


## Privacy & Data Confidentiality
* **100% Local & Offline**: This software suite is designed to run entirely locally on your own hardware or local area network.
* **No Telemetry & No Cloud Storage**: We do not collect usage data, analytics, or store your patient data in any external cloud server. 
* **Data Security**: DICOM files transferred via the Pusher App or loaded directly do not leave your network. It is the user's responsibility to ensure the host machine complies with local medical data regulations (e.g., HIPAA, GDPR).

## Why This Suite is Novel
* **Zero Server Configuration**: Unlike traditional PACS solutions, you can immediately push DICOM files directly from the acquisition PC to the doctor's screen via a simple drag-and-drop interface over the local network (or VPNs like Tailscale).
* **Modern Side-by-Side Viewing**: Combines an integrated medical DICOM viewer seamlessly with the standard ILO 2022 Reference Radiographs (digitized in high-resolution DICOM and JPEG formats) directly in your browser.
* **Instant Digital Reporting**: Replaces paper ILO forms with an interactive, validating digital wizard that generates standardized PDFs locally.



## Updates and Versioning
**Current Version:** 1.0.0

To check if a newer version of the software is available, visit the [Official Updates Page](https://arka1985.github.io/ILO_RAD/) (you can also click the "Updates" button in the Viewer App footer). 

**How to check for updates:**
1. Compare the **Current Version** listed on the Updates Page with the version number shown in your Viewer App's footer.
2. If the Updates Page shows a newer version, download the latest `.zip` package for your distribution directly from that page without needing to navigate the GitHub repository.

**How to Install an Update:**
1. Download the new `.zip` package from GitHub and extract it to a **new folder**.
2. **Do not overwrite** the old folder immediately. The software runs locally and your browser saves your settings based on the local address. 
3. If you want to keep your patient history, your browser's `localStorage` will automatically carry over as long as you open the new version in the same browser on the same computer (e.g., `localhost:3000`).
4. Once you have verified the new version works and your history is intact, you can safely delete the old folder.



## Creating a Desktop Shortcut (Windows Only)
To make launching the software easier, we have included a script to automatically create a shortcut on your Desktop with a custom medical icon.
1. Open the folder containing the software.
2. Double-click the file named `Create_Desktop_Shortcut.vbs`.
3. A shortcut named **"PulmoView"** will appear on your Desktop. You can now use this to start the application directly!


