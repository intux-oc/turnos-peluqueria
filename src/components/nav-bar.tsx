"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Scissors, Menu, X, User as UserIcon, Calendar, Settings, LogOut } from "lucide-react";

export function NavBar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = user ? [
    { href: "/mis-turnos", label: "Mis Turnos", icon: Calendar },
    { href: "/perfil", label: "Perfil", icon: UserIcon },
    // Simple check for admin, in real app check db role
    { href: "/admin", label: "Admin", icon: Settings, adminOnly: true },
  ] : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
            <Scissors className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase">
            Peluquería
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={handleSignOut}>
              Salir
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => router.push("/login")}>
              Ingresar
            </Button>
          )}
          <Button 
            size="sm" 
            className="bg-white text-black hover:bg-gray-200"
            onClick={() => router.push(user ? "/turnos/nuevo" : "/login")}
          >
            Reservar Turno
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-black border-b border-white/10 p-4 space-y-4 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-lg font-medium text-gray-300 py-2"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            {!user && (
              <Button variant="outline" className="border-white/10 text-white" onClick={() => { router.push("/login"); setMobileMenuOpen(false); }}>
                Ingresar
              </Button>
            )}
            <Button className="bg-white text-black" onClick={() => { router.push(user ? "/turnos/nuevo" : "/login"); setMobileMenuOpen(false); }}>
              Reservar Turno
            </Button>
            {user && (
              <Button variant="ghost" className="text-red-500 justify-start px-0" onClick={handleSignOut}>
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
