"use client";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryPerformanceChart = ({ data }) => {
  const colors = [
    "rgba(59, 130, 246, 0.8)", // Blue
    "rgba(16, 185, 129, 0.8)", // Green
    "rgba(245, 158, 11, 0.8)", // Yellow
    "rgba(239, 68, 68, 0.8)", // Red
    "rgba(139, 92, 246, 0.8)", // Purple
    "rgba(236, 72, 153, 0.8)", // Pink
    "rgba(14, 165, 233, 0.8)", // Light Blue
    "rgba(34, 197, 94, 0.8)", // Emerald
  ];

  const borderColors = [
    "rgb(59, 130, 246)",
    "rgb(16, 185, 129)",
    "rgb(245, 158, 11)",
    "rgb(239, 68, 68)",
    "rgb(139, 92, 246)",
    "rgb(236, 72, 153)",
    "rgb(14, 165, 233)",
    "rgb(34, 197, 94)",
  ];

  const chartData = {
    labels: data.map((item) => item.name || item._id),
    datasets: [
      {
        label: "Courses",
        data: data.map((item) => item.count || item.courses),
        backgroundColor: colors.slice(0, data.length),
        borderColor: borderColors.slice(0, data.length),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} courses (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default CategoryPerformanceChart;
