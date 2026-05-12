import type { AnyOutbound } from "../protocols";
import type { Middleware } from "./index";

// Country code -> flag emoji mapping (common proxy region keywords)
const REGION_FLAGS: Record<string, string> = {
    "HK": "🇭🇰", "TW": "🇹🇼", "CN": "🇨🇳", "JP": "🇯🇵", "KR": "🇰🇷",
    "US": "🇺🇸", "GB": "🇬🇧", "UK": "🇬🇧", "SG": "🇸🇬", "DE": "🇩🇪",
    "FR": "🇫🇷", "NL": "🇳🇱", "RU": "🇷🇺", "AU": "🇦🇺", "CA": "🇨🇦",
    "IN": "🇮🇳", "BR": "🇧🇷", "IT": "🇮🇹", "ES": "🇪🇸", "SE": "🇸🇪",
    "CH": "🇨🇭", "NO": "🇳🇴", "FI": "🇫🇮", "DK": "🇩🇰", "PL": "🇵🇱",
    "TR": "🇹🇷", "AE": "🇦🇪", "TH": "🇹🇭", "VN": "🇻🇳", "MY": "🇲🇾",
    "PH": "🇵🇭", "ID": "🇮🇩", "NZ": "🇳🇿", "ZA": "🇿🇦", "IL": "🇮🇱",
};

// Keywords to detect in node tags
const REGION_KEYWORDS: Array<{ code: string; keywords: string[] }> = [
    { code: "HK",  keywords: ["hk", "hongkong", "hong kong", "港"] },
    { code: "TW",  keywords: ["tw", "taiwan", "taipei", "台", "臺灣"] },
    { code: "CN",  keywords: ["cn", "china", "back", "回国"] },
    { code: "JP",  keywords: ["jp", "japan", "tokyo", "osaka", "日", "東京"] },
    { code: "KR",  keywords: ["kr", "korea", "seoul", "韩", "首爾"] },
    { code: "US",  keywords: ["us", "usa", "america", "美", "洛杉矶", "纽约", "圣何塞"] },
    { code: "GB",  keywords: ["gb", "uk", "britain", "london", "英"] },
    { code: "SG",  keywords: ["sg", "singapore", "新", "獅城"] },
    { code: "DE",  keywords: ["de", "germany", "german", "德"] },
    { code: "FR",  keywords: ["fr", "france", "法"] },
    { code: "NL",  keywords: ["nl", "netherlands", "荷兰", "ams"] },
    { code: "AU",  keywords: ["au", "australia", "悉尼", "澳"] },
    { code: "CA",  keywords: ["ca", "canada", "加", "多伦多", "温哥华"] },
    { code: "RU",  keywords: ["ru", "russia", "俄"] },
    { code: "IN",  keywords: ["in", "india", "印"] },
    { code: "TH",  keywords: ["th", "thailand", "泰"] },
    { code: "VN",  keywords: ["vn", "vietnam", "越"] },
    { code: "MY",  keywords: ["my", "malaysia", "马来"] },
    { code: "PH",  keywords: ["ph", "philippines", "菲"] },
    { code: "ID",  keywords: ["id", "indonesia", "印尼"] },
    { code: "TR",  keywords: ["tr", "turkey", "土"] },
    { code: "BR",  keywords: ["br", "brazil", "巴西"] },
    { code: "SE",  keywords: ["se", "sweden", "瑞典"] },
    { code: "CH",  keywords: ["ch", "switzerland", "瑞士"] },
    { code: "AE",  keywords: ["ae", "dubai", "阿联酋", "迪拜"] },
];

export interface RenameOptions {
    /** Add flag emoji to node tags based on detected region */
    flag?: boolean;
}

export function renameMiddleware(options: RenameOptions = {}): Middleware {
    return (nodes: AnyOutbound[]) => {
        if (!options.flag) return nodes;

        return nodes.map((node) => {
            const tag = node.tag;
            const upperTag = tag.toUpperCase();

            for (const { code, keywords } of REGION_KEYWORDS) {
                if (keywords.some((kw) => upperTag.includes(kw.toUpperCase()))) {
                    const flag = REGION_FLAGS[code];
                    if (flag && !tag.startsWith(flag)) {
                        return { ...node, tag: `${flag} ${tag}` };
                    }
                    break;
                }
            }

            return node;
        });
    };
}
