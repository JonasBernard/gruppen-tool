
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useState } from "react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import Button from "./Button";

export function useConfirm(title, yesButtonLabel, noButtonLabel, onConfirm) {
  const [openModal, setOpenModal] = useState(false);
  const [customData, setCustomData] = useState(null);

  const askConfirmation = (...data) => {
    setCustomData(data);
    setOpenModal(true);
  };

  const modalElement = (
    <>
      <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineQuestionMarkCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {title}
            </h3>
            <div className="flex justify-center gap-4">
              <Button className="text-sm" onClick={() => {
                setOpenModal(false);
                onConfirm(...customData);
              }}>
                {yesButtonLabel}
              </Button>
              <Button color="alternative" bgColor="bg-gray-200" className="!text-black text-sm hover:bg-gray-300 focus:ring-gray-300" onClick={() => setOpenModal(false)}>
                {noButtonLabel}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );

  return [modalElement, askConfirmation];
}
