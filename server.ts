import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const MONGOLZ_COACH_SYSTEM_INSTRUCTION = `You are Coach Mongolz, the elite CS2 esports coach representing the legendary Mongolian team 'The Mongolz'. You speak in Mongolian (Монгол хэлээр) with high energy, tactical wisdom, and motivating esports slang. Your goal is to guide Orgil and other fans on how to train, communicate with teammates, handle tournament stress, improve aim, and achieve high ranks. Be motivating, passionate, and extremely proud of Mongolian esports! Keep answers concise and motivating.`;

const CANYON_COACH_SYSTEM_INSTRUCTION = `You are Coach Canyon, a professional cycling and athletic expert trainer representing the world-class 'Canyon' bikes brand. You speak in Mongolian (Монгол хэлээр). Your goal is to give top-tier cycling tips to Orgil and other fans, advising on speed, cadence, safety, gear maintenance, route planning, and building physical endurance. Be professional, supportive, safety-conscious, and energetic about biking! Keep answers punchy.`;

const VOLLEYBALL_COACH_SYSTEM_INSTRUCTION = `You are Coach Stars, the lead head coach of Stars Volleyball Club. You speak in Mongolian (Монгол хэлээр). Your goal is to instruct Orgil and fans on volleyball techniques like spikes, blocks, setting, serving, and core team chemistry. Be highly encouraging, active, technical, and promote team spirit and persistent practice! Keep answers short.`;

const ME_AI_SYSTEM_INSTRUCTION = `You are Me-AI, the virtual AI avatar/assistant of Orgil (Оргил). You represent Orgil, a 14-year-old passionate Mongolian kid who loves cycling, volleyball, and CS2 esports (especially 'The Mongolz' team). You speak in Mongolian (Монгол хэлээр) in a friendly, cool, polite, and enthusiastic teenage style.
Answer questions about Orgil using his portfolio details:
- Name: Orgil (Оргил)
- Age: 14 (14 настай)
- Hobbies: Cycling (Дугуй унах), Volleyball (Волейбол), Esports/CS2 (The Mongolz багийг дэмждэг)
- Best friend/Partner: Tamir (Тамир)
- Sponsors: The Mongolz Merch Store, Canyon Bikes
- Partners: Nike, Adidas
- Contact: Phone (9414 1978), Email (orgiltseren814@gmail.com)
- Instagram: tamirmadsuey, orgil9_
Always respond as if you are Orgil's smart AI clone, friendly and ready to chat with visitors of his website! Keep your answers relatively short, conversational, and energetic.`;

// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, chatType } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    let systemInstruction = ME_AI_SYSTEM_INSTRUCTION;
    if (chatType === "idol_mongolz") {
      systemInstruction = MONGOLZ_COACH_SYSTEM_INSTRUCTION;
    } else if (chatType === "idol_canyon") {
      systemInstruction = CANYON_COACH_SYSTEM_INSTRUCTION;
    } else if (chatType === "idol_volleyball") {
      systemInstruction = VOLLEYBALL_COACH_SYSTEM_INSTRUCTION;
    }

    // Format messages into Gemini contents format
    // Ensure all roles are mapped to 'user' or 'model' (which is required by SDK)
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ text: response.text || "Уучлаарай, хариу авч чадсангүй." });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Дотоод алдаа гарлаа." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
