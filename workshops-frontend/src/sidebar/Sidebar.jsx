import { Alert, Sidebar, SidebarCollapse, SidebarItem, SidebarItemGroup, SidebarItems, SidebarLogo } from "flowbite-react";
import { useState } from "react";
import { HiChevronRight, HiColorSwatch, HiDownload, HiExclamation, HiExternalLink, HiMenu, HiOutlineTrash, HiOutlineUserGroup, HiOutlineUsers } from "react-icons/hi";
import Footer from "../Footer";
import { getExampleData10P, getExampleData50P } from "./exampleData";
import { useConfirm } from "../components/useConfirm";

export default function AppSidebar(props) {
    const [open, setOpen] = useState(false);

    const [modalElement, askConfirmation] = useConfirm(
        "Möchtest du wirklich Beispiel-Daten laden? Alle aktuellen Daten werden überschrieben.",
        "Ja, Daten laden",
        "Nein, doch nicht",
        (exampleVariant) => {
            let workshops, participants = [];
            if (exampleVariant === "10-participants") {
                [workshops, participants] = getExampleData10P();
            }
            if (exampleVariant === "50-participants") {
                [workshops, participants] = getExampleData50P();
            }
            props.setWorkshops(workshops);
            props.setParticipants(participants);
            props.resetTabToParticipants();
            setOpen(false);
        }
    );

    const [modalElementReset, askConfirmationReset] = useConfirm(
        "Möchtest du wirklich alle Workshops und alle Teilnehmer löschen?",
        "Ja, alles löschen",
        "Nein, doch nicht",
        () => {
            props.setWorkshops([]);
            props.setParticipants([]);
            setOpen(false);
        }
    );

    const getChannelName = () => {
        return process.env.REACT_APP_CHANNEL_FRIENDLY_NAME || "";
    };

    return (
        <>
            <div className={"shadow-lg fixed right-0 top-0 h-screen flex items-start transition-transform duration-300 ease-in-out " + (open ? "" : "translate-x-full")}>
                <Sidebar aria-label="Sidebar" style={{width:"min(30rem, 100vw - 2rem)"}}>
                    <SidebarLogo img="/undraw_people_re_8spw.png" imgAlt="Gruppen-Tool Logo">
                        Gruppen-Tool
                        <span className="ml-2 text-xs font-semibold">{getChannelName()}</span>
                    </SidebarLogo>
                    <SidebarItems>
                        {getChannelName() === "Alpha" || getChannelName() === "Beta" ? (
                            <Alert icon={HiExclamation} additionalContent={<>
                                <a href="https://gruppen-tool.de" className="flex mt-2 text-xs font-medium"
                                ><HiExternalLink className="-ml-0.5 mr-2 h-4 w-4" />Zur stabilen Version wechseln</a>
                            </>} color="warning" className="text-yellow-900 dark:bg-gray-700 dark:text-yellow-300">
                                <span>
                                    <span className="font-medium">
                                        Dies ist eine {getChannelName()}-Version
                                    </span>
                                    <br />
                                {getChannelName() === "Alpha" ? 
                                    "Diese Version ist extrem neu und es ist davon auszugehen, dass sie sehr viele Fehler enthält."
                                    : "Diese Version ist experimentell und dient hauptsächlich zum Testen neuer Funktionen. Sie kann viele Fehler enthalten."}
                            </span>
                        </Alert>) : <></>}
                        <SidebarItemGroup>
                            <SidebarItem icon={HiOutlineTrash} className="cursor-pointer" onClick={(e) => askConfirmationReset()}>
                                Alle Daten zurücksetzen
                            </SidebarItem>
                            <Alert color="light" className="dark:bg-gray-700 bg-gray-100">
                                Falls du das Tool dirkekt in Aktion sehen willst, kannst du hier Beispiel-Daten laden. Achtung: Das Laden überschreibt deine aktuellen Workshops, Teilnehmer und Einstellungen.
                            </Alert>
                            <SidebarCollapse open={true} icon={HiColorSwatch} label="Beispiel-Daten laden">
                                <SidebarItem icon={HiOutlineUsers} className="cursor-pointer" onClick={(e) => askConfirmation("10-participants")}>
                                    Beispiel mit 10 Teilnehmern laden
                                </SidebarItem>
                                <SidebarItem icon={HiOutlineUserGroup} className="cursor-pointer" onClick={(e) => askConfirmation("50-participants")}>
                                    Beispiel mit 50 Teilnehmern laden
                                </SidebarItem>
                                <SidebarItem icon={HiDownload} className="cursor-pointer" onClick={() => window.open("/Gruppen-Tool Importvorlage.xlsx")}>
                                    Beispiel Excel-Datei für den Import herunterladen
                                </SidebarItem>
                            </SidebarCollapse>
                        </SidebarItemGroup>
                    </SidebarItems>

                    <Footer className="absolute bottom-1 left-0 right-0" />
                </Sidebar>
            </div>
            <button onClick={() => setOpen(!open)} className={
                (open ? "" : "lg:translate-y-20 translate-y-0") + 
                "transition-all duration-300 ease-in-out lg:top-2 lg:bottom-auto bottom-2 -right-1 fixed p-3 rounded-l-full bg-white shadow-md " + 
                "dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400"}>
                <HiMenu className={"transition-transform duration-300 ease-in-out " + (open ? "rotate-180 h-0 w-0" : "")} />
                <HiChevronRight className={"transition-transform duration-300 ease-in-out " + (open ? "" : "-rotate-180 h-0 w-0")} />
            </button>
            {modalElement}
            {modalElementReset}
        </>
    );
}