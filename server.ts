import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  const getAiClient = () => {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Automatic Question Bank Generator (CDC Class 10 Nepal Syllabus)
  app.post('/api/auto-generate-questions', async (req, res) => {
    try {
      const { subject = 'Science', chapter = 'All Chapters', count = 5 } = req.body;
      const ai = getAiClient();

      const prompt =
        subject === 'GK'
          ? `Generate ${count} high-yield entrance exam Multiple Choice Questions (MCQs) in NEPALI LANGUAGE (देवनागरी लिपि) for Class 10 Nepal Entrance Preparation under subject "GK" and chapter "${chapter}". Include 4 realistic options, the exact 0-based correctIndex (0 to 3), and a clear explanation in Nepali.`
          : `Generate ${count} high-yield Class 10 CDC Syllabus Nepal Entrance Preparation Multiple Choice Questions (MCQs) for St. Xavier's / SOS / Budhanilkantha / CTEVT entrance exams.
Subject: "${subject}"
Chapter: "${chapter}"
Provide 4 distinct options, the 0-based correctIndex (0, 1, 2, or 3), and a clear step-by-step explanation.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                chapter: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['subject', 'chapter', 'question', 'options', 'correctIndex', 'explanation'],
            },
          },
        },
      });

      const text = response.text || '[]';
      const questions = JSON.parse(text);
      res.json({ questions });
    } catch (error: any) {
      console.error('Auto question generation error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to auto-generate questions',
      });
    }
  });

  // Automatic Flash Board Post Generator (Notice / GK in Nepali / Motivational)
  app.post('/api/auto-generate-flashboard', async (req, res) => {
    try {
      const { category = 'GK Nepali', topic = 'Important Nepal Entrance Facts' } = req.body;
      const ai = getAiClient();

      const prompt = `Create an official Flash Board post for "UDAN - The Entrance Topper" (Class 10 CDC Syllabus Nepal, Created by Niraj Yadav).
Category: "${category}"
Topic: "${topic}"
If Category is "GK Nepali", write the title and content in Nepali language (देवनागरी) with 5 high-value GK bullet points for entrance students.
Otherwise, write an inspiring, clear, and authoritative post signed by Niraj Yadav.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ['title', 'content'],
          },
        },
      });

      const text = response.text || '{}';
      const post = JSON.parse(text);
      res.json({ post });
    } catch (error: any) {
      console.error('Auto flashboard generation error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to auto-generate Flash Board post',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UDAN Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
