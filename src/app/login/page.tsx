'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // ou outro componente de alerta

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      console.log(
        'Enviando login para:',
        `${process.env.NEXT_PUBLIC_API_URL}/api/login`
      );

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Resposta da API:', res.status, data);

      if (!res.ok) {
        // ✅ Mostrar erro antes de lançar
        toast.error(data.message || 'Erro ao fazer login');
        throw new Error(data.message || 'Erro ao fazer login');
      }

      localStorage.setItem('token', data.token);

      // tenta validar o token antes de redirecionar
      const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!me.ok) {
        toast.error('Token inválido');
        localStorage.removeItem('token');
        return;
      }

      toast.success('Login realizado com sucesso');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro no login';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md px-6 py-8">
        <div className="flex items-center gap-2 w-full justify-center mb-2">
          <p className="text-xl font-medium">UEX</p>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Faça login na sua conta
        </p>

        <form
          className="flex flex-col mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
        >
          <Label htmlFor="email" className="text-sm ml-1">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2"
            placeholder="paul@graham.com"
          />
          <Label htmlFor="password" className="mt-4 text-sm ml-1">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="mt-2"
            placeholder="********"
          />

          <div className="flex w-full justify-end mt-2">
            <Link href="/esqueci-senha">
              <p className="text-sm text-muted-foreground hover:underline">
                Esqueceu a senha?
              </p>
            </Link>
          </div>

          <div className="flex gap-2 mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

          <div className="flex items-center justify-center mt-8 gap-1">
            <p className="text-sm text-muted-foreground">
              Ainda não tem uma conta?
            </p>
            <Link href="/register">
              <p className="text-sm hover:underline">Cadastre-se</p>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
