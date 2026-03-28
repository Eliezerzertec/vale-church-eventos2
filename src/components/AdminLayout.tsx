import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Calendar, Users, CreditCard, FileText, LogOut, UserCircle, Music2, Settings, Menu, X, Gift } from "lucide-react";
import logo from "@/assets/logo-vale.png";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      setUser(session.user);
      if (session.user.user_metadata?.avatar_url) {
        setAvatarUrl(session.user.user_metadata.avatar_url);
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles?.some((r) => r.role === "admin")) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login");
      if (session?.user) {
        setUser(session.user);
        if (session.user.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  }

  if (!isAdmin) return null;

  const navItems = [
{ 
      category: "VISÃO GERAL",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      category: "GERENCIAMENTO",
      items: [
        { href: "/admin/eventos", label: "Eventos", icon: Calendar },
        { href: "/admin/inscricoes", label: "Inscrições", icon: Users },
        { href: "/admin/audicoes", label: "Audições", icon: Music2 },
      ]
    },
    {
      category: "OPERACIONAL",
      items: [
        { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
        { href: "/admin/cupons", label: "Cupons", icon: Gift },
        { href: "/admin/relatorios", label: "Relatórios", icon: FileText },
      ]
    },
    {
      category: "CONFIGURAÇÃO",
      items: [
        { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-secondary border-b border-border/50 p-4 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Vale Church Lavras" className="h-8 w-8 rounded-full object-cover" />
          <div>
            <span className="font-display text-sm font-bold text-secondary-foreground">Vale</span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-secondary-foreground/10 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-[61px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative
        w-64 bg-secondary border-r border-border/50
        flex flex-col shrink-0
        transition-all duration-300 ease-in-out
        h-[calc(100vh-61px)] md:h-screen
        z-40
        ${sidebarOpen ? "left-0" : "-left-64 md:left-0"}
        md:top-0
      `}>
        <div className="hidden md:block p-4 border-b border-border/30 space-y-3">
          {/* Logo/Brand - Desktop */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Vale Church Lavras" className="h-8 w-8 rounded-full object-cover" />
            <div>
              <span className="font-display text-sm font-bold text-secondary-foreground">Vale Church</span>
              <span className="block text-[10px] text-primary tracking-widest uppercase">Admin</span>
            </div>
          </Link>
        </div>

<nav className="flex-1 p-3 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.category} className="mb-6">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-bold text-secondary-foreground/50 tracking-wider uppercase">
                  {group.category}
                </p>
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-secondary-foreground/70 hover:bg-secondary-foreground/5 hover:text-secondary-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border/30 space-y-2">
          <Link to="/admin/perfil" onClick={() => setSidebarOpen(false)}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/5 text-sm h-10"
            >
              <UserCircle className="mr-3 h-4 w-4 flex-shrink-0" />
              Meu Perfil
            </Button>
          </Link>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full justify-start text-secondary-foreground/60 hover:text-destructive hover:bg-red-50 text-sm h-10"
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main */}
<main className="flex-1 overflow-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

