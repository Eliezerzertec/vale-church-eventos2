import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-vale.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if user has admin role
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (roleError) throw roleError;

      const isAdmin = roles?.some((r) => r.role === "admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({ title: "Acesso negado", description: "Você não tem permissão de administrador.", variant: "destructive" });
        return;
      }

      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Falha no login.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="Vale Church Lavras" className="h-16 w-auto mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-secondary-foreground">Painel Admin</h1>
          <p className="text-secondary-foreground/60 text-sm mt-1">Vale Church Lavras</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl p-6 shadow-soft space-y-4">
          <div>
            <Label htmlFor="email" className="text-foreground">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password" className="text-foreground">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full gradient-gold text-secondary font-semibold" disabled={loading}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
