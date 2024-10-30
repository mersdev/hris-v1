function saveFileInfoToSession(type, fileInfo) {
  try {
    sessionStorage.setItem(
      `${type}FileInfo`,
      JSON.stringify({
        name: fileInfo.name,
        size: fileInfo.size,
        type: fileInfo.type,
        isVisible: true,
      })
    );
  } catch (error) {
    console.error(`Error saving ${type} file info to session:`, error);
  }
}

function loadFileInfoFromSession(type) {
  try {
    const fileInfo = sessionStorage.getItem(`${type}FileInfo`);
    return fileInfo ? JSON.parse(fileInfo) : null;
  } catch (error) {
    console.error(`Error loading ${type} file info from session:`, error);
    return null;
  }
}

async function handleTrainingFile(event) {
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

    showToast("File uploaded successfully!", "success");

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

function showToast(message, type = "info") {
  const toastContainer =
    document.getElementById("toastContainer") || createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast ${type} animate-slideIn`;

  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  toastContainer.appendChild(toast);

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

function clearFiles() {
  trainingData = null;
  employeeData = null;
  sessionStorage.clear();

  document.getElementById("trainingFile").value = "";
  document.getElementById("employeeFile").value = "";

  document.getElementById("trainingFileInfo").classList.add("hidden");
  document.getElementById("employeeFileInfo").classList.add("hidden");

  document.getElementById("resultTable").querySelector("tbody").innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
  if (loadFromSessionStorage()) {
    const trainingFileInfo = loadFileInfoFromSession("training");
    if (trainingFileInfo && trainingData) {
      const fileInfo = document.getElementById("trainingFileInfo");
      const fileName = document.getElementById("trainingFileName");
      const fileDetails = document.getElementById("trainingFileDetails");

      fileInfo.classList.remove("hidden");
      fileName.textContent = trainingFileInfo.name;
      fileDetails.textContent = `${formatFileSize(trainingFileInfo.size)} • ${
        trainingFileInfo.type
      }`;
    }

    const employeeFileInfo = loadFileInfoFromSession("employee");
    if (employeeFileInfo && employeeData) {
      const fileInfo = document.getElementById("employeeFileInfo");
      const fileName = document.getElementById("employeeFileName");
      const fileDetails = document.getElementById("employeeFileDetails");

      fileInfo.classList.remove("hidden");
      fileName.textContent = employeeFileInfo.name;
      fileDetails.textContent = `${formatFileSize(employeeFileInfo.size)} • ${
        employeeFileInfo.type
      }`;
      populateJobTitleFilter();
    }
  }
});

export {
  handleTrainingFile,
  handleEmployeeFile,
  showToast,
  clearFiles,
  trainingData,
  employeeData,
};
