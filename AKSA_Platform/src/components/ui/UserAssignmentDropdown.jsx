import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";

export default function UserAssignmentDropdown({ users, value, onChange }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-300 bg-white py-1 pl-3 pr-8 text-left text-sm text-gray-700 focus:outline-none">
          <span className="block truncate">{value}</span>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {users.map((user) => (
              <Listbox.Option
                key={user}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  }`
                }
                value={user}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                      {user}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-2 flex items-center text-green-500">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
