from fpdf import FPDF
import os

# Configuration
INPUT_FILE = r"c:\Users\arkad\OneDrive\Documents\ILO_RAD\viewer-app\src\app\page.tsx"
OUTPUT_FILE = r"c:\Users\arkad\OneDrive\Documents\ILO_RAD\Source_Code_Registration_Final.pdf"
LINES_TO_EXTRACT = 60
SOFTWARE_TITLE = "PulmoView: Digital Radiography Interpretation System for Pneumoconiosis Classification"

class PDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.cell(0, 10, f"Source Code - {SOFTWARE_TITLE}", align="C")

pdf = PDF(format="A4")
pdf.set_auto_page_break(auto=True, margin=20)

# COVER PAGE
pdf.add_page()
pdf.set_font("Helvetica", "B", 18)
pdf.ln(80)
pdf.cell(0, 10, "SOURCE CODE REPRESENTATION", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 10, "FOR COPYRIGHT REGISTRATION", align="C", new_x="LMARGIN", new_y="NEXT")

pdf.ln(30)
line_height = 10

# Set a left margin
pdf.set_left_margin(25)

# Print only the Name
pdf.set_font("Helvetica", "B", 14)
pdf.cell(20, line_height, "Name:")

pdf.set_font("Helvetica", "", 14)
pdf.multi_cell(130, line_height - 2, SOFTWARE_TITLE, new_x="LMARGIN", new_y="NEXT")

# Reset margin for code pages
pdf.set_left_margin(15)

# Read lines
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Clean up tabs so they align nicely in PDF
lines = [line.replace('\t', '    ') for line in lines]

first_lines = lines[:LINES_TO_EXTRACT]
last_lines = lines[-LINES_TO_EXTRACT:]

def add_code_page(title, filename, code_lines, start_idx):
    pdf.add_page()
    pdf.set_left_margin(15)
    pdf.set_right_margin(15)
    
    # Header
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Principal File: {filename}", new_x="LMARGIN", new_y="NEXT")
    
    y = pdf.get_y()
    pdf.line(15, y, 195, y)
    pdf.ln(8)
    
    # Code
    pdf.set_font("Courier", "", 8.5)
    for i, line in enumerate(code_lines):
        num = start_idx + i
        # Replace non-breaking spaces and fix weird chars for PDF if any
        clean_line = line.rstrip('\n\r').encode('latin-1', 'replace').decode('latin-1')
        formatted_line = f"{num:04d}: {clean_line}"
        pdf.multi_cell(0, 4.5, formatted_line, new_x="LMARGIN", new_y="NEXT")

add_code_page("FIRST PAGE OF SOURCE CODE", "viewer-app/src/app/page.tsx", first_lines, 1)
add_code_page("LAST PAGE OF SOURCE CODE", "viewer-app/src/app/page.tsx", last_lines, len(lines) - LINES_TO_EXTRACT + 1)

pdf.output(OUTPUT_FILE)
print(f"Generated {OUTPUT_FILE} successfully.")
