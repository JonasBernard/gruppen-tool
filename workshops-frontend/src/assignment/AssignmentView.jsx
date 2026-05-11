import { Table } from "flowbite-react";
import Button from "../components/Button";
import { exportExcel } from "../exportExcel";

export default function AssignmentView(props) {
    let problemSolution = props.solution;
    let participants = props.participants || [];

    const asssignedParticipants = problemSolution.map(ass => ass[0]);
    const unassignedParticipants = participants.filter(participant => !(asssignedParticipants.includes(participant.name))).map(k => k.name);

    const wLength = Math.max(...problemSolution.map(ass => ass.length - 1));

    return (
        <div className="mt-3 flex flex-col items-stretch">
            {/* <Card className="rounded-xl bg-slate-100 dark:bg-gray-700 p-3 items-center justify-between mb-2"> */}
                <div className="flex items-center justify-between">
                    <span>Teilnehmer nach Alphabet sortiert:</span>
                    <span>
                        <Button 
                        onClick={() => exportExcel(problemSolution, unassignedParticipants)}
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
                                        <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Workshop{wLength > 1 ? " " + (i + 1) : ""}</td>
                                    ))}
                                    {/* <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">entspricht Wunsch</td> */}
                                </tr>
                            </thead>
                            <Table.Body>
                                {problemSolution.sort((ass1, ass2) => ass1[0].localeCompare(ass2[0])).map(assignment => {
                                    return (<Table.Row key={assignment[0]}>
                                        <Table.Cell className="px-2 py-2 text-center text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                            {assignment[0]}
                                        </Table.Cell>
                                        {Array.from({ length: wLength }, (_, i) => {
                                            let wishNr = participants.find(p => p.name === assignment[0])?.wishes.findIndex(w => w === assignment[i + 1]) + 1 || -1;

                                            let comment = wishNr !== -1 ? wishNr + ". Wunsch" : "wurde nicht gewünscht";
                                            
                                            return (<Table.Cell key={i} className="px-2 py-2 text-center text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                {assignment[i + 1] !== "none" && assignment[i + 1] !== null ? 
                                                    (<div className="flex flex-col text-center">
                                                        <span>{assignment[i + 1]}</span>
                                                        <span className="text-xs text-gray-500">{comment}</span>
                                                    </div>)
                                                : "nicht eingeteilt"}
                                            </Table.Cell>);
                                        })}
                                        {/* <Table.Cell className="px-2 py-2 text-center text-sm whitespace-nowrap">
                                            <p>{wishNr > 0 ? wishNr + ". Wunsch" : "Wurde nicht gewünscht"}</p>
                                        </Table.Cell> */}
                                    </Table.Row>);
                                })}
                            </Table.Body>
                        </Table>
                    </div>
                </div>
                <div className="mt-8">
                    Zugeteilt wurden: {asssignedParticipants.join(", ") || "Niemand"} ({asssignedParticipants.length})
                    <br /><br />
                    Nicht zugeteilt wurden: {unassignedParticipants.join(", ") || "Niemand"} ({unassignedParticipants.length})
                </div>
            {/* </Card> */}
        </div>
        );
}
