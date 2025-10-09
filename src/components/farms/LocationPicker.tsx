// src/components/farms/LocationPicker.tsx

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglo para un bug conocido de Leaflet con bundlers como Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;  
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Componente interno para manejar los eventos del mapa
function MapEvents({ onLocationChange, setMarkerPosition }: any) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setMarkerPosition([lat, lng]);
            onLocationChange({ lat, lng });
        },
    });
    return null;
}

interface LocationPickerProps {
    initialPosition: [number, number];
    onLocationChange: (coords: { lat: number; lng: number; }) => void;
}

const LocationPicker = ({ initialPosition, onLocationChange }: LocationPickerProps) => {
    const [markerPosition, setMarkerPosition] = useState<[number, number]>(initialPosition);

    const eventHandlers = useMemo(
        () => ({
            dragend(event: any) {
                const marker = event.target;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    setMarkerPosition([lat, lng]);
                    onLocationChange({ lat, lng });
                }
            },
        }),
        [onLocationChange],
    );

    return (
        <MapContainer center={markerPosition} zoom={13} scrollWheelZoom={false} className="location-picker-map">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={markerPosition}
            >
                <Popup>Arrastra o haz clic en el mapa para ubicar la finca.</Popup>
            </Marker>
            <MapEvents setMarkerPosition={setMarkerPosition} onLocationChange={onLocationChange} />
        </MapContainer>
    );
};

export default LocationPicker;