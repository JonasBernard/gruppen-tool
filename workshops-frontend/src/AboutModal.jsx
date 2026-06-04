import { Modal, ModalBody, ModalFooter, ModalHeader  } from "flowbite-react";
import { useEffect, useState } from "react";
import Button from "./components/Button";
import { FaRegHandPeace } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";
import { FaCoffee } from "react-icons/fa";

export default function AboutModal() {
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenAboutModal");
    if (hasSeenModal !== "v1") {
      setOpenModal(true);
      localStorage.setItem("hasSeenAboutModal", "v1");
    }
  }, []);

  return (
    <>
      <span className="text-xs">Made with ♥ by <button onClick={() => setOpenModal(true)} className="cursor-pointer text-indigo-600 dark:text-indigo-400">Jonas Bernard</button></span>
      <Modal show={openModal} onClose={() => setOpenModal(false)} dismissible={true} popup={true} size="xl">
        <ModalBody className="mt-3 md:mt-8">
            <ModalHeader className="md:hidden">Über mich</ModalHeader>
            <div className="flex gap-10">
                <div className="max-w-40">
                    <img src="/profile-pic.png" alt="Portait von Jonas Bernard" />
                </div>
                <div className="flex flex-col gap-3">
                    <h1 className="text-5xl tracking-tight font-black dark:text-white flex gap-2"><FaRegHandPeace /> Hey!</h1>
                    <p className="mt-3 text-lg text-gray-500 dark:text-gray-300">
                        Ich bin Jonas, und ich entwickle dieses Tool in meiner Freizeit.
                    </p>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">
                        Wenn du Wünsche, Fragen oder Anregungen hast, melde dich gerne bei mir!
                    </p>
                </div>
            </div>
        </ModalBody>
        <ModalFooter className="flex flex-wrap gap-1 justify-end">
         <Button onClick={() => window.location.href = "mailto:info@gruppen-tool.de"}>
            <HiOutlineMail className="mr-2 h-5 w-5" /> E-Mail schreiben
          </Button>
          <Button 
          // className="pl-0 pr-0 py-0"
          onClick={() => window.open("https://www.buymeacoffee.com/JonasBernard", "_blank", "noopener noreferrer")}
          >
            {/* <a href="https://www.buymeacoffee.com/JonasBernard" className="px-6 py-0" target="_blank" rel="noreferrer">
                <img src="/bmc-full-logo.svg" alt="Buy me a coffe" width={110} className="max-h-6" />
            </a> */}
            <FaCoffee className="mr-2 h-5 w-5" /> Spenden
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
