'use client'
import {Chat} from "phosphor-react";
import {useRef} from "react";

type Props = {
    getPhoneNumber: (phoneNumber: string, currentPassword: string) => void
}

export function PhoneRegistration({getPhoneNumber}: Props) {
    const phoneNumber = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);

    function handleClick() {
        if (phoneNumber.current && password.current) {
            getPhoneNumber(phoneNumber.current.value, password.current.value);
        }
    }

    return (
        <div className='flex justify-center items-center px-4'>
            <div className="bg-white flex flex-col p-5 border-2 rounded-xl w-full max-w-md">
                <h1 className='font-medium text-xl'>Provide your phone</h1>
                <p className='text-gray-500 mt-2 text-sm'>Enter your phone number to receive the code</p>

                <input
                    ref={phoneNumber}
                    type="tel"
                    placeholder="Phone number"
                    className="border rounded-md px-4 py-2 w-full mt-4"
                />
                <input
                    ref={password}
                    type="password"
                    placeholder="Current password"
                    className="border rounded-md px-4 py-2 w-full mt-2"
                />

                <button onClick={handleClick} className="bg-black text-white rounded-md px-4 py-2 mt-4">
                    Send SMS
                </button>
            </div>
        </div>
    );
}
