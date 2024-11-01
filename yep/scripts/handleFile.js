import { showDialog } from "./utils.js";

let trainingData = null;
let employeeData = null;

function saveToSessionStorage(trainingData, employeeData) {
  try {
    sessionStorage.setItem("trainingData", JSON.stringify(trainingData));
    sessionStorage.setItem("employeeData", JSON.stringify(employeeData));
    showToast("Data saved to session storage", "success");
  } catch (error) {
    console.error("Error saving to session storage:", error);
    showToast("Error saving data to session", "error");
  }
}

function loadFromSessionStorage() {
  try {
    const savedTrainingData = sessionStorage.getItem("trainingData");
    const savedEmployeeData = sessionStorage.getItem("employeeData");

    if (savedTrainingData && savedEmployeeData) {
      trainingData = JSON.parse(savedTrainingData);
      employeeData = JSON.parse(savedEmployeeData);

      // Load file info and update UI for both files
      const trainingFileInfo = loadFileInfoFromSession("training");
      const employeeFileInfo = loadFileInfoFromSession("employee");

      if (trainingFileInfo) {
        updateFileInfoUI("training", trainingFileInfo);
        showToast("Training data restored from session", "info");
      }

      if (employeeFileInfo) {
        updateFileInfoUI("employee", employeeFileInfo);
        showToast("Employee data restored from session", "info");
        populateJobTitleFilter(); // Repopulate the job title filter
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error("Error loading from session storage:", error);
    showToast("Error loading saved data", "error");
    return false;
  }
}

async function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function handleTrainingFile(event) {
  const file = event.target.files[0];
  if (!file) {
    showDialog("No file selected", "error");
    return;
  }

  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];
  if (!validTypes.includes(file.type)) {
    showDialog("Please upload only .xlsx or .csv files!", "error");
    return;
  }

  const fileInfo = document.getElementById("trainingFileInfo");
  const fileName = document.getElementById("trainingFileName");
  const fileDetails = document.getElementById("trainingFileDetails");

  try {
    console.log("Reading training file:", file.name);
    trainingData = await readExcelFile(file);
    console.log("Training data loaded:", trainingData);

    if (!trainingData || trainingData.length === 0) {
      throw new Error("No data found in file");
    }

    if (employeeData) {
      saveToSessionStorage(trainingData, employeeData);
    }

    saveFileInfoToSession("training", file);
    showToast("Training file uploaded successfully!", "success");

    fileInfo.classList.remove("hidden");
    fileName.textContent = file.name;
    fileDetails.textContent = `${formatFileSize(file.size)} • ${file.type}`;
  } catch (error) {
    console.error("Error processing training file:", error);
    showToast(`Error uploading file: ${error.message}`, "error");
  }
}

async function handleEmployeeFile(event) {
  const file = event.target.files[0];
  if (!file) {
    showToast("No file selected", "error");
    return;
  }

  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];
  if (!validTypes.includes(file.type)) {
    showToast("Please upload only .xlsx or .csv files!", "error");
    return;
  }

  const fileInfo = document.getElementById("employeeFileInfo");
  const fileName = document.getElementById("employeeFileName");
  const fileDetails = document.getElementById("employeeFileDetails");

  try {
    console.log("Reading employee file:", file.name);
    employeeData = await readExcelFile(file);
    console.log("Employee data loaded:", employeeData);

    if (!employeeData || employeeData.length === 0) {
      throw new Error("No data found in file");
    }

    if (trainingData) {
      saveToSessionStorage(trainingData, employeeData);
    }

    saveFileInfoToSession("employee", file);
    showToast("Employee file uploaded successfully!", "success");

    fileInfo.classList.remove("hidden");
    fileName.textContent = file.name;
    fileDetails.textContent = `${formatFileSize(file.size)} • ${file.type}`;
    populateJobTitleFilter();
  } catch (error) {
    console.error("Error processing employee file:", error);
    showToast(`Error uploading employee file: ${error.message}`, "error");
  }
}

function clearFiles() {
  // Clear data variables
  trainingData = null;
  employeeData = null;
  sessionStorage.clear();

  // Clear file inputs
  document.getElementById("trainingFile").value = "";
  document.getElementById("employeeFile").value = "";

  // Hide file info sections
  document.getElementById("trainingFileInfo").classList.add("hidden");
  document.getElementById("employeeFileInfo").classList.add("hidden");

  // Clear detailed table
  const resultTable = document.getElementById("resultTable");
  if (resultTable) {
    const tbody = resultTable.querySelector("tbody");
    const thead = resultTable.querySelector("thead");
    if (tbody) tbody.innerHTML = "";
    if (thead) thead.innerHTML = "";
  }

  // Clear summary table
  const summaryTable = document.getElementById("summaryTable");
  if (summaryTable) {
    const tbody = summaryTable.querySelector("tbody");
    const thead = summaryTable.querySelector("thead");
    if (tbody) tbody.innerHTML = "";
    if (thead) thead.innerHTML = "";
  }

  // Clear and destroy pie chart
  const pieChartCanvas = document.getElementById("summaryChart");
  if (pieChartCanvas) {
    const existingPieChart = Chart.getChart(pieChartCanvas);
    if (existingPieChart) {
      existingPieChart.destroy();
    }
  }

  // Clear and destroy completion chart
  const completionChartCanvas = document.getElementById("completionChart");
  if (completionChartCanvas) {
    const existingCompletionChart = Chart.getChart(completionChartCanvas);
    if (existingCompletionChart) {
      existingCompletionChart.destroy();
    }
  }

  // Disable generate table button
  const generateButton = document.getElementById("generateTable");
  if (generateButton) {
    generateButton.disabled = true;
  }

  // Clear job title filter
  const jobTitleFilter = document.getElementById("jobTitleFilter");
  if (jobTitleFilter) {
    jobTitleFilter.innerHTML = '<option value="">All</option>';
  }

  // Hide all containers
  const containersToHide = [
    "detailedTableContainer",
    "summaryTableContainer",
    "pieChartContainer",
    "completionChartContainer",
  ];

  containersToHide.forEach((containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.classList.add("hidden");
    }
  });

  showToast("All files and data have been cleared", "info");
}

function populateJobTitleFilter() {
  if (!employeeData) return;

  const jobTitleDropdown = document.getElementById("jobTitleFilter");

  // Get unique job titles with special handling for SOFTWARE ENGINEER 1
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

  // Clear existing options and add "All" option
  jobTitleDropdown.innerHTML = '<option value="">All</option>';

  // Add job titles to dropdown
  uniqueJobTitles.forEach((title) => {
    const option = document.createElement("option");
    option.value = title;
    option.textContent = title;
    jobTitleDropdown.appendChild(option);
  });
}

function showToast(message, type = "info") {
  // Get or create toast container
  const toastContainer =
    document.getElementById("toastContainer") || createToastContainer();

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type} animate-slideIn`;

  // Set icon based on type
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  // Create toast content
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  // Add toast to container
  toastContainer.appendChild(toast);

  // Remove toast after delay
  setTimeout(() => {
    toast.classList.add("animate-slideOut");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

function saveFileInfoToSession(type, fileInfo) {
  try {
    // Save file metadata to session storage
    const fileData = {
      name: fileInfo.name,
      size: fileInfo.size,
      type: fileInfo.type,
      lastModified: fileInfo.lastModified,
      isVisible: true,
    };

    // Store in session storage
    sessionStorage.setItem(`${type}FileInfo`, JSON.stringify(fileData));

    // Update UI elements
    const fileInfoElement = document.getElementById(`${type}FileInfo`);
    const fileName = document.getElementById(`${type}FileName`);
    const fileDetails = document.getElementById(`${type}FileDetails`);

    if (fileInfoElement && fileName && fileDetails) {
      fileInfoElement.classList.remove("hidden");
      fileName.textContent = fileInfo.name;
      fileDetails.textContent = `${formatFileSize(fileInfo.size)} • ${
        fileInfo.type
      }`;
    }

    // Show success toast
    showToast(
      `${type.charAt(0).toUpperCase() + type.slice(1)} file info saved`,
      "success"
    );
  } catch (error) {
    console.error(`Error saving ${type} file info to session:`, error);
    showToast(`Error saving file info: ${error.message}`, "error");
  }
}

// Helper function to load file info (used in DOMContentLoaded)
function loadFileInfoFromSession(type) {
  try {
    const fileInfo = sessionStorage.getItem(`${type}FileInfo`);
    return fileInfo ? JSON.parse(fileInfo) : null;
  } catch (error) {
    console.error(`Error loading ${type} file info from session:`, error);
    showToast(`Error loading file info: ${error.message}`, "error");
    return null;
  }
}

// Helper function to update UI elements for file info
function updateFileInfoUI(type, fileInfo) {
  const fileInfoElement = document.getElementById(`${type}FileInfo`);
  const fileName = document.getElementById(`${type}FileName`);
  const fileDetails = document.getElementById(`${type}FileDetails`);

  if (fileInfoElement && fileName && fileDetails) {
    fileInfoElement.classList.remove("hidden");
    fileName.textContent = fileInfo.name;
    fileDetails.textContent = `${formatFileSize(fileInfo.size)} • ${
      fileInfo.type
    }`;
  }
}

// Add event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Try to load data from session storage
  if (loadFromSessionStorage()) {
    console.log("Data loaded from session storage");

    // If both files are loaded, enable the generate table button
    if (trainingData && employeeData) {
      const generateButton = document.getElementById("generateTable");
      if (generateButton) {
        generateButton.disabled = false;
      }
    }
  } else {
    console.log("No saved data found in session storage");
  }

  // Add other event listeners
  document
    .getElementById("trainingFile")
    .addEventListener("change", handleTrainingFile);
  document
    .getElementById("employeeFile")
    .addEventListener("change", handleEmployeeFile);
  document.getElementById("clearExcel").addEventListener("click", clearFiles);
});

export {
  handleTrainingFile,
  handleEmployeeFile,
  clearFiles,
  trainingData,
  employeeData,
  populateJobTitleFilter,
};
