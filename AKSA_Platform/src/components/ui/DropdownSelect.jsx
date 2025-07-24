import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Fragment } from "react";

export default function DropdownSelect({ options, value, onChange, className = "" }) {
  return (
    <div className={`relative w-36 ${className}`}>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-xs text-left text-gray-800 focus:outline-none">
            <span className="block truncate">{value || "Select"}</span>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <ChevronsUpDown className="h-3 w-3 text-gray-400" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((opt) => (
                <Listbox.Option
                  key={opt}
                  value={opt}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-8 pr-4 ${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {opt}
                      </span>
                      {selected && (
                        <span className="absolute left-2 inset-y-0 flex items-center text-green-600">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
