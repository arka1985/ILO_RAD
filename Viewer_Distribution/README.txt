===================================================
      ILO RADIOGRAPH SUITE - VIEWER APPS
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
