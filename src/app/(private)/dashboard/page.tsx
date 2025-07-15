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
import { CreateContactDialog } from '@/components/contacts/CreateContactDialog';

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
  const [ordenacao, setOrdenacao] = useState<
    'nome_asc' | 'nome_desc' | 'tipo_contrato'
  >('nome_asc');
  const [selectedContact, setSelectedContact] = useState<Contato | null>(null);

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

  const contatosFiltrados = contatos
    .filter((c) => {
      const termo = `${c.name} ${c.address || ''}`.toLowerCase();
      return (
        termo.includes(search.toLowerCase()) &&
        (tipoContrato === 'todos' || c.tipo_contrato === tipoContrato)
      );
    })
    .sort((a, b) => {
      if (ordenacao === 'nome_asc') return a.name.localeCompare(b.name);
      if (ordenacao === 'nome_desc') return b.name.localeCompare(a.name);
      if (ordenacao === 'tipo_contrato')
        return (a.tipo_contrato || '').localeCompare(b.tipo_contrato || '');
      return 0;
    });

  return (
    <div className="flex h-screen">
      <div className="w-[400px] border-r p-4 overflow-y-auto">
        <CreateContactDialog onCreated={fetchContacts} />
        <div className="flex flex-wrap gap-2 mb-4">
          <Select
            onValueChange={(value) => setTipoContrato(value)}
            value={tipoContrato}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={ordenacao}
            onValueChange={(value) =>
              setOrdenacao(value as 'nome_asc' | 'nome_desc' | 'tipo_contrato')
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome_asc">Nome (A–Z)</SelectItem>
              <SelectItem value="nome_desc">Nome (Z–A)</SelectItem>
              <SelectItem value="tipo_contrato">Tipo de contrato</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Buscar por nome ou unidade"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[120px]"
          />
        </div>

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
