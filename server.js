import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillText = fs.readFileSync(path.join(__dirname, 'SKILL2.md'), 'utf8');
const formularyText = fs.readFileSync(path.join(__dirname, 'formulary.md'), 'utf8');

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

function repairJSON(str) {
  let open = 0;
  let inString = false;
  let escape = false;
  for (const ch of str) {
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') inString = !inString;
    if (!inString) {
      if (ch === '{' || ch === '[') open++;
      if (ch === '}' || ch === ']') open--;
    }
  }
  let repaired = str.trimEnd();
  if (repaired.endsWith(',')) repaired = repaired.slice(0, -1);
  for (let i = 0; i < open; i++) repaired += '}';
  return repaired;
}

/* ============ POST /api/analyse — Claude clinical-structuring proxy ============ */
app.post('/api/analyse', async (req, res) => {
  const { transcript, patientDetails, selectedOutputs } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY configuration' });
  if (!transcript) return res.status(400).json({ error: 'Missing transcript or clinical notes' });

  const outputInstructions = `## OUTPUT FORMAT FOR THIS TOOL

You are operating inside SugarCARE Consult — a clinical documentation tool. The patient data is from a real consultation.

Apply the full Cardiometabolic Clinical Algorithm v4. Run all three layers (Territory → Psychosocial → Clinical Core) before writing output.

Respond ONLY in valid JSON. No markdown, no preamble, no text outside the JSON object.

## FORMULARY RULE — STRICT
The SugarCARE drug formulary is provided above. Prescribe ONLY from it.
- Use the EXACT brand name, salt content, MRP per unit, and pack size as listed — no invention, no approximation.
- If the clinically correct drug or class is absent from the formulary: do NOT substitute silently. Record it in audit.findings with direction "not-stocked", then prescribe the closest available formulary alternative with formularyStatus "in-formulary".
- When multiple brands share the same salt, select the lowest-MRP option unless a clinical reason (tolerability, dose form, strength) justifies otherwise.
- Never write "JanAushadhi", never write a cost tier label, never write a price not listed in the formulary.
- Every medication entry must have formularyStatus: "in-formulary" or "indicated-not-stocked".

## CORE SECTIONS — ALWAYS GENERATED
context, audit, idealWorkup, and idealPrescription are MANDATORY on every run regardless of selectedOutputs.
selectedOutputs may only control idealDiet, idealExercise, and idealFollowUpPlan.

## AUDIT — ALWAYS RUN
Always audit the prescription present in the transcript:
- If an existing Rx is found: populate audit.findings with gravity-graded findings for every variance.
- If no existing Rx is present: set audit.mode = "SUGGEST", audit.findings = [], audit.summary = "No existing prescription — SUGGEST mode."

## IDEAL WORKUP — ALWAYS GENERATED
List every investigation and anthropometric measurement that is absent but clinically required to complete a safe workup, reach a diagnosis, or justify evidence-based therapy.

Available JSON fields — all four core sections are mandatory; idealDiet, idealExercise, idealFollowUpPlan are included only if in selectedOutputs:

{
  "context": {
    "summary": "2-3 sentence narrative clinical picture — not a list",
    "missingData": ["critical missing items with one-line clinical reason each"],
    "deviations": ["abnormal values with targets"],
    "internalIssues": ["comorbidities, drug risks, psychosocial barriers, alternative medicine flags"],
    "redFlags": ["urgent items requiring immediate action"]
  },
  "audit": {
    "mode": "SUGGEST | AUDIT | REVIEW | FLAG | SCREEN | RISK",
    "summary": "one-paragraph narrative summary of the audit",
    "findings": [
      {
        "finding": "description of the variance from guideline standard",
        "direction": "omitted | under-dosed | over-dosed | wrong-drug | missing | contraindicated | not-stocked | appropriate",
        "gravity": "Grade 1 | Grade 2 | Grade 3",
        "standard": "what the algorithm recommends for this patient",
        "source": "guideline name + year",
        "grade": "[1A] | [1B] | [1C] | [2A] | [2B] | [2C] | [GPP]",
        "correction": "recommended corrective action"
      }
    ],
    "gravityTally": { "grade3": 0, "grade2": 0, "grade1": 0, "appropriate": 0 }
  },
  "idealWorkup": {
    "investigations": [
      {
        "test": "test name",
        "reason": "clinical reason",
        "purpose": "workup | diagnosis | therapy-justification",
        "priority": "urgent | this-visit | routine",
        "actionTrigger": "what result changes management, e.g. CK >5x ULN → stop statin"
      }
    ],
    "anthropometryMissing": ["e.g. waist circumference"],
    "summary": "one line: what cannot be safely concluded until these return"
  },
  "idealPrescription": {
    "medications": [
      {
        "brand": "exact brand name from formulary",
        "salt": "salt content + strength from formulary, e.g. Metformin (500mg)",
        "dose": "e.g. 500mg",
        "frequency": "e.g. Twice daily with meals",
        "duration": "e.g. 3 months",
        "instructions": "concise patient instruction",
        "mrp": "MRP per unit exactly as in formulary, e.g. ₹1.98/unit",
        "packSize": "pack size from formulary",
        "rationale": "one line — why this drug for this patient",
        "formularyStatus": "in-formulary | indicated-not-stocked"
      }
    ],
    "specialInstructions": "string",
    "monitoringParameters": ["what to check at next visit"]
  },
  "idealDiet": {
    "targetCalories": 0,
    "macros": { "carbsPercent": 0, "proteinPercent": 0, "fatPercent": 0 },
    "keralaMeals": ["Kerala-specific food swaps"],
    "hydration": "string"
  },
  "idealExercise": {
    "type": "string",
    "minutesPerDay": 0,
    "daysPerWeek": 0,
    "instructions": "string"
  },
  "idealFollowUpPlan": {
    "nextVisitType": "Titration / Q1 / Q2 / Q3 / Annual",
    "nextVisitDate": "YYYY-MM-DD",
    "nextVisitFocus": ["what to assess"],
    "targetsByNextVisit": {
      "hba1c": "target",
      "weight": "target",
      "bp": "target",
      "other": []
    },
    "warningSignsToReturn": ["urgent symptoms"]
  }
}`;

  const system = [
    { type: 'text', text: skillText },
    { type: 'text', text: formularyText },
    { type: 'text', text: outputInstructions, cache_control: { type: 'ephemeral', ttl: '1h' } }
  ];

  const coreOutputs = ['context', 'audit', 'idealWorkup', 'idealPrescription'];
  const optionalOutputs = Array.isArray(selectedOutputs) && selectedOutputs.length
    ? selectedOutputs.filter(k => ['idealDiet', 'idealExercise', 'idealFollowUpPlan'].includes(k))
    : ['idealDiet', 'idealExercise', 'idealFollowUpPlan'];
  const requested = [...coreOutputs, ...optionalOutputs];

  const userMessage = `Patient details: ${JSON.stringify(patientDetails || {})}
Selected outputs: ${JSON.stringify(requested)}

Consultation transcript / clinical notes:
${transcript}

ALWAYS audit the existing prescription in the transcript AND produce the full ideal plan. Prescribe ONLY from the formulary using the exact brand name, salt, and MRP. Respond in valid JSON only.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
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
    console.log('[analyse] stop_reason:', stopReason, '| output_tokens:', data.usage?.output_tokens, '| cache_create:', data.usage?.cache_creation_input_tokens ?? 0, '| cache_read:', data.usage?.cache_read_input_tokens ?? 0);
    if (stopReason === 'max_tokens') {
      console.warn('[analyse] response was truncated by max_tokens — JSON will be incomplete');
    }

    const clean = raw.replace(/```json\s*|```\s*/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      try {
        parsed = JSON.parse(repairJSON(clean));
        console.log('[analyse] JSON repaired successfully');
      } catch (e2) {
        console.error('[analyse] JSON.parse failed:', e.message);
        return res.status(502).json({
          error: 'Claude returned non-JSON or truncated output: ' + e.message,
          stopReason
        });
      }
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
