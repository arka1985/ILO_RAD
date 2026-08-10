===================================================
      ILO RADIOGRAPH SUITE - UNIFIED DISTRIBUTION
===================================================

This package contains both the Viewer Application and the Pusher Application in one unified bundle.

REQUIREMENTS:
-------------
- Node.js must be installed on your computer. If you don't have it, download and install it from: https://nodejs.org/

HOW TO RUN:
-----------
1. Ensure this entire folder is unzipped (extracted) on your computer.
2. If you are on Windows:
   - Double-click the `start_windows.bat` file.
3. If you are on Mac or Linux:
   - Open a terminal in this folder and run: `./start_mac_linux.sh`
   - (Note: You may need to run `chmod +x start_mac_linux.sh` first to make it executable).

USAGE:
------
When you launch the script, a menu will appear in the command window prompting you to select your role:

  [1] Viewer (Interpreter / Doctor)
  [2] Pusher (Image Sender / X-Ray Tech)

- If you select [1], the script will install the viewer dependencies and automatically open the medical image viewer in your default web browser.
- If you select [2], the script will install the pusher dependencies and open the Pusher tool, allowing you to instantly send DICOM files directly to the interpreter.

Keep the black terminal window open while you are using the app. When you're done, simply close the window (or press Ctrl+C).
