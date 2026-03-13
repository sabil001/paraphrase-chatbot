import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* =========================
   GEMINI CONFIG
========================= */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/* =========================
   FILE UPLOAD CONFIG
========================= */

const upload = multer({ dest: "uploads/" });

/* =========================
   HOME ROUTE
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

/* =========================
   PARAPHRASE TEXT
========================= */

app.post("/paraphrase", async (req, res) => {

  try {

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        result: "Teks tidak boleh kosong"
      });
    }

    const prompt = `Parafrase kalimat berikut dengan struktur berbeda tetapi makna tetap sama:\n${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    console.log("GEMINI RESPONSE:", response);

    let result = "";

    if (response?.text) {
      result = response.text;
    } 
    else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      result = response.candidates[0].content.parts[0].text;
    } 
    else {
      result = "AI tidak memberikan respons.";
    }

    res.json({ result });

  } catch (error) {

    console.error("ERROR:", error);

    res.status(500).json({
      result: "Terjadi kesalahan pada server"
    });

  }

});


/* =========================
   PARAPHRASE FILE
========================= */

app.post("/upload", upload.single("file"), async (req, res) => {

  try {

    const filePath = req.file.path;

    const text = fs.readFileSync(filePath, "utf8");

    const prompt = `Parafrase teks berikut dengan bahasa berbeda namun makna tetap sama:\n${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    let result = "";

    if (response?.text) {
      result = response.text;
    } 
    else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      result = response.candidates[0].content.parts[0].text;
    } 
    else {
      result = "AI tidak memberikan respons.";
    }

    fs.unlinkSync(filePath);

    res.json({ result });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      result: "Gagal memproses file"
    });

  }

});


/* =========================
   SERVER
========================= */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});