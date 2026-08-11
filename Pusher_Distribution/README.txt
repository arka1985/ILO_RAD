===================================================
      ILO RADIOGRAPH SUITE - PUSHER APP
===================================================

This package contains the standalone Pusher Application, allowing you to securely send DICOM files directly to the remote interpreter.

REQUIREMENTS:
-------------
- Node.js must be installed on your computer. If you don't have it, download and install it from: https://nodejs.org/

HOW TO RUN:
-----------
1. Ensure the folder is unzipped (extracted) on your computer.
2. If you are on Windows:
   - Double-click the `start_pusher_windows.bat` file.
3. If you are on Mac or Linux:
   - Open a terminal in this folder and run: `./start_pusher_mac_linux.sh`
   - (Note: You may need to run `chmod +x start_pusher_mac_linux.sh` first to make it executable).

USAGE:
------
1. The script will install necessary dependencies on its first run and then automatically open a webpage (http://localhost:3002).
2. Enter the IP Address or Tailscale IP provided by the interpreter.
   (The interpreter can find their IP by typing `ipconfig` in Windows Command Prompt, `ifconfig | grep inet` in Mac Terminal, or `ip a` in Linux Terminal).
   Format: http://<INTERPRETER_IP>:3000/api/dicom-receiver (e.g., http://192.168.1.50:3000/api/dicom-receiver)
3. Drag and drop your `.dcm` files into the designated area. The files will be pushed instantly to the viewer!

Keep the black terminal window open while you are using the app. When you're done, simply close the window (or press Ctrl+C).
