"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setIsAdmin(false);
      }
      // Nota: No refrescamos el perfil aquí para evitar llamadas excesivas en cambios de estado internos
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      setMobileMenuOpen(false);
      // Limpiar sesión de Supabase
      await supabase.auth.signOut();
      
      // Limpiar estados locales inmediatamente
      setUser(null);
      setIsAdmin(false);
      
      // Redirigir y forzar recarga para limpiar memoria/caché
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      // Incluso si falla, forzamos salida
      window.location.href = "/";
    }
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

  const pathname = usePathname();
  const isBookingPage = pathname.startsWith("/b/");

  if (isBookingPage) return null;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group transition-opacity hover:opacity-90" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-8 h-8 bg-white flex items-center justify-center">
            <Scissors className="w-4 h-4 text-black" />
          </div>
          <span className="text-xl font-light tracking-widest uppercase">
            Intux Oc
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-[10px] font-light text-gray-400 transition-colors hover:text-white uppercase tracking-widest"
            >
              {link.label}
            </Link>
          ))}
          
          <div className="h-4 w-px bg-white/10 mx-2" />

          {user ? (
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover:bg-white/5 uppercase tracking-widest text-[10px] font-light h-8"
              onClick={handleSignOut}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Salir
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover:bg-white/5 uppercase tracking-widest text-[10px] font-light h-8"
              onClick={() => router.push("/login")}
            >
              <LogIn className="w-3.5 h-3.5 mr-2" />
              Ingresar
            </Button>
          )}
          
          <Button 
            className="bg-white text-black hover:bg-gray-200 uppercase tracking-widest text-[10px] font-light px-6 h-8 rounded-none transition-all active:scale-95"
            onClick={() => {
              if (!user) {
                router.push('/planes')
              } else if (isAdmin) {
                router.push('/admin')
              } else {
                router.push('/turnos/nuevo')
              }
            }}
          >
            {user ? (isAdmin ? 'Dashboard' : 'Agendar Turno') : 'Registrar mi Negocio'}
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
