import {
  handleTrainingFile,
  handleEmployeeFile,
  clearFiles,
} from "./handleFile.js";

import { generateDetailedTable, exportToExcel } from "./handleDetailedTable.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize file upload handlers
  document
    .getElementById("trainingFile")
    .addEventListener("change", handleTrainingFile);
  document
    .getElementById("employeeFile")
    .addEventListener("change", handleEmployeeFile);

  // Clear files button
  document.getElementById("clearExcel").addEventListener("click", clearFiles);

  document
    .getElementById("generateTable")
    .addEventListener("click", generateDetailedTable);

  // Export to Excel button
  document
    .getElementById("exportExcel")
    .addEventListener("click", exportToExcel);
});
