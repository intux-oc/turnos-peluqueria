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
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(profile?.role === 'admin' || profile?.role === 'superadmin');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(profile?.role === 'admin' || profile?.role === 'superadmin');
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    ...(user ? [
      { href: "/mis-turnos", label: "Mis Turnos", icon: Calendar },
      { href: "/perfil", label: "Perfil", icon: UserIcon },
    ] : []),
    ...(isAdmin ? [
      { href: "/admin", label: "Administración", icon: Settings },
    ] : []),
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-2xl font-light tracking-widest uppercase hover:opacity-80 transition-opacity" 
          onClick={() => setMobileMenuOpen(false)}
        >
          Peluquería
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm font-light text-gray-400 transition-colors hover:text-white uppercase tracking-widest"
            >
              {link.label}
            </Link>
          ))}
          
          <div className="h-6 w-px bg-white/10 mx-2" />

          {user ? (
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-white/5 uppercase tracking-widest text-xs font-light"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-white/5 uppercase tracking-widest text-xs font-light"
              onClick={() => router.push("/login")}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Ingresar
            </Button>
          )}
          
          <Button 
            className="bg-white text-black hover:bg-gray-200 uppercase tracking-widest text-xs font-light px-8 h-10 rounded-none"
            onClick={() => router.push(user ? "/turnos/nuevo" : "/login")}
          >
            Agendar Turno
          </Button>
        </div>

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
        <div className="md:hidden absolute top-20 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-4 text-lg font-light text-gray-300 py-2 uppercase tracking-[0.2em]"
            >
              <link.icon className="h-5 w-5 text-gray-500" strokeWidth={1} />
              {link.label}
            </Link>
          ))}
          
          <div className="h-px w-full bg-white/10 my-2" />
          
          <div className="flex flex-col gap-4">
            {!user ? (
              <Button 
                variant="outline" 
                className="border-white/10 text-white rounded-none uppercase tracking-widest font-light h-12" 
                onClick={() => { router.push("/login"); setMobileMenuOpen(false); }}
              >
                Ingresar
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                className="text-red-500 justify-start px-0 rounded-none uppercase tracking-widest font-light h-12" 
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </Button>
            )}
            <Button 
              className="bg-white text-black rounded-none uppercase tracking-widest font-light h-12" 
              onClick={() => { router.push(user ? "/turnos/nuevo" : "/login"); setMobileMenuOpen(false); }}
            >
              Agendar Turno
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

import { LogIn } from "lucide-react";
