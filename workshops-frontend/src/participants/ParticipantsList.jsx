import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import Button from "../components/Button";
import TextInputWithAutocomplete from "../components/TextInputWithAutocomplete";
import ImportExcelModal from "./importExcelModal";
import NumberSelector from "../components/NumberSelector";
import ImportJSONModal from "./importJSONModal";
import { useConfirm } from "../components/useConfirm";
import { HiOutlineCheck, HiOutlineDocumentAdd, HiOutlinePencil, HiOutlinePlus, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { Dropdown, Popover } from "flowbite-react";
import { useTheme } from "../Navbar";

export default function ParticipantsList(props) {
    const participants = props.participants;
    const setParticipants = props.setParticipants;
    const workshopNames = props.workshopNames;

    const setSettings = props.setSettings;
    const initialSettings = props.initialSettings;

    const MAX_WISH_COUNT = 6;
    const DEFAULT_WISH_COUNT = 3;

    const [wishCount, setWishCount] = useState(initialSettings.numberOfWishesPerParticipant !== undefined ? initialSettings.numberOfWishesPerParticipant : DEFAULT_WISH_COUNT);

    useEffect(() => {
        setSettings(oldSettings => { return {
            ...oldSettings, 
            numberOfWishesPerParticipant: wishCount,

        }})
    }, [wishCount, setSettings]);

    const [newName, setNewName] = useState('');
    const [newWishList, setNewWishList] = useState([...Array(MAX_WISH_COUNT).fill('')]);

    const nameInputRef = useRef(null);

    const [, isDarkMode, ] = useTheme();

    const addParticipant = () => {
        let name = newName.trim();
        if (name === "") {
            name = "Teilnehmer " + (participants.length + 1);
        }

        let wishes = newWishList; // Data from the form
        while (wishes.length < MAX_WISH_COUNT) {
            wishes.push("");
        }
        while (wishes.length > MAX_WISH_COUNT) {
            wishes.pop();
        }

        wishes = wishes.map(w => w.trim());

        setParticipants([
            {"id": uuidv4(), "name": name, "wishes": wishes},
            ...participants
        ]);
        setNewWishList([...Array(MAX_WISH_COUNT).fill('')]);
        setNewName('');

        nameInputRef.current.focus();
    }

    const removeParticipant = (id) => {
        setParticipants(participants.filter(k => k.id !== id));
    }

    const updateWish = (index, wish) => {
        const newlist = newWishList.map((a,j) => j === index ? wish : a);
        setNewWishList(newlist);
    }

    const editWishOfParticipant = (id, index, wish) => {
        const participant = participants.find(k => k.id === id);
        if (participant) {
            if (!participant.editsMade) {
                participant.editsMade = {};
            }
            if (!participant.editsMade.wishes) {
                participant.editsMade = participant.wishes ? {wishes: [...participant.wishes]} : {wishes: []};
            }
            participant.editsMade.wishes[index] = wish;
            setParticipants([...participants]);
        }
    }

    const editParticipantName = (id, name) => {
        const participant = participants.find(k => k.id === id);
        if (participant) {
            if (!participant.editsMade) {
                participant.editsMade = {};
            }
            participant.editsMade.name = name;
            setParticipants([...participants]);
        }
    }

    const confirmEdit = () => {
        for (const participant of participants) {
            if (participant.editable) {
                if (!participant.editsMade) {
                    continue;
                }
                if (participant.editsMade.name !== undefined) {
                    let name = participant.editsMade.name.trim();
                    if (name === "") {
                        name = "[ohne Name]";
                    }
                    participant.name = name;
                }
                if (participant.editsMade.wishes !== undefined) {
                    participant.wishes = participant.editsMade.wishes;
                }
                delete participant.editsMade;
            }
        }
        setParticipants([...participants]);
    }

    const setEditable = (id, editable) => {
        const participant = participants.find(k => k.id === id);
        if (participant) {
            if (editable === true)
                participant.editable = true;
            else
                delete participant.editable;
                delete participant.editsMade;
            setParticipants([...participants]);
        }
    }

    const [modalElementClearParticipants, askConfirmationClearParticipants] = useConfirm(
        "Möchtest du alle Teilnehmer aus der Tabelle entfernen?",
        "Ja, Tabelle leeren", 
        "Nein, abbrechen", 
        () => {setParticipants([])}
    );

    const renderNonEditableParticipantRow = (participant) => {
        return (<tr key={participant.id}>
            <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                <h2 className="font-medium text-gray-800 dark:text-white text-center">{participant.name}</h2>
            </td>
            {[...Array(wishCount)].map((x, i) => {
                return <td key={i} className={"px-2 py-2 text-sm text-center whitespace-nowrap"}>
                    <span className={((workshopNames.includes(participant.wishes[i]) || participant.wishes[i] === "" || participant.wishes[i] === null || participant.wishes[i] === undefined) ? "" : "px-4 py-1 rounded-xl bg-yellow-500 text-black")}>
                        {participant.wishes[i]}
                    </span>
                </td>
            })}

            <td className="px-2 py-2 text-sm text-center whitespace-nowrap flex justify-center">
                <Popover 
                    content={<span className="font-medium m-4">Bearbeiten</span>}
                    aria-labelledby="default-popover"
                    placement="bottom"
                    trigger="hover">
                        <div>
                            <Button
                            className="bg-indigo-500 focus:ring-indigo-300 dark:bg-indigo-600 hover:bg-indigo-400 hover:dark:bg-indigo-500 dark:text-stone-100 px-0 rounded-r-none"
                            onClick={() => setEditable(participant.id, true)}>
                            <HiOutlinePencil className="h-5 w-5" />
                        </Button>         
                        </div>
                </Popover>    
                <Popover 
                    content={<span className="font-medium m-4">Löschen</span>}
                    aria-labelledby="default-popover"
                    placement="bottom"
                    trigger="hover">
                        <div>
                            <Button
                                className="bg-red-500 focus:ring-red-300 dark:bg-rose-600 hover:bg-red-400 hover:dark:bg-rose-500 dark:text-stone-100 px-0 rounded-l-none"
                                onClick={() => removeParticipant(participant.id)}>
                                <HiOutlineTrash className="h-5 w-5" />
                            </Button>
                        </div>
                </Popover>
            </td>
        </tr>);
    }

    const renderEditableParticipantRow = (participant) => {
        return (<tr>
            <td className="p-1">
                <TextInputWithAutocomplete extraStyle="rounded-none" placeholder="Name des Teilnehmers" value={participant.editsMade?.name !== undefined ? participant.editsMade?.name : participant.name} onChange={e => editParticipantName(participant.id, e.target.value)}/>
            </td>
            {[...Array(wishCount)].map((x, i) => {
                return <td className="p-1" key={i}>
                    <div className="flex justify-center">
                        {/* <TextInputWithAutocomplete
                            key={i}
                            extraStyle="rounded-none" placeholder={i+1 + ". Wunsch"}
                            value={participant.editsMade?.wishes?.[i] || participant.wishes[i]}
                            onChange={e => editWishOfParticipant(participant.id, i, e.target.value)}
                            onKeyDown={(e, trAuoCom) => (i === wishCount-1 && (e.key === 'Enter') && !trAuoCom) && (e.preventDefault() || setEditable(participant.id, false))}
                            autocomplete={workshopNames}
                            autocompleteSetValue={value => editWishOfParticipant(participant.id, i, value)}
                        /> */}
                        <Dropdown color={isDarkMode ? "dark" : "indigo"} placement="center" label={participant.editsMade?.wishes?.[i] !== undefined ? participant.editsMade?.wishes?.[i] : participant.wishes[i]}>
                            {workshopNames.map(workshop => (
                                <Dropdown.Item key={workshop} onClick={() => editWishOfParticipant(participant.id, i, workshop)}>
                                    {workshop}
                                </Dropdown.Item>
                            ))}
                            <Dropdown.Item onClick={() => editWishOfParticipant(participant.id, i, "")}>
                                [Kein Wunsch]
                            </Dropdown.Item>
                        </Dropdown>
                    </div>
                </td>
            })}
            <td className="p-2 text-sm text-center whitespace-nowrap flex justify-center">
                <Popover 
                    content={<span className="font-medium m-4">Fertig</span>}
                    aria-labelledby="default-popover"
                    placement="bottom"
                    trigger="hover">
                        <div>
                            <Button
                            className="bg-indigo-500 focus:ring-indigo-300 dark:bg-indigo-600 hover:bg-indigo-400 hover:dark:bg-indigo-500 dark:text-stone-100 px-0 rounded-r-none"
                            onClick={() => {confirmEdit(); setEditable(participant.id, false)}}>
                            <HiOutlineCheck className="h-5 w-5" />
                        </Button>         
                        </div>
                </Popover>    
                <Popover 
                    content={<span className="font-medium m-4">Abbrechen</span>}
                    aria-labelledby="default-popover"
                    placement="bottom"
                    trigger="hover">
                        <div>
                            <Button
                                className="bg-red-500 focus:ring-red-300 dark:bg-rose-600 hover:bg-red-400 hover:dark:bg-rose-500 dark:text-stone-100 px-0 rounded-l-none"
                                onClick={() => setEditable(participant.id, false)}>
                                <HiOutlineX className="h-5 w-5" />
                            </Button>
                        </div>
                </Popover>
            </td>
        </tr>);
    }

    return (
            <section className="container px-4 mx-auto">
                {/* <h2 className="text-lg font-medium text-gray-800 dark:text-white">Teilnehmer</h2> */}

                <div className="flex justify-between items-center">
                    <p className="ml-3 mt-1 text-sm text-gray-500 dark:text-gray-300">
                        Füge die Teilnehmer und ihre Wünsche hinzu.
                    
                        Workshops, die es in der Workshopliste nicht gibt, werden
                        <span className="mx-1 px-2 py-1 rounded-xl bg-yellow-500 text-black text-nowrap">
                            in gelb
                        </span>
                        markiert.
                    </p>
                    <span>
                        <NumberSelector
                            text="Anzahl der Wünsche pro Teilnehmer"
                            placeholder="Festlegen der Wünsche pro Teilnehmer über Plus und Minus"
                            value={wishCount}
                            setValue={(valueFn) => {
                                const newVal = Number(valueFn(wishCount));
                                if (1 <= newVal && newVal <= MAX_WISH_COUNT) {
                                    setWishCount(newVal);
                                }
                            }}
                        ></NumberSelector>
                    </span>
                </div>

                <div className="flex mt-4 justify-end">
                    { process.env.NODE_ENV !== 'production' && 
                        <div className="mr-3">
                            <ImportJSONModal onImportParticipants={(data) => {
                                setParticipants([
                                    ...data,
                                    ...participants
                                ]);
                            }}
                            wishCount={wishCount}
                            maxWishCount={MAX_WISH_COUNT}
                            workshopNames={workshopNames}>
                                Aus JSON-Datei importieren (Debug-Funktion)
                            </ImportJSONModal>
                        </div>
                    }
                    <ImportExcelModal onImportParticipants={(data) => {
                        setParticipants([
                            ...data,
                            ...participants
                        ]);
                    }}
                    wishCount={wishCount}
                    maxWishCount={MAX_WISH_COUNT}
                    workshopNames={workshopNames}>
                        <HiOutlineDocumentAdd className="mr-2 h-5 w-5" /> Aus Excel-Datei importieren
                    </ImportExcelModal>
                    <Button
                        onClick={askConfirmationClearParticipants}
                        bgColor="bg-red-500 focus:ring-red-300 dark:bg-rose-600 dark:text-stone-100 p-2"
                        className="rounded-l-none"
                    >
                        <HiOutlineTrash className="mr-2 h-5 w-5" /> Tabelle leeren
                    </Button>
                    {modalElementClearParticipants}
                </div>

                <div className="flex flex-col mt-4">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">

                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th scope="col" className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Name
                                            </th>

                                            <th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Erst-Wunsch
                                            </th>

                                            {wishCount >= 2 ? (<th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Zweit-Wunsch
                                            </th>) : <></>}

                                            {wishCount >= 3 ? (<th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Dritt-Wunsch
                                            </th>) : <></>}

                                            {wishCount >= 4 ? (<th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Viert-Wunsch
                                            </th>) : <></>}

                                            {wishCount >= 5 ? (<th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Fünft-Wunsch
                                            </th>) : <></>}

                                            {wishCount >= 6 ? (<th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Sechst-Wunsch
                                            </th>) : <></>}

                                            <th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Aktionen
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900 dark:bg-opacity-40">
                                    
                                    <tr>
                                        <td className="p-1">
                                            <TextInputWithAutocomplete extraStyle="rounded-none" placeholder="Name des Teilnehmers" ref={nameInputRef} value={newName} onChange={e => setNewName(e.target.value)}/>
                                        </td>
                                        {[...Array(wishCount)].map((x, i) => {
                                            return <td className="p-1" key={i}>
                                                {/* <TextInputWithAutocomplete
                                                    key={i}
                                                    extraStyle="rounded-none" placeholder={i+1 + ". Wunsch"} 
                                                    value={newWishList[i]}
                                                    onChange={e => updateWish(i, e.target.value)}
                                                    onKeyDown={(e, trAuoCom) => (i === wishCount-1 && (e.key === 'Enter') && !trAuoCom) && (e.preventDefault() || addParticipant())}
                                                    autocomplete={workshopNames}
                                                    autocompleteSetValue={value => updateWish(i, value)}
                                                /> */}
                                                <div className="flex justify-center">
                                                    <Dropdown color={isDarkMode ? "dark" : "indigo"} placement="center" label={newWishList[i]}>
                                                        {workshopNames.map(workshop => (
                                                            <Dropdown.Item key={workshop} onClick={() => updateWish(i, workshop)}>
                                                                {workshop}
                                                            </Dropdown.Item>
                                                        ))}
                                                        <Dropdown.Item onClick={() => updateWish(i, "")}>
                                                            [Kein Wunsch]
                                                        </Dropdown.Item>
                                                    </Dropdown>
                                                </div>
                                            </td>
                                        })}
                                        <td className="p-2 text-sm text-center whitespace-nowrap">
                                            <Button onClick={() => addParticipant()}>
                                                <HiOutlinePlus className="h-5 w-5 mr-2" /> Hinzufügen
                                            </Button>
                                        </td>
                                    </tr>

                                    {participants.map(k => (
                                        (k.editable) ? renderEditableParticipantRow(k) : renderNonEditableParticipantRow(k)
                                    ))}

                                    {participants.length > 0 && <tr className="text-gray-500 dark:text-gray-400 text-sm">
                                        <td className="p-1 text-center">
                                            <span>Anzahl Teilnehmer: {participants.length}</span>
                                        </td>
                                        {[...Array(wishCount)].map((x, i) => {
                                        return <td className="p-1 text-center" key={i}>
                                            <span>Anzahl gesetzer Wünsche in dieser Spalte: {participants.reduce((a,b) => b.wishes[i] !== "" ? a + 1 : a, 0)}</span>
                                        </td>
                                        })}
                                        <td></td>
                                    </tr>}

                                    </tbody>
                                </table>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
    );
}