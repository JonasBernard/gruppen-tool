import { useId } from "react";
import { Checkbox } from "flowbite-react";

export default function MyCheckbox(props) {
    const checkbox = useId();
    const checkboxLabel = useId();

    return <>
       <div className="flex">
            <div className="flex items-center h-5">
                <Checkbox id={checkbox} aria-describedby={checkboxLabel} 
                checked={props.checked} onChange={props.onChange}
                disabled={props.disabled}
                type="checkbox" 
                className={
                    "w-4 h-4 dark:text-indigo-700 text-indigo-700 bg-gray-100 border-gray-300 " + 
                    "rounded focus:ring-indigo-300 dark:focus:ring-indigo-500 dark:ring-offset-gray-800 " + 
                    "focus:ring-opacity-80 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" + 
                    (props.disabled ? " cursor-not-allowed opacity-50" : "")
                } />
            </div>
            <div className="ms-2 text-sm text-left">
                <label htmlFor={checkbox} className={
                    "font-medium" + (props.disabled ? " text-gray-500 dark:text-gray-500 select-none" : " text-gray-900 dark:text-gray-300")
                }>
                    { props.title }
                </label>
                {props.details &&
                    <p id={checkboxLabel} className={"text-xs font-normal text-gray-500 dark:text-gray-300" + (props.disabled ? " select-none" : "")}>{ props.details }</p>
                }
            </div>
        </div>
    </>
}