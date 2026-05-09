export default function TextInput(props) {
    return (
        // copied from Flowbite to fix missing dark mode
        <div className="flex">
            <div className="relative w-full">
                <input className={"block w-full border disabled:cursor-not-allowed"
                 + " disabled:opacity-50 p-2.5 text-sm rounded-lg" 
                //  this is manual:
                 + " dark:bg-gray-700"}
                type="text"
                id={props.id}
                disabled={props.disabled}
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
             />
            </div>
        </div>
    );
}
