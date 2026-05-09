import { Radio, Label, Popover } from "flowbite-react";

export default function RadioButtons(props) {
    const options = props.options;
    const selectedOption = props.selectedOption;
    const setSelectedOption = props.setSelectedOption;

    return (
        <div className={"flex max-w-md flex-col gap-4 " + props.className}>
            {options.map((option) => (
                <Popover 
                    key={option.value}
                    content={option.popover}
                    aria-labelledby="default-popover"
                    placement="right"
                    trigger="hover">
                    <div className="flex items-center gap-2">
                        <Radio
                            // As long as Flowbite React does not support the ThemeProvider, this overwrites the theme
                            className="text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:bg-indigo-600 dark:focus:ring-indigo-600"
                            id={option.id}
                            name={option.name}
                            value={option.value}
                            checked={selectedOption === option.value}
                            onChange={() => setSelectedOption(option.value)}
                            />
                        <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                </Popover>
            ))}
        </div>
    );
}