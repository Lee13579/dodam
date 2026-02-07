
import { useState, useEffect } from "react";
import { AiConcept, DogStyle, Product, SuggestedItem } from "@/types";
import { getNaturalName } from "@/lib/utils";
import { toast } from "sonner"; // Using toast instead of alert

interface StylingResults {
    originalImage: string;
    styledImages: string[];
    analysis: string;
    baseAnalysis: string;
    description: string;
    dogName?: string;
    shoppingTip?: string;
    keywords?: string[];
    personalColor?: string;
}

const resizeImage = (file: File, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else if (height > maxWidth) {
                    width *= maxWidth / height;
                    height = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                }
                resolve(canvas.toDataURL("image/jpeg", 0.9));
            };
        };
    });
};

export const useStylingEngine = () => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [style, setStyle] = useState<DogStyle | null>(null);
    const [mode, setMode] = useState<'pictorial' | 'vto' | null>(null);
    const [keepBackground, setKeepBackground] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    const [dogName, setDogName] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [userRequest, setUserRequest] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [results, setResults] = useState<StylingResults | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [recommendations, setRecommendations] = useState<AiConcept[]>([]);
    const [personalColor, setPersonalColor] = useState<string>("#EC4899");
    const [suggestedClothes, setSuggestedClothes] = useState<SuggestedItem[]>([]);
    const [suggestedAccessories, setSuggestedAccessories] = useState<SuggestedItem[]>([]);

    const [selectedCloth, setSelectedCloth] = useState<SuggestedItem | null>(null);
    const [selectedAcc, setSelectedAcc] = useState<SuggestedItem | null>(null);

    const [shoppingQuery, setShoppingQuery] = useState("");
    const [loadingMore, setLoadingMore] = useState(false);



    useEffect(() => {
        if (!loading) return;
        const messages = [
            "아이의 모색과 체형을 분석하고 있어요...",
            "가장 잘 어울리는 컬러를 찾는 중이에요...",
            "트렌디한 아이템을 매칭하고 있어요...",
            "에디터가 추천사를 작성하고 있어요...",
            "멋진 화보를 완성하는 중입니다..."
        ];
        let idx = 0;
        const interval = setInterval(() => {
            idx = (idx + 1) % messages.length;
            setLoadingStep(messages[idx]);
        }, 2500);
        return () => clearInterval(interval);
    }, [loading]);

    const handleReset = () => {
        setFile(null);
        setPreviewUrl(null);
        setStyle(null);
        setMode(null);
        setSelectedCloth(null);
        setSelectedAcc(null);
        setRecommendations([]);
        setSuggestedClothes([]);
        setSuggestedAccessories([]);
        setProducts([]);
        setResults(null);
        setDogName("");
        setCustomPrompt("");
        setUserRequest("");
        setKeepBackground(false);
        setStep(1);
        setRetryCount(0);
    };

    const fetchRealProductForItem = async (item: SuggestedItem): Promise<SuggestedItem> => {
        try {
            const res = await fetch(`/api/partners?query=${encodeURIComponent(item.searchKeyword)}&start=1`);
            const products = await res.json();
            if (products && products.length > 0) return { ...item, realProduct: products[0] };
            return item;
        } catch { return item; }
    };

    const handleStep1Submit = async () => {
        if (!file || !mode) return;
        setLoading(true);
        const dispName = getNaturalName(dogName);
        setLoadingStep(`${dispName}의 매력을 분석하는 중...`);

        try {
            const base64 = await resizeImage(file);
            setPreviewUrl(base64);
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 }),
            });
            const data = await res.json();
            if (res.ok && data.concepts?.length > 0) {
                setRecommendations(data.concepts);
                if (data.personalColor) setPersonalColor(data.personalColor);
                setLoadingStep("어울리는 실제 아이템을 매칭하는 중...");
                const clothesWithReal = await Promise.all((data.suggestedClothes || []).map(fetchRealProductForItem));
                const accWithReal = await Promise.all((data.suggestedAccessories || []).map(fetchRealProductForItem));
                setSuggestedClothes(clothesWithReal);
                setSuggestedAccessories(accWithReal);
                setStep(2);
            } else throw new Error(data.details || "분석 실패");
        } catch (e: any) {
            toast.error(`분석 중 오류가 발생했습니다: ${e.message}`);
        } finally {
            setLoading(false);
            setLoadingStep("");
        }
    };

    const handleStartAnalysis = async () => {
        if (!file || (!style && !selectedCloth && !selectedAcc)) return;
        setLoading(true);

        try {
            const base64 = await resizeImage(file);
            let generationPrompt = "";
            let keywords: string[] = [];
            let currentShoppingTip = "";

            const itemImages: { cloth?: string, acc?: string } = {};

            if (selectedCloth || selectedAcc) {
                const items = [];
                if (selectedCloth) {
                    if (selectedCloth.isUserUploaded) {
                        itemImages.cloth = selectedCloth.image;
                        items.push("the clothing in the second image");
                    } else {
                        const name = selectedCloth.realProduct?.name || selectedCloth.name;
                        if (selectedCloth.realProduct?.image) {
                            itemImages.cloth = selectedCloth.realProduct.image;
                            items.push(`the exact ${name} shown in the second image`);
                        } else items.push(name);
                        keywords.push(selectedCloth.searchKeyword || selectedCloth.name);
                    }
                }
                if (selectedAcc) {
                    if (selectedAcc.isUserUploaded) {
                        itemImages.acc = selectedAcc.image;
                        items.push(`the accessory in the ${itemImages.cloth ? 'third' : 'second'} image`);
                    } else {
                        const name = selectedAcc.realProduct?.name || selectedAcc.name;
                        if (selectedAcc.realProduct?.image) {
                            itemImages.acc = selectedAcc.realProduct.image;
                            items.push(`the exact ${name} shown in the ${itemImages.cloth ? 'third' : 'second'} image`);
                        } else items.push(name);
                        keywords.push(selectedAcc.searchKeyword || selectedAcc.name);
                    }
                }
                generationPrompt = `[VTO] precisely dress the dog in ${items.join(" and ")}`;
                currentShoppingTip = "의류와 액세서리의 조화가 아주 훌륭해요. 실루엣과 디테일을 꼼꼼하게 표현합니다.";
            } else {
                if (style === 'custom') {
                    generationPrompt = keepBackground ? `[VTO] ${customPrompt}` : `[PICTORIAL] ${customPrompt}`;
                    currentShoppingTip = "커스텀 스타일링은 아이의 개성을 가장 잘 드러낼 수 있어요.";
                } else {
                    const selectedAiConcept = recommendations.find(c => c.id === style);
                    generationPrompt = (mode === 'vto' || keepBackground) ? `[VTO] ${selectedAiConcept?.vtoOutfitEnglish}` : `[PICTORIAL] ${selectedAiConcept?.customPrompt}`;
                    keywords = selectedAiConcept?.searchKeywords || [];
                    currentShoppingTip = selectedAiConcept?.shoppingTip || "";
                }
            }

            if (userRequest.trim()) generationPrompt += `. Additionally, carefully follow this: ${userRequest}`;

            setLoadingStep("에디터가 추천사를 작성 중입니다...");
            const noteRes = await fetch("/api/styling/note", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: generationPrompt, mode, dogName })
            });
            const noteData = await noteRes.json();

            const selectedAiConcept = style !== 'custom' ? recommendations.find(c => c.id === style) : null;
            const currentDescription = selectedAiConcept?.description || (style === 'custom' ? "보호자님의 상상력이 담긴 특별한 커스텀 화보입니다." : "");
            const initialAnalysis = recommendations.length > 0
                ? recommendations[0].koreanAnalysis.replace(/^\d+[\.\)]\s*/, '').split('.')[0]
                : "";

            setResults({
                originalImage: base64,
                styledImages: [],
                analysis: noteData.analysis || "아이의 스타일을 분석 중입니다...",
                baseAnalysis: initialAnalysis,
                description: currentDescription,
                dogName: dogName || undefined,
                shoppingTip: currentShoppingTip,
                keywords: keywords.length > 0 ? keywords : undefined,
                personalColor: personalColor
            });
            setStep(3);

            const query = keywords.length > 0 ? keywords.join(" ") : (style as string);
            setShoppingQuery(query);

            const [generateRes, partnersRes] = await Promise.all([
                fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: generationPrompt, image: base64, clothImage: itemImages.cloth, accImage: itemImages.acc }),
                }),
                fetch(`/api/partners?query=${encodeURIComponent(query)}`)
            ]);

            const generateData = await generateRes.json();
            if (!generateRes.ok) throw new Error(generateData.details);

            setResults(prev => prev ? { ...prev, styledImages: generateData.urls } : null);
            setProducts(await partnersRes.json());

        } catch (e: any) {
            toast.error(`생성 중 오류가 발생했습니다: ${e.message}`);
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMoreProducts = async () => {
        if (!shoppingQuery || loadingMore) return;
        setLoadingMore(true);
        try {
            const nextStart = products.length + 1;
            const res = await fetch(`/api/partners?query=${encodeURIComponent(shoppingQuery)}&start=${nextStart}`);
            const newProducts = await res.json();
            if (Array.isArray(newProducts)) setProducts(prev => [...prev, ...newProducts]);
        } catch (e) {
            console.error("Load more failed:", e);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleRetry = async () => {
        if (retryCount >= 1) {
            toast.info("재시도는 1회만 가능해요. 새로운 스타일을 시도해보세요!");
            return;
        }
        setRetryCount(prev => prev + 1);
        await handleStartAnalysis();
    };

    const handleItemUpload = async (type: 'cloth' | 'acc', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const base64 = await resizeImage(file, 512);
        const customItem: SuggestedItem = {
            id: `custom-${type}-${Date.now()}`,
            image: base64,
            name: type === 'cloth' ? "나의 옷" : "나의 소품",
            isUserUploaded: true,
            searchKeyword: "",
            description: ""
        };
        if (type === 'cloth') setSelectedCloth(customItem);
        else setSelectedAcc(customItem);
    };


    return {
        step, setStep,
        file, setFile,
        style, setStyle,
        mode, setMode,
        keepBackground, setKeepBackground,
        loading, loadingStep,
        dogName, setDogName,
        customPrompt, setCustomPrompt,
        userRequest, setUserRequest,
        previewUrl,
        results,
        products,
        personalColor,
        recommendations,
        suggestedClothes,
        suggestedAccessories,
        selectedCloth, setSelectedCloth,
        selectedAcc, setSelectedAcc,
        loadingMore,
        retryCount,
        handleReset,
        handleRetry,
        handleStep1Submit,
        handleStartAnalysis,
        handleLoadMoreProducts,
        handleItemUpload
    };
};
