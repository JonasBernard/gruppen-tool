import { Pagination, Popover, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import AssignmentView from "./assignment/AssignmentView";
import useProfile from "./profile/useProfile";

const API_BASE = 'https://eu.posthog.com/api/projects/76742/endpoints';
const PAGE_SIZE = 25;

export default function AdminTab(props) {
    const [getProfileOption] = useProfile();

    const POSTHOG_PERSONAL_API_KEY = getProfileOption("adminTab.postHogPersonalApiKey");

    const [data, setData] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch total page count - runs once on mount
    useEffect(() => {
        const fetchPageCount = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE}/count-assignments-computed/run`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}` },
                });
                const result = await response.json();
                setTotalPages(Math.ceil(result.results[0][0] / PAGE_SIZE));
            } catch (err) {
                console.error('Error fetching page count:', err);
                setError('Failed to load page count');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPageCount();
    }, [POSTHOG_PERSONAL_API_KEY]);

    // Fetch page data when page changes
    useEffect(() => {
        const fetchPageData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE}/recorded-assigments/run`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
                    },
                    body: JSON.stringify({
                        variables: { page: PAGE_SIZE * (currentPage - 1), perpage: PAGE_SIZE }
                    }),
                });
                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error('Error fetching page data:', err);
                setError('Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPageData();
    }, [currentPage, POSTHOG_PERSONAL_API_KEY]);

    const parseAssignmentData = (event) => {
        try {
            const properties = JSON.parse(event[3]);
            const requestBody = (() => {
                try { return JSON.parse(properties.requestBody); } catch { return {}; }
            })();

            let participants = properties.participants || [];
            let workshops = properties.workshops || [];
            let result = null;
            let assignment = null;

            if (requestBody.participants) participants = requestBody.participants;
            if (requestBody.workshops) workshops = requestBody.workshops;

            try {
                result = JSON.parse(properties.response);
            } catch { }
            if (properties.responseData) result = properties.responseData;

            if (result?.solutions?.length > 0) {
                assignment = result.solutions[0];
            } else if (result?.solution?.length > 0) {
                assignment = result.solution.map(obj => [obj.Left.name, obj.Right.name]);
            } else if (Array.isArray(result) && result.length > 0) {
                assignment = result[0].assignment;
            }

            return {
                timestamp: event[1].replace("T", " ").substring(0, 19),
                sessionId: event[0],
                hostname: event[2],
                participantsCount: participants.length,
                workshopsCount: workshops.length,
                rawData: properties,
                requestData: requestBody,
                assignment,
                settings: requestBody.settings || properties.settings,
                participants,
                workshops,
            };
        } catch (error) {
            console.error('Error parsing event:', error);
            return null;
        }
    };

    const DataDetails = ({ data }) => (
        <details className="mt-2">
            <summary className="cursor-pointer font-weight-bold text-gray-700 dark:text-gray-300">See Data</summary>
            <pre className="text-left bg-gray-100 dark:bg-gray-700 p-2 rounded-md overflow-x-auto max-w-xl">
                <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
        </details>
    );

    const TableCell = ({ children }) => (
        <Table.Cell className="px-2 py-2 text-center text-sm whitespace-nowrap text-gray-900 dark:text-white">
            {children}
        </Table.Cell>
    );

    const AssignmentCell = ({ assignment, participants, workshops, settings }) => {
        if (!assignment || (typeof assignment === 'object' && Object.keys(assignment).length === 0)) {
            return <TableCell>No assignment found</TableCell>;
        }
        return (
            <TableCell>
                <Popover
                    content={
                        <div className="px-4 py-2">
                            <AssignmentView
                                solution={assignment}
                                participants={participants}
                                workshops={workshops}
                                settings={settings}
                            />
                        </div>
                    }
                    aria-labelledby="default-popover"
                    placement="bottom"
                    trigger="click"
                >
                    <button className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline">
                        View Assignment
                    </button>
                </Popover>
            </TableCell>
        );
    };

    return (
        <div className="flex flex-col items-end gap-4">
            {error && <div className="text-red-600 p-4">{error}</div>}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            <span>Showing {data?.results?.length || 0} of {totalPages * PAGE_SIZE}</span>
            <div className="self-stretch overflow-auto border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md md:rounded-lg">
                <Table className="divide-y divide-gray-200 dark:divide-gray-700" hoverable={true}>
                    <thead>
                        <tr>
                            <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Timestamp</td>
                            <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Session ID</td>
                            <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Hostname</td>
                            <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400"># Participants</td>
                            <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400"># Workshops</td>
                            <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Result</td>
                            <td className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">Raw</td>
                        </tr>
                    </thead>
                    <Table.Body>
                        {isLoading ? (
                            <Table.Row>
                                <Table.Cell colSpan={7} className="text-center py-4">Loading...</Table.Cell>
                            </Table.Row>
                        ) : data?.results?.length > 0 ? (
                            data.results.map((event, index) => {
                                const parsed = parseAssignmentData(event);
                                if (!parsed) {
                                    return (
                                        <Table.Row key={index}>
                                            <Table.Cell colSpan={7} className="text-center py-4 text-red-600">Error parsing data</Table.Cell>
                                        </Table.Row>
                                    );
                                }
                                return (
                                    <Table.Row key={index}>
                                        <TableCell>{parsed.timestamp}</TableCell>
                                        <TableCell>{parsed.sessionId}</TableCell>
                                        <TableCell>{parsed.hostname}</TableCell>
                                        <TableCell>{parsed.participantsCount}</TableCell>
                                        <TableCell>{parsed.workshopsCount}</TableCell>
                                        <AssignmentCell
                                            assignment={parsed.assignment}
                                            participants={parsed.participants}
                                            workshops={parsed.workshops}
                                            settings={parsed.settings}
                                            />
                                        <TableCell><DataDetails data={parsed.rawData} /></TableCell>
                                    </Table.Row>
                                );
                            })
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={7} className="text-center py-4">No data</Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
}
