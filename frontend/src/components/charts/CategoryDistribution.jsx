import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CategoryDistribution = ({ data }) => {
  const colors = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(34, 197, 94, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(249, 115, 22, 0.8)",
  ];

  const chartData = {
    labels: data.map((item) => (item.name ? item.name : item.category)),
    datasets: [
      {
        label: "Courses",
        data: data.map((item) => (item.value ? item.value : item.count)),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors
          .slice(0, data.length)
          .map((color) => color.replace("0.8", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default CategoryDistribution;
