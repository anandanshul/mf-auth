import {
  ApplicationVerifier,
  Auth,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  getMultiFactorResolver,
  GoogleAuthProvider,
  multiFactor,
  MultiFactorError,
  MultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  reauthenticateWithCredential,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from "@firebase/auth";
import { app } from "@/firebase/init";

export const auth: Auth = getAuth(app);

/* ---------------------------------------------------------------------------
   Reauthenticate the user before sensitive operations (like enrolling MFA).
   For email/password users, we ask for their current password.
--------------------------------------------------------------------------- */
export async function reauthenticateUser(
  user: User,
  currentPassword: string | undefined
): Promise<boolean> {
  if (!currentPassword) {
    console.error("❌ Reauthentication failed: Password is required.");
    return false;
  }

  try {
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
    console.log("✅ User reauthenticated successfully.");
    return true;
  } catch (error) {
    console.error("❌ Reauthentication error:", error);
    return false;
  }
}


/* ---------------------------------------------------------------------------
   Basic Sign In / Sign Up / Sign Out functions
--------------------------------------------------------------------------- */
export async function signInWithGoogle(): Promise<any> {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    return true;
  } catch (e) {
    return e;
  }
}

export async function signUp(email: string, password: string): Promise<boolean> {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return true;
  } catch (e) {
    console.error("Sign-up error:", e);
    return false;
  }
}

export async function login(email: string, password: string): Promise<any> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (e) {
    // Return error to allow handling MFA-required error codes
    return e;
  }
}

export async function logout(): Promise<boolean> {
  try {
    await signOut(auth);
    return true;
  } catch (e) {
    console.error("Logout error:", e);
    return false;
  }
}

/* ---------------------------------------------------------------------------
   Utility function to check if the user has any enrolled MFA factors
--------------------------------------------------------------------------- */
export function verifyIfUserIsEnrolled(user: User) {
  const enrolledFactors = multiFactor(user).enrolledFactors;
  return enrolledFactors.length > 0;
}

/* ---------------------------------------------------------------------------
   Email verification
--------------------------------------------------------------------------- */
export async function verifyUserEmail(user: User): Promise<boolean> {
  try {
    await sendEmailVerification(user);
    return true;
  } catch (e) {
    console.error("Email verification error:", e);
    return false;
  }
}

/* ---------------------------------------------------------------------------
   MFA Enrollment Flow (Activation)
   1. Before calling these, ensure the user is reauthenticated.
   2. verifyPhoneNumber sends an SMS code for enrollment.
--------------------------------------------------------------------------- */
export async function verifyPhoneNumber(
  user: User,
  phoneNumber: string,
  recaptchaVerifier: ApplicationVerifier
): Promise<false | string> {
  try {
    const session = await multiFactor(user).getSession();
    if (!session) {
      console.error("❌ Failed to get MFA session. Please reauthenticate.");
      return false;
    }
    const phoneInfoOptions = { phoneNumber, session };
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    return await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
  } catch (e) {
    console.error("❌ Error during phone verification (enrollment):", e);
    return false;
  }
}

/* ---------------------------------------------------------------------------
   Enroll the user in MFA after verifying the phone number via SMS.
--------------------------------------------------------------------------- */
export async function enrollUser(
  user: User,
  verificationCodeId: string,
  verificationCode: string
) {
  const phoneAuthCredential = PhoneAuthProvider.credential(
    verificationCodeId,
    verificationCode
  );
  const multiFactorAssertion =
    PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

  try {
    await multiFactor(user).enroll(
      multiFactorAssertion,
      "Personal Phone Number"
    );
    console.log("✅ MFA enrollment successful.");
    return true;
  } catch (e) {
    console.error("❌ MFA enrollment failed:", e);
    return false;
  }
}

/* ---------------------------------------------------------------------------
   MFA Sign-In Resolution Flow
   Triggered when a sign-in error with code "auth/multi-factor-auth-required"
   is encountered. This function sends an SMS code to resolve the sign-in.
--------------------------------------------------------------------------- */
export async function verifyUserMFA(
  error: MultiFactorError,
  recaptchaVerifier: ApplicationVerifier,
  selectedIndex: number
): Promise<false | { verificationId: string; resolver: MultiFactorResolver } | void> {
  try {
    const resolver = getMultiFactorResolver(auth, error);

    if (!resolver.hints || resolver.hints.length === 0) {
      console.error("No MFA factors enrolled for this user. Enroll MFA first.");
      return false;
    }

    if (selectedIndex < 0 || selectedIndex >= resolver.hints.length) {
      console.error("Invalid factor selection index.");
      return false;
    }

    if (
      resolver.hints[selectedIndex].factorId ===
      PhoneMultiFactorGenerator.FACTOR_ID
    ) {
      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[selectedIndex],
        session: resolver.session,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);

      if (!recaptchaVerifier) {
        console.error("RecaptchaVerifier is not initialized.");
        return false;
      }

      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      );
      return { verificationId, resolver };
    } else {
      console.error("Selected MFA factor is not phone-based.");
      return false;
    }
  } catch (e) {
    console.error("Error during MFA sign-in resolution:", e);
    return false;
  }
}

/* ---------------------------------------------------------------------------
   Complete MFA sign-in resolution by verifying the SMS code provided by the user.
--------------------------------------------------------------------------- */
export async function verifyUserEnrolled(
  verificationMFA: { verificationId: string; resolver: MultiFactorResolver },
  verificationCode: string
) {
  const { verificationId, resolver } = verificationMFA;
  const credentials = PhoneAuthProvider.credential(
    verificationId,
    verificationCode
  );
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credentials);

  try {
    await resolver.resolveSignIn(multiFactorAssertion);
    console.log("MFA sign-in resolved successfully.");
    return true;
  } catch (e) {
    console.error("MFA sign-in resolution failed:", e);
    return false;
  }
}



