import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useState } from "react";
import { Timeline, TimelineBody, TimelineContent, TimelineItem, TimelinePoint, TimelineTime, TimelineTitle } from "flowbite-react";
import { HiCalendar, HiCurrencyEuro, HiCursorClick, HiExternalLink, HiFlag, HiHashtag, HiOutlineGlobeAlt, HiSparkles } from "react-icons/hi";

function getTimelineItems() {
  return [
    {
      time: "6. Juni 2026",
      title: "Version 0.1",
      body: "Das Tool hat einige neue Funktionen und ein verbessertes Design verpasst bekommen. Außerdem stehen nun Beispiel-Daten zum Testen zur Verfügung.",
      icon: HiSparkles,
    },
    {
      time: "5. Juni 2026",
      title: "250te Einteilung",
      body: "Am 5. Juni 2026 um 01:41 Uhr nachts wurde die 250te Einteilung berechnet.",
      icon: HiHashtag,
      // SELECT * FROM events WHERE event = 'assignment_computed'  AND (session.$end_hostname = 'gruppen-tool.de' OR session.$end_hostname = 'gruppen-tool.jonasbernard.de') LIMIT 250 ORDER BY timestamp ASC
    },
    {
      time: "20. März 2026",
      title: "ChatGPT",
      body: "Das Tool wurde von ChatGPT empfohlen. Ein Nutzer hat das Tool von ChatGPT aus aufgerufen.",
      icon: HiCalendar,
    },
    {
      time: "15. Februar 2026",
      title: "500ter Besucher",
      body: "Am 15. Februar 2026 um 22:10 Uhr hat der 500. Besucher das Tool aufgesucht. Gezählt wurde ab dem 09. Juli 2025.",
      icon: HiCursorClick,
      // SELECT * from sessions WHERE `$end_hostname` = 'gruppen-tool.de' OR `$end_hostname`= 'gruppen-tool.jonasbernard.de' ORDER BY `$start_timestamp` ASC LIMIT 500
    },
    {
      time: "19. November 2025",
      title: "Umzug auf gruppen-tool.de",
      body: "Das Tool bekam seine eigene Addresse. Ab jetzt war er unter gruppen-tool.de erreichbar.",
      icon: HiExternalLink,
    },
    // {
    //   time: "09. Juli 2025",
    //   title: "Nutzerzähler beginnt",
    //   body: "Ab hier wurden erfasst, wie viele Nutzer das Tool aufrufen.",
    //   icon: HiCalendar,
    // },
    {
      time: "22. Februar 2025",
      title: "Erste Spende",
      body: "Der erste begeistere Nutzer hat sich mit einer Spende bedankt.",
      icon: HiCurrencyEuro,
    },
    {
      time: "April 2024",
      title: "Gruppen-Tool live",
      body: "Die erste Version des Gruppen-Tools wurde auf gruppen-tool.jonasbernard.de veröffentlicht.",
      icon: HiOutlineGlobeAlt,
    },
    {
      time: "17. Januar 2024",
      title: "Erster Commit im Repository",
      body: "Mit dem ersten Commit startete das Projekt auf GitHub.",
      icon: HiFlag,
    },
  ];
}

export default function ChangelogModal() {
  const [openModal, setOpenModal] = useState(false);

  const timelineElement = ({ time, title, body, icon }) => {
    return (
      <TimelineItem>
        <TimelinePoint icon={icon} />
        <TimelineContent>
          <TimelineTime>{time}</TimelineTime>
          <TimelineTitle>{title}</TimelineTitle>
          <TimelineBody>{body}</TimelineBody>
        </TimelineContent>
      </TimelineItem>
    );
  }

  return (
    <>
      <span>Gruppen-Tool in der <button onClick={() => setOpenModal(true)} className="cursor-pointer text-indigo-600 dark:text-indigo-400">Version {process.env.REACT_APP_VERSION || "[development]"}</button></span>
      <Modal show={openModal} onClose={() => setOpenModal(false)} dismissible={true} popup={true} size="2xl">
        <ModalBody className="mt-3 md:mt-6">
          <ModalHeader className="md:hidden"></ModalHeader>
          <div className="flex gap-10" id="changelog-timeline-content">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl tracking-tight font-black dark:text-white flex gap-2">Die Entwicklung des Gruppen-Tools</h1>
              <div className="p-4 mt-3">
                <Timeline>
                  {getTimelineItems().map(timelineElement)}
                </Timeline>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
