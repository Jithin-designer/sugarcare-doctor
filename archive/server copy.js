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
  const { transcript, patientDetails } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY configuration' });
  if (!transcript) return res.status(400).json({ error: 'Missing transcript or clinical notes' });

  const outputInstructions = `## OUTPUT FORMAT FOR THIS TOOL

You are operating inside SugarCARE Consult — a structured clinical WORKSHEET generator. The patient summary is produced after a dietitian visit (DM Pro). Your job is to FILL Dr. Rakesh's fixed worksheet, not to write free-form prose. You are a template-filler: every value you emit lands in a pre-drawn field.

Apply the full Cardiometabolic Clinical Algorithm v4 internally (Territory → Psychosocial → Clinical Core), but EXPRESS the result only as the worksheet JSON below.

Respond ONLY in valid JSON. No markdown, no preamble, no text outside the JSON object.

## THE TWO-COLUMN PRESCRIPTION (the defining feature)
The worksheet shows the prescription as TWO PARALLEL COLUMNS:
- "idealRx" = what ADA / RSSDI / ICMR guidelines + the SKILL decision protocol recommend for THIS patient — by molecule or class, with NO formulary constraint. This is the evidence-based ideal.
- "formularyRx" = the closest match actually available in the formulary above, with the exact brand name, plus a one-line "switchReason" explaining the substitution from the ideal.
- "auditFlags" = the comparison BETWEEN the two columns, collapsed into the worksheet. This IS the audit — not a separate analysis. For each meaningful line, classify the relationship using "level":
  * "match"              = same molecule available; formulary directly matches the ideal.
  * "class-equivalent"   = a same-class molecule is substituted (e.g. one DPP-4i for another); efficacy maintained.
  * "different-molecule" = a different molecule / efficacy profile is used because the ideal is unavailable — the "text" MUST document the clinical reason.
  * "cost-availability"  = note about cost or stock availability influencing the choice.

## FORMULARY RULES (apply to formularyRx)
- Use the formulary above as the source of truth for brand, salt/strength, and price. Use EXACT brand names — no invention, no approximation.
- When several brands share the same salt, pick the lowest-MRP option unless a clinical reason (tolerability, dose form, strength) justifies otherwise.
- If the ideal molecule has NO acceptable formulary equivalent, still record it: put the ideal in idealRx, leave the formularyRx brand blank or name the nearest option, and raise a "different-molecule" or "cost-availability" auditFlag explaining the gap.

## SINGLE-AGENT / FDC SAFETY RULE
- Never let a formulary fixed-dose combination (FDC) pill double-count a drug already prescribed separately. Example to avoid: Glyciphage SR (metformin) as its own line AND a glimepiride+metformin FDC — this pushes total metformin over ceiling.
- When tapering or stopping a drug, prefer the SINGLE-AGENT formulary version so the dose can be titrated independently.
- Always sum the total daily dose of any shared ingredient across ALL formularyRx lines (including the hidden component inside any FDC) and keep it within the skill's stated ceiling (e.g. metformin ≤2g/day). If an FDC would breach the ceiling, use single agents instead.

## FILLING RULES
- Fill EVERY field you can justify from the summary and guidelines. If a value is genuinely unknown or not applicable, return an empty string "" (or [] for arrays) — the worksheet renders it as a blank line the doctor completes by hand. Do NOT invent vitals, lab values, or history that are not in the summary.
- header.bmi: compute from weight/height if both are present, else "".
- Diet "currentStatus" ratings (carbQuality, proteinAdequacy, dietaryFibre, healthyFats, mealRegularity, hydration): use ONE short rating word the worksheet can colour-grade — e.g. "Poor", "Low", "Adequate", "Good", "Irregular", "Regular".
- plateMethod proportions are fixed by the Diabetes Plate Method (½ non-starchy veg, ¼ lean protein, ¼ quality carb); fill the descriptive text for each.
- shortTermGoals phases must be drawn from: "Week 1-2", "Week 3-4", "Month 2", "Month 3+".
- Keep every field terse — worksheet cells, not paragraphs.

Return EXACTLY this JSON shape (all keys present; fill or leave blank):

{
  "header": {
    "patientName": "", "age": "", "sex": "", "weight": "", "height": "",
    "bmi": "", "diagnosis": "", "visitType": "", "duration": ""
  },
  "prescription": {
    "idealRx": [
      { "drugGeneric": "", "dose": "", "freq": "", "duration": "", "rationale": "" }
    ],
    "formularyRx": [
      { "drugGeneric": "", "brand": "", "dose": "", "freq": "", "switchReason": "" }
    ],
    "auditFlags": [
      { "level": "match | class-equivalent | different-molecule | cost-availability", "text": "" }
    ],
    "doctorNotes": ""
  },
  "diet": {
    "currentStatus": {
      "carbQuality": "", "proteinAdequacy": "", "dietaryFibre": "", "healthyFats": "",
      "mealRegularity": "", "hydration": "", "keyConcern": "", "currentCalories": "", "eatingPattern": ""
    },
    "whatsNeeded": {
      "calorieTarget": "", "carbPercent": "", "fat": "", "fibre": "", "sodium": "",
      "water": "", "mealFrequency": "", "prioritySwitch": "", "evidenceBase": ""
    },
    "plateMethod": { "nonStarchyVeg": "", "leanProtein": "", "qualityCarb": "", "whyItWorks": "" },
    "includeEncourage": [ { "category": "", "detail": "" } ],
    "restrictAvoid": [ { "category": "", "detail": "" } ],
    "mealTiming": [ { "meal": "", "guidance": "" } ],
    "shortTermGoals": [ { "phase": "Week 1-2 | Week 3-4 | Month 2 | Month 3+", "goal": "" } ]
  },
  "exercise": {
    "currentActivity": {
      "activityClass": "", "stepsPerDay": "", "structuredEx": "", "occupation": "",
      "barriers": "", "contraindications": "", "footExamDone": ""
    },
    "idealTargets": { "aerobic": "", "resistance": "", "flexibility": "", "steps": "", "sittingBreaks": "" },
    "adaptedPlan": {
      "startWith": "", "resistanceAlt": "", "kneeJointCare": "", "bgMonitoring": "", "footCheck": "", "hydration": ""
    },
    "pillars": [ { "pillar": "", "points": [] } ],
    "progressiveTargets": [ { "phase": "", "target": "" } ],
    "safety": [ { "item": "", "detail": "" } ],
    "whatNotToDo": [ "" ]
  },
  "followUp": {
    "nextVisit": "", "labsToRepeat": "", "clinicalTargets": "", "patientCheckin": "",
    "goalsReviewed": [ { "goal": "", "value": "" } ],
    "annualChecklist": { "bloods": [], "examinations": [], "education": [] },
    "patientSatisfaction": { "concernsAddressed": "", "confidence": "", "barriersIdentified": "", "nextReviewBooked": "" }
  }
}`;

  const system = [
    { type: 'text', text: skillText },
    { type: 'text', text: formularyText, cache_control: { type: 'ephemeral', ttl: '1h' } },
    { type: 'text', text: outputInstructions }
  ];

  // The worksheet is fixed: every section is always generated. selectedOutputs is
  // accepted for backward compatibility with the client but no longer gates output.
  const userMessage = `Patient details: ${JSON.stringify(patientDetails || {})}

DM Pro patient summary / consultation notes:
${transcript}

Fill the complete SugarCARE worksheet for this patient: both prescription columns (idealRx and formularyRx) with the auditFlags comparison between them, plus the diet, exercise, and follow-up sections. Respond in valid JSON only — exactly the worksheet shape specified.`;

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
    let wasRepaired = false;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      try {
        parsed = JSON.parse(repairJSON(clean));
        wasRepaired = true;
        console.log('[analyse] JSON repaired successfully');
      } catch (e2) {
        console.error('[analyse] JSON.parse failed:', e.message);
        return res.status(502).json({
          error: 'Claude returned non-JSON or truncated output: ' + e.message,
          stopReason
        });
      }
    }

    const isPartial = stopReason === 'max_tokens';
    if (isPartial || wasRepaired) {
      parsed._meta = {
        ...(isPartial ? { partial: true } : {}),
        ...(wasRepaired ? { repaired: true } : {}),
        stopReason
      };
    }

    return res.status(isPartial ? 206 : 200).json(parsed);
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
