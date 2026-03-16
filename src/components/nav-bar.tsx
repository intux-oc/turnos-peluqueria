"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Scissors } from "lucide-react";

export function NavBar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Scissors className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Intux <span className="text-primary">Studio</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/mis-turnos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Mis Turnos
              </Link>
              <Link href="/perfil" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Perfil
              </Link>
              {user.email === "admin@intux.com" && (
                <Link href="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Admin Panel
                </Link>
              )}
              <div className="h-4 w-px bg-border mx-2" />
              <Button variant="ghost" className="text-foreground hover:bg-white/5 hover:text-primary" onClick={handleSignOut}>
                Cerrar Sesión
              </Button>
              <Button onClick={() => router.push("/turnos")} className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                Reservar Turno
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push("/login")} className="text-foreground hover:bg-white/5">
                Ingresar
              </Button>
              <Button onClick={() => router.push("/login")} className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                Reservar Turno
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Navigation (Simple for now, will expand) */}
        <div className="md:hidden flex items-center gap-2">
           {user ? (
             <Button size="sm" onClick={() => router.push("/turnos")}>
               Reservar
             </Button>
           ) : (
             <Button size="sm" onClick={() => router.push("/login")}>
               Ingresar
             </Button>
           )}
        </div>
      </div>
    </header>
  );
}
