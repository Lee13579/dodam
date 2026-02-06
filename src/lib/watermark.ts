interface WatermarkOptions {
    dogName?: string;
    styleName: string;
    noteColor: string;
}

/**
 * Adds an emotional note-style watermark to an image using Canvas.
 * Optimized for 2026 Dodam Styling Service.
 */
export const applyNoteWatermark = async (imageUrl: string, options: WatermarkOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
        const imgObj = new Image();
        imgObj.crossOrigin = "anonymous";
        imgObj.src = imageUrl;

        imgObj.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }

            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            ctx.drawImage(imgObj, 0, 0);

            const scale = canvas.width / 1000;
            const padding = 40 * scale;
            
            // Measure text for dynamic width
            ctx.font = `bold ${22 * scale}px sans-serif`;
            const labelWidth = ctx.measureText("스타일 : ").width;
            const styleWidth = ctx.measureText(options.styleName).width;
            
            const boxW = Math.min(450 * scale, Math.max(300 * scale, labelWidth + styleWidth + 60 * scale));
            const boxH = (options.dogName ? 170 : 130) * scale;
            const x = canvas.width - boxW - padding;
            const y = canvas.height - boxH - padding;

            ctx.save();
            ctx.translate(x + boxW / 2, y + boxH / 2);
            ctx.rotate(-1.5 * Math.PI / 180);
            ctx.translate(-(x + boxW / 2), -(y + boxH / 2));

            // Background Note Box
            ctx.fillStyle = 'rgba(255, 254, 249, 0.95)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 15 * scale;
            ctx.fillRect(x, y, boxW, boxH);

            // Left Border Accent
            ctx.fillStyle = options.noteColor;
            ctx.fillRect(x, y, 6 * scale, boxH);

            // Text Setup
            ctx.shadowBlur = 0;
            const textX = x + 30 * scale;
            let currentY = y + 50 * scale;

            // 1. Name
            if (options.dogName) {
                ctx.fillStyle = 'rgba(139, 115, 85, 0.6)';
                ctx.font = `bold ${20 * scale}px sans-serif`;
                ctx.fillText(`이름 : `, textX, currentY);
                ctx.fillStyle = '#2D241A';
                ctx.fillText(options.dogName, textX + labelWidth, currentY);
                currentY += 40 * scale;
            }
            
            // 2. Style (with indentation support)
            ctx.fillStyle = 'rgba(139, 115, 85, 0.6)';
            ctx.font = `bold ${20 * scale}px sans-serif`;
            ctx.fillText(`스타일 : `, textX, currentY);
            
            ctx.fillStyle = '#2D241A';
            const styleText = options.styleName;
            const maxTextWidth = boxW - labelWidth - 50 * scale;
            
            if (ctx.measureText(styleText).width > maxTextWidth) {
                // Split into two lines if too long (simplified)
                const firstHalf = styleText.substring(0, Math.floor(styleText.length / 2));
                const secondHalf = styleText.substring(Math.floor(styleText.length / 2));
                ctx.fillText(firstHalf, textX + labelWidth, currentY);
                currentY += 28 * scale;
                ctx.fillText(secondHalf, textX + labelWidth, currentY); // Indented
            } else {
                ctx.fillText(styleText, textX + labelWidth, currentY);
            }

            // 3. Brand Footer (Tighter)
            const brandY = y + boxH - 25 * scale;
            const lineY = brandY - 25 * scale;

            ctx.beginPath();
            ctx.setLineDash([4 * scale, 4 * scale]);
            ctx.moveTo(x + 20 * scale, lineY);
            ctx.lineTo(x + boxW - 20 * scale, lineY);
            ctx.strokeStyle = '#E5E7EB';
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.fillStyle = options.noteColor;
            ctx.font = `bold ${16 * scale}px sans-serif`;
            ctx.fillText(`도담`, textX, brandY);

            ctx.fillStyle = '#8B7355';
            ctx.font = `normal ${14 * scale}px sans-serif`;
            ctx.textAlign = 'right';
            ctx.fillText(`www.dodam.app`, x + boxW - 25 * scale, brandY);

            ctx.restore();
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };

        imgObj.onerror = (e) => reject(e);
    });
};
