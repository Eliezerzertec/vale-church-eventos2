import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Music2, Pencil, Trash2, CheckCircle2 } from "lucide-react";

const client = supabase as any; // casting to bypass strict typing for new tables not in generated types

interface Ministry {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  display_order?: number | null;
}

interface Role {
  id: string;
  ministry_id: string;
  name: string;
  description?: string;
  slots?: number | null;
  is_active: boolean;
  display_order?: number | null;
}

const AdminAuditions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);
  const [ministryForm, setMinistryForm] = useState({ name: "", description: "" });
  const [roleForm, setRoleForm] = useState({ name: "", description: "", slots: "", ministry_id: "" });
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const { data: ministries, isLoading: loadingMinistries } = useQuery({
    queryKey: ["audition-ministries"],
    queryFn: async () => {
      const { data, error } = await client
        .from("audition_ministries")
        .select("*")
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Ministry[];
    },
  });

  useEffect(() => {
    if (ministries && ministries.length > 0 && !selectedMinistry) {
      setSelectedMinistry(ministries[0].id);
      setRoleForm((prev) => ({ ...prev, ministry_id: ministries[0].id }));
    }
  }, [ministries, selectedMinistry]);

  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ["audition-roles", selectedMinistry],
    enabled: !!selectedMinistry,
    queryFn: async () => {
      const { data, error } = await client
        .from("audition_roles")
        .select("*")
        .eq("ministry_id", selectedMinistry)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Role[];
    },
  });

  const ministryMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: ministryForm.name.trim(),
        description: ministryForm.description.trim() || null,
        is_active: true,
      };
      const { error } = await client.from("audition_ministries").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      setMinistryForm({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["audition-ministries"] });
      toast({ title: "Ministério criado" });
    },
    onError: (error: any) => toast({ title: "Erro ao criar", description: error.message, variant: "destructive" }),
  });

  const toggleMinistry = useMutation({
    mutationFn: async (ministry: Ministry) => {
      const { error } = await client
        .from("audition_ministries")
        .update({ is_active: !ministry.is_active })
        .eq("id", ministry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition-ministries"] });
      toast({ title: "Ministério atualizado" });
    },
    onError: (error: any) => toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" }),
  });

  const deleteMinistry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.from("audition_ministries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition-ministries"] });
      queryClient.invalidateQueries({ queryKey: ["audition-roles"] });
      toast({ title: "Ministério removido" });
    },
    onError: (error: any) => toast({ title: "Erro ao remover", description: error.message, variant: "destructive" }),
  });

  const upsertRole = useMutation({
    mutationFn: async () => {
      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || null,
        slots: roleForm.slots ? Number(roleForm.slots) : null,
        ministry_id: roleForm.ministry_id || selectedMinistry,
        is_active: true,
      };
      if (!payload.ministry_id) throw new Error("Selecione um ministério");
      if (!payload.name) throw new Error("Nome da função é obrigatório");

      if (editingRoleId) {
        const { error } = await client.from("audition_roles").update(payload).eq("id", editingRoleId);
        if (error) throw error;
      } else {
        const { error } = await client.from("audition_roles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setRoleForm((prev) => ({ ...prev, name: "", description: "", slots: "" }));
      setEditingRoleId(null);
      queryClient.invalidateQueries({ queryKey: ["audition-roles", selectedMinistry] });
      toast({ title: editingRoleId ? "Função atualizada" : "Função criada" });
    },
    onError: (error: any) => toast({ title: "Erro na função", description: error.message, variant: "destructive" }),
  });

  const toggleRole = useMutation({
    mutationFn: async (role: Role) => {
      const { error } = await client
        .from("audition_roles")
        .update({ is_active: !role.is_active })
        .eq("id", role.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition-roles", selectedMinistry] });
      toast({ title: "Função atualizada" });
    },
    onError: (error: any) => toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" }),
  });

  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.from("audition_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audition-roles", selectedMinistry] });
      toast({ title: "Função removida" });
    },
    onError: (error: any) => toast({ title: "Erro ao remover", description: error.message, variant: "destructive" }),
  });

  const selected = useMemo(
    () => ministries?.find((m) => m.id === selectedMinistry) || null,
    [ministries, selectedMinistry]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Music2 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Audições</h1>
          <p className="text-sm text-muted-foreground">Cadastre ministérios e funções abertas para audições.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Ministérios</CardTitle>
            <CardDescription>Crie e ative/desative ministérios que terão vagas abertas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                ministryMutation.mutate();
              }}
            >
              <div className="grid gap-2">
                <Label>Nome *</Label>
                <Input
                  value={ministryForm.name}
                  onChange={(e) => setMinistryForm({ ...ministryForm, name: e.target.value })}
                  placeholder="Louvor, Midia, Dança..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input
                  value={ministryForm.description}
                  onChange={(e) => setMinistryForm({ ...ministryForm, description: e.target.value })}
                  placeholder="Resumo do ministério"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={ministryMutation.isPending}>
                  {ministryMutation.isPending ? "Salvando..." : "Adicionar"}
                </Button>
              </div>
            </form>

            <Separator />

            <div className="space-y-3">
              {loadingMinistries ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : !ministries || ministries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum ministério cadastrado.</p>
              ) : (
                ministries.map((min) => {
                  const isSelected = min.id === selectedMinistry;
                  return (
                    <div
                      key={min.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                        isSelected ? "border-primary/60 bg-primary/5" : "border-border/60"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedMinistry(min.id);
                              setRoleForm((prev) => ({ ...prev, ministry_id: min.id }));
                            }}
                          >
                            {min.name}
                          </Button>
                          {!min.is_active && <Badge variant="outline">Inativo</Badge>}
                        </div>
                        {min.description && <p className="text-xs text-muted-foreground">{min.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={min.is_active}
                          onCheckedChange={() => toggleMinistry.mutate(min)}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMinistry.mutate(min.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Funções por ministério</CardTitle>
            <CardDescription>Cadastre e ative/desative funções que aparecerão na página pública de audições.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                upsertRole.mutate();
              }}
            >
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Ministério *</Label>
                  <Select
                    value={roleForm.ministry_id || selectedMinistry || ""}
                    onValueChange={(value) => {
                      setRoleForm((prev) => ({ ...prev, ministry_id: value }));
                      setSelectedMinistry(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ministries?.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Nome da função *</Label>
                  <Input
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="Ex.: Vocal, Guitarra, Técnico de áudio"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Input
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="Resumo do que esperamos"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Vagas</Label>
                  <Input
                    value={roleForm.slots}
                    onChange={(e) => setRoleForm({ ...roleForm, slots: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={upsertRole.isPending}>
                  {upsertRole.isPending ? "Salvando..." : editingRoleId ? "Salvar alterações" : "Adicionar função"}
                </Button>
                {editingRoleId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingRoleId(null);
                      setRoleForm((prev) => ({ ...prev, name: "", description: "", slots: "" }));
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>

            <Separator />

            <div className="space-y-3">
              {loadingRoles ? (
                <p className="text-sm text-muted-foreground">Carregando funções...</p>
              ) : !roles || roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma função cadastrada para este ministério.</p>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{role.name}</span>
                        {!role.is_active && <Badge variant="outline">Inativo</Badge>}
                        {role.slots ? (
                          <Badge variant="secondary">{role.slots} vagas</Badge>
                        ) : (
                          <Badge variant="secondary">Vagas abertas</Badge>
                        )}
                      </div>
                      {role.description && <p className="text-xs text-muted-foreground">{role.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingRoleId(role.id);
                          setRoleForm({
                            name: role.name,
                            description: role.description || "",
                            slots: role.slots?.toString() || "",
                            ministry_id: role.ministry_id,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleRole.mutate(role)}
                        className={role.is_active ? "text-green-600" : "text-muted-foreground"}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteRole.mutate(role.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuditions;
