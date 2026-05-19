import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { HiMail } from "react-icons/hi";

export default function Footer() {
    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="text-center flex flex-col items-stretch gap-3 pt-24 p-3 text-sm text-gray-500 dark:text-gray-400 dark:bg-slate-700 ">
            <div>
                <span>Gruppen-Tool in der Version {process.env.REACT_APP_VERSION || "(development)"}</span>
                <span className="mx-2">•</span>
                <a href="mailto:contact@jonas-bernard.dev" className="cursor-pointer text-indigo-600 dark:text-indigo-400">E-Mail: contact@jonas-bernard.dev</a>
                <span className="mx-2">•</span>
                <button onClick={() => setOpenModal(true)} className="cursor-pointer text-indigo-600 dark:text-indigo-400">Impressum</button>
                <Modal show={openModal} onClose={() => setOpenModal(false)} dismissible={true} popup={true} size="2xl">
                <ModalBody className="mt-3 md:mt-8">
                    <ModalHeader><h1 className="text-3xl font-black dark:text-white">Impressum</h1></ModalHeader>
                    <div className="flex flex-col gap-6 p-2">
                        <p className="text-sm text-gray-500 dark:text-gray-300">Jonas Bernard<br />
                        c/o Postflex <br />
                        Emsdettener Str. 10<br />
                        48268 Greven</p>

                        <div>
                            <h2 className="text-xl font-black dark:text-white flex gap-2">Kontakt</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                <HiMail className="mr-2 h-5 w-5 inline" />
                                E-Mail-Adresse: contact@jonas-bernard.dev
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
            </div>
        </div>
    );
}