import { ButtonGroup } from "flowbite-react";
import { useEffect, useState } from "react";
import Button from "./Button";

export default function ButtonGroupSelector(props) {
    const [selected, setSelected] = useState(props.options.findIndex(option => option.id === props.value) || 0);

    useEffect(() => {
        props.onChange(props.options[selected].id);
    }, [selected]);

    return (
        <ButtonGroup>
            {props.options.map((option, index) => {
                let classNames = "rounded-md duration-0";
                if (index === 0) classNames += " rounded-r-none";
                if (index === props.options.length - 1) classNames += " rounded-l-none";
                
                let bgColor = "";
                if (index === selected) {
                    bgColor += " bg-indigo-700 hover:bg-indigo-700 focus:ring-0";
                } else {
                    // TODO inset ring does not work
                    bgColor += " bg-transparent !text-indigo-700 dark:!text-white hover:bg-indigo-700/20 dark:hover:bg-indigo-700/40 inset-ring-indigo-600 inset-ring-2 border-none focus:ring-0";
                }
                return (
                    <Button
                        key={option.id}
                        color="gray"
                        bgColor={bgColor}
                        className={classNames}
                        onClick={() => setSelected(index)}
                    >
                        {option.label}
                    </Button>
                );
            })}
        </ButtonGroup>
    );
}