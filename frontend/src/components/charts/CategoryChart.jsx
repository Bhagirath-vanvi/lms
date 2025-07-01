import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ data }) => {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#F97316", // orange
  ];

  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export default CategoryChart;
