import { FileInput, Label } from "flowbite-react";
import { useId } from "react";

export default function FileDropzone(props) {
  const inputId = useId();

  const onDragover = (event) => {
    event.preventDefault();
  }

  return (
    <div className="flex w-full items-center justify-center">
      <Label
        htmlFor={inputId}
        onDrop={props.onDrop}
        onDragOver={onDragover}
        className="flex h-64 w-full cursor-pointer focus-within:ring-2 focus-within:ring-indigo-400 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <svg
            className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Hochladen durch <span className="font-semibold">Klick</span> oder per Drag-and-Drop 
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {props.fileTypes}
          </p>
        </div>
        <FileInput id={inputId} className="sr-only" accept={props.fileFilter} 
            onChange={(e) => {props.onChange(e);}}
        />
      </Label>
    </div>
  );
}
