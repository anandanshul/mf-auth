'use client'
import { useEffect } from "react";
import { UserComponent } from "@/components/UserComponent";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Loading } from "@/components/Loading";
import { useRouter } from "next/navigation";

export default function UserPage() {
    const currentUser = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
      if (currentUser === null) {
        void router.push('login');
      }
    }, [currentUser, router]);

    if (currentUser === 'loading') {
        return <Loading />;
    }

    // While waiting for router.push to complete, you can return null
    if (!currentUser) {
        return null;
    }

    return <UserComponent currentUser={currentUser} />;
}
