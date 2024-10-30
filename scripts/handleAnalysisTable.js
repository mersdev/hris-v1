import { trainingData, employeeData } from "./handleFile.js";
import { getRequiredCoursesByJobTitle } from "./handleDetailedTable.js";

function generateSummaryTable() {
  if (!trainingData || !employeeData) {
    alert("Please upload both training and employee files first.");
    return;
  }

  const summaryTable = document.getElementById("summaryTable");
  const thead = summaryTable.querySelector("thead");
  const tbody = summaryTable.querySelector("tbody");

  // Clear existing table content
  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Create header
  thead.innerHTML = `
    <tr class="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase bg-gray-50">
      <th class="px-4 py-3 border border-gray-200">Job Title</th>
      <th class="px-4 py-3 border border-gray-200">No. of Participants</th>
      <th class="px-4 py-3 border border-gray-200">Completion Rate</th>
    </tr>
  `;

  // Get unique job titles (handling SOFTWARE ENGINEER 1 special case)
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

  // Store data for chart
  const chartData = {
    labels: [],
    participants: [],
    completionRates: [],
  };

  // Calculate statistics for each job title
  uniqueJobTitles.forEach((jobTitle) => {
    let employees;
    let requiredCourses;

    // Handle SOFTWARE ENGINEER 1 special case
    if (jobTitle.includes("SOFTWARE ENGINEER 1")) {
      const plcpc = jobTitle.includes("PLC") ? "PLC" : "PC";
      employees = employeeData.filter(
        (emp) =>
          emp["Job Title"] === "SOFTWARE ENGINEER 1" && emp["PLC/PC"] === plcpc
      );
      requiredCourses = getRequiredCoursesByJobTitle(jobTitle, plcpc);
    } else {
      employees = employeeData.filter((emp) => emp["Job Title"] === jobTitle);
      requiredCourses = getRequiredCoursesByJobTitle(jobTitle);
    }

    const numParticipants = employees.length;

    // Calculate completion rate
    let totalCompletions = 0;
    employees.forEach((employee) => {
      let completedCourses = 0;
      requiredCourses.forEach((course) => {
        const completed = trainingData.some(
          (t) =>
            t.Emp_ID === employee["Employee ID"] && t.Course_Title === course
        );
        if (completed) completedCourses++;
      });
      totalCompletions += completedCourses;
    });

    const totalRequired = numParticipants * requiredCourses.length;
    const completionRate =
      totalRequired > 0
        ? ((totalCompletions / totalRequired) * 100).toFixed(1)
        : "0.0";

    // Store data for chart
    chartData.labels.push(jobTitle);
    chartData.participants.push(numParticipants);
    chartData.completionRates.push(parseFloat(completionRate));

    // Create table row
    const row = tbody.insertRow();
    row.innerHTML = `
      <td class="px-4 py-3 text-sm border border-gray-200">${jobTitle}</td>
      <td class="px-4 py-3 text-sm border border-gray-200">${numParticipants}</td>
      <td class="px-4 py-3 text-sm border border-gray-200">${completionRate}%</td>
    `;
  });

  // Generate charts
  generateSummaryCharts(chartData);
}

function generateSummaryCharts(data) {
  // Destroy existing charts if they exist
  const existingChart = Chart.getChart("summaryChart");
  if (existingChart) {
    existingChart.destroy();
  }

  // Create new chart
  const ctx = document.getElementById("summaryChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: data.labels,
      datasets: [
        {
          data: data.completionRates,
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: true,
          text: "Training Completion Rates by Job Title",
          font: {
            size: 16,
            weight: "bold",
          },
          padding: {
            top: 10,
            bottom: 30,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              return `${label}: ${value.toFixed(1)}% Completion`;
            },
          },
        },
      },
    },
  });
}

export { generateSummaryTable };
