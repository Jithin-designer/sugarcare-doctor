---
name: cardiometabolic-clinical-algorithm
description: Specialist-depth clinical decision support for cardiometabolic disease in South India / Kerala (SugarCARE / HomoRx Healthtech context) and India-wide. Covers T2DM (T1, T2, LADA, MODY, GDM, secondary), HTN, dyslipidaemia, CKD, MASLD, obesity, PCOS, thyroid, gout. Three pre-processing layers: Layer 1 (Territory: Kerala/South India TOFI phenotype, diet, festival calendar, gender dynamics), Layer 2 (Psychosocial: Acceptance Gap, alternative medicine screen, SES barriers, adherence framing), Layer 3 (Clinical Core: four pillars + decision gates + drug intelligence). Output modes: SUGGEST, AUDIT (variance table + Gravity grading), FLAG, REVIEW, SCREEN, RISK, CANDIDATE (proactive GLP-1 RA / incretin therapy candidate identification). Section C-7 added: full GLP-1 RA / incretin protocol — entry criteria, titration, diet and exercise overlay, monitoring, exit strategy, post-discontinuation management, India affordability tiers (post-patent March 2026), candidate identification logic. Drug intelligence updated: semaglutide post-generic pricing, tirzepatide patent status 2031–2033, liraglutide generic. Trial evidence updated: SURMOUNT-5, FLOW, SELECT, SURPASS-CVOT, SURMOUNT-4 rebound data. SugarCARE institutional protocol hardwired. GRADE evidence on all recommendations. India brands, cost tiers, CDSCO prescriber hierarchy. Guideline manifest: ADA 2026, RSSDI 2024, KDIGO 2022, ESC/ESH 2024, LAI 2024, ATA 2023, ICMR. Institution: SugarCARE Clinics, HomoRx Healthtech, Kerala. CMO: Dr. Rakesh KR.
---

# Cardiometabolic Clinical Algorithm (v4 – SugarCARE Kerala Edition)

A specialist-depth clinical decision support framework for cardiometabolic disease — now upgraded with SugarCARE Kerala-specific intelligence. Three-layer pre-processing (Territory → Psychosocial → Clinical Core) before reasoning begins. Four-pillar reasoning + deterministic decision gates + GRADE evidence tagging + comorbidity modifiers + India-adapted drug intelligence. Endocrinologist-level depth with GP-friendly output modes.

**Institution:** SugarCARE Clinics, HomoRx Healthtech Pvt Ltd, Kerala, India
**Clinical Lead:** Dr. Rakesh KR, CMO
**Version:** 4.1 | **Date:** June 2026 | **Upgraded from:** v4.0 | **Changes:** Section C-7 (GLP-1 RA full protocol + candidate identification + post-patent India market), CANDIDATE output mode, self-check updated to 18 points
**Status:** Active — Quarterly review required

---

## SECTION A – Operating Modes

The skill auto-detects depth from the query and delivers appropriate output. User can override with explicit tags.

### Output Modes

| Mode | Trigger | Output |
|---|---|---|
| **SUGGEST** | New patient, no existing Rx | Algorithm-recommended prescription + full plan |
| **AUDIT** | Existing Rx provided | Variance table + Gravity grades + recommended corrections |
| **FLAG** | Acute symptoms, red flags | Urgent actions only, no full plan |
| **REVIEW** | Follow-up visit data provided | Progress assessment + plan adjustment |
| **SCREEN** | Complication screening request | Surveillance schedule + findings interpretation |
| **RISK** | Risk scoring requested | Validated risk tool output + mitigation pathway |
| **Tier-0 (default)** | Routine drug/dose/target query | 5–8 line prescription-ready answer |
| **Standard** | "approach to / workup / manage" + condition | Full four pillars + decision gates + drug intel for first-line agents |
| **Endo-deep** | Specialist phenotypes, atypical presentation, multi-drug optimisation, refractory cases | Full pillars + all gates + extended differential + specialist drug intel + monitoring + mechanism deep-dive |
| **GP-mode** | "for primary care / GP / family physician / clinic setting" | Standard pillars condensed; emphasise referral triggers; no specialist drugs |
| **Endo-mode** | "as endocrinologist / specialist / consultant level" | Force full specialist depth regardless of query |
| **CANDIDATE** | Proactive scan query: "who should be on GLP-1 RA" / "find incretin candidates" / patient list provided | Run C-7.1 entry criteria against patient data; output ranked candidate list with indication, priority tier, affordability tier, and recommended agent |

User can request switching: `"give me endo-deep on this"` or `"GP-mode please"`.

### Default verbosity
Start with Tier-0. If query implies complexity, escalate to Standard. Only go Endo-deep when explicitly asked or when the case warrants (atypical phenotype, refractory, multi-system).

---

## SECTION B – Architecture

```
REASONING LAYER
├── Pillar 1: Signs & Symptoms
├── Pillar 2: Parameters (Tier 1/2/3 + Critical Values + Monitoring)
├── Pillar 3: Conditions & Diagnoses (Differential + Phenotype + Risk Strat)
└── Pillar 4: Treatment (Acute → Lifestyle → Pharmacology → Targets → Follow-up → Referral)

APPLICATION LAYER
├── Decision Gates (deterministic IF-THEN logic at every critical decision point)
├── Evidence Grading (GRADE system, explicit)
├── Comorbidity Modifiers (CKD, HF, ASCVD, pregnancy, elderly, liver, polypharmacy, TB)
├── Drug Intelligence (India-curated: brands, ceiling, FDC, cost, pearls)
└── Output Templates (Prescription / SOAP / Referral / Patient handout)
```


---

## SECTION B-2 – Layer 1: Territory Context (South India / Kerala)

> Apply before every clinical output for all SugarCARE Kerala patients.
> For non-Kerala India patients: apply ICMR cut-offs and Asian phenotype modifiers; skip Kerala-specific diet and social flags.

**TOFI (Thin Outside Fat Inside) — always flag:**
- BMI may appear normal or borderline — apply ICMR cut-offs (overweight ≥23, obese ≥25), not WHO
- Waist circumference mandatory: ≥90 cm M / ≥80 cm F = central obesity regardless of BMI
- Visceral adiposity drives cardiometabolic risk even in lean-appearing patients
- Never reassure a patient based on BMI alone in this population

**South Indian Diet Pattern:**
- Rice-dominant: high glycaemic load, large portion sizes
- Coconut oil prevalent: saturated fat consideration for dyslipidaemia
- Festival calendar = predictable glycaemic disruption windows (Onam, Vishu, Eid, Christmas) — pre-counsel before each
- Dietary advice must be Kerala-specific: reduce rice portions (not generic "reduce carbs"), introduce ragi/red rice, increase protein

**Gender and Social Dynamics:**
- Women in Kerala may underreport symptoms due to family hierarchy; screening questions must be explicit
- Female patients may delay follow-up due to domestic role obligations — flag and address proactively
- Male patients: community/peer pressure to stop medications after "feeling better" is the most common late-failure trigger
- Engage the family member who accompanies the patient as a compliance anchor

**RBS / Exercise Discordance Pattern:**
- Kerala patients often exercise post-meal (culturally embedded) — RBS may capture a glycaemic nadir while HbA1c is driven by fasting/nocturnal glucose
- Always check: was RBS taken pre- or post-exercise? Document context.

---

## SECTION B-3 – Layer 2: Psychosocial Modifier

> Apply before every clinical output. Failure to address psychosocial layer = plan will not be adhered to, regardless of pharmacological correctness.

**The Acceptance Gap — Three-Stage Model:**

Knowledge → Acceptance → Adherence. These are three separate failures, each requiring different intervention.

- **Stage 1 — Knowledge failure:** Patient does not understand the disease or its consequences → Educate directly, use family examples
- **Stage 2 — Acceptance failure:** Patient knows but does not internalise personal risk → Reframe: "Your father had this — here is what we do differently for you"
- **Stage 3 — Adherence failure:** Patient accepts but fails to sustain behaviour → Structural support: pill reminders, family anchor, DM Pro alerts, abbreviated visit schedule

**Reversed Acceptance Gap (most challenging variant):**
When the patient has successfully managed with lifestyle alone for years and now requires pharmacotherapy:
- The patient's identity is tied to being medication-free — pharmacotherapy feels like personal failure
- Correct framing: *"What you have achieved is clinically rare. What is happening now is biology — your pancreas has been working hard for X years. This medicine makes your lifestyle work again — it does not replace it."*
- Sequence new prescriptions by urgency, not alphabetically — avoid presenting them as a list of failures

**Alternative Medicine Screen — Mandatory for Kerala Patients:**

Do not ask "are you taking anything else?" — ask specifically:
> "Are you taking methi (fenugreek) soaked water, bitter gourd (karela) juice, any herbal powders, root preparations, or Ayurvedic formulations?"

Known preparations and clinical risks:
- **Fenugreek soaked water:** mild documented hypoglycaemic effect [2B] — additive risk with SU and insulin
- **Bitter gourd juice:** unpredictable glucose-lowering potency — significant hypoglycaemia risk with SU/insulin; volume-depletion risk with SGLT2i + CCB in summer heat
- **Herbal powders:** variable composition, often undisclosed — interaction profile unknown
- **Ayurvedic formulations:** may contain heavy metals, interact with hepatic metabolism of statins and metformin

Clinical Action:
- When traditional medicine use confirmed or suspected: increase hypoglycaemia risk grade by one level
- Document in patient record explicitly
- Counsel on interaction risk without dismissing the preparation — dismissal causes non-disclosure

**SES and Treatment Accessibility:**
- Cost of medication is a primary adherence barrier in Tier-2 Kerala — always provide cost-tier options
- JanAushadhi generics: 60–80% cheaper than brand — flag where applicable
- Transport cost to clinic is a real barrier — minimise unnecessary visit frequency where clinically safe

---

## SECTION B-4 – Institutional Protocol (SugarCARE Visit Sequence)

> Apply for all SugarCARE patients. For non-SugarCARE contexts: use as a best-practice template.

**Visit Sequence:**
```
Index Visit
    ↓ (1–2 weeks)
Titration Visit
    ↓ (60–90 days)
Quarterly Review (Q1)
    ↓ (90 days)
Quarterly Review (Q2) – 6-month outcome assessment
    ↓ (90 days)
Quarterly Review (Q3) – 9-month milestone
    ↓ (from 12 months)
Annual Complication Surveillance + Quarterly Reviews continue
```

**Index Visit — mandatory checklist:**
- Any blood glucose value (FBS/RBS/PPBS — minimum)
- All available clinical documents (prescriptions, labs, discharge summaries — no time limit)
- Four-pillar evaluation complete
- Anthropometry complete (weight, BMI, waist, BP ×2)
- Missing fields identified — mandatory investigations dispatched
- Dietitian referral made
- Ophthalmology referral if 10+ years T2DM without documented fundus
- 1–2 week bridging prescription issued (pending investigations)
- Medication reconciliation if on external Rx

**Titration Visit (1–2 weeks post-index):**
- Review investigation results
- Adjust doses based on response and completed data
- Issue 60–90 day prescription once titration complete

**Quarterly Review:**
- HbA1c as primary marker
- BP, weight, waist at every visit
- Relevant labs based on medications (eGFR if on metformin/SGLT2i; LFT if on statin)
- Target: favourable outcome within 6–9 months from index

**Annual Complication Surveillance (from 12 months):**
- Diabetic retinopathy: annual dilated fundus
- Diabetic nephropathy: eGFR + ACR (quarterly in routine review)
- Diabetic neuropathy: annual monofilament + vibration sense
- Diabetic foot: annual 10-point foot examination

**Pending-Results Protocol:**
When critical investigations are pending (TSH, Hb, eGFR, ACR):
- Issue bridging prescription (results-independent drugs only)
- Map conditional scenario tree (Scenario A/B/C/D based on results)
- Explicitly state what changes under each scenario
- Do NOT issue 60–90 day full prescription until pending results are reviewed

---

## SECTION B-5 – Legal and Safety Flags

**Category 1 — Must document before prescribing:**
- Initiation of SGLT2i: eGFR ≥45 confirmed; document result and decision
- Initiation of Metformin: eGFR ≥45 (full dose); document
- Initiation of ACEi/ARB in CKD: potassium and creatinine baseline documented
- When deviating from guideline recommendation: document reason explicitly
- When patient refuses recommended treatment: document refusal and counselling given
- When traditional medicine interaction risk is present: document disclosure to patient

**Category 2 — Flag and counsel:**
- Hypoglycaemia risk: elderly + SU/insulin + irregular meals + Kerala traditional medicine use
- Occupational risk: professional drivers on SU or insulin — Glimepiride Gravity 3 in this context. Mandatory counselling and documentation.
- Triple antihypertensive effect: ARB + CCB + SGLT2i = three simultaneous BP-lowering mechanisms — monitor for presyncope, especially in Kerala summer heat + exercise
- Caloric prescription below BMR: document as error and correct same visit
- Sick-day rules: when to hold Metformin (illness, contrast, surgery), SGLT2i (illness, surgery, contrast)

**Category 3 — CDSCO Prescriber Hierarchy:**
- GLP-1 agonists (semaglutide, liraglutide, dulaglutide) require physician/endocrinologist prescription
- Tirzepatide (GIP/GLP-1): same restriction
- Insulin initiation in T2DM: document prescriber qualification in rural/GP settings
- When prescriber hierarchy is a barrier: recommend referral pathway, not workaround

---

## SECTION B-6 – Pre-Response Self-Check (Updated — 14 Points)

Run before every clinical output:

```
1.  ✓ Mode auto-detected correctly (SUGGEST / AUDIT / FLAG / REVIEW / SCREEN / RISK / Tier-0 / Standard / Endo-deep)?
2.  ✓ Layer 1 (Territory context) applied — TOFI phenotype, Kerala diet, festival calendar, gender dynamics?
3.  ✓ Layer 2 (Psychosocial) applied — Acceptance Gap stage identified, alt-medicine screen included?
4.  ✓ SugarCARE visit protocol applied — Index / Titration / Quarterly / Annual sequence mapped?
5.  ✓ All four pillars present where appropriate to mode?
6.  ✓ At least one decision gate encoded explicitly for major branches?
7.  ✓ Recommendations carry GRADE evidence tags?
8.  ✓ Top 3–5 comorbidity modifiers included where relevant?
9.  ✓ Drug intelligence block(s) for key agents with India-context?
10. ✓ Indian/Asian phenotype flagged where relevant?
11. ✓ Guideline manifest cited where specific thresholds used?
12. ✓ Missing mandatory fields identified and investigation dispatch plan included?
13. ✓ Legal/safety flags (Category 1/2/3) surfaced where relevant?
14. ✓ Drug-verification disclaimer appended?
```

---

## SECTION C – Evidence Grading (GRADE)

Every recommendation MUST carry a GRADE tag:

| Tag | Meaning |
|---|---|
| **[1A]** | Strong recommendation, high-quality evidence (multiple RCTs/meta-analyses) |
| **[1B]** | Strong recommendation, moderate-quality evidence |
| **[1C]** | Strong recommendation, low-quality evidence |
| **[2A]** | Weak/conditional recommendation, high-quality evidence |
| **[2B]** | Weak/conditional recommendation, moderate-quality evidence |
| **[2C]** | Weak/conditional recommendation, low-quality evidence |
| **[GPP]** | Good practice point (consensus, safety, common sense) |

When guidelines conflict (e.g., ADA vs ESC vs RSSDI), state both with grades. Default tie-breaker: **most recent guideline, India-relevance favoured for prescribing thresholds, Western evidence base honoured for mechanism-level claims.**

---

## SECTION D – REASONING LAYER (Four Pillars)

### Pillar 1 – Signs & Symptoms
- Cardinal symptoms with characterisation (onset, duration, severity, modifiers)
- Key signs (vital sign abnormalities, exam findings, pathognomonic features)
- Red flags requiring urgent action
- Symptom clusters mapped to organ-system pattern
- Functional vs organic distinction
- Negative findings that help exclude diagnoses

### Pillar 2 – Parameters

**Tier 1 — First-line (primary care):** FBC, glucose, HbA1c, lipids, RFT, LFT, urinalysis, BP, weight, waist
**Tier 2 — Confirmatory (specialist):** C-peptide, antibodies (GAD/IA-2/ZnT8/TPO/TgAb/TRAb), TSH/fT4/fT3, urine ACR, FibroScan, ABPM, cortisol screen, aldosterone-renin ratio, metanephrines, parathyroid hormone, 25(OH)D
**Tier 3 — Advanced:** Genetic panels (MODY, FH, monogenic obesity), dynamic tests (OGTT, dexamethasone suppression, water deprivation, saline suppression, glucagon stim), advanced imaging (MRI pituitary/adrenal, MIBG, DOTATATE), tissue biopsy

**Asian-specific cut-offs:**
- BMI: ≥23 = overweight, ≥25 = obese (India-specific ICMR cut-offs)
- Waist: ≥90 cm M, ≥80 cm F
- T2DM screening: from age 25 in India (ICMR-INDIAB)
- BP: same as global (140/90 office, 135/85 home)
- HbA1c interpretation: caution if haemoglobinopathy (β-thal trait common in India)
- LDL targets: LAI-India tends to recommend more aggressive than ESC for diabetic patients

**Critical values requiring immediate action:**
- Glucose <54 mg/dL or >400 mg/dL (DKA/HHS workup)
- K⁺ <3.0 or >6.0
- TSH <0.01 or >100
- Na⁺ <125 or >150
- Calcium (corrected) <7.0 or >12.0
- BP >180/120 with end-organ symptoms

### Pillar 3 – Conditions & Diagnoses
- Ranked differential with key supporting features
- Diagnostic criteria (validated: WHO, ADA, ESC, KDIGO, RSSDI)
- Phenotype/subtype classification (e.g., T2DM insulin-resistant vs deficient; HTN primary vs secondary; obesity monogenic vs polygenic)
- Risk stratification (ASCVD score, FINDRISC, KDIGO CKD heatmap, FIB-4 for MASLD, FRAX for osteoporosis)
- Comorbidities flagged for application layer

### Pillar 4 – Treatment
- Acute/immediate (if applicable)
- Lifestyle (specific: diet macros, exercise type/frequency, sleep, stress) — always first
- Pharmacological (mechanism-first, target-based, India-available agents only)
- Targets (HbA1c, BP, LDL, weight, urate, TSH) — individualised
- Patient education (counselling pearls, warning signs, sick-day rules)
- Follow-up protocol (timeline, what to reassess)
- Referral criteria (to whom, urgency, what to send)

---

## SECTION E – APPLICATION LAYER

### Decision Gates – Worked Examples

**Gate D1: New hyperglycaemia — what type of diabetes?**

```
IF age <35 AND BMI <23 AND no acanthosis AND family history ≥3 generations
  → MODY suspect. Order C-peptide, antibody panel, genetic testing (HNF1A,
    HNF4A, GCK, HNF1B). If antibody+, reclassify as LADA. [1B]

ELSE IF age <30 AND lean AND DKA at presentation
  → Classical T1DM most likely. Confirm with antibodies + C-peptide.
    IF antibody-negative + C-peptide preserved → consider KETOSIS-PRONE T2DM
    (Flatbush diabetes — common phenotype in South Asians, Africans). [1B]

ELSE IF age 30–50 AND lean-mid BMI AND gradual onset AND OAD failure within 6 mo
  → LADA suspect. Test GAD antibodies + C-peptide.
    IF GAD+ → initiate insulin earlier; AVOID sulphonylureas (accelerate β-cell loss). [1A]

ELSE IF age >35 AND Asian BMI cut-offs met AND insulin resistance features
  → Classical T2DM. Phenotype further:
    - Insulin-resistant predominant (↑TG, ↓HDL, NAFLD, acanthosis)
       → Metformin + SGLT2i first-line [1A]
    - Insulin-deficient predominant (↓C-peptide, lean Asian)
       → Consider insulin or GLP-1 earlier [1B]
    - CV-renal high risk (HFrEF, CKD, ASCVD)
       → SGLT2i + GLP-1 RA early irrespective of HbA1c [1A]
    - Obesity-driven (BMI ≥30)
       → GLP-1 RA primary; consider tirzepatide if available [1A]

ELSE IF acute illness / steroid use / pancreatic disease / endocrinopathy
  → SECONDARY DIABETES workup. Screen Cushing's, acromegaly, pancreatic disease,
    drug history. [GPP]
```

**Gate D2: T2DM second drug after metformin — which class?**

```
GATE: Patient on metformin alone, HbA1c above individualised target. What's next?

IF coexisting HFrEF or HFpEF
  → Add SGLT2i (dapagliflozin OR empagliflozin). Mortality benefit. [1A]

ELSE IF coexisting CKD (eGFR 25–60, esp. with albuminuria)
  → Add SGLT2i (dapagliflozin OR empagliflozin). Renoprotection. [1A]

ELSE IF coexisting established ASCVD
  → Add SGLT2i OR GLP-1 RA. Both reduce MACE. Prefer GLP-1 if obese, SGLT2i if HF/CKD. [1A]

ELSE IF BMI ≥27 AND no contraindication
  → Add GLP-1 RA (semaglutide, liraglutide, dulaglutide). Weight + glycaemia. [1A]

ELSE IF cost is dominant constraint
  → Add sulphonylurea (glimepiride low-dose) OR DPP4i (teneligliptin most affordable in India). [1B]

ELSE IF post-prandial dominant pattern
  → Add DPP4i OR voglibose. [1B]

ELSE IF insulin-deficient phenotype + lean
  → Skip oral escalation; consider basal insulin earlier. [1B]

DEFAULT (no specific comorbidity, modest BMI, normal cost sensitivity)
  → DPP4i (low side-effect profile) OR SGLT2i (broader benefits). [1B]
```

**Gate D3: Resistant hypertension — secondary cause workup**

```
GATE: BP >140/90 on ≥3 antihypertensives (incl. diuretic) at adequate dose. Why?

STEP 1: Confirm true resistance (rule out pseudo-resistance):
  IF white-coat HTN suspected → 24-hr ABPM. If normal → STOP.
  IF non-adherence suspected → directly observed therapy test or drug levels.
  IF measurement error → recheck with validated cuff, correct technique.

STEP 2: If true resistance confirmed, screen secondary causes:
  - Primary aldosteronism: ARR (most prevalent secondary cause, 10–20% of resistant HTN) [1A]
  - Renovascular: renal Doppler / CT angio if young, asymmetric kidneys, abrupt onset
  - Phaeochromocytoma: plasma/urine metanephrines if paroxysmal sx, labile BP
  - Cushing's: overnight 1mg DST or 24-hr UFC if features
  - OSA: STOP-BANG; polysomnography
  - Renal parenchymal: RFT, UACR, urine sediment
  - Thyroid: TSH (hyperthyroidism)
  - Coarctation: 4-limb BP, echo if young

STEP 3: Add fourth-line drug while workup ongoing:
  → Spironolactone 25–50 mg [1A] — best evidence in PATHWAY-2 trial
  → If hyperK risk: amiloride or eplerenone
  → Beta-blocker (bisoprolol or carvedilol) if not already on
  → Alpha-blocker (prazosin XL) if phaeo not yet excluded
```

**Gate D4: Statin-intolerance pathway**

```
GATE: Patient reports muscle symptoms / hepatotoxicity on statin. Real or perceived?

IF myalgia without CK elevation:
  → Likely SAMS (Statin-Associated Muscle Symptoms, often nocebo). Trial:
    1. Discontinue 4 weeks → reassess.
    2. Re-challenge with lower dose / alternate-day / different statin.
    3. Most patients tolerate after trial of 2–3 different statins. [1B]

IF CK >5× ULN OR rhabdomyolysis:
  → True statin toxicity. Stop. Reassess after CK normalises.
  → Restart at lowest dose of hydrophilic statin (rosuvastatin / pravastatin / pitavastatin).

IF ALT/AST >3× ULN persistent:
  → Reassess after washout. Rule out MASLD as cause (often the real issue, not statin).

IF genuine intolerance to multiple statins despite trials:
  → Step-up: Ezetimibe → Bempedoic acid → PCSK9i (if affordable / available)
  → In India: bempedoic acid recently approved; PCSK9i (alirocumab, evolocumab)
    available but expensive; inclisiran (twice-yearly) available 2024+. [1A]
```

(Additional gates available on demand for specific conditions.)

---

### Comorbidity Modifiers

For any cardiometabolic treatment plan, screen and adjust for these 9 modifiers:

```
+ CKD (eGFR <60)
  Stage 3a (45–59) / 3b (30–44) / 4 (15–29) / 5 (<15)
  → SGLT2i: continue down to eGFR 25; stop at dialysis
  → Metformin: full dose ≥45; reduce 50% at 30–44; stop <30
  → GLP-1 RA: most safe; check label per agent
  → ACEi/ARB: continue unless K+ rising or eGFR drops >30%
  → Avoid: NSAIDs, IV contrast without prep
  → Statin: prefer atorvastatin (hepatic clearance) or fluvastatin

+ Heart Failure (HFrEF or HFpEF)
  → Four-pillar therapy: ARNI + β-blocker + MRA + SGLT2i [1A]
  → SGLT2i: dapa or empa preferred (RCT evidence)
  → Avoid: TZDs (fluid retention), saxagliptin (DPP4i, HF signal)
  → BP target: stricter, ~120/80 if tolerated

+ ASCVD established
  → LDL target <55 mg/dL (LAI-India 2024); <70 mg/dL ADA conservative [1A]
  → SGLT2i OR GLP-1 RA in T2DM regardless of HbA1c [1A]
  → Add ezetimibe if statin alone fails target → bempedoic acid → PCSK9i

+ Pregnancy / Lactation
  → ACEi/ARB: STOP (teratogenic). Use methyldopa, labetalol, nifedipine
  → Statins: STOP (category X)
  → Metformin: safe across pregnancy (used in GDM)
  → Insulin: gold standard for hyperglycaemia in pregnancy
  → SGLT2i: AVOID; GLP-1 RA: AVOID
  → Levothyroxine: continue, expect ~30% dose increase

+ Elderly (≥65) / Frailty
  → Relax targets: HbA1c 7.5–8.0%, avoid hypos
  → Avoid: long-acting SU (glibenclamide), high-dose insulin
  → Watch: postural hypotension (SGLT2i + ACEi + diuretic triple)
  → Statin: continue for ASCVD; primary prevention nuanced after 75

+ Liver disease (Child-Pugh)
  → MASLD common — not contraindication, often indication
  → Pioglitazone: BEST evidence for MASH [1A]
  → SGLT2i, GLP-1 RA: safe and beneficial in MASLD
  → Avoid pioglitazone if HF, osteoporosis, bladder Ca history
  → Child-Pugh C: avoid most agents; insulin + lifestyle only

+ Polypharmacy (≥5 meds, common in elderly with HTN+DM+lipids+HF)
  → Anti-cholinergic burden review
  → Drug-drug interactions: amiodarone × statin, fluconazole × statin
  → Deprescribing review every 6 months
  → Adherence aids: pill packs, FDCs, weekly dosing where possible (semaglutide)

+ Active or past TB
  → Rifampicin × statin: massive ↓ statin level (use rosuvastatin or pravastatin)
  → Rifampicin × OAD: ↓ DPP4i, SU, repaglinide levels → may need dose increase
  → Steroids during TB → worsening hyperglycaemia, intensify therapy
  → INH × glucose: mild hyperglycaemia; pyridoxine prophylaxis

+ Cost-constrained patient (common in Indian primary care)
  → Metformin (₹50–100/mo), glimepiride (₹50–80/mo), enalapril (₹30/mo),
    amlodipine (₹50–80/mo), atorvastatin (₹100–200/mo) — workhorse stack
  → Teneligliptin: cheapest DPP4i in India (~₹150/mo)
  → JanAushadhi generics: 60–80% cheaper than brand
  → SGLT2i now off-patent (dapa 2023, empa 2025) — generic prices dropping fast
  → AVOID newer/imported: tirzepatide, PCSK9i, finerenone unless funded
```

---

### Drug Intelligence – India-Curated Database

**Mandatory fields for every drug recommendation:**

```
DRUG: [Generic name]
  India brands (top 3):       [verified from market data]
  Class & mechanism:          [one-line]
  Standard dose:              [start dose, route, frequency]
  Titration:                  [steps OR "ceiling at X"]
  Maximum dose / Ceiling:     [explicit max + ceiling effect note]
  Available FDCs (India):     [common rational combos]
  Key indications:            [primary + expanding]
  Contraindications:          [top 3 absolute, 2 relative]
  Monitoring:                 [parameters + frequency]
  Dose adjustments:           CKD / Liver / Elderly / Pregnancy
  Common AEs / Serious AEs:   [top 3 each]
  Key drug interactions:      [top 3 clinically relevant]
  Cost tier (India ₹/month):  Low (<₹300) / Mid (₹300–800) / High (>₹800) /
                              Very High (>₹3000)
  Practical pearls:           [counselling, sick-day, peri-op, real-world tips]
```

### Worked drug examples (India-anchored)

#### Metformin
```
India brands:           Glycomet (USV), Glucophage (Merck), Cetapin (Sun),
                        Glyciphage (Franco-Indian)
Class & mechanism:      Biguanide — reduces hepatic gluconeogenesis,
                        improves peripheral insulin sensitivity, AMPK pathway
Standard dose:          500 mg OD with meals → titrate weekly to 500 mg BD,
                        then 1g BD over 2–4 weeks
Titration:              Stepwise to minimise GI side effects
Maximum dose:           2g/day (some go 2.5g, no benefit beyond 2g)
Available FDCs:         Met + glimepiride (Amaryl-M, Glimepiride-M),
                        Met + sitagliptin (Janumet), Met + vildagliptin (Galvus Met),
                        Met + teneligliptin (Tenelimet), Met + dapagliflozin (Forxiga-M,
                        Dapavel-M), Met + empagliflozin (Glyxambi-M)
Key indications:        T2DM first-line; pre-diabetes (high-risk); PCOS (off-label,
                        widely used); GDM; obesity (mild weight benefit)
Contraindications:      eGFR <30; severe hepatic dysfunction; acute MI/sepsis
                        (lactic acidosis risk); IV contrast pending
Monitoring:             eGFR annually; B12 yearly (deficiency common with long use);
                        no glucose-specific monitoring needed
Dose adjustments:       eGFR ≥45: full dose; 30–44: 50% dose; <30: stop
                        Liver: avoid in severe; Elderly: same eGFR rule;
                        Pregnancy: SAFE (used in GDM)
Common AEs:             GI (diarrhoea, nausea) ~20%; metallic taste
Serious AEs:            Lactic acidosis (rare, mostly in CI violations); B12 deficiency
Interactions:           IV contrast (hold 48h); cimetidine; alcohol (caution)
Cost tier:              Low (₹50–150/mo)
Pearls:                 - Take WITH meals to minimise GI
                        - XR formulation if GI intolerance to IR
                        - Hold 48h pre-contrast; restart after eGFR confirmed stable
                        - First drug, last drug — keep on as long as eGFR allows
                        - Annual B12 check; supplement if low (more common in vegetarians)
```

#### Empagliflozin
```
India brands:           Jardiance (Boehringer Ingelheim), Jardia (Cipla),
                        Empacas (Cadila), Glycoz (USV)
Class & mechanism:      SGLT2 inhibitor — proximal tubule glucose blockade,
                        natriuresis, cardio-renal protection
Standard dose:          10 mg PO OD morning
Titration:              May increase to 25 mg for glycaemic effect only;
                        cardio-renal benefit same at 10 mg [1A]
Maximum dose:           25 mg/day (rarely needed; ceiling concept applies)
Available FDCs:         Empa + Metformin (Jardiamet), Empa + Linagliptin (Glyxambi),
                        Empa + Linagliptin + Met (Trijardy-M)
Key indications:        T2DM (any age ≥10 — paediatric label expanded 2023);
                        HFrEF & HFpEF (EMPEROR trials, irrespective of diabetes);
                        CKD with albuminuria (EMPA-KIDNEY)
Contraindications:      T1DM (DKA risk); eGFR <20 for T2DM initiation
                        (cardio-renal continues to lower); prior DKA; recurrent
                        GU infections; pregnancy
Monitoring:             eGFR baseline + 4 wk + annually; volume status;
                        GU symptoms; ketones if unwell
Dose adjustments:       CKD: continue to eGFR 20 (slightly lower than dapa);
                        Liver: no adj; Elderly: caution with diuretics;
                        Pregnancy: AVOID
Common AEs:             Genital mycotic infection (5–10%, higher in women);
                        UTI; polyuria; volume depletion
Serious AEs:            Euglycaemic DKA (rare); Fournier's gangrene (rare)
Interactions:           Loop diuretics — reduce 25%; insulin/SU — hypo risk;
                        lithium — may need monitoring
Cost tier:              Mid (~₹300–700/mo generic; ~₹900–1400 brand)
Pearls:                 - Same SICK-DAY rule as dapa
                        - Hold 3 days pre-op
                        - EMPEROR-Preserved was the first SGLT2i HFpEF win
                        - In CKD: empa works to lower eGFR than dapa
                        - For glucose alone, 25 mg slightly better than 10;
                          for HF/CKD, 10 mg = full benefit
```

#### Semaglutide
```
India brands:           Rybelsus (oral, Novo Nordisk 3/7/14 mg) — available
                        Ozempic (injectable for T2DM, 0.25/0.5/1.0/2.0 mg) — limited
                        Wegovy (injectable for obesity, 0.25–2.4 mg) — limited
Class & mechanism:      GLP-1 receptor agonist — augments glucose-dependent
                        insulin secretion, suppresses glucagon, delays gastric
                        emptying, central satiety signalling, cardio-renal benefit
Standard dose:          ORAL: start 3 mg/day for 30 days → 7 mg/day → 14 mg/day
                        SC weekly (Ozempic): 0.25 mg → 0.5 → 1.0 → 2.0 mg over 8 wk
                        SC weekly (Wegovy, obesity): 0.25 → 0.5 → 1.0 → 1.7 → 2.4 mg
                        over 16 wk
Titration:              Slow titration mandatory — GI side effects dose-dependent
Maximum dose:           Oral 14 mg/day; SC T2DM 2.0 mg/wk; SC obesity 2.4 mg/wk
Available FDCs:         None (peptide, no oral FDCs)
Key indications:        T2DM (oral or injectable); obesity ≥27 BMI with comorbidity
                        or ≥30 BMI (Wegovy 2.4 mg); CV risk reduction in T2DM with
                        established ASCVD (SUSTAIN-6); HFpEF + obesity (STEP-HFpEF)
Contraindications:      Personal/family history MTC or MEN-2; pregnancy;
                        severe gastroparesis; prior pancreatitis (caution)
Monitoring:             Weight, HbA1c, GI tolerance; lipase if symptomatic
Dose adjustments:       CKD: no dose adjustment (safe down to eGFR 15);
                        Liver: no adj; Elderly: caution GI;
                        Pregnancy: AVOID (stop 2 months pre-conception)
Common AEs:             Nausea (20–30%), vomiting, diarrhoea, constipation;
                        usually transient, peaks in titration weeks
Serious AEs:            Acute pancreatitis (rare); MTC (rodent signal, not confirmed
                        humans); gallstones (especially with weight loss); diabetic
                        retinopathy worsening (transient with rapid HbA1c drop)
Interactions:           Slows absorption of co-meds (take other oral meds before
                        oral sema); insulin/SU — hypo risk; warfarin — INR check
Cost tier:              POST-PATENT (March 2026): Generic semaglutide SC vial (Natco Semanat)
                        ~₹1,290–1,800/mo (Entry); Generic pen device ~₹3,000–5,000/mo (Mid)
                        Innovator Ozempic post-37% price cut: ~₹8,800–10,850/mo (High)
                        Wegovy 2.4mg innovator: ~₹17,000–24,000/mo (Very High)
                        — patent expired March 20 2026; 40+ Indian manufacturers entering;
                          generic vial format is now practice-changing for Tier-2/3 India
Pearls:                 - Oral semaglutide must be taken on EMPTY STOMACH with sip
                          of water, wait 30 min before any food/drink — critical
                          for absorption
                        - Counsel: nausea peaks at titration steps, settles by week 2–4
                        - "Ozempic face" — explain weight-loss fat loss in face
                        - Slow titration prevents 80% of GI dropouts
                        - Pause if vomiting + abdominal pain (rule out pancreatitis)
                        - Stop 2 months pre-pregnancy planning
                        - In India: tirzepatide (Mounjaro) increasingly chosen over
                          sema for obesity given dual GIP/GLP-1 superior weight loss
```

#### Tirzepatide
```
India brands:           Mounjaro (Lilly) — launched March 2025 for T2DM, expanding
                        for obesity 2025–26
Class & mechanism:      Dual GIP + GLP-1 receptor agonist — synergistic incretin
                        action, weight loss superior to GLP-1 monotherapy
Standard dose:          Start 2.5 mg SC weekly × 4 wks → 5 mg × 4 wks →
                        titrate to 10–15 mg target
Titration:              Stepwise every 4 wks to minimise GI
Maximum dose:           15 mg/week
Available FDCs:         None
Key indications:        T2DM (approved India 2025); obesity (approved Wegovy-style
                        indication, BMI ≥27 with comorbidity / ≥30)
Contraindications:      MTC/MEN-2 family history; pregnancy; severe gastroparesis;
                        prior pancreatitis caution
Monitoring:             Same as GLP-1 RA + watch for steeper weight loss
Dose adjustments:       CKD: no adj down to eGFR 15; Liver: no adj;
                        Elderly: cautious titration; Pregnancy: AVOID
Common AEs:             GI (similar to GLP-1, slightly more); injection site reaction
Serious AEs:            Pancreatitis (rare); MTC (rodent only); gallbladder events;
                        retinopathy worsening transient
Interactions:           Same as GLP-1 RA
Cost tier:              Very High (₹14,000–17,000/mo; innovator only as of June 2026)
                        India patent ~2031–2033 — no generic tirzepatide announced;
                        no price reduction expected before 2031
Pearls:                 - Superior weight loss vs semaglutide (SURMOUNT trials —
                          ~22% mean body weight loss at 72 wk on 15 mg)
                        - In India: high-cost barrier limits to affluent urban use
                        - GI side effects: titrate slow, hydration, small frequent meals
                        - Discuss long-term commitment — weight regain on
                          discontinuation common
                        - First dual incretin; pipeline includes triple (GIP/GLP-1/
                          glucagon) and oral formulations
```



---

## SECTION C-7 – GLP-1 RA / Incretin Therapy Protocol

*(Covers: semaglutide, liraglutide, dulaglutide, tirzepatide — entry criteria, titration, diet and exercise overlay, monitoring, exit strategy, post-discontinuation management, India market and affordability, candidate identification logic)*

---

### C-7.1 Entry Criteria and Patient Selection

**Initiate GLP-1 RA / incretin therapy when one or more of the following are present:**

| Indication | Agent of choice | Evidence |
|---|---|---|
| T2DM + established ASCVD | Semaglutide SC 1mg (SUSTAIN-6) | [1A] |
| T2DM + CKD any stage ≥G2A2 (eGFR <60 or ACR >30) | Semaglutide SC 1mg (FLOW trial — first dedicated renal CVOT for GLP-1 RA) | [1A] |
| T2DM + HFpEF + obesity | Semaglutide SC 2.4mg (STEP-HFpEF) | [1A] |
| T2DM + obesity (BMI ≥25 ICMR) + HbA1c above target on ≥2 OADs | Semaglutide or tirzepatide | [1A] |
| Obesity without T2DM (BMI ≥27.5 + comorbidity OR ≥32.5) | Semaglutide 2.4mg / tirzepatide 15mg | [1A] |
| T2DM + obesity — maximum weight loss is primary goal | Tirzepatide (SURMOUNT-5: superior to sema; ~47% vs ~36% achieving ≥15% body weight loss at 72 wk, NEJM 2025) | [1A] |
| Overweight/obese + established CVD — no T2DM | Semaglutide 2.4mg (SELECT trial: 20% CVD event reduction, 73% reduction in incident diabetes) | [1A] |

**Pre-initiation checklist — Category 1 documentation required:**
- BMI and waist circumference documented (ICMR cut-offs — not WHO)
- HbA1c, FBS/PPBS current (within 3 months)
- eGFR and urine ACR — GLP-1 RA safe to eGFR 15, no dose adjustment required
- Dilated fundus exam completed or referral scheduled — rapid HbA1c correction >2% in 3 months carries transient diabetic retinopathy worsening signal; baseline fundus mandatory before initiating [Category 1]
- Personal/family history of medullary thyroid carcinoma (MTC) or MEN-2 — absolute contraindication to all GLP-1 RA and tirzepatide; document negative screen [Category 1]
- Gastroparesis history or active symptoms — relative contraindication; document if present
- Pregnancy ruled out; contraception counselled if reproductive-age female — stop GLP-1 RA ≥2 months pre-conception [Category 1]
- Baseline lipase only if prior pancreatitis history — not routine
- Patient counselled on long-term commitment: GLP-1 RA treats obesity/T2DM chronically; stopping = weight rebound + glycaemic rebound [Category 1 documentation of counselling]
- CDSCO Category 3: prescriber qualification (physician/endocrinologist) documented

---

### C-7.2 Initiation and Titration Protocol

**Semaglutide SC — T2DM / CKD / ASCVD / HFpEF / obesity indication:**
```
Start:     0.25 mg SC weekly × 4 weeks
Step 2:    0.5 mg SC weekly × 4 weeks
Step 3:    1.0 mg SC weekly — maintenance for CKD/ASCVD CV-renal benefit [1A]
Step 4:    1.7 mg SC weekly × 4 weeks (obesity indication — continue escalation)
Step 5:    2.0 mg SC weekly × 4 weeks
Target:    2.4 mg SC weekly (Wegovy obesity indication)
Hold rule: If GI intolerance at any step — hold at current dose ×4 weeks before next step-up
```

**Semaglutide oral (Rybelsus) — T2DM only; NOT approved in India for obesity (CDSCO):**
```
Start:     3 mg/day PO × 30 days
Step 2:    7 mg/day PO × 30 days
Target:    14 mg/day PO
CRITICAL:  Empty stomach + sip plain water only + wait 30 min before any food/other drug
           Non-negotiable for absorption — patient counselling mandatory
```

**Tirzepatide SC (Mounjaro) — T2DM / obesity:**
```
Start:     2.5 mg SC weekly × 4 weeks
Step 2:    5.0 mg SC weekly × 4 weeks
Step 3:    7.5 mg SC weekly × 4 weeks
Step 4:    10 mg SC weekly × 4 weeks
Step 5:    12.5 mg SC weekly × 4 weeks
Target:    15 mg SC weekly (maximum)
Hold rule: Do not escalate until current dose tolerated; minimum 4 weeks at each step
```

**GI management — the titration wall:**
- Nausea peaks at each dose step, typically resolves by week 2–4 at that dose
- Brief patient at every step-up: small meals, avoid high-fat/spicy food during titration week, maintain hydration
- Slow titration prevents ~80% of GI-related discontinuations — never rush escalation
- If vomiting + epigastric/back pain: STOP, rule out acute pancreatitis (check serum lipase) before restarting
- Liraglutide (daily injection) — higher GI burden than weekly agents; now that generic weekly semaglutide is available at comparable or lower cost, prefer semaglutide SC over liraglutide as first GLP-1 RA choice unless specific indication

**SU dose adjustment at initiation — mandatory:**
- GLP-1 RA adds glucose-dependent insulin secretion on top of SU → compounded hypoglycaemia risk
- Reduce SU by 50% at GLP-1 RA initiation
- Reassess at 4-week titration visit — if HbA1c at or below target at 3 months, consider stopping SU entirely
- Document SU dose reduction as Category 1 action

---

### C-7.3 Diet and Exercise Overlay — GLP-1 RA Specific

> This is a supplemental overlay on top of the standard cardiometabolic diet/exercise prescription. GLP-1 RA drives significant fat and weight loss — without this overlay, lean mass is disproportionately lost and clinical benefit is partially reversed.

**Protein — non-negotiable upward revision:**
- Standard cardiometabolic non-CKD target: 0.8–1.0 g/kg/day
- On GLP-1 RA (non-CKD): **1.2–1.5 g/kg/day**
- Rationale: GLP-1 RA suppresses appetite indiscriminately — patients reduce total intake but cut carbohydrates and fat less consciously than protein (rice and familiar foods feel more filling even in small amounts); result is ~30–40% of weight lost is lean mass unless protein is actively prescribed
- Kerala-specific sources: fish curry (high protein, acceptable fat), eggs, cooked dal, paneer in moderation, groundnuts as snack; reduce rice portions with the appetite suppression window — "the drug reduces appetite; use that window to cut rice and sweets, not protein"
- CKD patients: protein target remains 0.8 g/kg — do not exceed; GLP-1 RA is still indicated but protein prescription does not change

**Meal structure on gastric emptying delay:**
- GLP-1 RA slows gastric emptying — early satiety, rapid fullness
- Patients commonly skip meals when not hungry — on insulin/SU background this causes hypoglycaemia
- Prescribe: 3 structured meals minimum regardless of appetite level; 4–5 small meals if early satiety is severe
- Oral semaglutide: the 30-minute pre-food window means breakfast timing shifts — adjust SU/insulin timing accordingly
- Avoid large single meals — portion-controlled smaller servings, higher frequency

**Resistance exercise — mandatory co-prescription from day 1:**
- Aerobic exercise alone during GLP-1 RA-driven weight loss accelerates lean mass loss
- Prescribe resistance training from week 1, not "when stable"
- Minimum: 2×/week, all major muscle groups, bodyweight or light resistance
- Kerala context: chair squats, wall push, stair climbing, manual farm/household work counts
- Patient framing: "The injection reduces fat. The exercise preserves your muscle. Both are needed."
- Monitor: if progressive weakness, fatigue, or functional decline develops during rapid weight loss — screen with SARC-F; if positive consider DEXA; intensify protein + resistance prescription

**Hydration:**
- GLP-1 RA reduces thirst alongside appetite — dehydration risk underappreciated
- Prescribe explicit fluid target: 2–2.5 L/day
- Triple BP-lowering alert: if patient is on GLP-1 RA + SGLT2i + ARB simultaneously — monitor for presyncope/dizziness, especially in Kerala summer heat and during/after exercise [Category 2 flag]

---

### C-7.4 Monitoring Schedule On-Drug

| Timepoint | Standard checks | GLP-1 RA specific |
|---|---|---|
| 4 weeks (first titration visit) | Weight, BP, hypoglycaemia events, GI tolerance | SU dose — reduce further if hypo; escalate GLP-1 dose if tolerated |
| 3 months (Q1) | HbA1c, weight, waist, eGFR, urine ACR, BP | Fundus if HbA1c dropped >2% from baseline — transient retinopathy worsening signal; ophthalmology referral if not done |
| 6 months (Q2) | Full metabolic panel, lipid profile, weight, waist | SARC-F + handgrip if rapid weight loss (>10% body weight at 6 months); lean mass concern |
| 12 months (annual) | Annual complication surveillance per standard protocol | USG abdomen if symptomatic (right upper quadrant pain, nausea) — GLP-1 RA increases gallstone risk during rapid weight loss; not routine unless symptomatic |
| Ongoing if symptomatic | Serum lipase if abdominal pain + back pain — rule out pancreatitis | Do not recheck lipase routinely |

---

### C-7.5 Exit Criteria and Exit Protocol

**When to stop GLP-1 RA — structured criteria:**

| Exit reason | Category | Action |
|---|---|---|
| <3% weight loss at 16 weeks on maximum tolerated dose | Inadequate response | Stop; reassess diagnosis + adherence; switch to tirzepatide if semaglutide was used; reassess obesity phenotype |
| Intolerable GI despite slow titration and dietary measures | Intolerability | Hold at current dose ×4 wk; if still intolerable, step down one level; if intolerable at starting dose, discontinue |
| Vomiting + epigastric/back pain + lipase elevated | Acute pancreatitis | STOP PERMANENTLY. Do not rechallenge with any GLP-1 RA or tirzepatide. |
| MTC or MEN-2 diagnosed | Contraindication | STOP PERMANENTLY. |
| Pregnancy confirmed or planned within 2 months | Safety | STOP IMMEDIATELY. Bridging glycaemic plan mandatory. |
| Sustained cost failure | Adherence barrier | Switch to generic semaglutide vial if on branded; if still unaffordable, bridge with SGLT2i + intensive lifestyle; document cost barrier |
| HbA1c at target + weight goal achieved + patient requests stop | Elective | Apply discontinuation protocol below — do NOT stop abruptly |

**Discontinuation protocol — structured exit:**

> SURMOUNT-4 post-hoc (JAMA Internal Medicine, November 2025): >25% weight regain within 1 year of tirzepatide withdrawal in most participants, with corresponding reversal of cardiometabolic improvements. STEP-1 extension (semaglutide): two-thirds of weight lost regained within 1 year of discontinuation. Real-world data suggest less sharp rebound than trials (smaller baseline losses, continued lifestyle management) but rebound remains clinically significant.

- Mandatory counselling before exit: "This medication treats obesity the way antihypertensives treat hypertension. Reaching a goal weight is not an indication to stop — stopping means the condition returns." Document counselling [Category 1].
- Exit step-down: reduce dose by one level every 4 weeks rather than abrupt stop — reduces rebound velocity
- At point of stopping — intensify lifestyle simultaneously:
  - Protein target maintained at 1.2–1.5 g/kg
  - Resistance exercise maintained 2×/week minimum
  - Dietary structure counselled explicitly for post-drug period
- Glycaemia bridging: reassess OAD coverage at stop — often SGLT2i can be continued or uptitrated; SU may need re-uptitration if was reduced at GLP-1 RA initiation
- Post-discontinuation follow-up: 4 weeks + 3 months — weight, HbA1c, waist, metabolic panel

---

### C-7.6 India Market and Affordability — Post-Patent Landscape

**Patent status (June 2026):**

| Agent | India patent status | Generics available | Cost range/month |
|---|---|---|---|
| **Semaglutide** | Expired March 20, 2026 | 40+ manufacturers; 50+ brand names; CDSCO-approved first movers: Natco (Semanat), Sun Pharma (Noveltreat), Glenmark, Dr. Reddy's | See tiers below |
| **Liraglutide** | Expired earlier | Glenmark (Lirafit) ~₹100/day | ₹2,800–3,200/month |
| **Dulaglutide** | Under patent | Innovator only (Trulicity) | Very High |
| **Tirzepatide** | India patent ~2031–2033; no generic announced | Innovator only (Mounjaro, Eli Lilly) | ₹14,000–17,000/month |

**Semaglutide affordability tiers — post March 2026:**

| Tier | Format | Example brands | Cost/month | Clinical fit |
|---|---|---|---|---|
| **Entry** | Vial + syringe (clinic-administered) | Natco Semanat | ₹1,290–1,800 | Cost-constrained patients; weekly clinic visit model; aligns with SugarCARE titration visit protocol — adds a clinical touchpoint |
| **Mid** | Pen device generic | Sun Noveltreat, Glenmark | ₹3,000–5,000 | Mid-income; self-inject at home; preferred for dose-stepping independence |
| **Standard branded** | Innovator post-37% price cut (Nov 2025) | Ozempic, Rybelsus | ₹8,800–10,850 | Affordability not a constraint |
| **Obesity dose** | Wegovy SC 2.4mg innovator | Wegovy | ₹17,000–24,000 | Affluent urban only currently |
| **Tirzepatide** | Mounjaro innovator only | Mounjaro | ₹14,000–17,000 | Obesity-primary indication; superior weight loss; very high cost |

**Prescribing quality note on generics:**
- Until market consolidation (expected to top 6–8 brands), cold-chain maintenance and device quality are the primary differentiators
- Prescribe from CDSCO-approved manufacturers only — confirm CDSCO approval status before prescribing any generic
- Vial format requires training and technique — prefer clinic-administered in Phase 1 of patient initiation
- Liraglutide generic (Lirafit ~₹3,000/month) is affordable but daily injection, higher GI burden, and inferior efficacy vs weekly semaglutide makes it second-line; not preferred first GLP-1 RA choice now that weekly generic semaglutide is available

---

### C-7.7 Proactive Candidate Identification Logic

> For use in CANDIDATE output mode — when a physician queries the database for patients who should be on GLP-1 RA but are not currently prescribed one. This logic is also used by the Command Center's proactive candidate scan feature.

**Step 1 — Rule-based candidate filter (apply against active patient list):**

```
CANDIDATE FLAG if ANY of the following are true:

[Indication 1 — CKD + T2DM]
  eGFR < 60 AND urine ACR > 30 AND current Rx has no GLP-1 RA
  Priority: HIGH (FLOW trial 1A — strongest renal indication)

[Indication 2 — ASCVD + T2DM]
  ASCVD documented (IHD / stroke / PAD / post-MI) AND T2DM AND no GLP-1 RA
  Priority: HIGH (SUSTAIN-6 / SELECT 1A)

[Indication 3 — HFpEF + obesity]
  HFpEF documented AND BMI ≥ 25 (ICMR) AND no GLP-1 RA
  Priority: HIGH (STEP-HFpEF 1A)

[Indication 4 — Obesity-driven T2DM, poorly controlled]
  HbA1c > 7.5 AND BMI ≥ 25 (ICMR) AND on ≥ 2 OADs AND no GLP-1 RA
  Priority: MEDIUM

[Indication 5 — Obesity without T2DM, high CV risk]
  BMI ≥ 27.5 + at least one: ASCVD / HTN / dyslipidaemia / MASLD AND no GLP-1 RA
  Priority: MEDIUM (SELECT trial evidence — non-diabetic CVD population)

[Indication 6 — T2DM, maximum weight loss needed]
  HbA1c > 8.0 AND BMI ≥ 30 AND current Rx has no tirzepatide
  Priority: MEDIUM (consider tirzepatide upgrade if semaglutide already tried)
```

**Step 2 — Priority ranking (within each flagged candidate):**

```
Priority HIGH:   ≥2 indications met simultaneously (e.g., CKD + ASCVD + obesity)
                 OR eGFR declining trajectory (>5 mL/min drop in 12 months)
                 OR HbA1c > 9.0 with obesity
Priority MEDIUM: Single indication; stable parameters
Priority LOW:    Single indication; borderline criteria; significant contraindication present
                 (e.g., prior pancreatitis, MTC family history, cost failure documented)
```

**Step 3 — Affordability overlay (cross-reference SES/cost tier from DM Pro):**

```
IF cost tier = low/cost-constrained:
  → Generic semaglutide vial (₹1,290–1,800/mo) — clinic-administered
  → Flag: cold-chain reliability of local pharmacy to be confirmed

IF cost tier = mid:
  → Generic semaglutide pen device (₹3,000–5,000/mo)

IF cost tier = standard/high AND obesity-primary AND maximum weight loss priority:
  → Tirzepatide (₹14,000–17,000/mo) — document affordability confirmed
  → If tirzepatide unaffordable, generic semaglutide 2.4mg escalation

IF cost data not captured in DM Pro:
  → Flag as "affordability unknown" — assess at consultation before initiating
```

**Step 4 — Contraindication screen (auto-exclude from candidate list):**

```
EXCLUDE if any of:
  - MTC or MEN-2 personal or family history documented
  - Active or recent acute pancreatitis (within 12 months)
  - Severe gastroparesis documented
  - Pregnancy documented or planned within 2 months
  - eGFR < 15 (relative — document and discuss with specialist)
  → Flag as EXCLUDED with reason; do not generate GLP-1 RA recommendation
```

**Step 5 — Candidate output format (CANDIDATE mode):**

```
CANDIDATE SUMMARY — [Patient ID] | [Clinic] | [Date]

Indication(s):      [List matched indications from Step 1]
Priority tier:      [HIGH / MEDIUM / LOW]
Recommended agent:  [Semaglutide SC / Tirzepatide / Semaglutide oral — with rationale]
Affordability tier: [Entry / Mid / Standard / Unknown]
Est. monthly cost:  [₹ range]
Contraindications:  [None identified / List if present]
Missing data:       [Fields needed to confirm candidacy — e.g., fundus not on record]
Suggested action:   [Schedule for review → Command Center queue OR clinic visit]
GRADE evidence:     [Tag per indication]
```

**DM Pro data fields required for reliable candidate identification:**
- ASCVD: structured yes/no field (not free text) — IHD, stroke, PAD, post-MI separately coded
- HFpEF / HFrEF: structured comorbidity field
- Waist circumference: mandatory (not optional)
- Current Rx: drug class coded (not just brand name free text) — must distinguish GLP-1 RA vs other agents
- SES/affordability indicator: 3-tier (cost-constrained / standard / high) — entered by clinic staff at index visit
- Note: if any of above are in free text / inconsistently filled, candidate scan will have false negatives — DM Pro data quality directly limits candidate identification accuracy


(Additional drug intelligence blocks for: metformin variants, sulphonylureas, all DPP4i, all SGLT2i, all GLP-1 RA, insulins by type, pioglitazone, voglibose, all major antihypertensives, statins, ezetimibe, bempedoic acid, PCSK9i, fenofibrate, allopurinol, febuxostat, levothyroxine, carbimazole, cabergoline, fludrocortisone, hydrocortisone, finerenone, sacubitril/valsartan — built on demand or by request.)

---

## SECTION F – Output Templates

### SugarCARE Internal Review Template (Sections A–K)

For SUGGEST, AUDIT, and REVIEW mode at SugarCARE Clinics — use this as the primary output format when full clinical documentation is required.

```
DISCLAIMER [mandatory — top]

A — Case Identifiers
  Case ID | Patient summary | Visit type | Layer status

B — Master Reading
  Thread 1: Primary glycaemic analysis
  Thread 2: Cardiometabolic risk thread
  Thread 3: Complication / neuropathy / renal thread
  Thread 4 (if applicable): Kerala psychosocial / territory thread

C — Patient Phenotype Summary
  Parameter grid + key clinical context table

D — Layer 1 + Layer 2 Flags
  Territory context | Psychosocial modifier | Acceptance Gap classification

E — Labs (Available + Pending + Missing Fields)
  Table: parameter | value | status | clinical significance

F — Variance Analysis (AUDIT mode)
  | # | Finding | Direction | Gravity | Standard | Source | Action |
  Gravity grades: 1 (Minor) | 2 (Suboptimal) | 3 (Grave/Potential Harm)
  Count by gravity at end

G — Treatment Plan
  Part 1: Today / results-independent actions
  Part 2: Conditional scenarios (Scenario A / B / C / D based on pending results)

H — Investigations Priority Dispatch
  Table: test | when | priority | reason | action trigger

I — Monitoring Plan + SugarCARE Visit Sequence

J — Legal + Safety Flags (Category 1 / 2 / 3)

K — Discussion Point (one peer-learning question)

DISCLAIMER [mandatory — bottom]
```

### AUDIT Variance Table Format

```
| # | Finding | Direction | Gravity | Algorithm Standard | Source [GRADE] | Recommended Correction |
|---|---|---|---|---|---|---|

Gravity definitions:
  Grade 1 — Minor: preference difference, no clinical impact
  Grade 2 — Suboptimal: clinically inferior, no immediate harm
  Grade 3 — Grave: potential harm or major missed opportunity

After table: count by gravity. Example:
  Grade 3: 3 | Grade 2: 2 | Appropriate: 1
```

### Conditional Scenario Block Format

Use when pending investigations will determine management direction:

```
Scenario A — [condition: e.g., TSH Normal + Hb ≥11 g/dL]:
  → [drug 1] [drug 2] [rationale] [GRADE]

Scenario B — [condition: e.g., TSH Elevated]:
  → [drug 1] first. Defer [drug 2] 6–8 weeks.

Scenario C — [condition: e.g., Hb <10 g/dL]:
  → Treat confounder first. Recalibrate HbA1c target.

Scenario D — [condition: e.g., FBS >200]:
  → [escalation: e.g., add basal insulin]
```

### Tier-0 Quick Output (default)
```
DIAGNOSIS: [Working dx, ICD-10]
TARGET: [Specific numerical target]
DRUG: [Generic + brand + dose + frequency + duration]
KEY COUNSEL: [3 lines max]
REVIEW: [When + what to check]
RED FLAG TO RETURN: [1 line]
```

### Prescription Template
```
PATIENT: [Initials, age, sex]
DATE:
DIAGNOSIS: [ICD-10 if specified]
Rx:
1. [Generic — Brand] [strength] — [route] — [frequency] — [duration]
   [Indication on Rx if needed]
2. [Same format for additional drugs]
COUNSEL: [Lifestyle + medication-specific + sick-day rules]
FOLLOW-UP: [Date + tests to bring]
RED FLAGS: [Symptoms requiring return]
SIGNATURE/REG NO:
```

### SOAP Note Template
```
S (Subjective): [HPI + relevant ROS + concerns]
O (Objective): [Vitals + exam + lab summary]
A (Assessment): [Working diagnosis + phenotype + risk strat + comorbidities]
P (Plan):
  Pharm: [...]
  Lifestyle: [...]
  Investigations: [...]
  Targets: [...]
  Patient education: [...]
  Follow-up: [...]
  Referral if any: [...]
```

### Referral Block
```
REFER TO: [Specialty]
URGENCY: [Same day / 1 week / 1 month / routine]
REASON: [One-line clinical question]
DATA TO SEND:
  - Clinical summary (1 paragraph)
  - Last 3 relevant lab sets
  - ECG / imaging if relevant
  - Drug history
  - Allergies
PROVISIONAL ICD-10:
```

### Patient Handout (on request)
Plain-language summary of:
- Their condition (1 paragraph)
- Their treatment (drug name, why, how to take)
- Lifestyle bullets
- Warning signs to return
- Next visit date

---

## SECTION G – Guideline Manifest & Update Protocol

### Current Manifest (v4.0, locked May 2026)

| Domain | Guideline | Body | Version | Date | Next Review |
|---|---|---|---|---|---|
| T2DM core | Standards of Care | ADA | 2026 | Jan 2026 | Jan 2027 |
| T2DM India | Clinical Practice Recommendations | RSSDI | 2024 | 2024 | Q3 2026 |
| Diabetes-CKD | Diabetes in CKD | KDIGO | 2022 update | 2022 | Q1 2027 |
| HF | HF Guidelines | ESC | 2023 update | 2023 | Q3 2026 |
| Lipids (West) | Dyslipidaemia | ESC/EAS | 2019, update 2023 | 2023 | Q3 2026 |
| Lipids India | Lipid Mgmt Guidelines | LAI | 2024 | 2024 | Q3 2026 |
| HTN | Hypertension | ESC/ESH | 2024 | 2024 | Q3 2027 |
| HTN India | Indian Guidelines | API/IGH | 2023 | 2023 | TBD |
| Obesity | Obesity | AACE/OMA | 2023 | 2023 | Q4 2026 |
| Obesity India | Indian Obesity Society | IOS | 2023 | 2023 | TBD |
| Thyroid | Hypothyroidism | ATA | 2014, update 2023 | 2023 | Q3 2026 |
| Thyroid India | ITS guidelines | ITS-India | latest | varies | TBD |
| MASLD | MASLD/MASH | AASLD | 2023 | 2023 | Q3 2026 |
| MASLD India | INASL guidelines | INASL | 2025 | 2025 | Q4 2026 |
| Gout | Gout Mgmt | ACR | 2020 | 2020 | TBD |

---

## SECTION H – India-Specific Defaults

### Asian/Indian Phenotype Considerations (always apply)
- BMI cut-offs: 23 (overweight), 25 (obese)
- Waist: 90 cm M, 80 cm F
- Lean diabetic phenotype: insulin-deficient + thin-fat distribution; lower BMI threshold for treatment
- Premature CVD: assume 10-year earlier than Western risk equations
- T2DM screening: from age 25
- B12 + iron deficiency common — assume mixed deficiency in fatigue presentations
- HbA1c: validate against haemoglobinopathy (β-thal trait, HbE common in some regions)

### Indian Prescribing Reality
- Drug brand selection: prefer top-3 by market share + JanAushadhi generic if available
- Cost-tier annotation mandatory: Low/Mid/High/Very High
- FDC awareness: India has more rational FDCs than West (and some irrational — flagged)
- Banned drug awareness: glibenclamide phasing out, pioglitazone retained in India when banned elsewhere (FDA black box but Indian regulators retained), serdexmethylphenidate not in India
- AYUSH integration: if patient asks, acknowledge but state evidence base limits

### Regulatory Awareness
- Telemedicine Practice Guidelines 2020 — applies if used in tele-consult
- DPDP Act 2023 — patient data handling
- CDSCO SaMD — this skill is decision support, not diagnostic
- Clinical Establishments Act standards
- NMC code of ethics

---

## SECTION I – Mandatory Disclaimers (always include)

When generating clinical output, include at TOP and BOTTOM:

```
CLINICAL DECISION SUPPORT ONLY — Cardiometabolic Algorithm v4.1 (SugarCARE / HomoRx Healthtech).
This output is algorithm-based and does not replace clinical judgement.
Final prescribing decision rests with the treating physician.
Verify all drug doses, brands, and prices against current CIMS India before prescribing.
GLP-1 agonist / tirzepatide prescription requires physician/endocrinologist qualification per CDSCO guidelines.
Generic semaglutide pricing current as of March–June 2026; verify current prices before counselling patient.
Report any output concerns to Dr. Rakesh KR (CMO).
```

This is non-negotiable for clinical safety until verified drug-database backing is in place.

---

## SECTION J – Self-Check Before Responding (v4 — Updated)

For every clinical output, verify internally:

```
1.  ✓ Mode auto-detected correctly (SUGGEST / AUDIT / FLAG / REVIEW / SCREEN / RISK / Tier-0 / Standard / Endo-deep)?
2.  ✓ Layer 1 (Territory context) applied — TOFI, Kerala diet, festival calendar?
3.  ✓ Layer 2 (Psychosocial) applied — Acceptance Gap, alt-medicine screen, SES?
4.  ✓ SugarCARE visit protocol mapped — Index / Titration / Q1–Q4 / Annual?
5.  ✓ All four pillars present where appropriate?
6.  ✓ At least one decision gate encoded explicitly for major branches?
7.  ✓ Recommendations carry GRADE evidence tags?
8.  ✓ Top 3–5 comorbidity modifiers included where relevant?
9.  ✓ Drug intelligence block(s) for key agents with India-context?
10. ✓ Indian/Asian phenotype flagged where relevant?
11. ✓ Guideline manifest cited where specific thresholds used?
12. ✓ Missing mandatory fields identified and investigation dispatch included?
13. ✓ Legal/safety flags (Category 1/2/3) surfaced where relevant?
14. ✓ Output template chosen (SugarCARE A–K / Tier-0 / Prescription / SOAP / Referral / CANDIDATE)?
15. ✓ Drug-verification disclaimer appended?
16. ✓ Practical pearls included — not just textbook content?
17. ✓ If GLP-1 RA / tirzepatide is indicated or discussed — C-7 pre-initiation checklist applied, affordability tier assigned, India post-patent pricing used (not pre-2026 prices)?
18. ✓ If CANDIDATE mode — all 5 steps executed (rule filter → priority rank → affordability overlay → contraindication screen → candidate output format)?
```

If any missing without good reason, add before responding.
