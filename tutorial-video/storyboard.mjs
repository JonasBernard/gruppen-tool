// The tutorial itself: what is said, what the cards show and what happens on screen.
// All German text of the video lives in this file (`lines` and `cards`).
import { fileURLToPath } from "node:url";

/** Narration, one caption per entry. The keys are used by `t.say()` below. */
export const lines = {
  intro: "Das Gruppen-Tool teilt Personen auf Workshops, Kurse oder Gruppen auf – fair und in wenigen Minuten.",
  idea1: "Jede Person gibt Wünsche ab: einen Erstwunsch, einen Zweitwunsch, einen Drittwunsch.",
  idea2: "Jeder Workshop hat nur begrenzt viele Plätze.",
  idea3: "Das Tool berechnet die Einteilung, bei der möglichst viele ihre liebsten Wünsche bekommen.",
  scope1: "Wichtig: Gewünscht werden Workshops, nicht Personen.",
  scope2: "Angaben wie „Ich will mit Bob in eine Gruppe“ oder „Bloß nicht mit Alice“ kann das Tool nicht berücksichtigen.",

  workshops1: "Los geht’s im Reiter „Workshops“: Trag jeden Workshop mit Namen und Anzahl der Plätze ein.",
  workshops2: "So legst du nach und nach alle Angebote an.",

  people1: "Im Reiter „Teilnehmer“ stellst du zuerst ein, wie viele Wünsche jede Person hat – zwischen einem und sechs.",
  people2: "Einzelne Personen trägst du von Hand ein: Name eintippen, Wünsche auswählen, hinzufügen.",

  import1: "Bei vielen Personen geht das schneller mit dem Excel-Import.",
  import2: "Du brauchst eine Excel-Datei mit einer Zeile pro Person. In Spalte A steht der Name …",
  import3: "… und in den Spalten daneben stehen die Wünsche, beginnend mit dem Erstwunsch.",
  import4: "Lass die Überschriften weg: In Zeile eins steht schon die erste Person.",
  import5: "Importiert wird nur das erste Tabellenblatt.",
  import6: "Klick auf „Aus Excel-Datei importieren“ und zieh deine Datei in das Feld.",
  import7: "Die Vorschau zeigt, was importiert wird. Gelb markiert sind Wünsche, die zu keinem Workshop passen – hier ein Tippfehler.",
  import8: "Mit „Importieren“ übernimmst du alle in deine Liste.",
  import9: "Den Tippfehler korrigierst du über den Stift.",

  assign1: "Im Reiter „Einteilen“ legst du fest, ob ein Erstwunsch mehr zählen soll als ein Zweitwunsch …",
  assign2: "… und ob Personen notfalls auch in einen Workshop kommen dürfen, den sie sich nicht gewünscht haben.",
  assign3: "Dann ein Klick auf „Gruppen jetzt einteilen“ – und das Ergebnis ist da.",
  assign4: "Die Diagramme zeigen, wie viele ihren Erst-, Zweit- oder Drittwunsch bekommen haben und wie voll die Workshops sind.",
  assign5: "Darunter steht für jede Person der zugeteilte Workshop. Die Liste kannst du als Excel-Datei herunterladen.",
  assign6: "Gibt es mehrere gleich gute Lösungen, entscheidet der Zufall: Ein weiterer Klick kann eine andere, ebenso gute Einteilung bringen.",

  extras: "Zum Ausprobieren findest du im Menü rechts Beispiel-Daten und eine Excel-Vorlage.",
  outro: "Viel Spaß beim Einteilen!",
};

/** Spellings the TTS voice needs to pronounce a word properly. Captions are not affected. */
export const pronunciation = {
  Excel: "Ex-Zell",
  Workshop: "Wörkschopp",
  Alice: "Ällis",
  Bob: "Bopp",
  Tabellenblatt: "Tabellen-Blatt",
};

const workshops = [["Schwimmbad", 4], ["Wandern", 5], ["Brettspiele", 4], ["Radfahren", 4]];
const excelFile = fileURLToPath(new URL("./assets/Wünsche.xlsx", import.meta.url));

export const cards = {
  title: { logo: "/undraw_people_re_8spw.png", title: "Gruppen-Tool", subtitle: "So funktioniert’s – in unter drei Minuten" },
  idea: {
    wishesTitle: "Wünsche",
    workshopsTitle: "Workshops",
    ranks: ["1. Wunsch", "2. Wunsch", "3. Wunsch"],
    // `gets` is the index of the wish the person ends up with.
    people: [
      { name: "Alice", wishes: ["Schwimmbad", "Wandern", "Radfahren"], gets: 0 },
      { name: "Bob", wishes: ["Schwimmbad", "Radfahren", "Wandern"], gets: 1 },
      { name: "Mia", wishes: ["Wandern", "Schwimmbad", "Radfahren"], gets: 0 },
    ],
    workshops: [
      { name: "Schwimmbad", seats: "1 Platz" },
      { name: "Wandern", seats: "1 Platz" },
      { name: "Radfahren", seats: "1 Platz" },
    ],
  },
  scope: {
    title: ["Gewünscht werden ", "Workshops", " – nicht Personen."],
    yes: { label: "Das geht", who: "Alice", wishes: ["Schwimmbad", "Wandern", "Radfahren"] },
    no: { label: "Das geht nicht", bubbles: ["„Ich will mit Bob in eine Gruppe!“", "„Bloß nicht mit Alice!“"] },
  },
  sheet: {
    file: "Wünsche.xlsx",
    tabs: ["Tabelle1", "Tabelle2"],
    // The first rows of assets/Wünsche.xlsx.
    rows: [
      ["Franka", "Schwimmbad", "Wandern", "Brettspiele"],
      ["Johannes", "Brettspiele", "Schwimmbad", "Radfahren"],
      ["Mia", "Schwimbad", "Radfahren", "Wandern"],
      ["Mohammed", "Brettspiele", "Radfahren", "Wandern"],
      ["Lea", "Wandern", "Radfahren", "Schwimmbad"],
      ["Isabella", "Schwimmbad", "Brettspiele", "Radfahren"],
    ],
    notes: {
      name: "Name",
      wishes: ["1. Wunsch", "2. Wunsch", "3. Wunsch"],
      noHeader: "Keine Überschriften – Zeile 1 ist schon die erste Person",
      firstSheet: "Nur das erste Tabellenblatt wird importiert",
    },
  },
  outro: { title: "Viel Spaß beim Einteilen!", url: "gruppen-tool.de" },
};

export async function run(t) {
  const page = t.page;
  const tab = (name) => page.locator("button.border-b-2", { hasText: name });
  const button = (name) => page.getByRole("button", { name, exact: true });
  const menuItem = (name) => page.locator('[role="menu"]:visible button', { hasText: new RegExp(`^${name}$`) });
  const rows = page.locator("tbody tr");
  const wishDropdown = (row, i) => row.locator('[data-testid="dropdown"]').nth(i);
  const actionButton = (row, i) => row.locator("td").last().locator("button").nth(i);
  /** The left `width` px of an element that spans the whole page. */
  const leftPart = async (target, width) => ({ ...(await t.rect(target)), width });
  const pickWish = async (row, i, name) => {
    await t.click(wishDropdown(row, i), { after: 300 });
    await t.click(menuItem(name), { after: 250 });
  };

  await t.card("title", cards.title);

  await t.scene("intro", async () => {
    await t.wait(900);
    await t.say("intro");
    await t.card("idea", cards.idea);
    await t.say("idea1");
    await t.phase(1);
    await t.say("idea2");
    await t.phase(2);
    await t.say("idea3");
    await t.wait(500);
    await t.card("scope", cards.scope);
    await t.say("scope1");
    await t.phase(1);
    await t.say("scope2");
    await t.wait(700);
  });

  await t.scene("workshops", async () => {
    await t.showCursor(760, 420);
    await t.hideCard();
    t.say("workshops1");
    await t.click(tab("Workshops"));
    const name = page.getByPlaceholder("Name des Workshops");
    const capacity = page.getByPlaceholder("Wie viele Teilnehmer");
    await t.zoomTo([name, capacity], { pad: 6 });
    await t.click(name);
    await t.type(workshops[0][0]);
    await t.click(capacity);
    await t.press("Control+a");
    await t.type(String(workshops[0][1]));
    await t.wait(400);
    await t.click(button("Hinzufügen"));
    await t.voiceDone();

    t.say("workshops2");
    await t.zoomTo([name, capacity], { pad: 6, ms: 600 });
    for (const [workshop, seats] of workshops.slice(1)) {
      await t.type(workshop, { delay: 45 });
      await t.press("Tab");
      await t.press("Control+a");
      await t.type(String(seats));
      await t.wait(250);
      await t.press("Enter", 350);
    }
    await t.voiceDone();
    await t.wait(500);
  });

  await t.scene("participants", async () => {
    t.say("people1");
    await t.zoomOut(700);
    await t.click(tab("Teilnehmer"));
    const wishCount = page.locator("form", { has: page.locator("#increment-button") });
    await t.zoomTo(wishCount, { scale: 1.7 });
    await t.click(page.locator("#increment-button"), { after: 700 });
    await t.click(page.locator("#decrement-button"), { after: 500 });
    await t.voiceDone();

    t.say("people2");
    const newRow = rows.first();
    await t.zoomTo([page.getByPlaceholder("Name des Teilnehmers"), wishDropdown(newRow, 2)], { pad: 20 });
    await t.click(page.getByPlaceholder("Name des Teilnehmers"));
    await t.type("Alice");
    await pickWish(newRow, 0, "Schwimmbad");
    await pickWish(newRow, 1, "Wandern");
    await pickWish(newRow, 2, "Brettspiele");
    await t.click(button("Hinzufügen"));
    await t.voiceDone();
    await t.wait(400);
  });

  await t.scene("import", async () => {
    const importButton = button("Aus Excel-Datei importieren");
    t.say("import1");
    await t.zoomTo(importButton, { scale: 1.5 });
    await t.moveTo(importButton);
    await t.highlight(importButton);
    await t.voiceDone();

    await t.clearHighlight();
    await t.card("sheet", cards.sheet);
    t.say("import2");
    await t.wait(2600);
    await t.phase(1);
    await t.voiceDone();
    await t.phase(2);
    await t.say("import3");
    await t.phase(3);
    await t.say("import4");
    await t.phase(4);
    await t.say("import5");
    await t.wait(300);
    await t.hideCard();

    t.say("import6");
    await t.click(importButton, { after: 700 });
    await t.dragFile(excelFile, 'label[for="dropzone-file"]', { x: 4, y: 470 });
    await t.voiceDone();

    const dialog = page.getByRole("dialog");
    const typo = dialog.locator("span.bg-yellow-500").first();
    t.say("import7");
    await t.wait(2300);
    await t.zoomTo(typo, { scale: 1.7 });
    await t.moveTo(typo, { dy: 22 });
    await t.highlight(typo);
    await t.voiceDone();

    t.say("import8");
    await t.clearHighlight();
    await t.zoomOut(700);
    await t.click(dialog.getByRole("button", { name: "Importieren", exact: true }), { after: 200 });
    await t.moveTo({ x: 700, y: 330 });
    await t.voiceDone();

    // Imported rows are added on top: the row with the typo is the third one below the input row.
    const mia = rows.nth(3);
    t.say("import9");
    await t.zoomTo(mia, { scale: 1.2 });
    await t.click(actionButton(mia, 0));
    await pickWish(mia, 0, "Schwimmbad");
    await t.click(actionButton(mia, 0));
    await t.voiceDone();
    await t.wait(400);
  });

  await t.scene("assign", async () => {
    const option = (label) => page.getByText(label, { exact: true }).locator("xpath=ancestor::div[2]");
    const weighted = option("Wünsche als gewichtet betrachten");
    const unwished = option("Einteilung in nicht gewünschte Workshops zulassen");
    const runButton = button("Gruppen jetzt einteilen");

    t.say("assign1");
    await t.zoomOut(700);
    await t.click(tab("Einteilen"));
    await t.zoomTo([await leftPart(weighted, 820), await leftPart(unwished, 820)], { pad: 24 });
    await t.moveTo(weighted.locator("label"), { dy: 26 });
    await t.highlight([weighted.locator("input"), weighted.locator("label")]);
    await t.voiceDone();
    t.say("assign2");
    await t.moveTo(unwished.locator("label"), { dy: 26 });
    await t.highlight([unwished.locator("input"), unwished.locator("label")]);
    await t.voiceDone();
    await t.clearHighlight();

    t.say("assign3");
    await t.zoomOut(700);
    await t.click(runButton, { after: 900 });
    await t.voiceDone();

    const charts = page.locator("canvas");
    t.say("assign4");
    await t.scrollToElement(charts.first(), 110);
    await t.zoomTo([charts.nth(0), charts.nth(1)], { pad: 50, ms: 700 });
    await t.moveTo(charts.nth(0), { dy: 60 });
    await t.wait(2200);
    await t.moveTo(charts.nth(1));
    await t.voiceDone();

    const download = button("Als Excel-Datei herunterladen");
    t.say("assign5");
    await t.zoomOut(500);
    await t.scrollToElement(download, 60);
    const list = await t.rect(page.locator("table").last());
    const top = (await t.rect(download)).y;
    await t.zoomTo({ x: list.x + list.width * 0.22, y: top - 10, width: list.width * 0.78, height: 320 }, { pad: 0 });
    await t.moveTo(page.locator("table").last().locator("tr").nth(2));
    await t.wait(2000);
    await t.click(download);
    await t.voiceDone();

    t.say("assign6");
    await t.zoomOut(500);
    // Back to the top first: the page gets shorter while the new result is computed.
    await t.scrollTo(0, 900);
    await t.zoomOut(400);
    await t.click(runButton, { after: 900 });
    await t.scrollToElement(charts.first(), 140);
    await t.voiceDone();
    await t.wait(400);
  });

  await t.scene("outro", async () => {
    const sidebarToggle = page.locator("button.rounded-l-full");
    t.say("extras");
    await t.scrollTo(0, 700);
    await t.zoomOut(400);
    await t.click(sidebarToggle, { after: 600 });
    const examples = [page.getByText("Beispiel mit 10 Teilnehmern laden"), page.getByText("Beispiel Excel-Datei für den Import herunterladen")];
    await t.zoomTo(examples, { scale: 1.45 });
    await t.highlight(examples, 10);
    await t.moveTo(examples[0], { dx: -80 });
    await t.voiceDone();
    await t.wait(600);

    await t.clearHighlight();
    await t.card("outro", cards.outro);
    await t.say("outro");
    await t.wait(1800);
  });
}
