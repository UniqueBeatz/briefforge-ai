import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

app.use(express.json({ limit: '1mb' }));

const buildDemoResults = (payload) => {
  const { brand, audience, offer, tone, angle, objective } = payload;
  const properBrand = brand || 'Your Brand';
  const properAudience = audience || 'your ideal customers';
  const properOffer = offer || 'your product or service';
  const properTone = tone || 'confident';
  const properAngle = angle || 'results';
  const properObjective = objective || 'more leads';

  return {
    socialPosts: [
      `🚀 ${properBrand} is helping ${properAudience} turn ${properAngle} into momentum. ${properOffer} is designed for busy teams who want results without the usual friction. ${properTone} thinking starts here.` ,
      `Need a smarter way to grow without more busywork? ${properBrand} gives ${properAudience} a faster path to ${properObjective}. See how ${properOffer} can help your business move with more clarity and less stress.`,
      `Still doing things the hard way? ${properBrand} helps ${properAudience} simplify their process and unlock more wins with ${properOffer}. Stop guessing. Start growing.`,
    ],
    email: [
      `Subject: Make ${properObjective} easier this month\n\nHi there,\n\nIf you're trying to help ${properAudience} move faster, ${properBrand} makes it simple to deliver ${properOffer} with more clarity and less friction.\n\nThis is built for teams that want better outcomes without adding complexity.\n\nWant to see how it works? Reply to this email and we’ll walk you through it.`,
      `Subject: The smarter way to get more from ${properOffer}\n\nHey team,\n\n${properBrand} is built for ${properAudience} who want better results with less effort. Instead of juggling more tools, you get a cleaner system designed around your goals.\n\nIf ${properObjective} matters to you this quarter, this is worth a look.`,
    ],
    ads: [
      `${properBrand}: The simpler way to win with ${properOffer}. Built for ${properAudience}.`,
      `Want more ${properObjective} without the chaos? ${properBrand} helps ${properAudience} get results with less effort.`,
      `From idea to execution, ${properBrand} keeps ${properOffer} focused on what matters most: real momentum.`,
    ],
    launchCopy: [
      `${properBrand} is the launch system for ${properAudience} who want ${properOffer} without the usual friction. Built to help teams move faster, look sharper, and convert more confidently.`,
      `Your next growth move starts here. ${properBrand} helps ${properAudience} remove the noise and turn ${properOffer} into a repeatable advantage.`,
    ],
    headlines: [
      `${properBrand} helps ${properAudience} grow with less friction`,
      `The smarter way to deliver ${properOffer}`,
      `Built for teams that want more ${properObjective}`,
    ],
  };
};

const buildPrompt = (payload) => ({
  role: 'system',
  content: `You are a senior growth marketer and copywriter. Create a concise, compelling set of marketing assets based on the client's brief. Output valid JSON with keys: socialPosts, email, ads, launchCopy, headlines. Each value is an array of strings. The tone should be ${payload.tone || 'confident'} and the angle should focus on ${payload.angle || 'results'} for ${payload.audience || 'your target market'}. Brand: ${payload.brand || 'Your Brand'}; Offer: ${payload.offer || 'your offer'}; Objective: ${payload.objective || 'more leads'};`. 
});

const callOpenAI = async (payload) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      buildPrompt(payload),
      {
        role: 'user',
        content: `Create 3 social posts, 2 email options, 3 ad variations, 2 launch lines, and 3 headlines for ${payload.brand || 'my brand'} targeting ${payload.audience || 'my audience'}. The offer is ${payload.offer || 'my offer'} and the CTA is focused on ${payload.objective || 'more leads'}.`,
      },
    ],
    temperature: 0.8,
  });

  const rawText = completion.choices?.[0]?.message?.content || '';
  const trimmedText = rawText.trim();

  if (!trimmedText) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmedText);
    return parsed;
  } catch (error) {
    const fallbackMatch = trimmedText.match(/\{[\s\S]*\}/);
    if (!fallbackMatch) {
      return null;
    }

    try {
      return JSON.parse(fallbackMatch[0]);
    } catch {
      return null;
    }
  }
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mode: process.env.OPENAI_API_KEY ? 'openai' : 'demo' });
});

app.post('/api/generate', async (req, res) => {
  const payload = req.body || {};

  try {
    const aiResults = await callOpenAI(payload);
    const results = aiResults || buildDemoResults(payload);

    res.json({
      success: true,
      results,
      meta: {
        mode: process.env.OPENAI_API_KEY ? 'openai' : 'demo',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not generate content right now.',
      error: error.message,
      fallback: buildDemoResults(payload),
    });
  }
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`BriefForge AI server running on http://localhost:${port}`);
});
