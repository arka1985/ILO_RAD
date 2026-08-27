import html
import os

# Configuration
INPUT_FILE = r"c:\Users\arkad\OneDrive\Documents\ILO_RAD\viewer-app\src\app\page.tsx"
OUTPUT_FILE = r"c:\Users\arkad\OneDrive\Documents\ILO_RAD\Copyright_Source_Code.html"
LINES_TO_EXTRACT = 60
SOFTWARE_TITLE = "PneumoRAD Suite: Digital Radiography System for Pneumoconiosis Classification"
YEAR = "2024"
STATUS = "Unpublished"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

first_lines = lines[:LINES_TO_EXTRACT]
last_lines = lines[-LINES_TO_EXTRACT:]

def format_code(lines_list, start_idx):
    formatted = ""
    for i, line in enumerate(lines_list):
        num = start_idx + i
        escaped_line = html.escape(line.rstrip('\n'))
        formatted += f"{num:04d}: {escaped_line}\n"
    return formatted

first_code = format_code(first_lines, 1)
last_code = format_code(last_lines, len(lines) - LINES_TO_EXTRACT + 1)

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Source Code Registration - {{SOFTWARE_TITLE}}</title>
<style>
    @page {{
        size: A4;
        margin: 25mm 20mm;
    }}
    body {{
        font-family: "Times New Roman", Times, serif;
        color: black;
        background: white;
        margin: 0;
        padding: 0;
    }}
    .page-break {{
        page-break-before: always;
    }}
    .cover-page {{
        text-align: center;
        padding-top: 100px;
    }}
    .cover-title {{
        font-size: 22pt;
        font-weight: bold;
        margin-bottom: 60px;
        line-height: 1.4;
    }}
    .cover-details {{
        font-size: 14pt;
        text-align: left;
        max-width: 700px;
        margin: 0 auto;
        line-height: 2.2;
        border-collapse: collapse;
    }}
    .cover-details td {{
        padding: 8px 15px;
        vertical-align: top;
    }}
    .cover-details td:first-child {{
        font-weight: bold;
        white-space: nowrap;
        width: 40%;
    }}
    .code-container {{
        font-family: "Courier New", Courier, monospace;
        font-size: 10pt;
        line-height: 1.35;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin-top: 20px;
        margin-bottom: 50px;
    }}
    .filename-header {{
        font-weight: bold;
        font-size: 12pt;
        margin-bottom: 10px;
        border-bottom: 2px solid black;
        padding-bottom: 5px;
        font-family: Arial, sans-serif;
    }}
    .footer-text {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 10pt;
        font-family: Arial, sans-serif;
        color: #333;
        background: white;
        padding-top: 10px;
    }}
    
    @media print {{
        .no-print {{
            display: none;
        }}
    }}
    .print-button {{
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #000;
        color: #fff;
        font-family: Arial, sans-serif;
        font-weight: bold;
        text-decoration: none;
        border-radius: 5px;
        cursor: pointer;
    }}
</style>
</head>
<body>

<button class="no-print print-button" onclick="window.print()">Print to PDF</button>

<div class="cover-page">
    <div class="cover-title">SOURCE CODE REPRESENTATION<br>FOR COPYRIGHT REGISTRATION</div>
    
    <table class="cover-details">
        <tr><td>Title of the Software:</td><td>{SOFTWARE_TITLE}</td></tr>
        <tr><td>Type of Work:</td><td>Computer Programme / Software</td></tr>
        <tr><td>Author:</td><td>Dr. Arkaprabha Sau</td></tr>
        <tr><td>Copyright Applicant/Owner:</td><td>Dr. Arkaprabha Sau</td></tr>
        <tr><td>Nature of Interest:</td><td>Author and Copyright Owner</td></tr>
        <tr><td>Year of Creation:</td><td>{YEAR}</td></tr>
        <tr><td>Status:</td><td>{STATUS}</td></tr>
    </table>
</div>

<div class="page-break"></div>

<div class="filename-header">FIRST PAGE OF SOURCE CODE<br><span style="font-size:10pt; font-weight:normal;">Principal File: viewer-app/src/app/page.tsx</span></div>
<div class="code-container">{first_code}</div>
<div class="footer-text">Source Code &ndash; {SOFTWARE_TITLE} &ndash; Dr. Arkaprabha Sau</div>

<div class="page-break"></div>

<div class="filename-header">LAST PAGE OF SOURCE CODE<br><span style="font-size:10pt; font-weight:normal;">Principal File: viewer-app/src/app/page.tsx</span></div>
<div class="code-container">{last_code}</div>
<div class="footer-text">Source Code &ndash; {SOFTWARE_TITLE} &ndash; Dr. Arkaprabha Sau</div>

</body>
</html>
"""

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated {{OUTPUT_FILE}} successfully.")
