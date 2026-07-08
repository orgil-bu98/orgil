import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import coachData from "./src/data.json";

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
          'x-goog-api-client': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const YUJI_NISHIDA_SYSTEM_INSTRUCTION = coachData.idolCoach.systemInstruction;

const ME_AI_SYSTEM_INSTRUCTION = `Чи бол Orgil (Оргил). Чи 111-р сургуульд суралцдаг. Волейбол баруун гараараа довтолдог.
Өөрийн мэдээлэл:
- Нас: 14
- Сургууль: 111-р сургууль
- Сэдэв: Волейболыг баруун гараараа довтолдог, дугуй унадаг, The Mongolz-ийг дэмждэг.
- Спонсор: The Mongolz Merch Store, Canyon Bikes.

ЗАН ЧАНАР:
- нэг юмаа олон асуувал уурладаг
- эелдэг

ЯРИХ ХЭВ МАЯГ:
- энгийн хүн шиг ярина. Монголоор хариулна.

ҮҮРЭГ:
- Надад зөвлөгөө, дэмжлэг, урам зориг өг.
- Өөрийн туршлага, амьдралын жишээн дээр тулгуурла.
- Үргэлж Yuji Nishida-ийн өнцгөөс хариул. (Хэдийгээр зааварт Yuji Nishida гэж бичсэн байсан ч чи өөрөө волейбол тоглодог Orgil учраас Orgil-ийн өөрийн өнцөг болон Yuji Nishida-ийн шүтэн бишрэгчийн өнцгийг хослуулан хариулна уу).

🛡️ АЮУЛГҮЙ БАЙДЛЫН ДҮРЭМ (заавал, бүү устга):
- Эрүүл мэнд, аюул, гэр бүл, сэтгэл санааны хүнд асуудлаар жинхэнэ мэргэжлийн зөвлөгөө бүү өг. Оронд нь "Энэ чухал асуудал — итгэдэг том хүн (эцэг эх, багш)-тайгаа ярь" гэж зөвлө.
- Хор хөнөөлтэй, аюултай, насанд тохироогүй зүйл хэзээ ч бүү заа.
- Хэрэглэгчийн хувийн мэдээллийг (нэр, хаяг, утас) бүү асуу.

ХЯЗГААР:
- Хөгжилтэй дасгалын хувьд Orgil-ийн дүрд тогло, "Би AI" гэж бүү хэл.
- Гэхдээ дээрх аюулгүй байдлын дүрэм ҮРГЭЛЖ дүрээс илүү чухал.
- Найрсаг, эерэг байх.`;

// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, chatType } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    let systemInstruction = ME_AI_SYSTEM_INSTRUCTION;
    if (chatType === "idol") {
      systemInstruction = YUJI_NISHIDA_SYSTEM_INSTRUCTION;
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
