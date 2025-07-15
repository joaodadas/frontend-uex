'use client';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Props {
  contato: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    cep: string;
    tipo_contrato?: string;
    unidade?: string;
  };
  onUpdated: () => void;
}

export function EditContactDialog({ contato, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...contato });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${contato.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      onUpdated();
      setOpen(false);
    } else {
      alert('Erro ao atualizar contato');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Contato</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            name="name"
            placeholder="Nome"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="Telefone"
            value={form.phone || ''}
            onChange={handleChange}
          />
          <Input
            name="cep"
            placeholder="CEP"
            value={form.cep}
            onChange={handleChange}
          />
          <Input
            name="tipo_contrato"
            placeholder="Tipo de contrato"
            value={form.tipo_contrato || ''}
            onChange={handleChange}
          />
          <Input
            name="unidade"
            placeholder="Unidade"
            value={form.unidade || ''}
            onChange={handleChange}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
