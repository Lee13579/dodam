"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StylingHero from "@/components/StylingHero";
import StylingWorkflow from "@/components/StylingWorkflow";

export default function StylingPage() {
    return (
        <main className="min-h-screen bg-[#fffdfa] text-[#433422]">
            <Header transparentMode />

            <StylingHero />

            <section className="bg-white">
                <StylingWorkflow />
            </section>

            <Footer />
        </main>
    );
}
