// lib/withAuth.js
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function withAuth(Component) {
  return function WithAuth(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isLoading = status === "loading";

    useEffect(() => {
      if (!isLoading && !session) {
        router.replace("/login");
      }
    }, [isLoading, session, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!session) {
      return null;
    }

    return <Component {...props} />;
  };
}