import { useEffect, useState } from "react";
import Checkbox from "../components/Checkbox";
import Button from "../components/Button";
import NumberSelector from "../components/NumberSelector";
import { List, ListItem, Alert, Card, Accordion } from "flowbite-react";
import TextInput from "../components/TextInput";
import { HiArrowCircleRight, HiCheckCircle, HiInformationCircle, HiStar, HiXCircle } from "react-icons/hi";
import RadioButtons from "../components/RadioButtons";
import MyCheckbox from "../components/Checkbox";

export default function SettingsView(props) {
    const setSettings = props.setSettings;
    const initialSettings = props.initialSettings;

    const [useWeighted, setUseWeighted] = useState(initialSettings.useWeighted !== undefined ? initialSettings.useWeighted : true);
    const [allowAssignmentToNonWishedWorkshop, setAllowAssignmentToNonWishedWorkshop] = useState(initialSettings.allowAssignmentToNonWishedWorkshop !== undefined ? initialSettings.allowAssignmentToNonWishedWorkshop : false);
    const [numberOfRequestedAssignments, setNumberOfRequestedAssignments] = useState(initialSettings.numberOfRequestedAssignments !== undefined ? initialSettings.numberOfRequestedAssignments : 3);
    const [numberOfWorkshopsPerParticipant, setNumberOfWorkshopsPerParticipant] = useState(initialSettings.numberOfWorkshopsPerParticipant !== undefined ? initialSettings.numberOfWorkshopsPerParticipant : 1);
    const [allowSameWorkshopTwice, setAllowSameWorkshopTwice] = useState(initialSettings.allowSameWorkshopTwice !== undefined ? initialSettings.allowSameWorkshopTwice : false);
    const [allowSecondWorkshopBeforeFirstFilled, setAllowSecondWorkshopBeforeFirstFilled] = useState(initialSettings.allowSecondWorkshopBeforeFirstFilled !== undefined ? initialSettings.allowSecondWorkshopBeforeFirstFilled : false);
    const [randomSeed, setRandomSeed] = useState(initialSettings.randomSeed !== undefined ? initialSettings.randomSeed : "");

    const [selectedAlgorithm, setSelectedAlgorithm] = useState(initialSettings.selectedAlgorithm !== undefined ? initialSettings.selectedAlgorithm : "min-cost-max-flow");

    useEffect(() => {
        setSettings(oldSettings => { return {
            useWeighted: useWeighted,
            allowAssignmentToNonWishedWorkshop: allowAssignmentToNonWishedWorkshop,
            numberOfWishesPerParticipant: oldSettings.numberOfWishesPerParticipant,
            numberOfRequestedAssignments: numberOfRequestedAssignments,
            numberOfWorkshopsPerParticipant: numberOfWorkshopsPerParticipant,
            allowSameWorkshopTwice: allowSameWorkshopTwice,
            allowSecondWorkshopBeforeFirstFilled: allowSecondWorkshopBeforeFirstFilled,
            randomSeed: randomSeed,
            selectedAlgorithm: selectedAlgorithm,
        }})
    }, [useWeighted, allowAssignmentToNonWishedWorkshop, numberOfRequestedAssignments, numberOfWorkshopsPerParticipant, allowSameWorkshopTwice, allowSecondWorkshopBeforeFirstFilled, randomSeed, selectedAlgorithm, setSettings]);

    const minCostMaxFlowPopoverContent = (<div className="flex flex-col gap-4 m-4 max-w-lg">
        <h6 className="text-left text-sm font-semibold text-gray-800 dark:text-white">
            Min-Cost-Max-Flow (empfohlen)
        </h6>
        <List>
            <ListItem icon={HiStar} className="text-green-700 dark:text-green-400 text-left font-bold">
                Der Algorithmus ist fair: alle optimalen Einteilungen sind gleich wahrscheinlich
            </ListItem>
            <hr />
            <ListItem icon={HiArrowCircleRight} className="dark:text-gray-200">
                Der Algorithmus stellt immer genau eine Einteilung zur Verfügung
            </ListItem>
            <ListItem icon={HiCheckCircle} className="text-green-700 dark:text-green-400">
                Er wählt garantiert die (eine) beste Einteilung aus
            </ListItem>
            <ListItem icon={HiCheckCircle} className="text-green-700 dark:text-green-400">
                Unter allen optimalen Einteilungen wählt er zufällig (gleichverteilt!) eine aus
            </ListItem>
            <ListItem icon={HiCheckCircle} className="text-green-700 dark:text-green-400">
                Wenn nicht alle Teilnehmer zugeteilt werden können, werden so viele Teilnehmer wie möglich zugeteilt
            </ListItem>
            <ListItem icon={HiXCircle} className="text-red-700 dark:text-red-400">
                Es stehen weniger Einstellungen zur Verfügung als bei SCIP
            </ListItem>
            <ListItem icon={HiCheckCircle} className="text-green-700 dark:text-green-400">
                Der Algorithmus ist gut getestet, robust und schnell
            </ListItem>
            <ListItem icon={HiArrowCircleRight} className="text-left dark:text-gray-200">
                Der Algorithmus wird empfohlen, wenn nicht die speziellen Einstellungen von SCIP benötigt werden
            </ListItem>
        </List>
        <span className="text-sm">Mathematischer Hintergrund: Ein maximales Matching wird durch "successive shortest paths" gefunden.</span>
    </div>);

    const scipPopoverContent = (<div className="flex flex-col gap-4 m-4 max-w-lg">
        <h6 className="text-left text-sm font-semibold text-gray-800 dark:text-white">
            SCIP
        </h6>
        <List>
            <ListItem icon={HiStar} className="text-green-700 dark:text-green-400 text-left font-bold">
                Es können pro Teilnehmer mehrere Workshops zugeteilt werden (z.B. einer für Vormittags und einer für Nachmittags)
            </ListItem>
            <hr />
            <ListItem icon={HiArrowCircleRight} className="dark:text-gray-200">
                Der Algorithmus stellt mehrere Einteilungen zur Verfügung
            </ListItem>
            <ListItem icon={HiCheckCircle} className="text-green-700 dark:text-green-400">
                Wenn nicht alle Teilnehmer zugeteilt werden können, werden so viele Teilnehmer wie möglich zugeteilt
            </ListItem>
            <ListItem icon={HiXCircle} className="text-red-700 dark:text-red-400">
                Er verwendet Zufall, aber garantiert nicht, dass die optimale Einteilung gleichverteilt ausgewählt wird
            </ListItem>
            <ListItem icon={HiXCircle} className="text-red-700 dark:text-red-400">
                Der Algorithmus ist noch nicht so gut getestet wie Min-Cost-Max-Flow und evtl. langsamer
            </ListItem>
        </List>
        <span className="text-sm">Mathematischer Hintergrund: Die Einteilung wird als ILP modelliert und mit <a href="https://www.scipopt.org/" target="_blank" rel="noopener noreferrer">SCIP</a> gelöst.</span>
    </div>);

    return (
    <>
        <div className="flex flex-col items-start items-stretch gap-5">
            <Card>
                <h6 className="text-left text-lg font-semibold text-gray-800 dark:text-white">
                    Allgemeine Einstellungen
                </h6>
                <Checkbox title="Wünsche als gewichtet betrachten"
                    details="Wenn diese Option gesetzt ist, werden die Wünsche der Teilnehmer gewichtet. Die Gewichtung
                    erfolgt klassisch über Erstwunsch, Zweitwunsch, usw.
                    Wenn die Option nicht gesetzt wird, werden alle Wünsch gleichberechtigt behandelt."
                    checked={useWeighted}
                    onChange={(e) => setUseWeighted(e.target.checked)}></Checkbox>
                <Checkbox title="Einteilung in nicht gewünschte Workshops zulassen"
                    details="Wenn diese Option gesetzt ist, können Teilnehmer vom Algorithmus in Workshops eingeteilt werden, die sie überhaupt nicht
                    gewählt haben. Das wird allerdings erst gemacht, wenn es unbedingt notwendig ist. Wenn die Option nicht gesetzt ist, werden
                    die Teilnehmer in einem solchen Fall überhaupt nicht zugeteilt."
                    checked={allowAssignmentToNonWishedWorkshop}
                    onChange={(e) => setAllowAssignmentToNonWishedWorkshop(e.target.checked)}></Checkbox>
            </Card>

            <Accordion collapseAll>
                <Accordion.Panel>
                    <Accordion.Title>
                        Erweiterte Einstellungen
                    </Accordion.Title>
                    <Accordion.Content>
                        <div className="flex flex-col gap-4">
                            <Alert color="indigo" icon={HiInformationCircle} className="text-left dark:bg-indigo-900 dark:text-indigo-100">
                                Hier können erweiterte Einstellungen vorgenommen werden, die für die meisten Anwendungsfälle nicht relevant sind. Es wird empfohlen, die Standardeinstellungen zu verwenden, es sei denn, es besteht ein spezieller Bedarf.
                            </Alert>
                            <Card>
                                <h6 className="text-left text-lg font-semibold text-gray-800 dark:text-white">
                                    Einteilungs-Algorithmus
                                </h6>
                                <div className="flex w-100 gap-3 flex-wrap">
                                    <div className="flex-auto flex flex-warp gap-8">
                                        <RadioButtons
                                            options={[
                                                { id: 'min-cost-max-flow', name: 'algorithm', value: 'min-cost-max-flow', label: 'Min-Cost-Max-Flow (empfohlen)', popover: minCostMaxFlowPopoverContent },
                                                { id: 'scip', name: 'algorithm', value: 'scip', label: 'SCIP', popover: scipPopoverContent }
                                            ]}
                                            selectedOption={selectedAlgorithm}
                                            setSelectedOption={setSelectedAlgorithm}
                                            className="max-w-md shrink-0"
                                        />
                                        <div className="flex flex-col gap-3">
                                            <Alert color="indigo" icon={HiInformationCircle} className="text-left dark:bg-indigo-900 dark:text-indigo-100">
                                                Die Wahl des Algorithmus beeinflusst, welche Einstellungen unten zur Verfügung stehen.
                                            </Alert>
                                            <Alert color="yellow" icon={HiInformationCircle} className="text-left dark:bg-gray-700 dark:text-yellow-300">
                                                Das Ergebnis (d.h. die Definition einer "optimalen Einteilung") unterscheidet sich aktuell zwischen den beiden Algorithmen und ist (noch) nicht konfigurierbar.
                                                Min-Cost-Max-Flow verwendet eine konvexe (quadratische) Kostenfunktion, während SCIP eine lineare Kostenfunktion verwendet.
                                                Deshalb liefern die beiden Algorithmen möglicherweise sehr unterschiedliche Ergebnisse.
                                            </Alert>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <Card>
                                <h6 className="text-left text-sm font-semibold text-gray-800 dark:text-white mb-2">
                                    Min-Cost-Max-Flow-spezifische Einstellungen
                                </h6>
                                <span className="text-left text-xs">Bisher keine Einstellungen verfügbar.</span>
                            </Card>
                            <Card>
                                <h6 className="text-left text-sm font-semibold text-gray-800 dark:text-white mb-2">
                                    SCIP-spezifische Einstellungen
                                </h6>
                                <div className="flex items-center justify-start gap-8">
                                    <NumberSelector
                                        disabled={selectedAlgorithm !== "scip"}
                                        text="Anzahl der Workshop-Phasen"
                                        placeholder="Teilnehmer werden in so viele Workshops eingeteilt"
                                        details="Zum Beispiel: Für einen Workshop am Vormittag und einen am Nachmittag hier 2 eintragen."
                                        value={numberOfWorkshopsPerParticipant}
                                        setValue={(valueFn) => {
                                            const newVal = Number(valueFn(numberOfWorkshopsPerParticipant));
                                            if (1 <= newVal && newVal <= 5) {
                                                setNumberOfWorkshopsPerParticipant(newVal);
                                            }
                                        }}
                                    ></NumberSelector>
                                    <div className="flex flex-col gap-3">
                                        <MyCheckbox
                                            disabled={selectedAlgorithm !== "scip"}
                                            title="Zuerst erste Phase auffüllen, dann zweite Phase, usw."
                                            details="Wenn diese Option nicht gesetzt ist, kann es passieren, dass ein Teilnehmer in mehreren Phasen einen Workshop erhält, während ein anderer noch gar nicht zugewiesen wurde."
                                            checked={!allowSecondWorkshopBeforeFirstFilled}
                                            onChange={(e) => setAllowSecondWorkshopBeforeFirstFilled(!e.target.checked)}></MyCheckbox>
                                        <MyCheckbox
                                            disabled={selectedAlgorithm !== "scip"}
                                            title="Mehrfache Einteilung in denselben Workshop erlauben"
                                            details="Wenn diese Option gesetzt ist, können einzelne Teilnehmer mehrmals in denselben Workshop eingeteilt werden."
                                            checked={allowSameWorkshopTwice}
                                            onChange={(e) => setAllowSameWorkshopTwice(e.target.checked)}></MyCheckbox>
                                    </div>
                                </div>
                                <hr className="my-3"/>
                                <div className="flex items-center gap-12">
                                    <NumberSelector
                                        className="shrink-0"
                                        disabled={selectedAlgorithm !== "scip"}
                                        text="Anzahl der angefragten Einteilungen"
                                        placeholder="Verschiedene alternative Einteilungen berechnen"
                                        details="Es kann immer sein, dass weniger Einteilungen ausgegeben werden."
                                        value={numberOfRequestedAssignments}
                                        setValue={(valueFn) => {
                                            const newVal = Number(valueFn(numberOfRequestedAssignments));
                                            if (1 <= newVal && newVal <= 15) {
                                                setNumberOfRequestedAssignments(newVal);
                                            }
                                        }}
                                    ></NumberSelector>
                                    <div className="flex flex-col">
                                        <TextInput
                                            color="indigo"
                                            id="randomSeed"
                                            disabled={selectedAlgorithm !== "scip"}
                                            className="dark:bg-gray-700"
                                            placeholder="Seed für Pseudo-Zufallszahlen"
                                            value={randomSeed}
                                            onChange={(e) => {
                                                setRandomSeed(e.target.value);
                                            }}
                                        ></TextInput>
                                        <p labelFor="randomSeed" className={"ms-2 mt-1 text-xs font-normal text-gray-500 dark:text-gray-300" + (selectedAlgorithm !== "scip" ? " select-none" : "")}>{
                                                "Wenn der Algorithmus zufällige Entscheidungen zwischen gleichwertigen Optionen treffen muss, kann hier ein Seed für die Zufallszahlengenerierung eingegeben werden. " + 
                                                "Bei gleichem Seed wird immer die gleiche Einteilung ausgegeben. Im Normalfall sollte dieses Feld leer gelassen werden."
                                            }</p>
                                    </div>
                                </div>
                                
                            </Card>
                        </div>

                    </Accordion.Content>
                </Accordion.Panel>
            </Accordion>
        </div>

        <div className="self-end flex flex-col items-center justify-center gap-4">
            <Button disabled={props.isLoading} disabledWithloading={props.isLoading} onClick={props.sendData}>
                {!props.isLoading ? "Gruppen jetzt einteilen" : "Gruppen werden eingeteilt..."}
            </Button>
        </div>
    </>);
}
