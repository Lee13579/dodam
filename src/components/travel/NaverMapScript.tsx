"use client";

import Script from "next/script";

export default function NaverMapScript() {
    return (
        <Script
            strategy="lazyOnload"
            src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${(process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '').trim()}&submodules=geocoder`}
        />
    );
}
