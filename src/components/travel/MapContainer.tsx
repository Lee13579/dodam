"use client";

import React, { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        naver: any;
    }
}

interface ExtendedMarker {
    lat: number;
    lng: number;
    title: string;
    id: string;
    imageUrl?: string;
    price?: number;
    bookingUrl?: string;
    source?: 'NAVER' | 'AGODA' | 'KLOOK';
}

interface MapContainerProps {
    markers: ExtendedMarker[];
    focusedId?: string | null;
}

const MapContainer: React.FC<MapContainerProps> = ({ markers, focusedId }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    // Initializer
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        let retryCount = 0;
        const maxRetries = 50; // 5 seconds polling

        const initMap = () => {
            // Check if SDK is available
            if (!window.naver || !window.naver.maps) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    setMapError('네이버 지도 SDK 로드 실패. 인터넷 연결이나 Client ID 설정을 확인해주세요.');
                    return true; // Stop polling
                }
                return false;
            }

            console.log("Naver Map SDK loaded. Initializing map...");

            // Check if map container is ready
            if (!mapRef.current) return false;

            // Avoid double init
            if (mapInstance.current) {
                setIsMapLoaded(true);
                return true;
            }

            try {
                const mapOptions = {
                    center: new window.naver.maps.LatLng(37.5665, 126.978),
                    zoom: 12,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: window.naver.maps.Position.TOP_RIGHT,
                    },
                    logoControl: false,
                    mapDataControl: false,
                };

                mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);
                setIsMapLoaded(true);
                return true;
            } catch (e: any) {
                console.error('Map Init Failed:', e);
                // Check specifically for authentication errors if possible, usually thrown during Map creation or tile loading
                setMapError(`지도 초기화 실패: ${e.message}`);
                return true;
            }
        };

        // Try immediately
        if (!initMap()) {
            // If failed, poll every 100ms for up to 5 seconds
            intervalId = setInterval(() => {
                if (initMap()) {
                    clearInterval(intervalId);
                }
            }, 100);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    // Marker management
    const markerInstances = useRef<Map<string, any>>(new Map());
    const polylineInstance = useRef<any>(null);

    // Effect: Update markers
    useEffect(() => {
        if (!isMapLoaded || !mapInstance.current || !window.naver?.maps) return;

        // Clear existing
        markerInstances.current.forEach((marker) => marker.setMap(null));
        markerInstances.current.clear();

        if (polylineInstance.current) {
            polylineInstance.current.setMap(null);
        }

        const path: any[] = [];
        const bounds = new window.naver.maps.LatLngBounds();

        markers.forEach((marker, index) => {
            const position = new window.naver.maps.LatLng(marker.lat, marker.lng);
            path.push(position);
            bounds.extend(position);

            const isAffiliate = marker.source === 'AGODA' || marker.source === 'KLOOK';
            const markerColor = isAffiliate ? '#ec4899' : '#8B7355'; // Pink for Affiliate, Brown/Gold for Naver

            const newMarker = new window.naver.maps.Marker({
                position: position,
                map: mapInstance.current,
                title: marker.title,
                icon: {
                    content: `
                        <div class="relative transition-transform duration-300 ease-out marker-container" id="marker-${marker.id}">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white ring-2 ring-black/5" style="background-color: ${markerColor}">
                                ${index + 1}
                            </div>
                            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-white" style="background-color: ${markerColor}"></div>
                        </div>
                    `,
                    anchor: new window.naver.maps.Point(16, 36),
                },
                zIndex: 100 + index
            });

            // Rich InfoWindow content
            const imageHtml = marker.imageUrl ?
                `<div style="width:100%; height:120px; background-image:url('${marker.imageUrl}'); background-size:cover; background-position:center; border-radius:12px 12px 0 0;"></div>` : '';

            const badgeHtml = marker.source === 'AGODA' ? `<span style="background:#dbeafe; color:#1d4ed8; font-size:10px; padding:2px 6px; border-radius:99px; font-weight:800; display:inline-block; margin-bottom:4px;">AGODA</span>` :
                marker.source === 'KLOOK' ? `<span style="background:#ffedd5; color:#c2410c; font-size:10px; padding:2px 6px; border-radius:99px; font-weight:800; display:inline-block; margin-bottom:4px;">KLOOK</span>` : '';

            const infoWindowContent = `
                <div style="min-width:200px; background:white; border-radius:16px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border:none; padding:0; overflow:hidden; font-family:sans-serif;">
                    ${imageHtml}
                    <div style="padding:16px;">
                        ${badgeHtml}
                        <p style="font-size:10px; font-weight:700; color:#ec4899; margin:0 0 2px 0; letter-spacing:0.05em;">STEP ${index + 1}</p>
                        <h4 style="font-size:15px; font-weight:800; color:#1c1917; margin:0 0 4px 0; line-height:1.3;">${marker.title}</h4>
                        ${marker.price ? `<p style="font-size:13px; font-weight:700; color:#57534e;">₩${marker.price.toLocaleString()}</p>` : ''}
                    </div>
                </div>
            `;

            const infoWindow = new window.naver.maps.InfoWindow({
                content: infoWindowContent,
                borderWidth: 0,
                backgroundColor: "transparent",
                disableAnchor: true,
                pixelOffset: new window.naver.maps.Point(0, -10)
            });

            window.naver.maps.Event.addListener(newMarker, "click", () => {
                // If it's already open, close it? Or just keep opening (standard map behavior)
                // Let's maximize focus
                infoWindow.open(mapInstance.current, newMarker);
            });

            // Auto open for affiliate markers initially? Maybe too cluttered.
            // But if it's the focused ID, maybe?

            markerInstances.current.set(marker.id, newMarker);
        });

        // Draw Polyline
        if (markers.length > 1) {
            if (polylineInstance.current) {
                polylineInstance.current.setMap(null);
            }

            const linePath = markers.map(m => new window.naver.maps.LatLng(m.lat, m.lng));

            polylineInstance.current = new window.naver.maps.Polyline({
                map: mapInstance.current,
                path: linePath,
                strokeColor: '#ec4899',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                strokeStyle: 'solid',
                strokeLineCap: 'round',
                strokeLineJoin: 'round'
            });
        }

        // Fit Bounds
        if (markers.length > 0) {
            mapInstance.current.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 });
        }

    }, [markers, isMapLoaded]);

    // Effect: Handle Highlight
    useEffect(() => {
        if (!isMapLoaded || !focusedId) return;

        const marker = markerInstances.current.get(focusedId);
        if (marker) {
            marker.setAnimation(window.naver.maps.Animation.BOUNCE);
            marker.setZIndex(999);
            // Optional: Pan to marker
            // mapInstance.current.panTo(marker.getPosition());
        }

        return () => {
            if (marker) {
                marker.setAnimation(null);
                marker.setZIndex(100);
            }
        };
    }, [focusedId, isMapLoaded]);

    return (
        <div className={`w-full h-full min-h-[400px] relative rounded-xl overflow-hidden shadow-lg border bg-stone-50 ${mapError ? 'border-red-200' : 'border-stone-200'}`}>
            {mapError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-red-50/90 backdrop-blur-md z-50">
                    <div className="w-16 h-16 bg-white text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl shadow-sm border border-red-100">
                        ⚠️
                    </div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">지도 로드 실패</h3>
                    <p className="text-sm text-red-600/90 mb-6 leading-relaxed max-w-xs">
                        {mapError}
                    </p>
                    <div className="bg-white p-4 rounded-2xl border border-red-100 text-[11px] text-stone-500 w-full max-w-sm text-left shadow-sm">
                        <p className="font-bold mb-2 text-red-700 flex items-center gap-2">
                            🔍 점검 포인트
                        </p>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>
                                <b>Client ID 확인:</b><br />
                                <code className="bg-stone-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                                    {process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
                                        ? `${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID.slice(0, 4)}****`
                                        : '설정되지 않음 (NULL)'}
                                </code>
                            </li>
                            <li>
                                <b>허용 URL (Web 서비스 URL):</b><br />
                                <code className="bg-stone-100 px-1.5 py-0.5 rounded mt-1 inline-block break-all">
                                    {typeof window !== 'undefined' ? window.location.origin : '...'}
                                </code>
                            </li>
                            <li className="text-xs text-stone-400 mt-1">
                                .env.local 파일에 <code>NEXT_PUBLIC_NAVER_MAP_CLIENT_ID</code>가 올바르게 설정되었는지 확인해주세요.
                            </li>
                        </ul>
                    </div>
                </div>
            ) : null}
            <div ref={mapRef} id="naver-map" className="w-full h-full" />
        </div>
    );
};

export default MapContainer;
