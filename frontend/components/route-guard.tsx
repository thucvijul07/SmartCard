"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const requiresAuth = !publicRoutes.includes(pathname);

    if (!loading && requiresAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return null;
  }
  if (!publicRoutes.includes(pathname) && !isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
