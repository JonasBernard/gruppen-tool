import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Card, Popover, ToggleSwitch } from 'flowbite-react';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function BarChart(props) {
    const [useBreakdown, setUseBreakdown] = useState(false);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: false,
                text: props.title,
            },
        },
        maintainAspectRatio: false,
        borderRadius: 8,
    };

    const data = {
        labels: props.labels,
        datasets: (useBreakdown ? props.datasetsBreakdown : props.datasets).map((dataset, index) => ({
            ...dataset,
            // additional options
        }))
    };

    return (<Card className="max-w-lg w-full" style={{ height: "430px" }}>
        <div className="h-full flex flex-col gap-4">
            <div class="flex justify-between items-start w-full">
                <div class="flex flex-col justify-between items-start w-full gap-3">
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
                    <ToggleSwitch className="self-end" color="indigo" checked={useBreakdown} label="Wünsche aufschlüsseln" onChange={setUseBreakdown} />
                </div>
            </div>
            <div id="chart-container" className="relative h-full"style={{ minHeight: "300px", minWidth: "300px" }}>
                <Bar options={options} data={data} />
            </div>
        </div>

    </Card>);
}
