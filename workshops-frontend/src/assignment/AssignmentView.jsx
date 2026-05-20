import { Table } from "flowbite-react";
import { useState } from "react";
import Button from "../components/Button";
import { exportExcel } from "../exportExcel";

export default function AssignmentView(props) {
    let problemSolution = props.solution;
    let participants = props.participants || [];
    let workshops = props.workshops || [];

    const wLength = Math.max(...problemSolution.map(ass => ass.length - 1));

    const [isExportLoading, setExportLoading] = useState(false);

    const exportExcelSync = () => {
        setExportLoading(true);
        exportExcel(getAssignmentTableRows(), wLength, workshops);
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

            const columns =Array.from({ length: wLength }, (_, i) => {
                let wishNr = participants.find(p => p.name === participantName)?.wishes.findIndex(w => w === assignment[i + 1]) + 1 || -1;
                
                // if wished for with preference e.g. 4 but currently only 3 are used accoring to numWishesPerParticipant
                if (wishNr > wLength+1) {
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

    return (
        <div className="mt-3 flex flex-col items-stretch">
            {/* <Card className="rounded-xl bg-slate-100 dark:bg-gray-700 p-3 items-center justify-between mb-2"> */}
                <div className="flex items-center justify-between">
                    <span>Teilnehmer nach Alphabet sortiert:</span>
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
                                    <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Teilnehmer</td>
                                    {Array.from({ length: wLength }, (_, i) => (
                                        <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">{wLength > 1 ? "Phase " + (i + 1) : "Workshop"}</td>
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
