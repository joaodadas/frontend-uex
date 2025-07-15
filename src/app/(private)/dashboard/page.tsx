'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { MapClient } from '@/components/dashboard/mapaClient';
import { EditContactDialog } from '@/components/contacts/EditContactDialog';
import { DeleteContactDialog } from '@/components/contacts/DeleteContactDialog';

interface Contato {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tipo_contrato?: string;
  latitude?: number;
  longitude?: number;
  cep: string;
}

export default function ContatosPage() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [search, setSearch] = useState('');
  const [tipoContrato, setTipoContrato] = useState<string>('todos');
  const [selectedContact, setSelectedContact] = useState<Contato | null>(null); // 👈 novo

  const fetchContacts = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setContatos(data));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const contatosFiltrados = contatos.filter((c) => {
    const termo = `${c.name} ${c.address || ''}`.toLowerCase();
    return (
      termo.includes(search.toLowerCase()) &&
      (tipoContrato === 'todos' || c.tipo_contrato === tipoContrato)
    );
  });

  return (
    <div className="flex h-screen">
      <div className="w-[400px] border-r p-4 overflow-y-auto">
        <Select
          onValueChange={(value) => setTipoContrato(value)}
          value={tipoContrato}
        >
          <SelectTrigger className="mb-4">
            <SelectValue placeholder="Tipo de Contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Conta, Unidade"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        {contatosFiltrados.map((contato) => (
          <Card
            key={contato.id}
            className={`mb-2 p-4 cursor-pointer ${
              selectedContact?.id === contato.id
                ? 'border-primary bg-muted'
                : ''
            }`}
            onClick={() => setSelectedContact(contato)} // 👈 novo
          >
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold text-sm truncate">{contato.name}</p>
              <div className="flex gap-1">
                <EditContactDialog
                  contato={contato}
                  onUpdated={fetchContacts}
                />
                <DeleteContactDialog
                  contatoId={contato.id}
                  onDeleted={fetchContacts}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {contato.address || 'Sem unidade'}
            </p>
            <p className="text-xs text-muted-foreground italic">
              {contato.tipo_contrato || 'Sem contrato'}
            </p>
          </Card>
        ))}
      </div>
      <MapClient contatos={contatosFiltrados} selected={selectedContact} />{' '}
      {/* 👈 novo */}
    </div>
  );
}
