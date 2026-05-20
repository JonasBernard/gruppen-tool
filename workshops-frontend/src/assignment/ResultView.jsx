import AssignmentView from "./AssignmentView";
import { Accordion, Alert } from "flowbite-react";
import { HiClock, HiInformationCircle } from "react-icons/hi";

function interpretStatus(status) {
    switch (status) {
        case "no-perfect-solution": return "Es ist keine vollständige Einteilung möglich. Die Gesamtkapazität der Workshops reicht nicht aus oder es gibt andere Konflikte. Es wurden so viele Teilnehmer wie möglich zugeteilt."
        case "error-unknown": return "Es ist ein unbekannter Fehler aufgetreten. Es wurde eine Teillösung berechnet:"
        case "ok": return "Es wurde eine Einteilung gefunden. Falls es mehrere gleichwertige Einteilungen gab, wurde eine davon zufällig ausgewählt."
        case "unknown-status": return "Es wurde keine Nachricht zur Einteilung übermittelt."
        case "v2:ok": return "Es wurden verschiedene Einteilungen gefunden."
        case "v2:ok-single-unique": return "Es wurde eine Einteilung gefunden. Diese ist die einzige optimale Einteilung."
        case "v2:ok-single-requested": return "Es wurde eine Einteilung gefunden."
        case "v2:no-solution": return "Es ist keine Einteilung möglich. Es wurden keine Teilnehmer zugeteilt."
        case "v2:scip-exception": return "Es ist ein Fehler bei der Berechnung der Einteilung aufgetreten. Fehlermeldung: " + (status.message || "Keine Fehlermeldung vorhanden.")
        case "v2:infeasible": return "Es ist keine Einteilung möglich. Das ist unerwartet. Sollte der Fehler bestehen, nimm Kontakt per E-Mail auf. Die Adresse findest du unten auf der Seite."
        default: return "(Keine Nachricht zum Anzeigen verfügbar.)"
    }
}

export default function ResultView(props) {
    const result = props.result;

    if (!result) {
        return (<></>);
    }

    const status = result.status || "unknown-status";

    if (!result.solutions || result.solutions.length === 0) {
        return (
            <div>
                <Alert color="indigo" icon={HiInformationCircle} className="text-indigo-900 dark:bg-indigo-800 dark:text-indigo-100" dismissable={false}>{interpretStatus(status)}</Alert>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-stretch gap-3">
            <Alert color="indigo" icon={HiInformationCircle} className="text-indigo-900 dark:bg-indigo-800 dark:text-indigo-100" dismissable={false}>{interpretStatus(status)}</Alert>

            {result.solutions.length > 1 && (
                <Accordion>
                    {result.solutions.map((solution, i) => {
                        const problemSolution = result.solutions[i];
                        return (
                            <Accordion.Panel isOpen={false}>
                                <Accordion.Title>
                                 <span>
                                    Einteilung {i+1}
                                </span>
                            </Accordion.Title>
                            <Accordion.Content className="dark:bg-slate-800">
                                {displaySolution(problemSolution, result)}
                            </Accordion.Content>
                        </Accordion.Panel>
                )})}
            </Accordion>)}

            {result.solutions.length === 1 && displaySolution(result.solutions[0], result)}

            <Alert color="gray" icon={HiClock} className="text-gray-800 dark:bg-gray-800 dark:text-gray-100" dismissable={false}>{`Die Anfrage hat ${(result.processingTime / 1000.0).toLocaleString('de-DE')} Sekunden gedauert. Davon entfielen ${(Math.ceil(result.computation_time*100.0) / 100.0).toLocaleString('de-DE')} Sekunden für die eigentliche Berechnung.`}</Alert>
        </div>
    );
}

function displaySolution(solution, result) {
    return (<div className="flex flex-col items-stretch gap-3">
        {/* {solution.score && 
            <Card>
                <div className="flex flex-col max-w-24">
                    Score: {100 * solution.score.toFixed(2)}%
                    <Progress size="md" color="indigo"
                        progress={100 * solution.score} />
                </div>
            </Card>} */}
        <AssignmentView solution={solution.assignment} participants={result.participants} workshops={result.workshops} />
    </div>);
}