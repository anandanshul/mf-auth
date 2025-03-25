'use client'
import {useEffect, useState} from "react";
import {ApplicationVerifier, RecaptchaVerifier} from "@firebase/auth";
import {auth} from "@/firebase/authentication";

export function useRecaptcha(componentId: string) {
    const [recaptcha, setRecaptcha] = useState<ApplicationVerifier>();

    useEffect(() => {
        if (!auth) {
            console.error("❌ Firebase Auth is not initialized.");
            return;
        }

        try {
            const recaptchaVerifier = new RecaptchaVerifier(auth, componentId, {
                size: "invisible"
            });

            setRecaptcha(recaptchaVerifier);

            return () => recaptchaVerifier.clear();
        } catch (error) {
            console.error("❌ Recaptcha initialization failed:", error);
        }
    }, [componentId]);

    return recaptcha;
}
