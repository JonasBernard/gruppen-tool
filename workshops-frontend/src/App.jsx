import { useEffect, useState } from "react";
import "./App.css";
import ParticipantsList from "./participants/ParticipantsList";
import Workshoplist from "./workshops/WorkshopList";
import ResultView from "./assignment/ResultView";
import NavBar from "./Navbar";
import Card from "./components/Card";
import WelcomePage from "./Welcomepage";
import SettingsView from "./assignment/SettingsView";
import { usePostHog } from "posthog-js/react";
import SummaryView from "./assignment/SummaryView";
import { Alert, Banner, BannerCollapseButton } from "flowbite-react";
import { HiX, HiAnnotation, HiExclamation, HiExclamationCircle, HiInformationCircle, HiOutlineLightBulb, HiOutlineUser, HiOutlineCollection, HiOutlineLightningBolt } from "react-icons/hi";
import Footer from "./Footer";
import AppSidebar from "./sidebar/Sidebar";
import { isExampleData } from "./sidebar/exampleData";

const APIBASE = process.env.REACT_APP_API_BASEURL || "http://localhost:5000";
const APIBASE_V2 = process.env.REACT_APP_API_BASEURL_V2 || "http://localhost:5010";

function saveData(participants, workshops, settings) {
  localStorage.dataV3 = JSON.stringify({
    participants: participants,
    workshops: workshops,
    settings: settings,
  })
}

function loadData() {
  if (localStorage.dataV3) {
    let data = JSON.parse(localStorage.dataV3);
    if (data.participants.length > 0 || data.workshops.length > 0)
      return [true, data.participants, data.workshops, data.settings];
  }
  if (localStorage.dataV2) {
    let data = JSON.parse(localStorage.dataV2);
    for (const workshop of data.workshops) {
      if (workshop.capacity instanceof String) {
        workshop.capacity = parseInt(workshop.capacity);
      }
    }

    localStorage.removeItem("dataV2");
    saveData(data.participants, data.workshops, data.settings);
    if (data.participants.length > 0 || data.workshops.length > 0)
      return [true, data.participants, data.workshops, data.settings];
  }
  if (localStorage.dataV1) {
    let data = JSON.parse(localStorage.dataV1);
    let numberOfWishesPerKid = data.settings.numberOfWishesPerKid;
    data.settings.numberOfWishesPerParticipant = numberOfWishesPerKid;
    data.settings.numberOfWishesPerKid = undefined;

    localStorage.removeItem("dataV1");
    saveData(data.kids, data.workshops, data.settings);
    if (data.kids.length > 0 || data.workshops.length > 0) {
      return [true, data.kids, data.workshops, data.settings];
    }
  }
  return [false, [], []];
}

function App() {
  const [participants, setParticipants] = useState([]);
  const [workshops, setWorkshops] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessages, setWarningMessages] = useState([]);
  const [infoMessage, setInfoMessage] = useState("");

  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const setInfoMessageWithTimeout = (message, timeout = 5000) => {
    setInfoMessage(message);
    setShowInfoMessage(true);
    setTimeout(() => {
      setShowInfoMessage(false);
    }, timeout);
  };

  const [settings, setSettings] = useState({});
  const [result, setRequestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentTab, setTab] = useState(3);

  const posthog = usePostHog();

  useEffect(() => {
    let [loaded,k,w,s] = loadData();
    if (loaded) {
      
      setParticipants(k); setWorkshops(w); setTab(2);
      s && setSettings(s);
      
      setInfoMessageWithTimeout("Es wurden Daten aus deiner letzten Sitzung wiederhergestellt.");
    }
  }, []);

  useEffect(() => {
    saveData(participants, workshops, settings);
  }, [participants, workshops, settings]);

  const addWarningMessage = (message) => {
    setWarningMessages((prev) => [...prev, message]);
  }

  const sendData = () => {
    setErrorMessage("");
    setWarningMessages([]);
    setRequestResult(null);

    const participantsOrig = participants;
    const workshopsOrig = workshops;
    const settingsOrig = settings;

    if (participantsOrig.filter(k => k.name === "").length > 0) {
      addWarningMessage("Es gibt einen Teilnehmer mit leerem Namen. Das kann zu Problemen führen.");
    }

    const participantsWithDoubleWishes = participantsOrig.filter(k => {
      return k.wishes.slice(0, settings.numberOfWishesPerParticipant).filter(w => w !== "").length > [...new Set(k.wishes.slice(0, settings.numberOfWishesPerParticipant).filter(w => w !== ""))].length;
    });
    if (participantsWithDoubleWishes.length > 0) {
      addWarningMessage("Es gibt Teilnehmer, die sich den gleichen Workshop mehrfach wünschen: " + participantsWithDoubleWishes.map(k => k.name).join(", ") + ".");
    }

    const participantsWithEmptyWishes = participantsOrig.filter(k => {
      return k.wishes.slice(0, settings.numberOfWishesPerParticipant).filter(w => w !== "").length < settings.numberOfWishesPerParticipant;
    });
    if (participantsWithEmptyWishes.length > 0) {
      addWarningMessage("Es gibt Teilnehmer, die nicht alle Wunsch-Slots ausgefüllt haben: " + participantsWithEmptyWishes.map(k => k.name).join(", ") + ".");
    }

    const participantsWithNoWishes = participantsOrig.filter(k => {
      return k.wishes.slice(0, settings.numberOfWishesPerParticipant).filter(w => w !== "").length === 0;
    });
    if (participantsWithNoWishes.length > 0) {
      addWarningMessage("Es gibt Teilnehmer, die sich nichts wünschen: " + participantsWithNoWishes.map(k => k.name).join(", ") + ".");
    }

    const overallCapacity = workshopsOrig.reduce((acc, w) => acc + w.capacity, 0);
    if (overallCapacity < participantsOrig.length) {
      addWarningMessage("Die Gesamtkapazität aller Workshops ist kleiner als die Anzahl der Teilnehmer. Eine vollständige Einteilung ist nicht möglich.");
    }
    
    if (workshopsOrig.filter(w => w.name === "").length > 0) {
      setErrorMessage("Es gibt einen Workshop mit leerem Namen. Das muss behoben werden bevor eine Einteilung gefunden werden kann.")
      return;
    }

    if (workshopsOrig.filter(w => w.capacity === 0).length > 0) {
      setErrorMessage("Es gibt minestens einen Workshop mit Kapazität null. Diese/r müssen/muss gelöscht werden bevor eine Einteilung gefunden werden kann: " + workshopsOrig.filter(w => w.capacity === 0).map(w => w.name).join(", ") + ".");
      return;
    }

    if (participantsOrig.length === 0) {
      setErrorMessage("Es gibt keine Teilnehmer. Bitte füge Teilnehmer hinzu bevor du die Einteilung berechnen lässt.");
      return;
    }

    if (workshopsOrig.length === 0) {
      setErrorMessage("Es gibt keine Workshops. Bitte füge Workshops hinzu bevor du die Einteilung berechnen lässt.");
      return;
    }

    if (workshopsOrig.filter(w => w.name === "none").length > 0) {
      setErrorMessage("Kein Workshop darf 'none' heißen. Bitte ändere die Namen der Workshops bevor du die Einteilung berechnen lässt.");
      return;
    }

    if (participantsOrig.length > [...new Set(participantsOrig.map(k=>k.name))].length) {
      let doubleNames = participantsOrig.reduce((acc, k) => {
        if (acc[k.name]) {
          acc[k.name] += 1;
        } else {
          acc[k.name] = 1;
        }
        return acc;
      }, {});
      doubleNames = Object.entries(doubleNames).filter(tuple => tuple[1] > 1)
      .map((k) => `${k[0]} (${k[1]}x)`)
      .join(", ");
      setErrorMessage("Es gibt mehrere Teilnehmer mit dem gleichem Namen. Das muss behoben werden, bevor eine Einteilung möglich ist: " + doubleNames + ".");
      return;
    }

    if (workshopsOrig.length > [...new Set(workshopsOrig.map(k=>k.name))].length) {
      let doubleNames = workshopsOrig.reduce((acc, k) => {
        if (acc[k.name]) {
          acc[k.name] += 1;
        } else {
          acc[k.name] = 1;
        }
        return acc;
      }, {});
      doubleNames = Object.entries(doubleNames).filter(tuple => tuple[1] > 1)
      .map((k) => `${k[0]} (${k[1]}x)`)
      .join(", ");
      setErrorMessage("Es gibt mehrere Workshops mit dem gleichem Namen. Das muss behoben werden, bevor eine Einteilung möglich ist: " + doubleNames + ".");
      return
    }
    
    saveData(participantsOrig, workshopsOrig);

    let useV2 = settings.selectedAlgorithm === "scip";

    let path = "/";
    if (!useV2) {
      path = settings.useWeighted ? "/weighted" : "/unweighted";
    }

    const startTime = new Date().getTime();

    setIsLoading(true);
    fetch((useV2 ? APIBASE_V2 : APIBASE) + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participants: participantsOrig,
        workshops: workshopsOrig,
        settings: settings,
      }),
    })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          setRequestResult({status: data.status});
          throw new Error(data.message);
        });
      }
      return response.json();
    })
    .then((data) => {
      const endTime = new Date().getTime();
      const processingTime = endTime - startTime;
      posthog.capture('assignment_computed', {
        apiVersion: useV2 ? "v2" : "v1",
        apiBaseUrl: useV2 ? APIBASE_V2 : APIBASE,
        requestPath: path,
        participants: participantsOrig,
        workshops: workshopsOrig,
        settings: settingsOrig,
        isExampleData: isExampleData(participantsOrig, workshopsOrig),
        responseStatus: data.status,
        responseData: data.solutions,
        processingTime: processingTime,
      });
      return { ...data, processingTime };
    })
    .catch((err) => {
      setIsLoading(false);
      console.error(err);
      setErrorMessage("Ein Fehler ist aufgetreten: " + err.message);
    })
    .then((actualData) => {
      setIsLoading(false);

      if (!actualData || !actualData.solutions) { // We caught something before
        return;
      }
      const result = {
        ...actualData,
        participants: participantsOrig,
        workshops: workshopsOrig,
        settings: settingsOrig,
      }
      setRequestResult(result);
    })
    .catch((err) => {
      setErrorMessage(err.message);
    });
  };

  return (
    <div className="App dark:bg-gray-700 dark:text-stone-100 h-screen flex flex-col justify-between">
      <div className="dark:bg-gray-700 dark:text-stone-100 h-100">
        
        <Banner className="lg:hidden">
          <div className="flex w-full justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <div className="mx-auto flex items-center">
              <p className="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
                <HiAnnotation className="shrink-0 mr-4 h-4 w-4" />
                <span className="[&_p]:inline">
                  Diese Seite ist nicht für mobile Geräte und kleine Bildschirme geeignet. Besuche uns wieder auf einem Laptop oder Desktop.
                </span>
              </p>
            </div>
            <BannerCollapseButton color="gray" className="border-0 bg-transparent text-gray-500 dark:text-gray-400">
              <HiX className="h-4 w-4" />
            </BannerCollapseButton>
          </div>
        </Banner>

        <NavBar></NavBar>

        <div className="flex flex-col items-center">

          <div className={"mb-6 fixed z-10 bottom-2 left-0 transition-all duration-800 ease-in-out " + (showInfoMessage ? "translate-x-5" : "-translate-x-full")}>
              <Alert color="indigo" icon={HiInformationCircle} 
                className="text-indigo-900" 
                onDismiss={() => setShowInfoMessage(false)}>
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-full h-1 bg-indigo-700 transition-width duration-5000 ease-linear" style={{width: showInfoMessage ? "0%" : "100%"}}></div>
                  <span className="mr-4">{infoMessage}</span>
              </Alert>
          </div>

          <Card extraStyle="container">
            <div className="flex justify-between overflow-x-auto overflow-y-hidden border-b border-gray-200 whitespace-nowrap dark:border-gray-700">
                <div className="flex">
                  <button onClick={() => setTab(0)}
                    className={
                      "inline-flex items-center h-10 px-4 -mb-px text-sm text-center bg-transparent border-b-2 sm:text-base "
                      + (
                        currentTab === 0
                        ? "text-indigo-600 border-indigo-500 dark:border-indigo-400 dark:text-indigo-300 "
                        : "text-gray-700 border-transparent dark:text-white focus:outline-none hover:border-gray-400 ")
                      + "whitespace-nowrap focus:outline-none"}>
                      <HiOutlineCollection className="mr-2" /> Workshops
                  </button>
                  <button onClick={() => setTab(1)} className={
                      "inline-flex items-center h-10 px-4 -mb-px text-sm text-center bg-transparent border-b-2 sm:text-base "
                      + (
                        currentTab === 1
                        ? "text-indigo-600 border-indigo-500 dark:border-indigo-400 dark:text-indigo-300 "
                        : "text-gray-700 border-transparent dark:text-white focus:outline-none hover:border-gray-400 ")
                      + "whitespace-nowrap focus:outline-none"}>
                      <HiOutlineUser className="mr-2"/>Teilnehmer
                  </button>
                  <button onClick={() => setTab(2)} className={
                      "inline-flex items-center h-10 px-4 -mb-px text-sm text-center bg-transparent border-b-2 sm:text-base "
                      + (
                        currentTab === 2
                        ? "text-indigo-600 border-indigo-500 dark:border-indigo-400 dark:text-indigo-300 "
                        : "text-gray-700 border-transparent dark:text-white focus:outline-none hover:border-gray-400 ")
                      + "whitespace-nowrap focus:outline-none"}>
                      <HiOutlineLightningBolt className="mr-2"/>Einteilen
                  </button>
                </div>

                <div className="flex">
                  <button onClick={() => setTab(3)} className={
                      "inline-flex items-center h-10 px-4 -mb-px text-sm text-center bg-transparent border-b-2 sm:text-base "
                      + (
                        currentTab === 3
                        ? "text-indigo-600 border-indigo-500 dark:border-indigo-400 dark:text-indigo-300 "
                        : "text-gray-700 border-transparent dark:text-white focus:outline-none hover:border-gray-400 ")
                      + "whitespace-nowrap focus:outline-none"}>
                      <HiOutlineLightBulb className="mr-2"/>So funktioniert's
                  </button>
                </div>  
            </div>


            {currentTab === 0 && <div className="pt-3">
              <Workshoplist workshops={workshops} setWorkshops={setWorkshops} />
            </div>}
            {currentTab === 1 && <div className="pt-3">
              <ParticipantsList
                participants={participants}
                setParticipants={setParticipants}
                workshopNames={workshops.map(w => w.name)}
                initialSettings={settings}
                setSettings={setSettings}
              />
            </div>}

            {currentTab === 2 && <div className="py-6 px-4 flex flex-col gap-5">
              <SummaryView participants={participants} workshops={workshops} settings={settings} />
              <SettingsView initialSettings={settings} setSettings={setSettings} sendData={sendData} isLoading={isLoading}></SettingsView>              
              {warningMessages && warningMessages.map((msg) => (
                  <Alert color="warning" icon={HiExclamation} className="text-yellow-900 dark:bg-gray-700 dark:text-yellow-300" dismissable={false}>{msg}</Alert>
              ))}
              {errorMessage && (
                  <Alert color="failure" icon={HiExclamationCircle} className="text-red-900 dark:bg-red-900 dark:text-red-100" dismissable={false}>{errorMessage}</Alert>
              )}
              <ResultView result={result} />
            </div>}

            {currentTab === 3 && <div className="pt-3">
              <WelcomePage setTab={setTab}></WelcomePage>
            </div>}

          </Card>
          
        </div>
        <AppSidebar setWorkshops={setWorkshops} setParticipants={setParticipants} resetTabToParticipants={() => setTab(1)} />
      </div>
      <Footer className="dark:bg-slate-700" />
    </div>
  );
}

export default App;
