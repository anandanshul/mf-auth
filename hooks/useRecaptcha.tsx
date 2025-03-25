'use client'
import { useEffect, useState } from "react";
import { ApplicationVerifier, RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/firebase/authentication";

export function useRecaptcha(componentId: string) {
    const [recaptcha, setRecaptcha] = useState<ApplicationVerifier>();

    useEffect(() => {
        // Ensure we're in the browser environment
        if (typeof window !== 'undefined') {
            if (!auth) {
                console.error("❌ Firebase Auth is not initialized.");
                return;
            }

            try {
                // Ensure the container element exists
                const container = document.getElementById(componentId);
                if (!container) {
                    console.error(`❌ Container element with id ${componentId} not found.`);
                    return;
                }

                const recaptchaVerifier = new RecaptchaVerifier(auth, componentId, {
                    size: "invisible",
                    callback: (response: string) => { // ✅ Explicitly define response as a string
                        console.log("✅ reCAPTCHA solved:", response);
                    },
                    'error-callback': (error: any) => { // ❗ You can also explicitly define error type if needed
                        console.error("❌ reCAPTCHA error:", error);
                    }
                });

                // Render the reCAPTCHA explicitly
                recaptchaVerifier.render().then((widgetId) => {
                    console.log("✅ reCAPTCHA widget ID:", widgetId);
                });

                setRecaptcha(recaptchaVerifier);

                return () => {
                    recaptchaVerifier.clear();
                };
            } catch (error) {
                console.error("❌ Recaptcha initialization failed:", error);
            }
        }
    }, [componentId]);

    return recaptcha;
}
