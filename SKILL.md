---
name: sugarcare-clinical
description: "Clinical decision support for SugarCARE doctors and CMO. Covers T2DM (T1/T2/LADA/MODY/GDM/secondary), HTN, dyslipidaemia, CKD, MASLD, obesity, PCOS, thyroid, gout. Three-layer pre-processing: Kerala/TOFI territory, psychosocial/Acceptance Gap, clinical core. Decision gates D1-D11. IDEAL-RX mode: gold standard prescription vs SugarCARE formulary comparative table. GLP-1 RA/incretin protocol. Comorbidity modifiers: CKD/HF/ASCVD/pregnancy/elderly/liver/TB/cost. India drug intel: brands, cost tiers, key pearls. GRADE evidence on all recommendations. ADA 2026, ESC/ESH 2024, KDIGO 2022, LAI 2024, RSSDI 2022+2024. Institution: SugarCARE Clinics, HomoRx Healthtech, Kerala. CMO: Dr. Rakesh KR. v4.3."
---

# SugarCARE Clinical Algorithm v4.3
**For:** Doctors, CMO | **Institution:** SugarCARE / HomoRx Healthtech, Kerala
**Companion skill:** sugarcare-dietex (diet + exercise — run separately for dietician output)

---

## SECTION A — Output Modes

| Mode | Trigger | Output |
|---|---|---|
| **SUGGEST** | New patient, no Rx | Gold standard plan |
| **AUDIT** | Existing Rx provided | Variance table + Gravity + corrections |
| **FLAG** | Acute / red flags | Urgent actions only |
| **REVIEW** | Follow-up data | Progress + plan adjustment |
| **IDEAL-RX** | "ideal prescription / gold standard Rx" | Comparative table: Gold Standard \| SugarCARE Formulary \| Action (Section F) |
| **CANDIDATE** | "who should be on X" / patient list | Ranked list with indication, priority, affordability |
| **Tier-0** | Quick drug/dose/target query | 5–8 line answer |
| **Standard** | "approach to / manage / workup" | Four pillars + gates + drug intel |
| **Endo-deep** | Atypical / refractory / specialist | Full depth, extended differential |
| **GP-mode** | "for primary care" | Condensed; referral triggers prominent |

Default: Tier-0. Escalate to Standard when complexity warrants. Endo-deep only on request or clear need.
Companion: for diet + exercise output, instruct user to run **sugarcare-dietex**.

---

## SECTION B — Pre-Processing Layers

### Layer 1 — Kerala / South India Territory
Apply before every output for SugarCARE Kerala patients.

- **TOFI phenotype:** BMI may be normal — use ICMR cut-offs (≥23 overweight, ≥25 obese). Waist mandatory: ≥90 cm M / ≥80 cm F. Never reassure on BMI alone.
- **Diet:** Rice-dominant, high GI, coconut oil prevalent. Festival windows = glycaemic disruption: Onam, Vishu, Eid, Christmas — pre-counsel before each.
- **RBS/exercise discordance:** Post-meal exercise common → RBS may be falsely low while HbA1c is driven by fasting/nocturnal glucose. Document RBS context. CGM resolves this.
- **Gender dynamics:** Women underreport; men stop meds after "feeling better" — engage family member as compliance anchor.

### Layer 2 — Psychosocial Modifier
Failure here = plan won't be followed regardless of pharmacological correctness.

**Acceptance Gap — three stages:**
- Knowledge failure → Educate; use family examples
- Acceptance failure → Reframe: *"Your father had this — here's what we do differently for you"*
- Adherence failure → Structural: pill reminders, family anchor, visit schedule
- Reversed Gap (lifestyle-managed, now needs drugs): *"What you achieved is rare. Biology changed — not your discipline."*

**Alternative medicine screen (mandatory — ask specifically):**
> "Are you taking fenugreek water, bitter gourd juice, herbal powders, root preparations, or Ayurvedic formulations?"
- Fenugreek: mild hypoglycaemic effect [2B] — additive risk with SU/insulin
- Bitter gourd: unpredictable potency; volume-depletion risk with SGLT2i + CCB in summer heat
- Any declaration → raise hypoglycaemia risk grade one level; document

**SES:** Always provide cost-tier options. JanAushadhi 60–80% cheaper. Transport is a real barrier — minimise visit frequency where safe.

---

## SECTION B-2 — SugarCARE Visit Protocol

```
Index → Titration (1–2 wk) → Q1 (3 mo) → Q2 (6 mo) → Q3 (9 mo)
→ Q4/Annual (12 mo: full panel + complication surveillance) → Annual thereafter
```

**Index:** Anthropometry (wt, BMI, waist, BP×2), any glucose value, all documents, four pillars, missing investigations dispatched, dietitian referral, ophthalmology if T2DM ≥10 yr without fundus, bridging Rx.

**Q4 / Annual:** HbA1c, lipids, eGFR, ACR, LFT, TSH (if relevant). Complication surveillance: fundus, monofilament, foot exam, ACR.

**Pending results:** Issue bridging Rx (results-independent drugs only) + Scenario A/B/C/D tree. Never issue 60–90 day Rx before results reviewed.

---

## SECTION B-3 — Safety Flags

**Category 1 — Document before prescribing:**
eGFR confirmed before SGLT2i/metformin initiation | K⁺ + creatinine before ACEi/ARB in CKD | MTC/MEN-2 screen + fundus before GLP-1 RA | Guideline deviation documented | Patient refusal documented

**Category 2 — Flag and counsel:**
- Hypoglycaemia: elderly + SU/insulin + irregular meals + alt medicine
- Driver on SU/insulin: Glimepiride Gravity 3 — mandatory counselling + documentation
- **Quadruple BP-lowering alert:** ARB + CCB + SGLT2i + GLP-1 RA = four simultaneous BP-lowering mechanisms. Monitor presyncope/dizziness/falls — especially elderly, summer heat, post-exercise. Reduce CCB/diuretic before uptitrating GLP-1 RA if BP at/below target. [Category 2]
- Sick-day rules: hold Metformin (illness/contrast/surgery); hold SGLT2i (illness/surgery/contrast)

**Category 3 — CDSCO prescriber hierarchy:**
GLP-1 agonists + tirzepatide: physician/endocrinologist Rx required. Document prescriber qualification.

---

## SECTION C — Evidence Grading

| Tag | Meaning |
|---|---|
| [1A] | Strong recommendation, high-quality evidence |
| [1B] | Strong recommendation, moderate evidence |
| [2A/2B/2C] | Conditional recommendation, high/moderate/low evidence |
| [GPP] | Good practice point / consensus |

Guideline conflicts → state both grades. Tie-breaker: most recent; India-relevance for prescribing thresholds.

---

## SECTION D — Four Pillars

**Pillar 1 — Signs & Symptoms:** Cardinal symptoms (onset/duration/severity/modifiers), red flags, symptom clusters, key negatives.

**Pillar 2 — Parameters:**
- Tier 1 (primary care): FBC, glucose, HbA1c, lipids, RFT, LFT, urinalysis, BP, wt, waist
- Tier 2 (specialist): C-peptide, antibodies (GAD/IA-2/ZnT8/TPO/TgAb/TRAb), TSH/fT4, ACR, FibroScan, ABPM, ARR, metanephrines, cortisol
- Tier 3 (advanced): Genetic panels, dynamic tests, advanced imaging
- CGM: mandatory T1DM [1A]; T2DM on insulin [1A]; T2DM on SU + recurrent hypo [1B]; GDM [1B]; T2DM uncontrolled on ≥2 OADs — especially RBS/exercise discordance [2B]. Targets: TIR ≥70%, TBR <4%, TAR <5%. India: FreeStyle Libre 2 (₹2,500–3,500/sensor).
- Critical values: BG <54 or >400 | K⁺ <3.0 or >6.0 | TSH <0.01 or >100 | BP >180/120 with symptoms

TREND READING (MANDATORY when multiple dated values exist):
For HbA1c, FBS, PPBS, BP (systolic), and weight — when 2 or more dated values are present, note the direction of change:
- Improving / Worsening / Stable (stable = <5% change)
Format: 'HbA1c: improving — 10.1% (Jan 2026) → 8.2% (Jun 2026)'
Use this trend to calibrate prescription intensity:
- Improving on current regimen → intensification may not be needed; hold and review
- Worsening despite current regimen → escalate per D-gate
- Stable but above target → maintain current direction, optimise adherence first

**Pillar 3 — Conditions:** Ranked differential, validated diagnostic criteria (ADA/WHO/ESC/KDIGO), phenotype classification, risk stratification (FINDRISC, ASCVD, FIB-4, KDIGO heatmap).

**Pillar 4 — Treatment:** Acute → Lifestyle (always first) → Pharmacological (mechanism-first, India-available) → Targets (individualised) → Education → Follow-up → Referral.

---

## SECTION E — Decision Gates D1–D11

### D1: New hyperglycaemia — diabetes type?
```
Age <35 + lean + 3-generation FH → MODY: C-peptide, GAD/IA-2/ZnT8, genetic panel [1B]
Age <30 + lean + DKA → T1DM: confirm antibodies + C-peptide
  If antibody− + C-peptide preserved → Ketosis-prone T2DM (Flatbush) [1B]
Age 30–50 + lean-mid BMI + OAD failure <6 mo → LADA: GAD + C-peptide
  If GAD+ → insulin earlier; AVOID SU (accelerates β-cell loss) [1A]
Age >35 + Asian BMI + IR features → T2DM; phenotype:
  IR-dominant (↑TG ↓HDL acanthosis) → Metformin + SGLT2i [1A]
  Insulin-deficient (lean, ↓C-peptide) → GLP-1 RA or insulin earlier [1B]
  CV-renal risk (HFrEF/CKD/ASCVD) → SGLT2i + GLP-1 RA early regardless HbA1c [1A]
  Obesity-driven (BMI ≥25 ICMR) → GLP-1 RA; tirzepatide if max weight loss [1A]
Acute illness / steroid / pancreatic / endocrinopathy → secondary DM workup [GPP]
```

### D2: T2DM second drug after metformin (ADA 2026)
```
HFrEF or HFpEF → SGLT2i (dapagliflozin or empagliflozin) [1A]
CKD eGFR 25–60 + ACR >30 → SGLT2i [1A]; add finerenone if ACR >300 on SGLT2i+ACEi/ARB [1A]
ASCVD + obesity (BMI ≥25 ICMR) → GLP-1 RA preferred (ADA 2026): semaglutide SC or dulaglutide [1A]
ASCVD without obesity → SGLT2i or GLP-1 RA (both reduce MACE); prefer SGLT2i if HF/CKD [1A]
BMI ≥27 + HbA1c ≥1% above target → GLP-1 RA; tirzepatide if max weight loss [1A]
Cost-dominant → Glimepiride low-dose or teneligliptin [1B]
Post-prandial dominant → DPP4i or voglibose [1B]
Insulin-deficient + lean → skip oral escalation; basal insulin (Gate D7) [1B]
Default → DPP4i or SGLT2i [1B]
```

### D3: Resistant HTN — secondary cause workup
```
BP >140/90 on ≥3 drugs (incl. diuretic) at adequate dose.
Step 1: Confirm true resistance → ABPM (white-coat) / observed dose (non-adherence)
Step 2: Screen — Primary aldosteronism: ARR [1A] | Renovascular: Doppler/CT angio
  Phaeochromocytoma: metanephrines | Cushing's: 1mg DST | OSA: STOP-BANG
  Renal parenchymal: RFT + ACR | Thyroid: TSH | Coarctation: 4-limb BP
Step 3: Add spironolactone 25–50 mg [1A] (PATHWAY-2) while workup ongoing
  If hyperK: amiloride or eplerenone | Add β-blocker or α-blocker as indicated
```

### D4: Statin intolerance
```
Myalgia, no ↑CK → SAMS (often nocebo). Trial: stop 4 wk → rechallenge lower dose /
  alternate-day / different statin. Most tolerate after 2–3 statin trials [1B]
CK >5× ULN or rhabdo → Stop. Restart hydrophilic statin (rosuvastatin/pravastatin/pitavastatin)
ALT/AST >3× ULN persistent → washout; rule out MASLD (Gate D11)
True multi-statin intolerance → Ezetimibe → Bempedoic acid → PCSK9i [1A]
```

### D5: HTN — first-line drug
```
T2DM + HTN → ACEi or ARB [1A]; add CCB if not at target [1A]; target <130/80 [1A]
  Preferred India: Telmisartan 40–80 mg OD / Ramipril 5–10 mg OD
  AVOID β-blocker first-line in T2DM (masks hypo, worsens IR)
CKD + proteinuria ACR >300 → ACEi or ARB [1A]; avoid thiazide if eGFR <30
HFrEF + HTN → ARNI (sacubitril/valsartan) [1A] + β-blocker [1A]; AVOID verapamil/diltiazem
ASCVD (no DM/CKD) → ACEi/ARB + CCB [1A]; β-blocker if post-MI/angina [1A]
Pregnancy → Methyldopa 250–500 mg BD / labetalol / nifedipine LA; STOP ACEi/ARB [1A]
Young <30 + lean + no FH → secondary workup before starting (Gate D3)
Elderly isolated systolic → CCB or indapamide [1A]; avoid <120/70
Default → Telmisartan 40–80 mg OD or amlodipine 5–10 mg OD or ramipril [1A]
  Two-drug: ACEi/ARB + CCB preferred [1A] | Three-drug not at target → Gate D3
```

### D6: Dyslipidaemia — statin initiation + LDL targets
```
VERY HIGH RISK (established ASCVD / T2DM+ASCVD / CKD+ASCVD) → LDL <55 mg/dL [1A]
  Atorvastatin 40–80 mg or Rosuvastatin 20–40 mg [1A]
  + Ezetimibe if not at target [1A] → Bempedoic acid → PCSK9i [1A]
HIGH RISK (T2DM ≥40 yr or ≥1 RF / CKD G3–G4 / 10-yr ASCVD ≥10%) → LDL <70 mg/dL [1A]
  Atorvastatin 20–40 mg or Rosuvastatin 10–20 mg [1A]
MODERATE RISK (T2DM <40 yr no RF / ASCVD risk 5–10%) → LDL <100 mg/dL [1B]
  Atorvastatin 10–20 mg [1B]
LOW RISK → LDL <116 mg/dL [2B]; lifestyle first; statin if LDL >160
TG ≥500 → Fenofibrate + fat restriction FIRST (pancreatitis risk) [1A]
Statin intolerance → Gate D4
```

INDIA CONTEXT — STATIN DISCRETION:
In Indian clinical practice, statins are continued only while LDL targets are unmet or cardiovascular risk is high. If the patient's LDL is at or near target AND no ASCVD is documented, flag statin continuation as discretionary — not mandatory. Always state the specific LDL target alongside the recommendation:
- High risk (ASCVD, DM + 2 risk factors): LDL target <70 mg/dL
- Moderate risk (DM alone or DM + 1 risk factor): LDL target <100 mg/dL
If LDL is already below the applicable target, note: 'Statin continuation — discretionary (LDL at target). Continue only if clinician judges ongoing cardiovascular risk.'

### D7: Insulin initiation in T2DM
```
WHEN: HbA1c >10% on ≥2 OADs [1A] | HbA1c >9% + symptoms [1B]
  Insulin-deficient phenotype [1B] | Hospitalisation [1A] | Pregnancy [1A]
BASAL FIRST: Glargine U100 (Basalog) or Degludec (Tresiba)
  Start: 0.1–0.2 units/kg/day SC at bedtime [1A]
  Titrate: +2 units every 3 days until FBS 80–130 mg/dL
  Ceiling: 0.5 units/kg → if FBS at target but HbA1c above: add prandial
PRANDIAL: Aspart/lispro at largest meal; start 4 units or 10% basal [1B]
PREMIXED: 30/70 twice daily — less flexible, higher hypo risk [2A]
OAD co-management: Metformin CONTINUE [1A] | SGLT2i CONTINUE [1A]
  GLP-1 RA may CONTINUE [1B] | SU STOP or halve [GPP] | DPP4i consider stopping [2B]
Cost: Basalog (Biocon) — most affordable glargine [Low]
```

### D8: Hypothyroidism
```
TSH >10 → TREAT all [1A]
TSH 4.5–10 + normal fT4 (subclinical):
  <65 + symptomatic / TPO-Ab+ / CV risk / dyslipidaemia → TREAT [1B]
  <65 + asymptomatic + TPO-Ab− → Monitor 6-monthly [2B]
  ≥65 + asymptomatic + TSH <10 → Monitor only [2B]
  Pregnancy / planning → TREAT; target TSH <2.5 mIU/L [1A]
DOSE: Levothyroxine OD empty stomach
  Adult <65: 1.6 mcg/kg/day [1A] | Elderly/cardiac: start 12.5–25 mcg, ↑slowly [1A]
MONITOR: TSH at 6–8 wk after change; annually when stable
Brand consistency: Thyronorm vs Eltroxin — switching alters bioavailability [GPP]
Interactions: calcium/iron → 4-hour gap; same brand always
```

### D9: PCOS — pharmacotherapy
```
IR/metabolic → Lifestyle first (5–10% wt loss restores cycles [1A])
  + Metformin 500 mg OD → 1g BD [1B IR] | If BMI ≥27.5 + inadequate response: GLP-1 RA [2B]
Hyperandrogenism → COC: ethinylestradiol + cyproterone (Diane-35) or drospirenone (Yasmin) [1A]
  If COC contraindicated: spironolactone 50–100 mg/day [1B]
  Minimum 6 months before assessing response (hair growth cycle)
Anovulatory infertility → Letrozole 2.5–7.5 mg days 3–7 FIRST-LINE [1A] (PPCOSII NEJM 2014)
  Metformin + letrozole [1B] | Clomiphene second-line [1A vs untreated]
  6 cycles letrozole without conception → refer reproductive endocrinology
Long-term CV risk → Annual FBS/OGTT, lipids, BP [1A]
Kerala: Diane-35 widely used — confirm BP + migraine history first
```

### D10: Gout / hyperuricaemia
```
ACUTE FLARE (treat before starting ULT):
  Colchicine 1 mg stat + 0.5 mg after 1 hr [1A] — most effective <24h
  NSAIDs: naproxen 500 mg BD or indomethacin 50 mg TDS × 5–7 days [1A]
    AVOID: eGFR <30, peptic disease, HF
  Prednisolone 30–35 mg/day × 5 days: if colchicine + NSAID contraindicated [1A]
  DO NOT START ULT during flare [1A]
START ULT: ≥2 flares/year [1A] | tophi [1A] | uric acid nephrolithiasis [1A]
  CKD G3+ [1B] | SUA >9 + CVD risk asymptomatic [2B]
  Start 2–4 wk AFTER flare; prophylaxis colchicine 0.5 mg OD × 3–6 months [1A]
ULT: Allopurinol 100 mg → ↑100 mg/4wk; target SUA <6 (<5 if tophi) [1A]
  CKD eGFR 30–59: 100–200 mg; <30: 50–100 mg
  DRESS alert: HLA-B*5801+ risk (screen if available) [GPP]
  If allopurinol failure: Febuxostat 40–80 mg [1A] — CV warning in ASCVD (CARES; FDA BX) [1B]
SGLT2i: uricosuria as secondary benefit in T2DM + gout [1B]
Kerala: moderate sardine/mackerel (not eliminate); reduce organ meat, beer, fructose drinks
```

### D11: MASLD/MASH — staging and treatment
```
EXCLUDE: Alcohol >14 units/wk M / >7 F → ALD. Drugs: tamoxifen, amiodarone, steroids.
STAGE FIBROSIS — FIB-4 = (Age × AST) / (Platelets × √ALT):
  <1.30: low risk → annual FIB-4 [1A]
  1.30–2.67: indeterminate → FibroScan or ELF [1A]
  >2.67: high risk → refer hepatology; consider biopsy [1A]
LIFESTYLE: 5% wt loss → ↓steatosis [1A]; 7–10% → ↓NASH histology [1A]; ≥10% → may reverse fibrosis [1B]
PHARMACOTHERAPY:
  MASH + T2DM → Pioglitazone 15–30 mg [1A] (AVOID: HF, osteoporosis, bladder Ca)
  GLP-1 RA (semaglutide): LEAN trial NEJM 2021 — 59% NASH resolution [1B]
  SGLT2i: emerging hepatic fat evidence [2B]
  MASH + obesity (no T2DM) → Semaglutide 2.4 mg [1B]
  NEW: Resmetirom (FDA approved March 2024, MASH F2–F3) — India import-only June 2026 [1A]
MONITOR: FIB-4 annually; LFT 3–6-monthly; FibroScan if FIB-4 rises
Refer hepatology: FIB-4 >2.67, suspected cirrhosis
```

---

## SECTION E-1 — GLP-1 RA / Incretin Protocol (condensed)

### Entry criteria
| Indication | Agent | Evidence |
|---|---|---|
| T2DM + ASCVD + obesity (BMI ≥25 ICMR) | Semaglutide SC — ADA 2026 preferred | [1A] |
| T2DM + ASCVD without obesity | Semaglutide SC or SGLT2i | [1A] |
| T2DM + CKD eGFR **25–75** + ACR >30 | Semaglutide SC 1 mg (FLOW) | [1A] |
| T2DM + HFpEF + obesity **BMI ≥30** | Semaglutide SC 2.4 mg (STEP-HFpEF — BMI ≥30 strictly) | [1A] |
| T2DM + obesity (BMI ≥25) + HbA1c above target ≥2 OADs | Semaglutide or tirzepatide | [1A] |
| Obesity only (BMI ≥27.5 + comorbidity or ≥32.5) | Semaglutide 2.4 mg / tirzepatide 15 mg | [1A] |
| Max weight loss primary goal | Tirzepatide (SURMOUNT-5: ~47% vs ~36% ≥15% wt loss vs sema 2.4 mg) | [1A] |
| CVD + no T2DM + overweight/obese | Semaglutide 2.4 mg (SELECT: 20% MACE ↓) | [1A] |

**Pre-initiation Category 1 checklist:** BMI + waist | HbA1c + FBS within 3 mo | eGFR + ACR | Fundus (rapid HbA1c drop >2% → retinopathy risk) | MTC/MEN-2 screen negative | Gastroparesis history | Pregnancy excluded; contraception if reproductive age; stop ≥2 mo pre-conception | Long-term commitment counselled | CDSCO prescriber documented

### Titration
```
Semaglutide SC: 0.25→0.5→1.0→1.7→2.0→2.4 mg/wk (4 wk each step)
Semaglutide oral: 3→7→14 mg/day (30 days each) — empty stomach, plain water, 30 min wait [CRITICAL]
Tirzepatide SC: 2.5→5→7.5→10→12.5→15 mg/wk (4 wk each)
Dulaglutide SC: 0.75→1.5→3.0→4.5 mg/wk — prefilled autoinjector; second-line to sema
Liraglutide SC: 0.6→1.2→1.8 mg/day (daily) — second-line; Lirafit generic ~₹2,800–3,200/mo
Hold rule: GI intolerance → hold at current dose × 4 wk before step-up
SU: REDUCE 50% at GLP-1 RA initiation [Category 1 action]
```

### Exit criteria (with GRADE)
| Reason | GRADE | Action |
|---|---|---|
| <3% wt loss at 16 wk on max tolerated dose | [1B] | Stop; switch sema→tirzepatide; reassess phenotype |
| Intolerable GI despite slow titration | [GPP] | Step down; if intolerable at start dose, discontinue |
| Vomiting + abdo/back pain + ↑lipase | [GPP] | STOP PERMANENTLY — no rechallenge |
| MTC or MEN-2 diagnosed | [1A] | STOP PERMANENTLY |
| Pregnancy confirmed or planned <2 mo | [1A] | STOP IMMEDIATELY; bridging plan mandatory |
| Sustained cost failure | [GPP] | Switch to generic sema vial; document |
| Elective stop | [GPP] | Step-down protocol; mandatory relapse counselling |

**Post-discontinuation:** STEP-1 extension: 2/3 weight regained within 1 yr. Mandatory counselling: *"This treats obesity like antihypertensives treat HTN — stopping means it returns."*

### India market (post-patent March 2026)
| Agent | Status | Cost/month |
|---|---|---|
| Semaglutide SC generic vial (Natco Semanat) | Available | ₹1,290–1,800 (entry) |
| Semaglutide SC generic pen (Sun Noveltreat, Glenmark) | Available | ₹3,000–5,000 (mid) |
| Semaglutide innovator (Ozempic post-37% cut) | Available | ₹8,800–10,850 |
| Semaglutide oral (Rybelsus) | Available | ₹8,000–10,000 |
| Liraglutide SC (Lirafit generic) | Available | ₹2,800–3,200 |
| Dulaglutide (Trulicity — innovator only) | Available | Very High |
| Tirzepatide (Mounjaro) | Available | ₹14,000–17,000 |

---

## SECTION E-2 — Comorbidity Modifiers

**CKD:** SGLT2i preferred [1A] — CREDENCE [1A], DAPA-CKD [1A], EMPA-KIDNEY [1A]. Add finerenone if ACR >300 on SGLT2i + ACEi/ARB (FIDELIO-DKD + FIGARO-DKD [1A]; 10 mg if eGFR <60, 20 mg if ≥60; monitor K⁺). FLOW: semaglutide SC in T2DM+CKD eGFR 25–75 [1A]. Metformin: full dose eGFR ≥45; 50% if 30–44; stop <30. Avoid NSAIDs, IV contrast without prep. Finerenone: Very High cost (₹5,000–8,000/mo).

**HF:** HFrEF four-pillar: ARNI + β-blocker + MRA + SGLT2i [1A]. SGLT2i: DAPA-HF + EMPEROR [1A]. HFpEF + obesity BMI ≥30: semaglutide 2.4 mg (STEP-HFpEF) [1A]. Avoid TZDs (fluid); saxagliptin (HF hospitalisation signal).

**ASCVD:** LDL <55 mg/dL [1A]. SGLT2i or GLP-1 RA in T2DM regardless HbA1c [1A]. ADA 2026: GLP-1 RA preferred if obesity co-present. Ezetimibe → bempedoic acid → PCSK9i if LDL above target.

**Pregnancy:** Stop ACEi/ARB (teratogenic), statins, SGLT2i, GLP-1 RA. Use methyldopa/labetalol/nifedipine. Insulin gold standard. Levothyroxine: continue, ~30% dose increase from T1. Colchicine: avoid (teratogenic); use prednisolone for gout flare.

**Elderly ≥65:** Relax HbA1c 7.5–8.0%. Avoid glibenclamide, high-dose insulin bolus. Quadruple BP alert (Section B-3). SARC-F annually (see sugarcare-dietex).

**Liver:** MASLD: pioglitazone [1A]; statins NOT contraindicated. Child-Pugh B/C: avoid statins, TZDs; insulin + lifestyle only.

**Polypharmacy:** Rifampicin × statin → massive ↓level; use rosuvastatin/pravastatin. Amiodarone × statin (CYP3A4). Deprescribing review 6-monthly.

**TB:** Rifampicin ↓ OAD/statin levels. Steroid during TB → intensify BG monitoring.

**Cost-constrained:** Metformin + glimepiride + enalapril + amlodipine + atorvastatin (₹300–600/mo total). Teneligliptin cheapest DPP4i (~₹150/mo). Dapagliflozin generic ₹200–400/mo. Sema generic vial ₹1,290–1,800/mo.

---

## SECTION E-3 — Drug Intelligence (Key Pearls)

*For full blocks, user can request: "full drug intel on [drug]"*

**Metformin:** Start 500 mg OD with food → 1g BD over 2–4 wk. Max 2g (no benefit beyond). Hold 48h pre-contrast; restart when eGFR stable. Annual B12. Low cost (₹50–150/mo). Brands: Glycomet, Glucophage, Cetapin.

**Dapagliflozin:** 10 mg OD — ONE dose for ALL indications (T2DM, HF, CKD); do NOT uptitrate. DAPA-HF: 26% ↓HF/CV death with AND without T2DM. DAPA-CKD: benefit regardless of T2DM status. Hold on illness/surgery/contrast. Genital hygiene counsel. Generic ₹200–400/mo (Dapavel, Oxra). Dapa vs empa: dapa has non-DM CKD indication; empa continues to eGFR 20 (dapa stops at 25).

**Empagliflozin:** 10 mg OD; may increase to 25 mg for glycaemia (cardio-renal benefit same at 10 mg). EMPEROR-Preserved: first SGLT2i with HFpEF survival benefit. Continues to eGFR 20. Same sick-day rules as dapa. Mid cost (₹300–700 generic).

**Semaglutide SC:** Post-patent generics (₹1,290–1,800 vial). Slow titration prevents 80% of GI dropouts — never rush. Oral form: empty stomach + plain water + 30-min wait (non-negotiable). Stop ≥2 mo pre-pregnancy. Counsel "Ozempic face" (facial fat loss during weight loss). Generic vial clinic-administered → aligns with titration visit touchpoint.

**Tirzepatide (Mounjaro):** Dual GIP+GLP-1. Superior weight loss: SURMOUNT-5 ~47% vs ~36% ≥15% loss vs sema 2.4 mg [1A]. Min 4 wk at each dose. India patent ~2031; no generic before 2031. ₹14,000–17,000/mo. For affluent urban / obesity-primary patients only.

**Glimepiride:** Low-dose preferred (1–2 mg). Gravity 3 in professional drivers [Category 2]. Reduce 50% at GLP-1 RA initiation. Cheapest SU (₹50–80/mo). Avoid in elderly (glibenclamide even more — being phased out).

**Pioglitazone:** Strongest histological evidence in MASH + T2DM [1A]. AVOID: HF, osteoporosis, bladder Ca, Child-Pugh C. CDSCO retained (2013 suspension reviewed and reversed). FDA black box warning — not a ban. France withdrew permanently. India: mandatory bladder Ca counselling. ₹100–200/mo.

**Atorvastatin:** JanAushadhi generic ₹100–200/mo. Interaction: rifampicin (massive ↓level) — use rosuvastatin/pravastatin with TB drugs. Not contraindicated in MASLD.

---

## SECTION F — Output Templates

### IDEAL-RX Table
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDEAL-RX — Gold Standard vs SugarCARE Formulary
Patient: [Initials, Age, Sex] | Date: | Clinician:
Diagnosis: [Primary + comorbidities]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| # | Gold Standard Drug | Dose/Route/Freq | Indication [GRADE] | SugarCARE Status | Nearest Alternative | Action |
|---|---|---|---|---|---|---|
| 1 | [Generic — Brand] | [dose] | [Indication] [GRADE] | ✅ IN STOCK / ❌ NOT IN STOCK | [Alt if not stocked] | Prescribe / Procure / Out-of-formulary Rx |

FORMULARY SUMMARY
In formulary:     [X/Total] → Prescribe directly
Out of formulary: [X/Total] → Actions below

OUT-OF-FORMULARY ACTIONS
[Drug]: [Why it is gold standard] [GRADE]
  → Nearest formulary alt: [drug + dose] — [how it compares]
  → OR: Procure via HomoRx supply chain (flag pharmacy)
  → OR: Out-of-formulary Rx with CMO documentation

LIFESTYLE: [1-line — full plan via sugarcare-dietex]
REVIEW: [Date + parameters]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Tier-0
```
DIAGNOSIS: [dx, ICD-10] | TARGET: [number]
DRUG: [Generic — Brand dose freq duration]
KEY COUNSEL: [3 lines] | REVIEW: [when + what] | RED FLAG: [1 line]
```

MEDICATION RECONCILIATION (MANDATORY — before generating idealRx):
For every drug the patient is currently taking, explicitly state one of:
- CONTINUE — reason
- MODIFY (dose/frequency change) — reason
- STOP — reason
Never silently drop or add a drug. If a current drug does not appear in idealRx, the reconciliation step must explain why it was stopped or replaced. If no current medications are mentioned in the summary, note: 'No current medications documented — reconciliation skipped.'

### Prescription
```
PATIENT: [Initials, age, sex] | DATE:
DIAGNOSIS: [ICD-10]
Rx: 1. [Generic — Brand] [strength] [route] [freq] [duration]
COUNSEL: [Lifestyle + sick-day] | FOLLOW-UP: [date + tests] | RED FLAGS:
```

### SOAP / SugarCARE A–K / CANDIDATE / Referral: available on request.

---

## SECTION G — Guideline Manifest

ADA 2026 | RSSDI CPR 2022 + 2024 position statements | KDIGO 2022 | ESC HF 2021+2023 | ESC/EAS Lipids 2019+2023 | LAI 2024 | ESC/ESH HTN 2024 | API/IGH HTN 2023 | AACE/OMA Obesity 2023 | IOS 2023 | ATA Thyroid 2014+2023 | AASLD MASLD 2023 | INASL 2025 | ACR Gout 2020

---

## SECTION H — India Defaults

- ICMR BMI: ≥23 overweight, ≥25 obese | Waist: ≥90 M / ≥80 F
- T2DM screening from age 25 (ICMR-INDIAB)
- Premature CVD: 10 years earlier than Western equations
- HbA1c: validate vs haemoglobinopathy — use GMI/fructosamine if β-thal/HbE trait
- Glibenclamide: being phased out — prolonged hypo risk in elderly
- Pioglitazone: retained by CDSCO; mandatory counselling on bladder Ca risk
- **Bariatric surgery (India thresholds):** BMI ≥37.5 any comorbidity; BMI ≥32.5 + ≥1 comorbidity (T2DM/HTN/OSA/MASLD) [1B]. ADA 2026: metabolic surgery in T2DM + BMI ≥32.5 + inadequate control [1A]. Sleeve gastrectomy most common in India. Post-op: lifelong B12/iron/Ca/VitD. Refer when BMI criteria met + ≥6 months optimised medical therapy [GPP].
- DPDP Act 2023: patient data handling obligations. Telemedicine Guidelines 2020.

---

## SECTION I — Disclaimer

```
CLINICAL DECISION SUPPORT ONLY — SugarCARE Clinical Algorithm v4.3
(HomoRx Healthtech Pvt Ltd). Does not replace clinical judgement.
Final prescribing decision rests with the treating physician.
Verify doses, brands, prices against current CIMS India before prescribing.
GLP-1 RA / tirzepatide: physician/endocrinologist Rx required (CDSCO).
Semaglutide generic pricing: March–June 2026; verify before counselling.
Report output concerns to Dr. Rakesh KR (CMO).
```

---

## SECTION J — SugarCARE Formulary (compact)

> Update with live inventory. Used by IDEAL-RX mode.

**✅ IN STOCK (standard):** Metformin IR/XR | Glimepiride 1/2/3 mg | Glimepiride+Met FDC | Vildagliptin | Vilda+Met FDC | Teneligliptin | Tenelimet | Sitagliptin | Dapagliflozin 10 mg | Dapa+Met FDC | Empagliflozin 10/25 mg | Pioglitazone 15/30 mg | Voglibose | Insulin Glargine U100 (Basalog/Glaritus) | Insulin Aspart (Novorapid) | Insulin Lispro (Humalog) | Human NPH + Regular (Huminsulin/Wosulin) | Premix 30/70 | Telmisartan 40/80 mg | Ramipril 5/10 mg | Enalapril | Amlodipine 5/10 mg | Telmi+Amlo FDC | Bisoprolol | Metoprolol succinate | Indapamide 1.5 mg SR | Spironolactone 25/50 mg | Atorvastatin 10/20/40/80 mg | Rosuvastatin 10/20/40 mg | Ezetimibe 10 mg | Atorva+Ezeti FDC | Fenofibrate 145/200 mg | Omega-3 1000 mg | Levothyroxine (Thyronorm) all strengths | Levothyroxine (Eltroxin) | Carbimazole 5/20 mg | PTU 50 mg | Allopurinol 100/300 mg | Febuxostat 40/80 mg | Colchicine 0.5 mg | Aspirin 75/150 mg | Clopidogrel 75 mg | Furosemide 40 mg | Ivabradine 5/7.5 mg

**⚠️ LIMITED STOCK:** Semaglutide oral (Rybelsus) | Bempedoic acid 180 mg

**❌ ORDER / PROCURE:** Semaglutide SC generic vial (Semanat) | Semaglutide SC pen (Noveltreat/Glenmark) | Semaglutide SC innovator (Ozempic) | Liraglutide SC (Lirafit) | Dulaglutide (Trulicity) | Tirzepatide (Mounjaro) | Insulin Degludec (Tresiba) | Finerenone (Kerendia) | Sacubitril/Valsartan (Vymada) | PCSK9i (alirocumab/evolocumab/inclisiran) | Canagliflozin | Resmetirom (import only)

> Out-of-formulary: raise procurement flag to HomoRx pharmacy, or write out-of-formulary Rx with CMO documentation. Never downgrade from gold standard based on formulary alone.

---

## SECTION K — Self-Check (run before every response)

```
1.  Mode correctly auto-detected? (SUGGEST/AUDIT/FLAG/REVIEW/IDEAL-RX/CANDIDATE/Tier-0/Standard/Endo-deep/GP-mode)
2.  Layer 1 (Kerala/TOFI/diet/RBS-exercise discordance/festival) applied?
3.  Layer 2 (Acceptance Gap stage/alt-medicine screen/SES) applied?
4.  SugarCARE visit protocol mapped (Index→Titration→Q1→Q2→Q3→Q4→Annual)?
5.  All four pillars present where appropriate?
6.  At least one decision gate D1–D11 explicitly encoded for major decision points?
7.  All recommendations carry GRADE tags?
8.  Top comorbidity modifiers screened and applied?
9.  India drug intel / cost tier / brands included for key agents?
10. ICMR BMI/waist cut-offs and Asian phenotype applied?
11. Guideline manifest cited where thresholds used?
12. Missing investigations flagged and dispatch plan included?
13. Safety flags (Category 1/2/3) surfaced where relevant?
14. Output template correct for mode?
15. Disclaimer at top AND bottom?
16. Practical pearls included — not just textbook content?
17. If GLP-1 RA / tirzepatide involved:
    - STEP-HFpEF: BMI ≥30 threshold used (NOT ICMR ≥25)?
    - FLOW: eGFR range 25–75 cited correctly?
    - Post-patent March 2026 generic pricing used?
    - Quadruple BP alert checked?
    - SU dose reduction documented as Category 1?
18. If IDEAL-RX mode:
    - Gold standard built from gates first, formulary-independent?
    - Each drug checked against Section J formulary?
    - Comparative table format used?
    - Out-of-formulary actions documented per drug?
19. If CANDIDATE mode: all 5 steps executed?
    (filter → priority rank → affordability → contraindication screen → output format)
20. Suggest sugarcare-dietex if diet/exercise plan is needed?

Missing without documented reason → add before responding.
```
