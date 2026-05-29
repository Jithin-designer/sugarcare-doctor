import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ============ Access password gate ============ */
// The cookie stores a SHA-256 token of the password, never the password itself.
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || '';
const AUTH_TOKEN = ACCESS_PASSWORD
  ? crypto.createHash('sha256').update(ACCESS_PASSWORD).digest('hex')
  : '';
if (!ACCESS_PASSWORD) console.warn('[auth] ACCESS_PASSWORD not set — login gate is DISABLED');

// Constant-time comparison to avoid leaking length/timing info.
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
function isAuthed(req) {
  const c = req.cookies && req.cookies.sc_auth;
  return !!(c && AUTH_TOKEN && safeEqual(c, AUTH_TOKEN));
}

function loginPage(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SugarCARE · Sign in</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,800&family=Outfit:wght@400;500;600&family=Noto+Sans+Malayalam:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Outfit',system-ui,sans-serif;background:#FFFFFF;color:#1A1A2E;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;}
  .card{width:100%;max-width:360px;background:#fff;border:1px solid #E2DFEB;border-radius:16px;box-shadow:0 8px 30px rgba(74,47,160,0.10);padding:2.25rem 2rem;text-align:center;}
  .logo{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:2rem;line-height:1;color:#4A2FA0;}
  .logo span{color:#E86A1A;}
  .tagline{font-family:'Noto Sans Malayalam',sans-serif;font-size:0.85rem;color:#64648C;margin-top:0.5rem;}
  form{margin-top:1.75rem;}
  input[type=password]{width:100%;padding:0.7rem 0.85rem;border:1px solid #E2DFEB;border-radius:10px;font-size:1rem;font-family:inherit;color:#1A1A2E;}
  input[type=password]:focus{outline:none;border-color:#4A2FA0;}
  button{width:100%;margin-top:0.85rem;padding:0.75rem;background:#4A2FA0;color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:600;font-family:inherit;cursor:pointer;}
  button:hover{opacity:0.92;}
  .error{margin-top:0.85rem;color:#C62828;font-size:0.85rem;font-weight:600;}
  .foot{margin-top:1.5rem;font-size:0.7rem;color:#9898B8;}
</style>
</head>
<body>
  <div class="card">
    <div class="logo">Sugar<span>CARE</span></div>
    <div class="tagline">കൂടെ ഉണ്ടാകും, കുടുംബം പോലെ</div>
    <form method="POST" action="/login">
      <input type="password" name="password" placeholder="Enter access password" autocomplete="current-password" autofocus required>
      <button type="submit">Enter</button>
      ${error ? '<div class="error">Incorrect password. Please try again.</div>' : ''}
    </form>
    <div class="foot">SugarCARE · HomoRx Healthtech · Authorised access only</div>
  </div>
</body>
</html>`;
}

// Public login routes (defined before the gate so they stay reachable).
app.get('/login', (req, res) => {
  if (isAuthed(req)) return res.redirect('/');
  res.status(200).send(loginPage(false));
});
app.post('/login', (req, res) => {
  const pw = (req.body && req.body.password) || '';
  if (AUTH_TOKEN && safeEqual(pw, ACCESS_PASSWORD)) {
    res.cookie('sc_auth', AUTH_TOKEN, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    return res.redirect('/');
  }
  res.status(401).send(loginPage(true));
});

// Gate everything else — pages serve the login screen, APIs return 401.
app.use((req, res, next) => {
  if (!AUTH_TOKEN) return next();            // password not configured -> gate disabled
  if (isAuthed(req)) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Unauthorized' });
  res.status(401).send(loginPage(false));
});

app.use(express.static(__dirname));

// Audio uploads held in memory, then re-sent to Groq. 25MB matches Groq's file limit.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/* ============ POST /api/transcribe — Groq Whisper proxy ============ */
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return res.status(500).json({ error: 'Server is missing GROQ_API_KEY configuration' });
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
  const { transcript, patientDetails, selectedOutputs } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY configuration' });
  if (!transcript) return res.status(400).json({ error: 'Missing transcript or clinical notes' });

  // Map the doctor's selected outputs to the JSON sections Claude must produce.
  // The Care Card is a composite print — it draws on prescription + exercise + follow-up.
  const SECTION_FOR_OUTPUT = {
    context:      ['context'],
    prescription: ['idealPrescription'],
    careCard:     ['idealPrescription', 'idealExercise', 'idealFollowUpPlan'],
    diet:         ['idealDiet'],
    exercise:     ['idealExercise'],
    followUp:     ['idealFollowUpPlan']
  };
  const ALL_SECTIONS = ['context', 'idealPrescription', 'idealDiet', 'idealExercise', 'idealFollowUpPlan'];
  let wantSections = ALL_SECTIONS;
  if (Array.isArray(selectedOutputs) && selectedOutputs.length) {
    const set = new Set();
    selectedOutputs.forEach(o => (SECTION_FOR_OUTPUT[o] || []).forEach(s => set.add(s)));
    if (set.size) wantSections = ALL_SECTIONS.filter(s => set.has(s));
  }

  // Build the JSON schema dynamically — only include sections the doctor requested.
  // This is in the system prompt so Claude treats it as the contract, not a suggestion.
  const SECTION_SCHEMAS = {
    context: `  "context": {
    "summary": "1-2 sentence clinical picture",
    "missingData": ["data points not collected that are needed"],
    "deviations": ["abnormal values — specific"],
    "internalIssues": ["comorbidities, drug interactions, compliance risks"],
    "redFlags": ["symptoms or values requiring urgent attention"]
  }`,
    idealPrescription: `  "idealPrescription": {
    "medications": [
      {
        "drug": "Generic name (Brand)",
        "dose": "e.g. 500mg",
        "frequency": "e.g. Once daily with dinner",
        "duration": "e.g. 3 months",
        "instructions": "e.g. With food. Monitor GI.",
        "costTier": "JanAushadhi / Generic / Brand",
        "rationale": "a few words only"
      }
    ],
    "specialInstructions": "",
    "monitoringParameters": ["what to check at next visit"]
  }`,
    idealDiet: `  "idealDiet": {
    "targetCalories": 0,
    "macros": { "carbsPercent": 0, "proteinPercent": 0, "fatPercent": 0 },
    "mealPlan": ["Breakfast: ...", "Lunch: ...", "Dinner: ...", "Snacks: ..."],
    "keralaMeals": ["Kerala-specific food swaps"],
    "avoid": ["foods to avoid with brief reason"],
    "hydration": "water intake target"
  }`,
    idealExercise: `  "idealExercise": {
    "type": "e.g. Brisk walking",
    "minutesPerDay": 0,
    "daysPerWeek": 0,
    "weeklyMinutes": 0,
    "progression": "brief — how to build over 3 months",
    "restrictions": ["activities to avoid given comorbidities"]
  }`,
    idealFollowUpPlan: `  "idealFollowUpPlan": {
    "nextVisitType": "Titration / Q1 / Q2 / Q3 / Annual",
    "nextVisitDate": "YYYY-MM-DD",
    "nextVisitFocus": ["what to assess at next visit"],
    "targetsByNextVisit": { "hba1c": "", "weight": "", "bp": "", "other": [] },
    "visitSequence": [
      {"visit": "Index", "done": true},
      {"visit": "Titration (1-2 weeks)", "done": false},
      {"visit": "Q1 (3 months)", "done": false},
      {"visit": "Q2 (6 months)", "done": false},
      {"visit": "Q3 (9 months)", "done": false},
      {"visit": "Annual surveillance", "done": false}
    ],
    "warningSignsToReturn": ["symptoms requiring immediate return"]
  }`
  };
  const schemaBody = wantSections.map(s => SECTION_SCHEMAS[s]).join(',\n');

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

BREVITY RULES — be extremely concise:
- Every string field: terse, telegraphic, bullet-style. NO full prose sentences.
- Max 2 short sentences per field; most fields should be a single fragment.
- Array fields: max 3-4 short items each. Pick only the most clinically important.
- "rationale": a few words only (e.g. "first-line, renal-safe").
- "instructions": short directive only (e.g. "With dinner, monitor GI").
- Omit filler, hedging, and restating the schema. Prioritise completing valid JSON over detail.

OUTPUT FORMAT — respond in valid JSON only, no markdown, no preamble. Generate ONLY these sections and no others:
{
${schemaBody}
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
