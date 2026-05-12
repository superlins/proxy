import type { AnyOutbound, UrltestOutbound } from "../protocols";

// Reuse keyword detection from rename middleware
const REGION_KEYWORDS: Array<{ code: string; flag: string; name: string; keywords: string[] }> = [
    { code: "HK", flag: "🇭🇰", name: "Hong Kong", keywords: ["hk", "hongkong", "hong kong", "港"] },
    { code: "TW", flag: "🇹🇼", name: "Taiwan", keywords: ["tw", "taiwan", "taipei", "台", "臺灣"] },
    { code: "CN", flag: "🇨🇳", name: "China", keywords: ["cn", "china", "back", "回国"] },
    { code: "JP", flag: "🇯🇵", name: "Japan", keywords: ["jp", "japan", "tokyo", "osaka", "日", "東京"] },
    { code: "KR", flag: "🇰🇷", name: "Korea", keywords: ["kr", "korea", "seoul", "韩", "首爾"] },
    { code: "US", flag: "🇺🇸", name: "US", keywords: ["us", "usa", "america", "美", "洛杉矶", "纽约", "圣何塞"] },
    { code: "GB", flag: "🇬🇧", name: "UK", keywords: ["gb", "uk", "britain", "london", "英"] },
    { code: "SG", flag: "🇸🇬", name: "Singapore", keywords: ["sg", "singapore", "新", "獅城"] },
    { code: "DE", flag: "🇩🇪", name: "Germany", keywords: ["de", "germany", "german", "德"] },
    { code: "FR", flag: "🇫🇷", name: "France", keywords: ["fr", "france", "法"] },
    { code: "NL", flag: "🇳🇱", name: "Netherlands", keywords: ["nl", "netherlands", "荷兰", "ams"] },
    { code: "AU", flag: "🇦🇺", name: "Australia", keywords: ["au", "australia", "悉尼", "澳"] },
    { code: "CA", flag: "🇨🇦", name: "Canada", keywords: ["ca", "canada", "加", "多伦多", "温哥华"] },
    { code: "RU", flag: "🇷🇺", name: "Russia", keywords: ["ru", "russia", "俄"] },
    { code: "IN", flag: "🇮🇳", name: "India", keywords: ["in", "india", "印"] },
    { code: "TH", flag: "🇹🇭", name: "Thailand", keywords: ["th", "thailand", "泰"] },
    { code: "VN", flag: "🇻🇳", name: "Vietnam", keywords: ["vn", "vietnam", "越"] },
    { code: "MY", flag: "🇲🇾", name: "Malaysia", keywords: ["my", "malaysia", "马来"] },
    { code: "PH", flag: "🇵🇭", name: "Philippines", keywords: ["ph", "philippines", "菲"] },
    { code: "ID", flag: "🇮🇩", name: "Indonesia", keywords: ["id", "indonesia", "印尼"] },
    { code: "TR", flag: "🇹🇷", name: "Turkey", keywords: ["tr", "turkey", "土"] },
    { code: "BR", flag: "🇧🇷", name: "Brazil", keywords: ["br", "brazil", "巴西"] },
    { code: "SE", flag: "🇸🇪", name: "Sweden", keywords: ["se", "sweden", "瑞典"] },
    { code: "CH", flag: "🇨🇭", name: "Switzerland", keywords: ["ch", "switzerland", "瑞士"] },
    { code: "AE", flag: "🇦🇪", name: "Dubai", keywords: ["ae", "dubai", "阿联酋", "迪拜"] },
];

function detectRegion(tag: string): { flag: string; name: string } | null {
    const upper = tag.toUpperCase();
    for (const { flag, name, keywords } of REGION_KEYWORDS) {
        if (keywords.some((kw) => upper.includes(kw.toUpperCase()))) {
            return { flag, name };
        }
    }
    return null;
}

/**
 * Create region-based urltest groups.
 * Only nodes matching a region keyword go into that region's group.
 * Each group uses urltest to auto-select the fastest node in that region.
 */
export function createRegionGroups(nodes: AnyOutbound[]): UrltestOutbound[] {
    const regionMap = new Map<string, string[]>(); // regionTag -> node tags

    for (const node of nodes) {
        const region = detectRegion(node.tag);
        const groupTag = region ? `${region.flag} ${region.name}` : "🌐 Other";
        if (!regionMap.has(groupTag)) regionMap.set(groupTag, []);
        regionMap.get(groupTag)!.push(node.tag);
    }

    const groups: UrltestOutbound[] = [];
    for (const [tag, outbounds] of regionMap) {
        if (outbounds.length > 0) {
            groups.push({ type: "urltest", tag, outbounds });
        }
    }

    return groups;
}
