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
        if (!currentUser || !recaptcha || !password) {
            notify("❌ Please enter your password before proceeding.");
            return;
        }

        const reauthSuccess = await reauthenticateUser(currentUser, password);
        if (!reauthSuccess) {
            notify("❌ Reauthentication failed. Try again.");
            return;
        }

        const verificationId = await verifyPhoneNumber(currentUser, phoneNumber, recaptcha);
        if (!verificationId) {
            notify("❌ Something went wrong. Try again.");
        } else {
            setVerificationCodeId(verificationId);
        }
    }

    return (
        <>
            {
                !verificationCodeId &&
                <>
                    <input
                        type="password"
                        placeholder="Enter current password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded-md px-4 py-2 w-full"
                    />
                    <PhoneRegistration getPhoneNumber={getPhoneNumber} />
                </>
            }
            {
                verificationCodeId &&
                currentUser &&
                <CodeSignup currentUser={currentUser} verificationCodeId={verificationCodeId} />
            }
            <div id='sign-up'></div>
        </>
    )
}
