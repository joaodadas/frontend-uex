'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ResetarSenhaPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const email = params.get('email');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token || !email) {
      toast.error('Link de redefinição inválido ou expirado.');
      return;
    }

    if (!password || !confirm) {
      toast.error('Preencha todos os campos.');
      return;
    }

    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            email,
            password,
            password_confirmation: confirm,
          }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        toast.success('Senha redefinida com sucesso!');
        router.push('/login');
      } else {
        toast.error(data.message || 'Erro ao redefinir a senha.');
      }
    } catch {
      setLoading(false);
      toast.error('Erro de rede. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-xl font-semibold text-center">Redefinir Senha</h1>
      <Input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Confirmar senha"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
      </Button>
    </div>
  );
}
