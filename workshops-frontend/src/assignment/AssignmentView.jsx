import { Progress, Table } from "flowbite-react";
import { useState } from "react";
import Button from "../components/Button";
import { exportExcel } from "../exportExcel";
import DoughnutChart from "../components/DoughnutChart";
import { useTheme } from "../ThemeContext";
import BarChart from "../components/BarChart";

// Orientation: https://coolors.co/48b420-36a776-278cb8-174de2-893f94-cd3e64-911d3c
const WishesColorShades = [
    'rgb(79 70 229)', // indigo-600
    'oklch(71.5% 0.143 215.221)',
    'oklch(69.6% 0.17 162.48)',
    'oklch(76.8% 0.233 130.85)',
    'oklch(55.8% 0.288 302.321)',
    'oklch(66.7% 0.295 322.15)',
    'oklch(44.4% 0.177 26.899)', // not wished
    'oklch(55.2% 0.016 285.938)' // not assigned
];

export default function AssignmentView(props) {
    const problemSolution = props.solution;
    const participants = props.participants || [];
    const workshops = props.workshops || [];
    const settings = props.settings || {};

    const numberOfWorkshopsPerParticipant = Math.max(...problemSolution.map(ass => ass.length - 1));

    const [isExportLoading, setExportLoading] = useState(false);

    const exportExcelSync = () => {
        setExportLoading(true);
        exportExcel(getAssignmentTableRows(), numberOfWorkshopsPerParticipant, workshops);
        setExportLoading(false);
    };

    const getAssignmentTableRows = () => {
        let rows = problemSolution;
        // Parsed names that are just numbers should be converted to strings again
        rows = rows.map((assignment) => {
            return assignment.map((value, index) => typeof value === "number" ? String(value) : value);
        });
        rows = rows.sort((ass1, ass2) => ass1[0].localeCompare(ass2[0]));
        rows = rows.map((assignment, index) => {
            const participantName = assignment[0] || "";
            const participant = participants.find(p => p.name === participantName);

            const columns = Array.from({ length: numberOfWorkshopsPerParticipant }, (_, i) => {
                let wishNr = participant?.wishes.findIndex(w => w === assignment[i + 1]) + 1 || -1;

                // if wished for with preference e.g. 4 but currently only 3 are used accoring to numWishesPerParticipant
                if (wishNr > settings.numberOfWishesPerParticipant) {
                    // TODO hier könnte man einen sinnvollen Kommentar hinterlassen.
                    wishNr = -1;
                }

                const comment = wishNr !== -1 ? wishNr + ". Wunsch" : "wurde nicht gewünscht";

                const assignedWorkshop = assignment[i + 1];
                const isAssigned = assignedWorkshop !== "none" && assignedWorkshop !== null;

                return {
                    isAssigned: isAssigned,
                    comment: comment,
                    assignedWorkshop: assignedWorkshop
                }
            });

            return {
                key: index,
                name: participantName,
                columns: columns
            };
        });
        return rows;
    };

    const { isDarkMode } = useTheme();

    let extraLabels = ["nicht eingeteilt"];
    let extraColors = [WishesColorShades[WishesColorShades.length - 1]];
    if (settings.allowAssignmentToNonWishedWorkshop) {
        extraLabels = ["nicht gewünscht", "nicht eingeteilt"];
        extraColors = [WishesColorShades[WishesColorShades.length - 2], WishesColorShades[WishesColorShades.length - 1]];
    }

    const getFullfilledWishesChartData = () => {
        if (settings.numberOfWishesPerParticipant === undefined) {
            return [];
        }

        const colors = WishesColorShades.slice(0, settings.numberOfWishesPerParticipant).concat(extraColors);

        const defaultDatasetEntry = () => ({
            label: "Anzahl Teilnehmer",
            data: Array(settings.numberOfWishesPerParticipant + extraColors.length).fill(0),
            backgroundColor: colors,
            borderColor: isDarkMode ? 'rgb(31 41 55)' : 'white', // default card background
            borderWidth: 1,
        });

        let dataset = Array(numberOfWorkshopsPerParticipant).fill({}).map(() => defaultDatasetEntry());

        if (numberOfWorkshopsPerParticipant > 1) {
            for (let j = 0; j < dataset.length; j++) {
                dataset[j].label += " (Phase " + (j + 1) + ")";
            }
        }

        for (let i = 0; i < problemSolution.length; i++) {
            const assignment = problemSolution[i];
            const participantName = assignment[0] || "";
            const participant = participants.find(p => p.name === participantName);
            if (!participant) continue;

            for (let j = 0; j < numberOfWorkshopsPerParticipant; j++) {
                const assignedWorkshop = assignment[j + 1];
                if (assignedWorkshop) {
                    if (assignedWorkshop !== "none") {
                        const wishNr = participant.wishes.findIndex(w => w === assignedWorkshop);
                        if (wishNr !== -1 && wishNr < settings.numberOfWishesPerParticipant) {
                            dataset[j].data[wishNr]++;
                        }
                        if (wishNr === -1 && settings.allowAssignmentToNonWishedWorkshop) {
                            dataset[j].data[settings.numberOfWishesPerParticipant]++;
                        }
                    } else {
                        const indexShift = settings.allowAssignmentToNonWishedWorkshop ? 1 : 0;
                        dataset[j].data[settings.numberOfWishesPerParticipant + indexShift]++;
                    }
                }
            }
        }
        return dataset;
    }

    const getWorkshopSize = (workshopName) => {
        let count = 0;
        for (let i = 0; i < problemSolution.length; i++) {
            const assignment = problemSolution[i];
            for (let j = 1; j < assignment.length; j++) {
                if (assignment[j] === workshopName) {
                    count++;
                }
            }
        }
        return count;
    }

    const getWorkshopDistributionData = () => {
        const data = workshops.map(workshop => getWorkshopSize(workshop.name) || 0);
        return [{
            label: "Anzahl Teilnehmer",
            data: data.concat([participants.length - data.reduce((a, b) => a + b, 0)]),
            backgroundColor: 'rgb(79 70 229)', // indigo-600
            borderWidth: 0,
        }];
    }

    const getWorkshopDistributionDataBreakdownWishes = () => {
        if (settings.numberOfWishesPerParticipant === undefined) {
            return [];
        }

        let extraColors = [WishesColorShades[WishesColorShades.length - 2]];
        const colors = WishesColorShades.slice(0, settings.numberOfWishesPerParticipant).concat(extraColors);

        const defaultDatasetEntry = (i) => ({
            label: i === settings.numberOfWishesPerParticipant ? "Nicht gewünscht" : `Durch ${i + 1}. Wunsch`,
            data: Array(workshops.length + 1).fill(0),
            backgroundColor: colors[i],
            borderColor: isDarkMode ? 'rgb(31 41 55)' : 'white', // default card background
            borderWidth: 1,
        });

        let dataset = Array(settings.numberOfWishesPerParticipant + 1).fill({}).map((_, i) => defaultDatasetEntry(i));

        for (let i = 0; i < problemSolution.length; i++) {
            const assignment = problemSolution[i];
            const participantName = assignment[0] || "";
            const participant = participants.find(p => p.name === participantName);
            if (!participant) continue;

            for (let j = 0; j < numberOfWorkshopsPerParticipant; j++) {
                const assignedWorkshop = assignment[j + 1];
                if (assignedWorkshop) {
                    if (assignedWorkshop !== "none") {
                        const wishNr = participant.wishes.findIndex(w => w === assignedWorkshop);
                        if (wishNr !== -1) {
                            dataset[wishNr].data[workshops.findIndex(w => w.name === assignedWorkshop)]++;
                        }
                    } else {
                        dataset[settings.numberOfWishesPerParticipant].data[workshops.length]++;
                    }
                }
            }
        }

        dataset = dataset.filter(d => d.data.some(value => value > 0));

        return dataset;
    }

    return (
        <div className="mt-3 flex flex-col items-stretch">
            {/* <Card className="rounded-xl bg-slate-100 dark:bg-gray-700 p-3 items-center justify-between mb-2"> */}
            <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
                <DoughnutChart
                    title={"Erfüllte Wünsche"}
                    helpText={"Zeigt an, wie viele Teilnehmer ihren 1., 2., 3. Wunsch etc. erfüllt bekommen haben."}
                    labels={['1. Wunsch', '2. Wunsch', '3. Wunsch', '4. Wunsch', '5. Wunsch', '6. Wunsch'].slice(0, settings.numberOfWishesPerParticipant).concat(extraLabels)}
                    datasets={getFullfilledWishesChartData()}
                >
                </DoughnutChart>

                <BarChart
                    title={"Absolute Auslastung der Workshops"}
                    labels={props.workshops.map(workshop => workshop.name).concat(["nicht eingeteilt"])}
                    datasets={getWorkshopDistributionData()}
                    datasetsBreakdown={getWorkshopDistributionDataBreakdownWishes()}
                />

                <div style={{ minWidth: "350px", minHeight: "430px", maxHeight: "430px" }}
                    className="overflow-hidden overflow-y-auto border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md md:rounded-lg">
                    <Table className="divide-y divide-gray-200 dark:divide-gray-700" hoverable={true}>
                        <thead>
                            <tr>
                                <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Workshop</td>
                                <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">relative Auslastung</td>
                            </tr>
                        </thead>
                        <Table.Body>
                            {props.workshops.map(workshop => (
                                <Table.Row key={workshop.id}>
                                    <Table.Cell className="px-2 py-2 text-center text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                        {workshop.name}
                                    </Table.Cell>
                                    <Table.Cell className="px-2 py-2 text-center text-sm whitespace-nowrap">
                                        {getWorkshopSize(workshop.name)} / {workshop.capacity} ({Math.round(100 * (getWorkshopSize(workshop.name) || 0) / (workshop.capacity || 1))}%)
                                        <Progress size="md" color="indigo"
                                            progress={100 * (getWorkshopSize(workshop.name) || 0) / (workshop.capacity || 1)} />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <span>
                    <Button
                        disable={isExportLoading} disabledWithloading={isExportLoading}
                        onClick={() => exportExcelSync()}
                        bgColor="bg-green-800 focus:ring-green-200">Als Excel-Datei herunterladen</Button>
                </span>
            </div>
            <div className="mt-2">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                    <Table className="divide-y divide-gray-200 dark:divide-gray-700" hoverable={true}>
                        <thead>
                            <tr>
                                <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Teilnehmer nach Alphabet sortiert</td>
                                {Array.from({ length: numberOfWorkshopsPerParticipant }, (_, i) => (
                                    <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">{numberOfWorkshopsPerParticipant > 1 ? "Phase " + (i + 1) : "Workshop"}</td>
                                ))}
                                {/* <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">entspricht Wunsch</td> */}
                            </tr>
                        </thead>
                        <Table.Body>
                            {getAssignmentTableRows().map(assignment => {
                                return (<Table.Row key={assignment.key}>
                                    <Table.Cell className="px-2 py-2 text-center text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                        {assignment.name}
                                    </Table.Cell>
                                    {assignment.columns.map((column, i) => (
                                        <Table.Cell key={i} className="px-2 py-2 text-center text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                            {column.isAssigned ?
                                                (<div className="flex flex-col text-center">
                                                    <span>{column.assignedWorkshop}</span>
                                                    <span className="text-xs text-gray-500">{column.comment}</span>
                                                </div>)
                                                : "nicht eingeteilt"}
                                        </Table.Cell>))}
                                    {/* <Table.Cell className="px-2 py-2 text-center text-sm whitespace-nowrap">
                                            <p>{wishNr > 0 ? wishNr + ". Wunsch" : "Wurde nicht gewünscht"}</p>
                                        </Table.Cell> */}
                                </Table.Row>);
                            })}
                        </Table.Body>
                    </Table>
                </div>
            </div>
            {/* </Card> */}
        </div>
    );
}
