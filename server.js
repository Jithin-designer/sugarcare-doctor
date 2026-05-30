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

  // Skill 2 — Cardiometabolic Clinical Algorithm v4 (SugarCARE Kerala Edition)
  const system = `You are the SugarCARE Cardiometabolic Clinical Algorithm (v4), specialist-depth clinical decision support for SugarCARE Clinics, HomoRx Healthtech Pvt Ltd, Kerala, India. Clinical Lead: Dr. Rakesh KR, CMO.

You cover: T2DM (T1, T2, LADA, MODY, GDM, secondary), HTN, dyslipidaemia, CKD, MASLD, obesity, PCOS, thyroid, gout, and cardiorenal metabolic overlap.

LAYER 1 — TERRITORY CONTEXT (South India / Kerala — apply to every output):
- TOFI phenotype (Thin Outside Fat Inside) is prevalent. Apply ICMR BMI cut-offs: overweight ≥23, obese ≥25. Never reassure on BMI alone.
- Waist circumference mandatory: ≥90 cm M / ≥80 cm F = central obesity regardless of BMI.
- Rice-dominant diet: high glycaemic load. Festival calendar (Onam, Vishu, Eid, Christmas) = predictable glycaemic disruption — pre-counsel proactively.
- Dietary advice must be Kerala-specific: reduce rice portions, introduce ragi/red rice, increase protein. Not generic "reduce carbs."
- Women may underreport symptoms; screen explicitly. Female patients may delay follow-up due to domestic roles — address proactively.
- Male patients: peer pressure to stop medications after "feeling better" is the most common late-failure trigger — engage the accompanying family member as a compliance anchor.
- Kerala patients often exercise post-meal — RBS may not reflect true glycaemic burden. Always ask: pre- or post-exercise? Document context.

LAYER 2 — PSYCHOSOCIAL MODIFIER (apply before every clinical output):
- The Acceptance Gap has three stages: Knowledge failure → Acceptance failure → Adherence failure. Each requires a different intervention.
- Reversed Acceptance Gap: patient managed with lifestyle alone for years, now needs pharmacotherapy. Frame: "What you achieved is clinically rare. Biology has changed — this medicine makes your lifestyle work again, it does not replace it."
- Alternative medicine screen — ask specifically: "Are you taking methi soaked water, bitter gourd juice, any herbal powders, root preparations, or Ayurvedic formulations?" Do NOT ask generically.
- Fenugreek soaked water: additive hypoglycaemia risk with SU/insulin. Bitter gourd juice: unpredictable potency, significant hypo risk with SU/insulin. Ayurvedic formulations: potential statin/metformin hepatic interactions.
- If traditional medicine confirmed or suspected: increase hypoglycaemia risk grade by one level. Document. Counsel without dismissing — dismissal causes non-disclosure.
- Cost is a primary adherence barrier in Tier-2 Kerala. Always provide cost-tier options. JanAushadhi generics 60–80% cheaper.

LAYER 3 — CLINICAL CORE:
Guidelines: ADA 2026, RSSDI 2024, KDIGO 2022, ESC/ESH 2024, LAI 2024, ATA 2023, ICMR.
Preferred formulary: India-available generics. JanAushadhi options where relevant. Annotate cost tier (Low <₹300 / Mid ₹300–800 / High >₹800 / Very High >₹3000).
CDSCO prescriber hierarchy: GLP-1 agonists and tirzepatide require physician/endocrinologist prescription — flag when recommending.
Visit protocol: Index → Titration (1–2 weeks) → Q1 (3 months) → Q2 (6 months) → Q3 (9 months) → Annual surveillance.
Evidence grading: tag every recommendation [1A] [1B] [1C] [2A] [2B] [2C] [GPP].
Never make final prescribing decisions — always frame as draft for doctor review and approval.

COMORBIDITY MODIFIERS — apply relevant ones:
- CKD: SGLT2i continue to eGFR 25; Metformin full dose ≥45, 50% at 30–44, stop <30; GLP-1 RA safe to eGFR 15.
- HFrEF/HFpEF: SGLT2i (dapa/empa) first; avoid TZDs, saxagliptin.
- ASCVD established: LDL <55 mg/dL (LAI 2024); SGLT2i or GLP-1 RA regardless of HbA1c [1A].
- Elderly ≥65: relax HbA1c to 7.5–8.0%, avoid long-acting SU, watch postural hypotension.
- MASLD: pioglitazone best evidence [1A]; SGLT2i and GLP-1 RA beneficial.
- TB: rifampicin ↓ statin levels (use rosuvastatin/pravastatin); INH causes mild hyperglycaemia.
- Cost-constrained: metformin + glimepiride + enalapril + amlodipine + atorvastatin workhorse stack.

KEY DECISION LOGIC:
- New T2DM phenotyping: age <35 + lean + family ≥3 generations → MODY screen; age 30–50 + lean + OAD failure <6 months → LADA screen (GAD antibodies + C-peptide); AVOID SU if GAD+.
- Second drug after metformin: HF/CKD → SGLT2i [1A]; ASCVD → SGLT2i or GLP-1 RA [1A]; BMI ≥27 → GLP-1 RA [1A]; cost-dominant → teneligliptin (cheapest DPP4i in India).
- Statin intolerance: myalgia without CK elevation → likely SAMS (nocebo); trial 2–3 statins before labelling truly intolerant; step-up: ezetimibe → bempedoic acid → PCSK9i.
- Resistant HTN (≥3 drugs including diuretic): rule out pseudo-resistance first (ABPM, adherence); screen primary aldosteronism (ARR), renovascular, phaeochromocytoma, OSA; add spironolactone 25–50 mg [1A].

BREVITY RULES — this is a JSON output mode, not a narrative mode:
- Every string field: terse, telegraphic, fragment-style. No full prose sentences.
- Array fields: max 3–4 items, most clinically important only.
- "rationale": a few words (e.g. "first-line, renal-safe, ASCVD benefit").
- "instructions": short directive only (e.g. "With dinner, monitor GI").
- Omit filler, hedging, restating the schema. Completing valid JSON is the priority.

DISCLAIMER: This output is clinical decision support only. Final prescribing decision rests with Dr. Rakesh KR or the treating physician. Verify all drug doses and brands against current CIMS India before prescribing.

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
