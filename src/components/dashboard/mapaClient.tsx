'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Contato {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  contatos: Contato[];
  selected?: Contato | null;
}

export function MapClient({ contatos, selected }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
    });

    loader.load().then(() => {
      console.log('Google Maps API carregada ✅');

      if (mapRef.current && !mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: -23.55052, lng: -46.633308 },
          zoom: 5,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Limpar marcadores antigos
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    contatos.forEach((contato) => {
      if (contato.latitude && contato.longitude) {
        console.log(
          'Plotando:',
          contato.name,
          contato.latitude,
          contato.longitude
        );

        const lat = Number(contato.latitude);
        const lng = Number(contato.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          const position = { lat, lng };

          const marker = new google.maps.Marker({
            position,
            map: mapInstance.current!,
            title: contato.name,
          });

          markersRef.current.push(marker);
          bounds.extend(position);
        }
      }
    });

    if (!bounds.isEmpty()) {
      mapInstance.current!.fitBounds(bounds);
    }
  }, [contatos]);

  useEffect(() => {
    if (
      selected &&
      selected.latitude &&
      selected.longitude &&
      mapInstance.current
    ) {
      const lat = Number(selected.latitude);
      const lng = Number(selected.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const position = { lat, lng };
        mapInstance.current.panTo(position);
        mapInstance.current.setZoom(15);
        console.log('Centralizando no contato selecionado:', selected.name);
      }
    }
  }, [selected]);

  return <div ref={mapRef} className="flex-1" />;
}
