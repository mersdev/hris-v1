# Training Records Analysis Web Application

## Overview

A web-based application designed to analyze and visualize training records for Young Engineer Program (YEP) participants. The application processes Excel/CSV files containing training data and employee information, providing detailed analysis through interactive tables and charts.

## Features

- **File Upload System**

  - Support for XLSX and CSV file formats
  - Drag & drop functionality
  - File size limit: 10MB per file
  - Session storage for persistent data

- **Data Analysis**

  - Training completion rates by job title
  - Detailed employee training records
  - Interactive pie charts for visual representation
  - Filterable results by job title and employee search

- **Data Management**
  - Export functionality to Excel
  - Pagination for large datasets
  - Clear data option
  - Real-time data filtering

## Technology Stack

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- Libraries:
  - Chart.js for data visualization
  - SheetJS for Excel file handling
  - ExcelJS for Excel export functionality

## Setup and Installation

1. Clone the repository
2. No build process required - pure frontend application
3. Open `index.html` in a modern web browser

## Usage Instructions

1. **Upload Files**

   - Upload Training Records file (XLSX/CSV)
   - Upload Employee Data file (XLSX/CSV)

2. **Generate Analysis**

   - Click "Generate Table" to view analysis
   - Use filters to refine data view
   - Export results using "Export to Excel" button

3. **View Results**
   - Training completion rates in pie chart
   - Detailed employee records in table format
   - Filter results by job title or search by employee

## Required File Format

### Training Records File

- Columns:
  - Emp_ID
  - Course_Title
  - Training_Duration_Hours

### Employee Data File

- Columns:
  - Employee ID
  - Employee Name
  - Department
  - Job Title
  - Email Address
  - PLC/PC (for Software Engineers)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technical Implementation Details

The application uses modular JavaScript with the following key components:

1. **File Handling**: Manages file uploads and data parsing
2. **Data Analysis**: Processes training records and generates statistics
3. **UI Components**: Handles user interface interactions and notifications

## Support

For technical support and inquiries, contact Business Relations Department at +6016-5709826 (Mon-Fri, 9AM-6PM)

## License

This project is proprietary software. All rights reserved.
