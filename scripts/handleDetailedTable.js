import { trainingData, employeeData } from "./handleFile.js";
import { generateSummaryTable } from "./handleAnalysisTable.js";
import { showDialog } from "./utils.js";
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;

function getRequiredCoursesByJobTitle(jobTitle, plcPcLabel = "") {
  const courseRequirements = {
    "MECHANICAL DESIGN ENGINEER 1": [
      "Cylinder Selection & Sizing and Air Consumption",
      "Motor Sizing By Using VisualSizer",
      "Material Selection & Surface Treatment",
      "Project Costing Preparation",
      "Basic GD&TSensor Selection",
      "Pneumatic Diagram (SMC)",
      "MOP",
      "MDFP",
    ],
    "SOFTWARE ENGINEER 1 (PC)": [
      "Intro C#",
      "Intro C# Object Oriented",
      "TCP/IP",
      "WPF",
      "SOP",
      "Basic Pneumatic Control",
    ],
    "SOFTWARE ENGINEER 1 (PLC)": [
      "Basic AB",
      "Basic Siemens",
      "Entry Level",
      "AB Data",
      "SOP",
      "Basic Pneumatic Control",
    ],
    "VISION ENGINEER 1": [
      "Fundamentals of Vision and Design Application",
      "SOP",
      "Basic Pneumatic Control",
    ],
    "ELECTRICAL DESIGN ENGINEER 1": [
      "Electrical Drawing using ZWCAD Software",
      "Electrical Standards (CE, UL)",
      "SOP",
      "Basic Pneumatic Control",
    ],
    "TEST ENGINEER 1": [
      "Introduction to C# Programming",
      "SOP",
      "Basic Pneumatic Control",
    ],
  };

  if (jobTitle === "SOFTWARE ENGINEER 1") {
    return courseRequirements[jobTitle][plcPcLabel] || [];
  }
  return courseRequirements[jobTitle] || [];
}

function generateDetailedTable() {
  if (!trainingData || !employeeData) {
    showDialog(
      "Please upload both training and employee files first.",
      "error"
    );
    return;
  }

  const table = document.getElementById("resultTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  // Clear existing table data
  thead.innerHTML = "";
  tbody.innerHTML = "";

  const jobTitleFilter = document.getElementById("jobTitleFilter").value;

  // Get table columns
  const tableColumns =
    jobTitleFilter === ""
      ? [...new Set(trainingData.map((t) => t.Course_Title))].sort()
      : getRequiredCoursesByJobTitle(
          jobTitleFilter,
          employeeData.find((emp) => emp["Job Title"] === jobTitleFilter)?.[
            "PLC/PC"
          ]
        );

  // Create header row
  thead.innerHTML = `
    <tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50">
      <th class="px-4 py-3">Employee ID</th>
      <th class="px-4 py-3">Employee Name</th>
      <th class="px-4 py-3">Department</th>
      <th class="px-4 py-3">Job Title</th>
      <th class="px-4 py-3">Email Address</th>
      <th class="px-4 py-3">PLC/PC</th>
      ${tableColumns
        .map((course) => `<th class="px-4 py-3">${course}</th>`)
        .join("")}
    </tr>
  `;

  // Filter employees
  let filteredEmployees = jobTitleFilter
    ? employeeData.filter((emp) => {
        if (jobTitleFilter === "SOFTWARE ENGINEER 1 (PC)") {
          return (
            emp["Job Title"] === "SOFTWARE ENGINEER 1" && emp["PLC/PC"] === "PC"
          );
        }
        if (jobTitleFilter === "SOFTWARE ENGINEER 1 (PLC)") {
          return (
            emp["Job Title"] === "SOFTWARE ENGINEER 1" &&
            emp["PLC/PC"] === "PLC"
          );
        }
        return emp["Job Title"] === jobTitleFilter;
      })
    : employeeData;

  // Apply pagination
  const paginatedEmployees = updatePagination(filteredEmployees);

  // Generate table rows
  paginatedEmployees.forEach((employee) => {
    const row = tbody.insertRow();

    // Add base employee information
    row.innerHTML = `
      <td class="px-4 py-3 text-sm text-gray-900">${
        employee["Employee ID"]
      }</td>
      <td class="px-4 py-3 text-sm text-gray-900">${
        employee["Employee Name"]
      }</td>
      <td class="px-4 py-3 text-sm text-gray-900">${employee["Department"]}</td>
      <td class="px-4 py-3 text-sm text-gray-900">${employee["Job Title"]}</td>
      <td class="px-4 py-3 text-sm text-gray-900">${
        employee["Email Address"]
      }</td>
      <td class="px-4 py-3 text-sm text-gray-900">${
        employee["PLC/PC"] || ""
      }</td>
    `;

    // Add training hours for each course
    tableColumns.forEach((course) => {
      const trainingRecord = trainingData.find(
        (t) => t.Emp_ID === employee["Employee ID"] && t.Course_Title === course
      );

      const cell = row.insertCell();
      cell.className = "px-4 py-3 text-sm";

      if (trainingRecord) {
        cell.textContent = trainingRecord.Training_Duration_Hours;
      } else {
        cell.textContent = "-";
      }
    });
  });

  generateSummaryTable();

  if (!window.listenersInitialized) {
    setupPaginationListeners();
    setupFilterListener();
    window.listenersInitialized = true;
  }
}

async function exportToExcel() {
  if (!trainingData || !employeeData) {
    showDialog(
      "Please upload both training and employee files first.",
      "error"
    );
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();

    // Get all unique events for column headers
    const allEvents = [
      ...new Set(trainingData.map((t) => t.Course_Title)),
    ].sort();

    // Create Masterlist sheet
    await createSheet(workbook, "Masterlist", employeeData, allEvents);

    // Get unique job titles
    const uniqueJobTitles = [
      ...new Set(
        employeeData.map((emp) => {
          if (emp["Job Title"] === "SOFTWARE ENGINEER 1") {
            return `SOFTWARE ENGINEER 1 (${emp["PLC/PC"]})`;
          }
          return emp["Job Title"];
        })
      ),
    ].sort();

    // Create sheet for each job title
    for (const jobTitle of uniqueJobTitles) {
      let filteredEmployees;

      if (jobTitle.includes("SOFTWARE ENGINEER 1")) {
        const plcpc = jobTitle.includes("PLC") ? "PLC" : "PC";
        filteredEmployees = employeeData.filter(
          (emp) =>
            emp["Job Title"] === "SOFTWARE ENGINEER 1" &&
            emp["PLC/PC"] === plcpc
        );
      } else {
        filteredEmployees = employeeData.filter(
          (emp) => emp["Job Title"] === jobTitle
        );
      }

      // Get required courses for this job title
      const requiredCourses = getRequiredCoursesByJobTitle(
        jobTitle,
        jobTitle.includes("SOFTWARE ENGINEER 1")
          ? jobTitle.includes("PLC")
            ? "PLC"
            : "PC"
          : null
      );

      await createSheet(workbook, jobTitle, filteredEmployees, requiredCourses);
    }

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Training_Report_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    showDialog("Error exporting to Excel. Please try again.", "error");
  }
}

async function createSheet(workbook, sheetName, employees, courseColumns) {
  const worksheet = workbook.addWorksheet(sheetName);

  // Set up headers
  const headers = [
    "Employee ID",
    "Employee Name",
    "Department",
    "Job Title",
    "Email Address",
    "PLC/PC",
    ...courseColumns,
  ];

  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  employees.forEach((employee) => {
    const rowData = [
      employee["Employee ID"],
      employee["Employee Name"],
      employee["Department"],
      employee["Job Title"],
      employee["Email Address"],
      employee["PLC/PC"] || "",
    ];

    // Add training hours for each course
    courseColumns.forEach((course) => {
      const trainingRecord = trainingData.find(
        (t) => t.Emp_ID === employee["Employee ID"] && t.Course_Title === course
      );
      rowData.push(
        trainingRecord ? trainingRecord.Training_Duration_Hours : "-"
      );
    });

    worksheet.addRow(rowData);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50); // Cap width at 50 characters
  });

  // Freeze top row
  worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
}

function updatePagination(filteredEmployees) {
  const totalItems = filteredEmployees.length;
  totalPages = Math.ceil(totalItems / pageSize);

  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return filteredEmployees.slice(startIndex, endIndex);
}

function setupPaginationListeners() {
  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      generateDetailedTable();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      generateDetailedTable();
    }
  });

  document.getElementById("pageSize").addEventListener("change", (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    generateDetailedTable();
  });
}

function filterEmployeesByJobTitle(employees, jobTitle) {
  if (!jobTitle) return employees;
  return employees.filter((emp) => emp["Job Title"] === jobTitle);
}

function populateJobTitleDropdown() {
  if (!employeeData) return;

  const jobTitleDropdown = document.getElementById("jobTitleFilter");

  const uniqueJobTitles = [
    ...new Set(employeeData.map((emp) => emp["Job Title"])),
  ].sort();

  jobTitleDropdown.innerHTML = '<option value="">All</option>';

  uniqueJobTitles.forEach((title) => {
    const option = document.createElement("option");
    option.value = title;
    option.textContent = title;
    jobTitleDropdown.appendChild(option);
  });
}

// Update the filter function to handle the new table structure
function setupFilterListener() {
  document.getElementById("jobTitleFilter").addEventListener("change", () => {
    // Clear the table body immediately when dropdown changes
    const tbody = document.getElementById("resultTable").querySelector("tbody");
    tbody.innerHTML = "";

    currentPage = 1; // Reset to first page when filter changes
    generateDetailedTable();
  });
}

export {
  generateDetailedTable,
  exportToExcel,
  updatePagination,
  getRequiredCoursesByJobTitle,
};
