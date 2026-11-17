import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import ParticipantsList from "./participants/ParticipantsList";
import Workshoplist from "./workshops/WorkshopList";
import ResultView from "./assignment/ResultView";
import NavBar from "./Navbar";
import WelcomePage from "./Welcomepage";
import SettingsView from "./assignment/SettingsView";
import { usePostHog } from "posthog-js/react";
import SummaryView from "./assignment/SummaryView";
import { Alert, Banner, BannerCollapseButton, Card } from "flowbite-react";
import { HiOutlineX, HiOutlineAnnotation, HiOutlineExclamation, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiOutlineLightBulb, HiOutlineUser, HiOutlineCollection, HiOutlineLightningBolt, HiOutlineKey } from "react-icons/hi";
import Footer from "./Footer";
import AppSidebar from "./sidebar/Sidebar";
import { isExampleData } from "./sidebar/exampleData";
import AdminTab from "./AdminTab";
import useProfile from "./profile/useProfile";
import { normalizeName } from "./normalizeName";

const APIBASE = process.env.REACT_APP_API_BASEURL || "http://localhost:5000";
const APIBASE_V2 = process.env.REACT_APP_API_BASEURL_V2 || "http://localhost:5010";

function saveData(participants, workshops, settings) {
  localStorage.dataV3 = JSON.stringify({
    participants: participants,
    workshops: workshops,
    settings: settings,
  })
}

function parseStringCapacities(workshops) {
  for (const workshop of workshops) {
    if (typeof workshop.capacity === "string") {
      workshop.capacity = parseInt(workshop.capacity) || 0;
    }
  }
}

function loadData() {
  try {
    if (localStorage.dataV3) {
      let data = JSON.parse(localStorage.dataV3);
      parseStringCapacities(data.workshops);
      if (data.participants.length > 0 || data.workshops.length > 0)
        return [true, data.participants, data.workshops, data.settings];
    }
    if (localStorage.dataV2) {
      let data = JSON.parse(localStorage.dataV2);
      parseStringCapacities(data.workshops);

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
  } catch {
    localStorage.removeItem("dataV3");
    localStorage.removeItem("dataV2");
    localStorage.removeItem("dataV1");
  }
  return [false, [], []];
}

function listDuplicateNames(items) {
  const counts = {};
  for (const item of items) {
    const name = normalizeName(item.name);
    counts[name] = counts[name] || { name: item.name, count: 0 };
    counts[name].count++;
  }
  return Object.values(counts).filter(c => c.count > 1).map(c => `${c.name} (${c.count}x)`).join(", ");
}

function TabButton({ tab, currentTab, navigateToTab, children }) {
  const isCurrent = tab === currentTab;
  return (
    <button onClick={() => navigateToTab(tab)}
      aria-current={isCurrent ? "page" : undefined}
      className={
        "inline-flex items-center h-10 px-4 -mb-px text-sm text-center bg-transparent border-b-2 sm:text-base "
        + "whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 "
        + (isCurrent
          ? "text-indigo-600 border-indigo-500 dark:border-indigo-400 dark:text-indigo-300"
          : "text-gray-700 border-transparent dark:text-white hover:border-gray-400")}>
      {children}
    </button>
  );
}

function AppContent() {
  const [participants, setParticipants] = useState([]);
  const [workshops, setWorkshops] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessages, setWarningMessages] = useState([]);
  const [infoMessage, setInfoMessage] = useState("");

  const [showInfoMessage, setShowInfoMessage] = useState(false);
  useEffect(() => {
    if (!showInfoMessage) return;
    const timer = setTimeout(() => setShowInfoMessage(false), 5000);
    return () => clearTimeout(timer);
  }, [showInfoMessage]);

  const [settings, setSettings] = useState({});
  const [result, setRequestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [getProfileOption] = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const posthog = usePostHog();

  const getTabFromPath = () => {
    const path = location.pathname;
    const tabMap = {
      '/workshops': 0,
      '/participants': 1,
      '/assign': 2,
      '/': 3,
      '/admin': 4,
    };
    return tabMap[path] !== undefined ? tabMap[path] : 3;
  };

  const navigateToTab = (tabIndex) => {
    const pathMap = {
      0: '/workshops',
      1: '/participants',
      2: '/assign',
      3: '/',
      4: '/admin',
    };
    navigate(pathMap[tabIndex]);
  };

  useEffect(() => {
    let [loaded,k,w,s] = loadData();
    if (loaded) {
      setParticipants(k); setWorkshops(w);
      s && setSettings(s);
      
      setInfoMessage("Es wurden Daten aus deiner letzten Sitzung wiederhergestellt.");
      setShowInfoMessage(true);
    }
  }, []);

  useEffect(() => {
    saveData(participants, workshops, settings);
  }, [participants, workshops, settings]);

  const currentTab = getTabFromPath();

  const addWarningMessage = (message) => {
    setWarningMessages((prev) => [...prev, message]);
  }

  const sendData = () => {
    setErrorMessage("");
    setWarningMessages([]);
    setRequestResult(null);

    for (const participant of participants) {
      delete participant.editable;
      delete participant.editsMade;
    }
    for (const workshop of workshops) {
      delete workshop.editable;
      delete workshop.editsMade;
    }

    const participantsOrig = participants;
    const workshopsOrig = workshops;
    const settingsOrig = settings;

    if (participantsOrig.filter(k => normalizeName(k.name) === "").length > 0) {
      addWarningMessage("Es gibt einen Teilnehmer mit leerem Namen. Das kann zu Problemen führen.");
    }

    const participantsWithDoubleWishes = participantsOrig.filter(k => {
      const wishes = k.wishes.slice(0, settings.numberOfWishesPerParticipant).map(normalizeName).filter(w => w !== "");
      return wishes.length > new Set(wishes).size;
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
    
    if (workshopsOrig.filter(w => normalizeName(w.name) === "").length > 0) {
      setErrorMessage("Es gibt einen Workshop mit leerem Namen. Das muss behoben werden bevor eine Einteilung gefunden werden kann.")
      return;
    }

    const workshopsWithoutCapacity = workshopsOrig.filter(w => !(Number.isInteger(w.capacity) && w.capacity > 0));
    if (workshopsWithoutCapacity.length > 0) {
      setErrorMessage("Es gibt mindestens einen Workshop, der keine (positive) Kapazität hat. Diese/r müssen/muss korrigiert oder gelöscht werden bevor eine Einteilung gefunden werden kann: " + workshopsWithoutCapacity.map(w => w.name).join(", ") + ".");
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

    if (workshopsOrig.filter(w => normalizeName(w.name) === "none").length > 0) {
      setErrorMessage("Kein Workshop darf 'none' heißen. Bitte ändere die Namen der Workshops bevor du die Einteilung berechnen lässt.");
      return;
    }

    const doubleParticipantNames = listDuplicateNames(participantsOrig);
    if (doubleParticipantNames) {
      setErrorMessage("Es gibt mehrere Teilnehmer mit dem gleichem Namen. Das muss behoben werden, bevor eine Einteilung möglich ist: " + doubleParticipantNames + ".");
      return;
    }

    const doubleWorkshopNames = listDuplicateNames(workshopsOrig);
    if (doubleWorkshopNames) {
      setErrorMessage("Es gibt mehrere Workshops mit dem gleichem Namen. Das muss behoben werden, bevor eine Einteilung möglich ist: " + doubleWorkshopNames + ".");
      return;
    }
    
    saveData(participantsOrig, workshopsOrig, settingsOrig);

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
        return response.text().then((text) => {
          let data = {};
          try {
            data = JSON.parse(text);
          } catch {}
          if (data.status) {
            setRequestResult({status: data.status, message: data.message});
          }
          throw new Error(data.message || "Der Server hat unerwartet folgenden Status angegeben: " + response.status);
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
                <HiOutlineAnnotation className="shrink-0 mr-4 h-4 w-4" />
                <span className="[&_p]:inline">
                  Diese Seite ist nicht für mobile Geräte und kleine Bildschirme geeignet. Besuche uns wieder auf einem Laptop oder Desktop.
                </span>
              </p>
            </div>
            <BannerCollapseButton color="gray" className="border-0 bg-transparent text-gray-500 dark:text-gray-400">
              <HiOutlineX className="h-4 w-4" />
            </BannerCollapseButton>
          </div>
        </Banner>

        <NavBar></NavBar>

        <div className="flex flex-col items-center">

          <div role="status" inert={showInfoMessage ? undefined : ""} className={"mb-6 fixed z-10 bottom-2 left-0 transition-all duration-800 ease-in-out " + (showInfoMessage ? "translate-x-5" : "-translate-x-full")}>
              <Alert color="indigo" icon={HiOutlineInformationCircle} 
                className="text-indigo-900" 
                onDismiss={() => setShowInfoMessage(false)}>
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-full h-1 bg-indigo-700 transition-width duration-5000 ease-linear" style={{width: showInfoMessage ? "0%" : "100%"}}></div>
                  <span className="mr-4">{infoMessage}</span>
              </Alert>
          </div>

          <Card className="container">
            <nav className="flex justify-between overflow-x-auto overflow-y-hidden border-b border-gray-200 whitespace-nowrap dark:border-gray-700">
                <div className="flex">
                  <TabButton tab={0} currentTab={currentTab} navigateToTab={navigateToTab}>
                      <HiOutlineCollection className="mr-2" /> Workshops
                  </TabButton>
                  <TabButton tab={1} currentTab={currentTab} navigateToTab={navigateToTab}>
                      <HiOutlineUser className="mr-2"/>Teilnehmer
                  </TabButton>
                  <TabButton tab={2} currentTab={currentTab} navigateToTab={navigateToTab}>
                      <HiOutlineLightningBolt className="mr-2"/>Einteilen
                  </TabButton>
                </div>

                <div className="flex">
                  <TabButton tab={3} currentTab={currentTab} navigateToTab={navigateToTab}>
                      <HiOutlineLightBulb className="mr-2"/>So funktioniert's
                  </TabButton>
                  {getProfileOption("adminTab.enable") && (
                    <TabButton tab={4} currentTab={currentTab} navigateToTab={navigateToTab}>
                      <HiOutlineKey className="mr-2"/>Admin
                    </TabButton>
                  )}
                </div>  
            </nav>


            <Routes>
              <Route path="/workshops" element={
                <div className="pt-3">
                  <Workshoplist 
                    participants={participants}
                    setParticipants={setParticipants}
                    workshops={workshops} 
                    setWorkshops={setWorkshops} />
                </div>
              } />
              <Route path="/participants" element={
                <div className="pt-3">
                  <ParticipantsList
                    participants={participants}
                    setParticipants={setParticipants}
                    workshopNames={workshops.map(w => w.name)}
                    initialSettings={settings}
                    setSettings={setSettings}
                  />
                </div>
              } />
              <Route path="/assign" element={
                <div className="py-6 px-4 flex flex-col gap-5">
                  <SummaryView participants={participants} workshops={workshops} settings={settings} />
                  <SettingsView initialSettings={settings} setSettings={setSettings} sendData={sendData} isLoading={isLoading}></SettingsView>              
                  {warningMessages && warningMessages.map((msg) => (
                      <Alert key={msg} color="warning" icon={HiOutlineExclamation} className="text-yellow-900 dark:bg-gray-700 dark:text-yellow-300" dismissable={false}>{msg}</Alert>
                  ))}
                  {errorMessage && (
                      <Alert color="failure" icon={HiOutlineExclamationCircle} className="text-red-900 dark:bg-red-900 dark:text-red-100" dismissable={false}>{errorMessage}</Alert>
                  )}
                  <ResultView result={result} />
                </div>
              } />
              <Route path="/" element={
                <div className="pt-3">
                  <WelcomePage setTab={navigateToTab}></WelcomePage>
                </div>
              } />
              {getProfileOption("adminTab.enable") && (
                <Route path="/admin" element={
                  <div className="pt-3">
                    <AdminTab></AdminTab>
                  </div>
                } />
              )}
            </Routes>

          </Card>
          
        </div>
        <AppSidebar setWorkshops={setWorkshops} setParticipants={setParticipants} resetTabToParticipants={() => navigateToTab(1)} />
      </div>
      <Footer className="dark:bg-slate-700" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
