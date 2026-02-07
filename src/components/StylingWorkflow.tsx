"use client";

import { useEffect } from "react";
import { useStylingEngine } from "@/hooks/useStylingEngine";
import { AnimatePresence } from "framer-motion";

// Step Components
import StylingStep1 from "./styling/steps/StylingStep1";
import StylingStep2 from "./styling/steps/StylingStep2";
import StylingStep3 from "./styling/steps/StylingStep3";

interface StylingWorkflowProps {
    step: number;
    setStep: (step: number) => void;
}

export default function StylingWorkflow({ step, setStep }: StylingWorkflowProps) {
    const engine = useStylingEngine();

    // Sync local engine step with parent controlled step
    useEffect(() => {
        setStep(engine.step);
    }, [engine.step, setStep]);

    return (
        <div id="workflow" className="max-w-7xl mx-auto py-24 px-6 relative z-10">
            {/* Background decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(255,244,230,0.4)_0%,transparent_70%)] -z-10 pointer-events-none" />

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <StylingStep1
                        key="step1"
                        file={engine.file}
                        setFile={engine.setFile}
                        dogName={engine.dogName}
                        setDogName={engine.setDogName}
                        mode={engine.mode}
                        setMode={engine.setMode}
                        loading={engine.loading}
                        loadingStep={engine.loadingStep}
                        onSubmit={engine.handleStep1Submit}
                    />
                )}

                {step === 2 && (
                    <StylingStep2
                        key="step2"
                        mode={engine.mode}
                        setMode={engine.setMode}
                        previewUrl={engine.previewUrl}
                        recommendations={engine.recommendations}
                        style={engine.style}
                        setStyle={engine.setStyle}
                        customPrompt={engine.customPrompt}
                        setCustomPrompt={engine.setCustomPrompt}
                        userRequest={engine.userRequest}
                        setUserRequest={engine.setUserRequest}
                        keepBackground={engine.keepBackground}
                        setKeepBackground={engine.setKeepBackground}
                        loading={engine.loading}
                        loadingStep={engine.loadingStep}
                        handleReset={engine.handleReset}
                        handleStartAnalysis={engine.handleStartAnalysis}
                        selectedCloth={engine.selectedCloth}
                        setSelectedCloth={engine.setSelectedCloth}
                        selectedAcc={engine.selectedAcc}
                        setSelectedAcc={engine.setSelectedAcc}
                        suggestedClothes={engine.suggestedClothes}
                        suggestedAccessories={engine.suggestedAccessories}
                        handleItemUpload={engine.handleItemUpload}
                    />
                )}

                {step === 3 && (
                    <StylingStep3
                        key="step3"
                        results={engine.results}
                        dogName={engine.dogName}
                        products={engine.products}
                        loadingMore={engine.loadingMore}
                        retryCount={engine.retryCount}
                        handleReset={engine.handleReset}
                        handleRetry={engine.handleRetry}
                        handleLoadMoreProducts={engine.handleLoadMoreProducts}
                        selectedCloth={engine.selectedCloth}
                        selectedAcc={engine.selectedAcc}
                        recommendations={engine.recommendations}
                        style={engine.style}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
