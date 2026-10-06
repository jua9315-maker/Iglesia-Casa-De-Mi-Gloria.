import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const getAi = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

app.post('/api/sermon-summary', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Por favor, introduce un tema para el sermón.' });
  }

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt.trim(),
      config: {
        systemInstruction: "Actúa como un pastor experimentado. Genera un resumen de sermón de 100-150 palabras, manteniendo un tono edificante y bíblico. Evita el lenguaje secular y céntrate en los principios de la fe cristiana. La respuesta debe ser un solo párrafo en español."
      }
    });

    const text = response.text || "No se pudo generar el resumen. Intenta con un tema diferente.";
    res.json({ text });
  } catch (error) {
    console.error('Error generating sermon summary:', error);
    res.status(500).json({ error: 'Hubo un problema al conectar con el servicio. Por favor, inténtalo de nuevo más tarde.' });
  }
});

app.post('/api/prayer', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Por favor, introduce una petición para la oración.' });
  }

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt.trim(),
      config: {
        systemInstruction: "Actúa como un guía espiritual. Genera una oración de 50-80 palabras, manteniendo un tono de fe, esperanza y consuelo. La oración debe ser un solo párrafo en español y terminar con 'Amén'."
      }
    });

    const text = response.text || "No se pudo generar la oración. Intenta con una petición diferente.";
    res.json({ text });
  } catch (error) {
    console.error('Error generating prayer:', error);
    res.status(500).json({ error: 'Hubo un problema al conectar con el servicio. Por favor, inténtalo de nuevo más tarde.' });
  }
});

// Map routes case-insensitively and handle spaces/aliases
const fileRouteMap = {
  '': 'index.html',
  '/': 'index.html',
  '/index.html': 'index.html',
  '/index': 'index.html',
  '/pagina principal.html': 'index.html',
  '/pagina principal': 'index.html',
  '/pagina%20principal.html': 'index.html',
  '/pagina%20principal': 'index.html',
  '/nosotros.html': 'Nosotros.html',
  '/nosotros': 'Nosotros.html',
  '/sermones.html': 'Sermones.html',
  '/sermones': 'Sermones.html',
  '/envivos.html': 'envivos.html',
  '/envivos': 'envivos.html',
  '/ttc.html': 'TTC.html',
  '/ttc': 'TTC.html',
  '/contacto.html': 'Contacto.html',
  '/contacto': 'Contacto.html',
  '/iglesia.html': 'iglesia.html',
  '/iglesia': 'iglesia.html'
};

app.use((req, res, next) => {
  const normalizedPath = decodeURIComponent(req.path).toLowerCase().trim();
  if (fileRouteMap[normalizedPath]) {
    return res.sendFile(path.join(__dirname, fileRouteMap[normalizedPath]));
  }
  next();
});

// Serve static assets (images, css, js, etc.)
app.use(express.static(__dirname));

// Fallback to index.html for page navigation
app.use((req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
