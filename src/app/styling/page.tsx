"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StylingHero from "@/components/StylingHero";
import StylingWorkflow from "@/components/StylingWorkflow";
import GallerySlider from "@/components/GallerySlider";

export default function StylingPage() {
    const [step, setStep] = useState(1);

    return (
        <main className="min-h-screen bg-[#fffdfa] text-[#433422] pt-[72px]">
            <Header />

            <StylingHero />

            <section className="bg-white">
                <StylingWorkflow step={step} setStep={setStep} />
            </section>

            {step === 1 && <GallerySlider />}

            <Footer />
        </main>
    );
}
