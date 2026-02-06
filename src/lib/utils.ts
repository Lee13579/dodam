/**
 * Handles natural Korean name particles (이/가, 의/이의) based on batchim.
 */
export const getNaturalName = (name?: string): string => {
    if (!name) return "아이";
    const lastChar = name.charCodeAt(name.length - 1);
    const hasBatchim = (lastChar - 0xac00) % 28 > 0;
    
    if (name.endsWith('이')) return name;
    return hasBatchim ? `${name}이` : name;
};

/**
 * Generates a consistent pastel color based on a string (e.g., style name).
 */
export const getStyleColor = (name: string): string => {
    const colors = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};
