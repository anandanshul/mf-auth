'use client'
import {UserComponent} from "@/components/UserComponent";
import {useCurrentUser} from "@/hooks/useCurrentUser";
import {Loading} from "@/components/Loading";
import {useRouter} from "next/navigation";

export default function UserPage() {
    const currentUser = useCurrentUser();
    const router = useRouter();

    if (currentUser === 'loading') {
        return <Loading />
    }

    if (!currentUser) {
        void router.push('login');
        return null
    }

    return <UserComponent currentUser={currentUser} />
}