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

export function CreateContactDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cep: '',
    address: '',
    tipo_contrato: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCepBlur = async () => {
    if (form.cep.length === 8) {
      const res = await fetch(`https://viacep.com.br/ws/${form.cep}/json`);
      const data = await res.json();
      if (!data.erro) {
        const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        setForm((prev) => ({ ...prev, address: endereco }));
        await fetchGeocode(endereco);
      }
    }
  };

  const fetchGeocode = async (address: string) => {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    const location = data.results?.[0]?.geometry?.location;
    if (location) {
      setForm((prev) => ({
        ...prev,
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
      }));
    }
  };

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onCreated();
      setOpen(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        cep: '',
        address: '',
        tipo_contrato: '',
        latitude: '',
        longitude: '',
      });
    } else {
      alert('Erro ao criar contato');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 w-full" variant="default">
          + Novo contato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Contato</DialogTitle>
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
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            name="cep"
            placeholder="CEP"
            value={form.cep}
            onChange={handleChange}
            onBlur={handleCepBlur}
          />
          <Input
            name="address"
            placeholder="Endereço"
            value={form.address}
            readOnly
          />
          <Input
            name="tipo_contrato"
            placeholder="Tipo de contrato (mensal/anual)"
            value={form.tipo_contrato}
            onChange={handleChange}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleCreate}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
