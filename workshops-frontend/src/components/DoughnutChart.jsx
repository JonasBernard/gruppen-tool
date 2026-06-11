import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Popover } from 'flowbite-react';
import { Doughnut } from 'react-chartjs-2';
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { Card } from 'flowbite-react';
import { useRef } from 'react';
import { useTheme } from '../ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart(props) {
  const chartRef = useRef(null);
  const { isDarkMode } = useTheme();

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? 'rgb(255 255 255)' : 'rgb(31 41 55)',
        }
      }
    },
  }

  const data = {
    labels: props.labels,
    datasets: props.datasets.map((dataset, index) => ({
      ...dataset,
      // additional options
    }))
  };


  return (
    <Card className="max-w-sm w-full">
      <div class="flex justify-between items-start w-full">
        <div class="flex-col items-center">
          <div class="flex items-center mb-1">
            <h5 class="text-xl font-semibold text-heading me-1">{props.title}</h5>
            {props.helpText && (
              <Popover 
                key="popover-1"
                content={
                  <div class="max-w-xs m-2">
                    <p class="text-sm text-gray-800 dark:text-gray-200">
                      {props.helpText}
                    </p>
                  </div>
                }
                aria-labelledby="default-popover"
                placement="right"
                trigger="hover">
                <div className="flex items-center gap-2">
                    <HiOutlineQuestionMarkCircle class="w-5 h-5" />
                </div>
            </Popover>
            )}
          </div>
        </div>
      </div>

      <Doughnut ref={chartRef} data={data} options={options} />
    </Card>
  );
}
