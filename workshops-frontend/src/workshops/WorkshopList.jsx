import { useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import Button from "../components/Button";
import TextInputWithAutocomplete from "../components/TextInputWithAutocomplete";
import NumberInput from "../components/NumberInput";
import { HiOutlineCheck, HiOutlinePencil, HiOutlinePlus, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { Popover } from "flowbite-react";
import { useConfirm } from "../components/useConfirm";

export default function Workshoplist(props) {
    const participants = props.participants;
    const setParticipants = props.setParticipants;
    const workshops = props.workshops;
    const setWorkshops = props.setWorkshops;

    const [newName, setNewName] = useState('');
    const [newCapa, setNewCapa] = useState(0);

    const nameInputRef = useRef(null);

    const [modalElementAdjustParticipantWishes, confirmParticipantWishes] = useConfirm(
        "Du hast den Workshop umbenannt. Sollen die Wünsche der Teilnehmer entsprechend angepasst werden?", 
        "Ja, Wünsche anpassen",
        "Nein, Wünsche nicht anpassen",
        (oldName, newName) => {
            if (!participants || participants.length === 0) {
                return;
            }
            participants.forEach(participant => {
                participant.wishes = participant.wishes.map(wish => wish === oldName ? newName : wish);
            });
            setParticipants([...participants]);
        }
    );

    const addWorkshop = () => {
        let name = newName.trim();
        if (name === "") {
            name = "Workshop " + (workshops.length + 1);
        }
        
        setWorkshops([
            {id: uuidv4(), "name": name, "capacity": newCapa},
            ...workshops
        ]);
        setNewCapa(0);
        setNewName('');

        nameInputRef.current.focus();
    }

    const removeWorkshop = (id) => {
        setWorkshops(workshops.filter(w => w.id !== id));
    }

    const editWorkshopName = (id, name) => {
        const workshop = workshops.find(w => w.id === id);
        if (workshop) {
            if (!workshop.editsMade) {
                workshop.editsMade = {};
            }
            workshop.editsMade.name = name;
            setWorkshops([...workshops]);
        }
    }

    const editWorkshopCapacity = (id, capacity) => {
        const workshop = workshops.find(w => w.id === id);
        if (workshop) {
            if (!workshop.editsMade) {
                workshop.editsMade = {};
            }
            workshop.editsMade.capacity = capacity;
            setWorkshops([...workshops]);
        }
    }

    const confirmEdit = () => {
        for (const workshop of workshops) {
            if (workshop.editable) {
                if (!workshop.editsMade) {
                    continue;
                }
                if (workshop.editsMade.name !== undefined) {
                    let name = workshop.editsMade.name.trim();
                    if (name === "") {
                        name = "[ohne Name]";
                    }

                    if (workshop.name !== name && participants && participants.length > 0) {
                        confirmParticipantWishes(workshop.name, name);
                    }
                    workshop.name = name;
                }
                if (workshop.editsMade.capacity !== undefined) {
                    workshop.capacity = workshop.editsMade.capacity;
                    if (Number.isNaN(workshop.capacity)) {
                        workshop.capacity = 0;
                    }
                }
                delete workshop.editsMade;
            }
        }
        setWorkshops([...workshops]);
    }

    const setEditable = (id, editable) => {
        const workshop = workshops.find(w => w.id === id);
        if (workshop) {
            if (editable === true)
                workshop.editable = true;
            else {
                delete workshop.editable;
                delete workshop.editsMade;
            }
            setWorkshops([...workshops]);
        }
    }

    const renderNonEditableWorkshopRow = (workshop) => {
        return (<tr key={workshop.id}>
            <td className="px-2 py-2 text-sm font-medium text-center whitespace-nowrap">
                <h2 className="font-medium text-gray-800 dark:text-white">{workshop.name}</h2>
            </td>
            <td className={"px-2 py-2 text-sm text-center whitespace-nowrap"}>
                {workshop.capacity}
            </td>

            <td className="px-2 py-2 text-sm text-center whitespace-nowrap flex justify-center">
                <Popover 
                    content={<span className="font-medium m-4">Bearbeiten</span>}
                    aria-labelledby="default-popover"
                    placement="bottom"
                    trigger="hover">
                        <div>
                            <Button
                            className="bg-indigo-500 focus:ring-indigo-300 dark:bg-indigo-600 hover:bg-indigo-400 hover:dark:bg-indigo-500 dark:text-stone-100 px-0 rounded-r-none"
                            onClick={() => setEditable(workshop.id, true)}>
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
                                onClick={() => removeWorkshop(workshop.id)}>
                                <HiOutlineTrash className="h-5 w-5" />
                            </Button>
                        </div>
                </Popover>
            </td>
        </tr>);
    }

    const renderEditableWorkshopRow = (workshop) => {
        return (<tr key={workshop.id}>
            <td className="p-1">
                <TextInputWithAutocomplete extraStyle="rounded-none" placeholder="Name des Workshops" value={workshop.editsMade?.name !== undefined ? workshop.editsMade?.name : workshop.name} onChange={e => editWorkshopName(workshop.id, e.target.value)}/>
            </td>
            <td className="p-1">
                <NumberInput extraStyle="rounded-none" 
                    placeholder="Kapazität" 
                    value={workshop.editsMade?.capacity !== undefined ? workshop.editsMade?.capacity : workshop.capacity} 
                    onChange={e => editWorkshopCapacity(workshop.id, parseInt(e.target.value))}
                />
            </td>
            <td className="p-2 text-sm text-center whitespace-nowrap flex justify-center">
                <Popover 
                    content={<span className="font-medium m-4">Fertig</span>}
                    aria-labelledby="default-popover"
                    placement="bottom"
                    trigger="hover">
                        <div>
                            <Button
                            className="bg-indigo-500 focus:ring-indigo-300 dark:bg-indigo-600 hover:bg-indigo-400 hover:dark:bg-indigo-500 dark:text-stone-100 px-0 rounded-r-none"
                            onClick={() => {confirmEdit(); setEditable(workshop.id, false)}}>
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
                                onClick={() => setEditable(workshop.id, false)}>
                                <HiOutlineX className="h-5 w-5" />
                            </Button>
                        </div>
                </Popover>
            </td>
        </tr>);
    }

    return (
        <>
            <section className="container px-4 mx-auto">
                {/* <h2 className="text-lg font-medium text-gray-800 dark:text-white">Workshops</h2> */}
                <p className="mt-1 text-sm text-center text-gray-500 dark:text-gray-300">
                    Füge die Workshops hinzu, die es gibt.
                </p>
                <div className="flex flex-col mt-6">
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
                                                Kapazität
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                                                Aktionen
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900 dark:bg-opacity-40">
                                    <tr>
                                        <td className="p-1">
                                            <TextInputWithAutocomplete extraStyle="rounded-none" placeholder="Name des Workshops" ref={nameInputRef} value={newName} onChange={e => setNewName(e.target.value)}/>
                                        </td>
                                        <td className="p-1">
                                            <NumberInput extraStyle="rounded-none"
                                                placeholder="Wie viele Teilnehmer kann der Workshop aufnehmen?"
                                                value={newCapa} onChange={e => setNewCapa(parseInt(e.target.value) || 0)}
                                                onKeyDown={(e) => ((e.key === 'Tab' && !e.shiftKey) || e.key === 'Enter' ) && (e.preventDefault() || addWorkshop())}
                                            />
                                        </td>
                                        <td className="p-2 text-sm text-center whitespace-nowrap">
                                            <Button onClick={() => addWorkshop()}>
                                                <HiOutlinePlus className="h-5 w-5 mr-2" /> Hinzufügen
                                            </Button>
                                        </td>
                                    </tr>
                                    {workshops.map(w => (
                                        (w.editable) ? renderEditableWorkshopRow(w) : renderNonEditableWorkshopRow(w)
                                    ))}
                                    {workshops.length > 0 && <tr className="text-gray-500 dark:text-gray-400 text-sm">
                                        <td className="p-1 text-center">
                                            <span>Anzahl Workshops: {workshops.length}</span>
                                        </td>
                                        <td className="p-1 text-center">
                                            <span>Gesamte Kapazität: {workshops.reduce((a,b) => a + b.capacity, 0)}</span>
                                        </td>
                                        <td></td>
                                    </tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {modalElementAdjustParticipantWishes}
        </>
    );
} 