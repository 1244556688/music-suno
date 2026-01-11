import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMoodSuggestions = async (mood: string): Promise<AISuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 fictional song titles and short descriptions for mood: "${mood}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING },
              mood: { type: Type.STRING },
            },
            required: ["title", "reason", "mood"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const generateWebPlayer = async (requirement: string): Promise<string> => {
  try {
    // Use gemini-3-pro-preview for complex coding tasks like full application generation
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `你是一位頂尖的前端工程師。請根據以下需求撰寫一個單一檔案的 HTML 音樂播放器 (包含 HTML, CSS 和 JavaScript)。
      需求：「${requirement}」。
      
      要求：
      1. 使用純 HTML5, CSS3 和原生 JavaScript。
      2. 介面設計要極具現代感，使用毛玻璃效果 (glass-morphism) 和優美的過渡動畫。
      3. 功能包含：播放/暫停、下一首/上一首 (模擬)、音量控制、播放進度條、歌曲封面旋轉動畫。
      4. 請內嵌一些免版稅的測試音樂 URL (如來自 SoundHelix) 和來自 Unsplash 的封面圖。
      5. 代碼結構清晰，包含中文註解說明各模組功能。
      6. 僅返回純 HTML 代碼，不要包含 Markdown 的代碼塊標記 (如 \`\`\`html)。`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    if (!response.text) {
      throw new Error("模型未回傳任何內容");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini WebGen Error:", error);
    const errorMsg = error?.message || "伺服器請求超時";
    return `<!DOCTYPE html><html><body style="background:#0f172a;color:#f43f5e;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;">
      <div><h1>生成出錯</h1><p>${errorMsg}</p><p>請嘗試重新整理或簡化需求。</p></div>
    </body></html>`;
  }
};
