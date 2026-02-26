import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, ArrowLeft, Upload, Camera } from "lucide-react";

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/admin/login");
          return;
        }

        setUser(session.user);
        setFormData(prev => ({
          ...prev,
          email: session.user.email || "",
          fullName: session.user.user_metadata?.full_name || "",
        }));

        // Carregar avatar URL
        if (session.user.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }
      } catch (error: any) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast({ title: "Erro", description: "Selecione uma imagem válida", variant: "destructive" });
        return;
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Erro", description: "A imagem não pode ter mais de 5MB", variant: "destructive" });
        return;
      }

      setAvatarFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !user) return;

    setUploadingAvatar(true);
    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${avatarFile.name}`;

      // Upload para Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Salvar URL no user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          full_name: formData.fullName || user.user_metadata?.full_name,
        },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setAvatarFile(null);
      setAvatarPreview(null);

      toast({
        title: "Sucesso",
        description: "Avatar enviado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar avatar",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Atualizar nome completo com avatar_url
      const updateData: any = {
        data: {
          full_name: formData.fullName,
        },
      };

      // Incluir avatar_url se tiver sido salvo
      if (avatarUrl) {
        updateData.data.avatar_url = avatarUrl;
      }

      const { error } = await supabase.auth.updateUser(updateData);
      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações e configurações de segurança</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* Dados Pessoais */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>Atualize suas informações de perfil</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Avatar Section */}
              <div className="space-y-3">
                <Label className="text-foreground">Avatar</Label>
                <div className="flex gap-4 items-start">
                  {/* Avatar Preview */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-lg bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Label htmlFor="avatar" className="block">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 cursor-pointer w-full"
                        onClick={() => document.getElementById("avatar")?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Escolher Imagem
                      </Button>
                    </Label>
                    {avatarFile && (
                      <Button
                        type="button"
                        variant="default"
                        className="w-full gap-2"
                        onClick={handleUploadAvatar}
                        disabled={uploadingAvatar}
                      >
                        <Camera className="h-4 w-4" />
                        {uploadingAvatar ? "Enviando..." : "Enviar Avatar"}
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG ou GIF. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  E-mail não pode ser alterado. Entre em contato com o suporte.
                </p>
              </div>

              <div>
                <Label htmlFor="fullName" className="text-foreground">Nome Completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Segurança
            </CardTitle>
            <CardDescription>Altere sua senha regularmente para proteger sua conta</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-foreground">Nova Senha</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repita sua senha"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>

              <Button type="submit" disabled={saving || !formData.newPassword} className="gap-2">
                {saving ? "Atualizando..." : "Atualizar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informações de Conta */}
        <Card className="shadow-soft">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Informações de Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">ID da Conta</p>
              <p className="text-sm font-mono text-foreground">{user?.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Membro Desde</p>
              <p className="text-sm text-foreground">
                {new Date(user?.created_at).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Status</p>
              <p className="text-sm text-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Ativo
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;
