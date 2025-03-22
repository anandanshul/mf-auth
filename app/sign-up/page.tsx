'use client'
import { SignUp } from "@/components/SignUp";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";
import { useEffect } from "react";

export default function SignUpPage() {
    const currentUser = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (currentUser && currentUser !== 'loading') {
            void router.push('/user');
        }
    }, [currentUser, router]);

    if (currentUser === 'loading') {
        return <Loading />;
    }

    return <SignUp />;
}
