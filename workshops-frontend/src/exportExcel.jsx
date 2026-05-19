import * as XLSX from 'xlsx/xlsx.mjs';

export const exportExcel = (result, wLength, workshops) => {
    let workbook = createWorksheetWithAllParticipants(result, wLength);
    
    let workshopsStrippedNames = workshops.map(workshop => { return {
        ...workshop,
        workbookName: workshop.name.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 31)
    }});

    for (let workshop of workshopsStrippedNames) {
        let rowData = []
        for (let phase = 0; phase < wLength; phase++) {
            rowData.push({ name: "Phase " + (phase + 1), columns: [] });
            let phaseData = result.filter(assignment => assignment.columns[phase]?.isAssigned && assignment.columns[phase]?.assignedWorkshop === workshop.name);
            rowData.push(...phaseData.map(assignment => {
                return {
                    ...assignment,
                    columns: [assignment.columns[phase]]
                };
            }));
        }

        let worksheet = XLSX.utils.aoa_to_sheet(formatAoA(rowData, wLength, false));
        XLSX.utils.book_append_sheet(workbook, worksheet, workshop.workbookName, true);
    }

    XLSX.writeFile(workbook, "Workshopeinteilung.xlsx", { compression: false });
}

const createWorksheetWithAllParticipants = (result, wLength) => {
    if (!result || result.length === 0) {
        return XLSX.utils.book_new();
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(formatAoA(result, wLength));
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alle Teilnehmer", true);
    return workbook;
}

const formatAoA = (data, wLength, includeHeader = true) => {
    let header = ["Teilnehmer"].concat(
        Array.from({ length: wLength }, (_, i) => {
            return [wLength > 1 ? "Phase " + (i + 1) : "Workshop", "entspricht"];
        }).flat());

    let newData = includeHeader ? [header] : [];

    data.forEach(row => {
        let column = [`${row.name}`].concat(row.columns.map(column => {
            if (column.isAssigned) {
                return [`${column.assignedWorkshop}`, `${column.comment}`];
            } else {
                return ["nicht eingeteilt", ""];
            }
        }).flat());

        newData.push(column);
    });
    
    return newData;
}