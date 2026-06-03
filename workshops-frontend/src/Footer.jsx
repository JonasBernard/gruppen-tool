import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { HiMail } from "react-icons/hi";

export default function Footer(props) {
    const [openImprintModal, setOpenImprintModal] = useState(false);
    const [openThankYouModal, setOpenThankYouModal] = useState(false);

    const imprintModal = () => {
        return (
            <Modal show={openImprintModal} onClose={() => setOpenImprintModal(false)} dismissible={true} popup={true} size="2xl">
                <ModalBody className="mt-3 md:mt-8">
                    <ModalHeader><h1 className="text-3xl font-black dark:text-white">Impressum</h1></ModalHeader>
                    <div className="flex flex-col gap-6 p-2">
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            Jonas Bernard<br />
                            c/o POSTFLEX PFX-391-638<br />
                            Emsdettener Straße 10<br />
                            48268 Greven
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            Bitte keine Pakete oder Päckchen an diese Anschrift senden, da dies mit vermeidbaren Kosten verbunden ist.
                            Eine Adresse für eine Packstation ist auf Anfrage per E-Mail erhältlich.
                        </p>

                        <div>
                            <h2 className="text-xl font-black dark:text-white flex gap-2">Kontakt</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                <HiMail className="mr-2 h-5 w-5 inline" />
                                E-Mail-Adresse: info@gruppen-tool.de
                            </p>
                        </div>

                        {/* <h2>Umsatzsteuer-ID</h2>
                        <p>Umsatzsteuer-Identifikationsnummer gem&auml;&szlig; &sect; 27 a Umsatzsteuergesetz:<br />
                        DE999999999</p> */}

                        <div>
                            <h2 className="text-lg font-black dark:text-white flex gap-2">Verbraucher&shy;streit&shy;beilegung/Universal&shy;schlichtungs&shy;stelle</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-300">Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        );
    }

    const thankYouModal = () => {
        return (
            <Modal show={openThankYouModal} onClose={() => setOpenThankYouModal(false)} dismissible={true} popup={true} size="2xl">
                <ModalBody className="mt-3 md:mt-8">
                    <ModalHeader><h1 className="text-3xl font-black dark:text-white">Dankeschön &lt;3</h1></ModalHeader>
                    <div className="mt-2 flex flex-col gap-3 p-2">
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            Danke Nils für deine kritischen Nachfragen dazu, ob meine Gewichtung der Wünsche wirklich so sinnvoll ist.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            Danke Jona für die ausführlichen und spaßigen Diskussionen über diverse mathematische und philosophische Fragen
                            von 'total unimodularity' bis zur Frage, wie fair man eigentlich sein sollte.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            Danke an alle, die das Gruppen-Tool nutzen und mir damit die Motivation geben, es weiter zu verbessern,
                            vor allem diejenigen, die mir so zahlreich konstruktives Feedback geben und Fehler finden.
                        </p>
                    </div>
                </ModalBody>
            </Modal>
        );
    }

    return (
        <div className={"text-center flex flex-col items-stretch gap-3 pt-24 pb-2 px-4 text-sm text-gray-500 dark:text-gray-400 " + props.className}>
            <div>
                <span>Gruppen-Tool in der Version {process.env.REACT_APP_VERSION || "[development]"}</span>
                <span className="mx-2">•</span>
                <a href="mailto:info@gruppen-tool.de" className="cursor-pointer text-indigo-600 dark:text-indigo-400">info@gruppen-tool.de</a>
                <span className="mx-2">•</span>
                <button onClick={() => setOpenImprintModal(true)} className="cursor-pointer text-indigo-600 dark:text-indigo-400">Impressum</button>
                {imprintModal()}
                <span className="mx-2">•</span>
                <button onClick={() => setOpenThankYouModal(true)} className="cursor-pointer text-indigo-600 dark:text-indigo-400">Dankeschön</button>
                {thankYouModal()}
            </div>
        </div>
    );
}
