'use client'
import {useState} from "react";
import {User} from "@firebase/auth";
import {useRecaptcha} from "@/hooks/useRecaptcha";
import {PhoneRegistration} from "@/components/PhoneRegistration";
import {verifyPhoneNumber, reauthenticateUser} from "@/firebase/authentication";
import {notify} from "@/utils/notify";
import {CodeSignup} from "@/components/CodeSignup";

type Props = {
    currentUser: User | null
}
export function CreateMultiFactorAuthentication({currentUser}: Props) {
    const recaptcha = useRecaptcha('sign-up');
    const [verificationCodeId, setVerificationCodeId] = useState<string | null>(null);
    const [password, setPassword] = useState<string>("");

    async function getPhoneNumber(phoneNumber: string) {
        // Validate inputs
        if (!currentUser) {
            notify("❌ No user logged in.");
            return;
        }

        if (!recaptcha) {
            notify("❌ reCAPTCHA not initialized. Please refresh.");
            return;
        }

        if (!password) {
            notify("❌ Please enter your current password.");
            return;
        }

        // Validate phone number (basic format check)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            notify("❌ Invalid phone number format.");
            return;
        }

        try {
            // Reauthenticate user
            const reauthSuccess = await reauthenticateUser(currentUser, password);
            if (!reauthSuccess) {
                notify("❌ Reauthentication failed. Check your password.");
                return;
            }

            // Verify phone number
            const verificationId = await verifyPhoneNumber(currentUser, phoneNumber, recaptcha);
            if (!verificationId) {
                notify("❌ Phone verification failed. Try again.");
            } else {
                setVerificationCodeId(verificationId);
            }
        } catch (error) {
            console.error("MFA Enrollment Error:", error);
            notify("❌ An unexpected error occurred.");
        }
    }

    return (
        <>
            {!verificationCodeId && (
                <>
                    <input
                        type="password"
                        placeholder="Enter current password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded-md px-4 py-2 w-full mb-4"
                    />
                    <PhoneRegistration getPhoneNumber={getPhoneNumber} />
                </>
            )}
            {verificationCodeId && currentUser && (
                <CodeSignup 
                    currentUser={currentUser} 
                    verificationCodeId={verificationCodeId} 
                />
            )}
            <div id='sign-up'></div>
        </>
    )
}