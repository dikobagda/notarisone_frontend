"use client";

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface MapViewProps {
  lat: number;
  lng: number;
}

const libraries: any[] = ["places"];

export default function MapView({ lat, lng }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 gap-3">
        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Peta...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat, lng }}
      zoom={16}
      options={{
        disableDefaultUI: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      }}
    >
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  );
}
