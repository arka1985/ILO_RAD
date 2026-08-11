# DICOM Pusher Utility

This is the lightweight upload utility designed to be installed on the X-Ray Source Computer. The technician simply drags and drops a patient's DICOM image here, and it is instantly pushed to the Interpreter's screen.

## Network Setup Guide

This suite uses a direct, modern web-based transfer system. You do NOT need to configure a complex third-party PACS server (like Orthanc) or mess with traditional DICOM C-STORE routing.

### 1. The Receiver (Viewer App)
* **Role**: The Interpreter/Physician's computer. It receives DICOM files.
* **IP Address**: The Local Network IP of the Interpreter's PC (e.g., `192.168.1.100`)
* **Port Number**: `3000`
* **AE Title**: N/A (Uses direct HTTP REST API instead of traditional DICOM protocol)

### 2. The Pusher (Pusher App)
* **Role**: The X-Ray Source/Technician's computer. It sends DICOM files.
* **IP Address**: The Local Network IP of the Technician's PC
* **Port Number**: `3001`
* **AE Title**: N/A (Uses direct HTTP REST API)

### How to Connect Them Over Your Network:
1. Find the IP Address of the RECEIVER computer.
   - **Windows**: Open Command Prompt, type `ipconfig` (look for IPv4 Address).
   - **Mac**: Open Terminal, type `ifconfig | grep inet` (or check System Settings > Network).
   - **Linux**: Open Terminal, type `ip a` or `hostname -I`.
   - *Example: `192.168.1.100`*
2. Open the PUSHER APP on the technician's computer.
3. In the "Target Interpreter URL" box, enter the receiver's address like this:
   `http://192.168.1.100:3000/api/dicom-receiver`
4. Drag and drop your DICOM file. It will push directly to the Viewer!


## Privacy & Data Confidentiality
* **100% Local & Offline**: This software suite is designed to run entirely locally on your own hardware or local area network.
* **No Telemetry & No Cloud Storage**: We do not collect usage data, analytics, or store your patient data in any external cloud server. 
* **Data Security**: DICOM files transferred via the Pusher App or loaded directly do not leave your network. It is the user's responsibility to ensure the host machine complies with local medical data regulations (e.g., HIPAA, GDPR).

## Why This Suite is Novel
* **Zero Server Configuration**: Unlike traditional PACS solutions, you can immediately push DICOM files directly from the acquisition PC to the doctor's screen via a simple drag-and-drop interface over the local network (or VPNs like Tailscale).
* **Modern Side-by-Side Viewing**: Combines an integrated medical DICOM viewer seamlessly with the standard ILO 2022 Reference Radiographs (digitized in high-resolution DICOM and JPEG formats) directly in your browser.
* **Instant Digital Reporting**: Replaces paper ILO forms with an interactive, validating digital wizard that generates standardized PDFs locally.

