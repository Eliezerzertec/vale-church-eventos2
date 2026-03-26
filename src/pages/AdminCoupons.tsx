import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Gift, Plus, Trash2, X, Copy, Check } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  notes: string;
  discountKind: 'PERCENTAGE' | 'FIXED';
  discount: number;
  maxRedeems: number;
  redeemsCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export default function AdminCoupons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    notes: '',
    discountKind: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discount: '',
    maxRedeems: '-1',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Listar cupons
  const { data: couponsResponse, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await fetch('/api/coupons/list');
      const data = await res.json();
      return data;
    },
    refetchInterval: 5000,
  });

  const coupons: Coupon[] = couponsResponse?.data || [];

  // Criar cupom
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.notes.trim() || !formData.discount) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/coupon/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          notes: formData.notes.trim(),
          discountKind: formData.discountKind,
          discount: Number(formData.discount),
          maxRedeems: Number(formData.maxRedeems),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Erro ao criar cupom',
          description: data?.error || 'Erro desconhecido',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Cupom criado!',
        description: `${formData.code.toUpperCase()} criado com sucesso`,
      });

      setFormData({
        code: '',
        notes: '',
        discountKind: 'PERCENTAGE',
        discount: '',
        maxRedeems: '-1',
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar cupom',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getDiscountLabel = (coupon: Coupon) => {
    if (coupon.discountKind === 'PERCENTAGE') {
      return `${coupon.discount}%`;
    }
    return `R$ ${(coupon.discount / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          Ativo
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
        Inativo
      </span>
    );
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      toast({
        title: 'Copiado!',
        description: `Código "${code}" copiado para a área de transferência`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o código',
        variant: 'destructive'
      });
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (couponId: string) => {
      const response = await fetch(`/api/coupon/${couponId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao deletar cupom');
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Cupom deletado!',
        description: 'O cupom foi removido com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 rounded-lg p-2">
            <Gift className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">CUPONS</h1>
            <p className="text-sm text-gray-600">Gerencie os cupons de desconto</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cupom
        </Button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">CRIAR NOVO CUPOM</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Código do Cupom *
                </label>
                <Input
                  placeholder="Ex: DESCONTO10"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo de Desconto *
                </label>
                <select
                  value={formData.discountKind}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountKind: e.target.value as 'PERCENTAGE' | 'FIXED',
                    })
                  }
                  disabled={isCreating}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  <option value="PERCENTAGE">Percentual (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Desconto *
                </label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    placeholder={
                      formData.discountKind === 'PERCENTAGE'
                        ? 'Ex: 10'
                        : 'Ex: 50'
                    }
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    disabled={isCreating}
                    min="0"
                    step={formData.discountKind === 'PERCENTAGE' ? '1' : '100'}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {formData.discountKind === 'PERCENTAGE' ? '%' : 'centavos'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.discountKind === 'FIXED' &&
                    'Para R$ 50,00 use: 5000'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Limite de Resgates
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 100 (-1 para ilimitado)"
                  value={formData.maxRedeems}
                  onChange={(e) =>
                    setFormData({ ...formData, maxRedeems: e.target.value })
                  }
                  disabled={isCreating}
                  min="-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descrição *
              </label>
              <textarea
                placeholder="Ex: Desconto para membros da comunidade"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                disabled={isCreating}
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar Cupom'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de cupons */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando cupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum cupom criado ainda
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    CÓDIGO
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    DESCRIÇÃO
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    DESCONTO
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    USO
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(coupon.code, coupon.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Copiar código"
                        >
                          {copiedId === coupon.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {coupon.notes}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">
                        {getDiscountLabel(coupon)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width:
                                coupon.maxRedeems === -1
                                  ? '0%'
                                  : `${Math.min(
                                      (coupon.redeemsCount / coupon.maxRedeems) *
                                        100,
                                      100
                                    )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs whitespace-nowrap ml-2">
                          {coupon.redeemsCount}
                          {coupon.maxRedeems === -1 ? '' : `/${coupon.maxRedeems}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(coupon.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(coupon.code, coupon.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                          title="Copiar código do cupom"
                        >
                          {copiedId === coupon.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(coupon.id)}
                          disabled={deleteMutation.isPending}
                          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Deletar cupom"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
