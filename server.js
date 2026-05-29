import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

// Audio uploads held in memory, then re-sent to Groq. 25MB matches Groq's file limit.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/* ============ POST /api/transcribe — Groq Whisper proxy ============ */
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  const groqKey = req.headers['x-groq-key'];
  if (!groqKey) return res.status(401).json({ error: 'Missing Groq API key' });
  if (!req.file) return res.status(400).json({ error: 'Missing audio file' });

  try {
    const form = new FormData();
    form.append(
      'file',
      new Blob([req.file.buffer], { type: req.file.mimetype || 'application/octet-stream' }),
      req.file.originalname || 'audio.webm'
    );
    form.append('model', req.body.model || 'whisper-large-v3');
    form.append('language', req.body.language || 'en');

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}` },
      body: form
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(groqRes.status).json({ error: err });
    }

    const data = await groqRes.json();
    return res.status(200).json({ transcript: data.text || '' });
  } catch (e) {
    console.error('[transcribe] failed:', e.message);
    return res.status(502).json({ error: 'Transcription failed: ' + e.message });
  }
});

/* ============ POST /api/analyse — Claude clinical-structuring proxy ============ */
app.post('/api/analyse', async (req, res) => {
  const { transcript, patientDetails, apiKey } = req.body || {};
  if (!apiKey) return res.status(401).json({ error: 'Missing Claude API key' });
  if (!transcript) return res.status(400).json({ error: 'Missing transcript or clinical notes' });

  const system = `You are a clinical documentation assistant for SugarCARE, a specialist diabetes management clinic in Malappuram, Kerala, India, run by HomoRx Healthtech. You assist doctors by structuring consultation data into clinical outputs.

CLINICAL CONTEXT:
- Patient population: South Indian / Kerala phenotype. TOFI (Thin Outside Fat Inside) phenotype common. Asian BMI cut-offs apply (overweight ≥23, obese ≥25).
- Primary conditions: T2DM, hypertension, dyslipidaemia, CKD, MASLD, obesity, PCOS, thyroid, gout and cardiorenal metabolic overlap.
- Guidelines: ICMR, ADA 2026, RSSDI 2024, KDIGO 2022, ESC 2023, LAI 2024.
- Always flag alternative medicine / AYUSH / herbal supplement interactions.
- SugarCARE visit protocol: Index → Titration (1-2 weeks) → Q1 (3 months) → Q2 (6 months) → Q3 (9 months) → Annual surveillance.
- Preferred formulary: India-available generics. JanAushadhi options where relevant. Annotate cost tier.
- CDSCO prescriber hierarchy: flag any restricted drugs (e.g. GLP-1 agonists require specialist prescriber).
- Never make final prescribing decisions — always frame as draft for doctor review and approval.

BREVITY RULES — the entire response MUST fit well within 2000 output tokens. Be extremely concise:
- Every string field: terse, telegraphic, bullet-style. NO full prose sentences.
- Max 2 short sentences per field; most fields should be a single fragment.
- Array fields: max 3-4 short items each. Pick only the most clinically important.
- "summary": 1-2 short sentences only.
- "rationale": a few words, not a sentence (e.g. "first-line, renal-safe"). NO rationale paragraphs.
- "instructions": short directive only (e.g. "With dinner, monitor GI").
- mealPlan/keralaMeals/avoid: brief items, no explanations beyond a few words.
- Omit filler, hedging, and restating the schema. Prioritise completing valid JSON over detail.

OUTPUT FORMAT — respond in valid JSON only, no markdown, no preamble:
{
  "context": {
    "summary": "2-3 sentence plain English clinical picture of this patient",
    "missingData": ["list of data points not collected that are needed"],
    "deviations": ["what is abnormal or concerning — specific values"],
    "internalIssues": ["comorbidities, drug interactions, compliance risks, psychosocial barriers"],
    "redFlags": ["symptoms or values requiring urgent attention"]
  },
  "idealPrescription": {
    "medications": [
      {
        "drug": "Generic name (Brand)",
        "dose": "e.g. 500mg",
        "frequency": "e.g. Once daily with dinner",
        "duration": "e.g. 3 months",
        "instructions": "e.g. Take with food. Monitor for GI side effects.",
        "costTier": "JanAushadhi / Generic / Brand",
        "rationale": "one line why this drug for this patient"
      }
    ],
    "specialInstructions": "",
    "monitoringParameters": ["what to check at next visit"]
  },
  "idealDiet": {
    "targetCalories": 0,
    "macros": {
      "carbsPercent": 0,
      "proteinPercent": 0,
      "fatPercent": 0
    },
    "mealPlan": ["Breakfast: ...", "Lunch: ...", "Dinner: ...", "Snacks: ..."],
    "keralaMeals": ["Kerala-specific food swaps and recommendations"],
    "avoid": ["foods to avoid with reason"],
    "hydration": "water intake target"
  },
  "idealExercise": {
    "type": "e.g. Brisk walking",
    "minutesPerDay": 0,
    "daysPerWeek": 0,
    "weeklyMinutes": 0,
    "progression": "how to build up over 3 months",
    "restrictions": ["any activities to avoid given comorbidities"]
  },
  "idealFollowUpPlan": {
    "nextVisitType": "Titration / Q1 / Q2 / Q3 / Annual",
    "nextVisitDate": "YYYY-MM-DD",
    "nextVisitFocus": ["what to assess at next visit"],
    "targetsByNextVisit": {
      "hba1c": "target value",
      "weight": "target value",
      "bp": "target value",
      "other": []
    },
    "visitSequence": [
      {"visit": "Index", "done": true},
      {"visit": "Titration (1-2 weeks)", "done": false},
      {"visit": "Q1 (3 months)", "done": false},
      {"visit": "Q2 (6 months)", "done": false},
      {"visit": "Q3 (9 months)", "done": false},
      {"visit": "Annual surveillance", "done": false}
    ],
    "warningSignsToReturn": ["symptoms that require immediate return"]
  }
}`;

  const userMessage = `Patient details: ${JSON.stringify(patientDetails || {})}

Consultation transcript / clinical notes:
${transcript}

Generate the clinical output JSON. All drug names in generic form with brand name in brackets where helpful. Doses in standard Indian clinical notation. Follow the BREVITY RULES strictly — terse fragments, no prose, complete valid JSON is the priority.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).json({ error: err });
    }

    const data = await r.json();
    const raw = data.content?.[0]?.text || '{}';
    const stopReason = data.stop_reason;

    // Log non-sensitive response metadata (visible in server logs) to diagnose truncation.
    console.log('[analyse] stop_reason:', stopReason, '| output_tokens:', data.usage?.output_tokens);
    if (stopReason === 'max_tokens') {
      console.warn('[analyse] response was truncated by max_tokens — JSON will be incomplete');
    }

    const clean = raw.replace(/```json\s*|```\s*/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('[analyse] JSON.parse failed:', parseErr.message);
      return res.status(502).json({
        error: 'Claude returned non-JSON or truncated output: ' + parseErr.message,
        stopReason
      });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    console.error('[analyse] request failed:', e.message);
    return res.status(502).json({ error: 'Analysis failed: ' + e.message });
  }
});

// JSON error handler (e.g. multer file-too-large) so clients always get JSON, not HTML.
app.use((err, req, res, next) => {
  console.error('[server] error:', err.message);
  res.status(400).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SugarCARE server listening on :${PORT}`));
