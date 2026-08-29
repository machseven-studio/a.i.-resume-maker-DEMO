/**
 * ============================================================================
 *  AI RESUME MAKER — DEMO EDITION — single-file Node.js + Express app
 *  (using Google's Gemini API — free tier, no credit card required)
 *  PDF rendering: PDFKit (no headless browser required)
 * ============================================================================
 */

require('dotenv').config();

const express = require('express');
const PDFDocument = require('pdfkit');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenAI({
  apiKey: process.env.AI_API_KEY,
});

app.use(express.json({ limit: '2mb' }));

const DEGREE_LIST = [
  'B.Tech (Bachelor of Technology)', 'M.Tech (Master of Technology)',
  'B.E. (Bachelor of Engineering)', 'M.E. (Master of Engineering)',
  'B.Sc (Bachelor of Science)', 'M.Sc (Master of Science)',
  'B.Com (Bachelor of Commerce)', 'M.Com (Master of Commerce)',
  'BA (Bachelor of Arts)', 'MA (Master of Arts)',
  'BBA (Bachelor of Business Administration)', 'MBA (Master of Business Administration)',
  'BCA (Bachelor of Computer Applications)', 'MCA (Master of Computer Applications)',
  'MBBS (Bachelor of Medicine, Bachelor of Surgery)', 'MD (Doctor of Medicine)',
  'MS (Master of Surgery)', 'BDS (Bachelor of Dental Surgery)', 'MDS (Master of Dental Surgery)',
  'LLB (Bachelor of Laws)', 'LLM (Master of Laws)',
  'B.Arch (Bachelor of Architecture)', 'M.Arch (Master of Architecture)',
  'B.Pharm (Bachelor of Pharmacy)', 'M.Pharm (Master of Pharmacy)',
  'B.Ed (Bachelor of Education)', 'M.Ed (Master of Education)',
  'BHM (Bachelor of Hotel Management)', 'BFA (Bachelor of Fine Arts)', 'MFA (Master of Fine Arts)',
  'B.Des (Bachelor of Design)', 'M.Des (Master of Design)',
  'CA (Chartered Accountant)', 'CS (Company Secretary)', 'CFA (Chartered Financial Analyst)',
  'ICWA / CMA (Cost and Management Accountant)',
  'Diploma (Polytechnic)', 'Higher Secondary (10+2)', 'Secondary School (10th)',
  'Ph.D. (Doctor of Philosophy)', 'Post-Doctoral Fellowship',
  'BS (Bachelor of Science, International)', 'MS (Master of Science, International)',
  'BA (Hons)', 'MA (Hons)',
  'B.Voc (Bachelor of Vocation)', 'PGDM (Post Graduate Diploma in Management)',
  'Executive MBA', 'PGCE (Postgraduate Certificate in Education)',
  'Associate Degree', "Bachelor's Degree (General)", "Master's Degree (General)",
  'JD (Juris Doctor, US Law)', 'EdD (Doctor of Education)', 'PsyD (Doctor of Psychology)',
  'DVM (Doctor of Veterinary Medicine)', 'DNB (Diplomate of National Board, Medical)',
];

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AI Résumé Maker — Free Demo</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind = tailwind || {};
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          wine: '#4A1620',
          wineLight: '#6B2430',
          gold: '#C9A876',
          parchment: '#F5EBE0',
          hairline: '#7A3540',
        },
        fontFamily: {
          display: ['Cormorant', 'serif'],
          sans: ['Libre Franklin', 'sans-serif'],
          silly: ['Kalam', 'cursive'],
        },
      },
    },
  };
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;1,500;1,600&family=Libre+Franklin:wght@400;500;700&family=Kalam:wght@400;700&display=swap" rel="stylesheet">
<style>
  body {
    font-family: 'Libre Franklin', system-ui, sans-serif;
    background-color: #4A1620;
    color: #F5EBE0;
    background-image:
      repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px),
      linear-gradient(125deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 18%, rgba(201,168,118,0.06) 30%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0) 58%, rgba(107,36,48,0.5) 68%, rgba(255,255,255,0.07) 80%, rgba(255,255,255,0) 100%),
      radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 50%),
      radial-gradient(ellipse at 80% 70%, rgba(201,168,118,0.07) 0%, rgba(255,255,255,0) 55%);
    background-attachment: fixed;
  }
  h1, h2, h3 { font-family: 'Cormorant', serif; letter-spacing: 1px; }

  .headline-cream {
    background-image: linear-gradient(135deg, #FDF8EF 0%, #EDE0C8 40%, #F5EBDB 60%, #E8D9BC 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  ::selection { background: #6B2430; color: #F5EBE0; }
  .glow-border:focus { box-shadow: 0 0 0 2px rgba(201,168,118,0.4); }
  .spinner {
    border: 3px solid rgba(245,235,224,0.15);
    border-top-color: #F5EBE0;
    border-radius: 50%;
    width: 18px; height: 18px;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes heroFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes drawLine {
    from { width: 0; }
    to { width: 64px; }
  }
  @keyframes punchIn {
    0% { opacity: 0; transform: scale(0.85) translateY(8px); }
    60% { opacity: 1; transform: scale(1.04) translateY(0); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .hero-heading {
    opacity: 0;
    animation: heroFadeUp 0.9s ease-out forwards;
  }
  .hero-rule {
    width: 0;
    height: 2px;
    background-color: #C9A876;
    margin: 18px auto;
    animation: drawLine 0.6s ease-out forwards;
    animation-delay: 0.9s;
  }
  .hero-subheading {
    opacity: 0;
    animation: punchIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: 3s;
  }

  .req-star { color: #C9A876; margin-left: 3px; font-weight: 700; }

  .company-card { position: relative; }
  .remove-company-btn {
    position: absolute; top: 10px; right: 10px;
    background: rgba(122,53,64,0.6); color: #F5EBE0;
    border: 1px solid #7A3540; border-radius: 6px;
    width: 26px; height: 26px; line-height: 1;
    font-size: 14px; cursor: pointer;
  }
  .remove-company-btn:hover { background: #7A3540; }

  .field-error { border-color: #f87171 !important; }

  .ph-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #F5EBE0; color: #4A1620;
    border-radius: 999px; padding: 6px 14px;
    font-size: 12px; font-weight: 600;
    box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  }
</style>
</head>
<body class="min-h-screen">

  <div class="max-w-3xl mx-auto px-6 py-14">

    <div class="mb-14 text-center relative">
      <div class="flex justify-center md:justify-end items-center gap-2 mb-4 flex-wrap">
        <span class="ph-badge">🏆 Featured on Product Hunt</span>
        <span class="ph-badge" style="background:#C9A876;">✨ Free Demo — No Payment Required</span>
      </div>

      <p class="uppercase tracking-[0.3em] text-xs text-gold mb-4">AI Résumé Maker</p>
      <h1 class="hero-heading headline-cream text-2xl md:text-4xl font-semibold tracking-tight leading-tight max-w-2xl mx-auto">
        No matter how &quot;<span class="font-silly font-normal">diverse</span>&quot; your experience is, if your resume looks like everyone else's homework, recruiters will <span class="font-bold" style="letter-spacing: 2px; font-size: 1.1em;">REJECT</span> it.
      </h1>
      <div class="hero-rule"></div>
      <p class="hero-subheading font-display italic text-gold text-base md:text-lg mb-10">
        (and honestly, basic résumés get basic salaries, you know?)
      </p>

      <div class="text-left max-w-xl mx-auto mb-10 space-y-4">
        <div class="flex gap-3">
          <span class="text-gold font-medium text-sm" style="font-family: Georgia, serif;">1.</span>
          <p class="text-parchment text-sm leading-relaxed" style="font-family: Georgia, serif;">Our advanced A.I. software will modify your basic keywords and convert them into Oxford-level immaculate English sentences which are impossible to overlook.</p>
        </div>
        <div class="flex gap-3">
          <span class="text-gold font-medium text-sm" style="font-family: Georgia, serif;">2.</span>
          <p class="text-parchment text-sm leading-relaxed" style="font-family: Georgia, serif;">Your resume will look like a <em>modern art masterpiece</em> instead of some confusing income-tax form.</p>
        </div>
        <div class="flex gap-3">
          <span class="text-gold font-medium text-sm" style="font-family: Georgia, serif;">3.</span>
          <p class="text-parchment text-sm leading-relaxed" style="font-family: Georgia, serif;">Your resume will be customised with <span class="text-gold font-semibold">executive-grade</span> raised lettering, <span class="text-gold font-semibold">premium golden edges</span> for the highlights, and a <span class="text-gold font-semibold">neat layout</span> <em>(which is cleaner than your excuses for being unemployed.)</em></p>
        </div>
        <div class="flex gap-3">
          <span class="text-gold font-medium text-sm" style="font-family: Georgia, serif;">4.</span>
          <p class="text-parchment text-sm leading-relaxed" style="font-family: Georgia, serif;">Your resume will be laden with slick margins <span class="uppercase">so precise</span>, even the pickiest recruiter won't find a flaw.</p>
        </div>
      </div>

      <h2 class="font-display text-2xl md:text-4xl font-semibold text-parchment leading-snug max-w-2xl mx-auto">
        Give us 120 seconds. We'll craft a resume the recruiters can't ignore.
      </h2>
      <p class="italic text-parchment/70 text-base mt-3"><em>(as for the processing fee? well, it's cheaper than an energy drink.)</em></p>
    </div>

    <div class="bg-wineLight/40 border border-hairline rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
      <form id="resumeForm" class="space-y-6" novalidate>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm text-parchment/70 mb-1.5">Full Name<span class="req-star">★</span></label>
            <input required name="fullName" type="text" placeholder="Jordan Blake"
              class="w-full bg-wine border border-hairline rounded-lg px-4 py-2.5 text-parchment glow-border outline-none" />
          </div>
          <div>
            <label class="block text-sm text-parchment/70 mb-1.5">Target Role / Position Title<span class="req-star">★</span></label>
            <input required name="targetRole" type="text" placeholder="Senior Product Manager"
              class="w-full bg-wine border border-hairline rounded-lg px-4 py-2.5 text-parchment glow-border outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm text-parchment/70 mb-1.5">Email<span class="req-star">★</span></label>
            <input required name="email" type="email" placeholder="jordan@email.com"
              class="w-full bg-wine border border-hairline rounded-lg px-4 py-2.5 text-parchment glow-border outline-none" />
          </div>
          <div>
            <label class="block text-sm text-parchment/70 mb-1.5">Phone</label>
            <input name="phone" type="text" placeholder="+91 98765 43210"
              class="w-full bg-wine border border-hairline rounded-lg px-4 py-2.5 text-parchment glow-border outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm text-parchment/70 mb-1.5">Location</label>
            <input name="location" type="text" placeholder="Mumbai, India"
              class="w-full bg-wine border border-hairline rounded-lg px-4 py-2.5 text-parchment glow-border outline-none" />
          </div>
          <div>
            <label class="block text-sm text-parchment/70 mb-1.5">LinkedIn URL</label>
            <input name="linkedin" type="text" placeholder="linkedin.com/in/jordanblake"
              class="w-full bg-wine border border-hairline rounded-lg px-4 py-2.5 text-parchment glow-border outline-none" />
          </div>
        </div>

        <div>
          <label class="block text-sm text-parchment/70 mb-1.5">Highest Qualification / Degree<span class="req-star">★</span></label>
          <input required name="degree" list="degreeOptions" autocomplete="off" placeholder="Start typing... e.g. B.Tech"
            class="w-full bg-wine border border-hairline rounded-lg px-4 py-2.5 text-parchment glow-border outline-none" />
          <datalist id="degreeOptions">
            ${DEGREE_LIST.map((d) => `<option value="${d.replace(/"/g, '&quot;')}"></option>`).join('\n            ')}
          </datalist>
          <p class="text-xs text-parchment/50 mt-1.5">Start typing to search — Indian &amp; international degrees supported.</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm text-parchment/70">Work Experience <span class="text-parchment/40">(optional)</span></label>
            <button type="button" id="addCompanyBtn"
              class="text-xs bg-gold text-wine font-semibold rounded-lg px-3 py-1.5 hover:bg-parchment transition">
              + Add Another Company
            </button>
          </div>
          <div id="companiesContainer" class="space-y-4"></div>
          <p class="text-xs text-parchment/50 mt-2">Leave this section empty if you have no work experience yet — totally fine. But if you add a company, fill in all three of its fields.</p>
        </div>

        <div>
          <label class="block text-sm text-parchment/70 mb-1.5">
            Raw Work Experience, Achievements &amp; Plain Keywords<span class="req-star">★</span>
          </label>
          <textarea required name="rawExperience" rows="7" placeholder="e.g. managed a team of 5, helped launch app, good at excel, handled customer complaints, ran social media page, in charge of budget for events..."
            class="w-full bg-wine border border-hairline rounded-lg px-4 py-3 text-parchment glow-border outline-none"></textarea>
          <p class="text-xs text-parchment/50 mt-1.5">Dump it in plain English. We'll do the fancy talk for you.</p>
        </div>

        <div>
          <label class="block text-sm text-parchment/70 mb-1.5">
            Extracurricular Achievements &amp; Honors <span class="text-parchment/40">(optional)</span>
          </label>
          <textarea name="extracurricular" rows="3" placeholder="e.g. state-level chess champion, college fest coordinator, published a research paper, volunteer work..."
            class="w-full bg-wine border border-hairline rounded-lg px-4 py-3 text-parchment glow-border outline-none"></textarea>
        </div>

        <div class="text-center font-display text-parchment leading-relaxed pt-2">
          <p class="text-lg mb-1">This is a <em>free demo</em> — generate your résumé instantly, no payment involved.</p>
        </div>

        <div class="mt-4 rounded-2xl border border-hairline bg-wine/60 p-6">
          <div class="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div>
              <p class="text-xs uppercase tracking-widest text-gold">Free Demo</p>
              <p class="text-2xl font-display font-semibold text-parchment mt-1">
                No cost, no checkout
              </p>
            </div>
            <div class="text-right text-xs text-parchment/70 space-y-1">
              <p>✓ Executive-level action verbs</p>
              <p>✓ Beats ATS keyword filters</p>
              <p>✓ 1-click crisp PDF download</p>
              <p>✓ Impressive enough to get you a job</p>
            </div>
          </div>
          <button type="submit" id="submitBtn"
            class="w-full bg-gold text-wine font-medium rounded-lg py-3.5 hover:bg-parchment transition flex items-center justify-center gap-2">
            <span id="btnLabel">Generate My Résumé</span>
          </button>
          <p class="text-center text-xs text-parchment/50 mt-3">Demo build — free, unlimited, for showcase purposes.</p>
        </div>

        <p id="errorMsg" class="text-red-300 text-sm hidden"></p>
      </form>
    </div>

    <p class="text-center text-xs text-parchment/40 mt-8">
      Your data is used only to generate your résumé. Nothing is stored.
    </p>

    <div class="text-center border-t border-hairline pt-6 mt-8">
      <p class="text-xs text-parchment/60 leading-relaxed max-w-md mx-auto mb-3">
        Got questions? Facing any problems? Wanna shower us with genuine gratitude? Want someone to yell at?
      </p>
      <div class="flex justify-center items-center gap-2.5 flex-wrap mb-2.5">
        <a href="mailto:samdave2131@gmail.com" class="text-parchment text-sm font-medium border-b border-gold pb-0.5 hover:text-gold transition">samdave2131@gmail.com</a>
        <span class="text-gold text-xs">•</span>
        <a href="mailto:machseven.studio@gmail.com" class="text-parchment text-sm font-medium border-b border-gold pb-0.5 hover:text-gold transition">machseven.studio@gmail.com</a>
      </div>
      <p class="text-xs italic text-gold/80">
        We actually respond, unlike the last three recruiters who ghosted you.
      </p>
    </div>

    <div class="text-center mt-6">
      <p class="font-display text-sm text-parchment/60 mb-1">
        Feel free to share our website with your fellow unemployed friends!
      </p>
      <p class="font-display text-sm text-parchment/60">
        Have a nice day ahead :)
      </p>
    </div>
  </div>

<script>
  const form = document.getElementById('resumeForm');
  const btn = document.getElementById('submitBtn');
  const btnLabel = document.getElementById('btnLabel');
  const errorMsg = document.getElementById('errorMsg');
  const companiesContainer = document.getElementById('companiesContainer');
  const addCompanyBtn = document.getElementById('addCompanyBtn');

  let companyCount = 0;

  function addCompanyCard() {
    companyCount += 1;
    const idx = companyCount;
    const card = document.createElement('div');
    card.className = 'company-card bg-wine/50 border border-hairline rounded-xl p-4';
    card.dataset.companyId = idx;
    card.innerHTML =
      '<button type="button" class="remove-company-btn" title="Remove this company">×</button>' +
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">' +
        '<div>' +
          '<label class="block text-xs text-parchment/60 mb-1">Company Name</label>' +
          '<input type="text" data-field="companyName" placeholder="Northlane Studio" ' +
            'class="w-full bg-wine border border-hairline rounded-lg px-3 py-2 text-sm text-parchment glow-border outline-none" />' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs text-parchment/60 mb-1">Job Title</label>' +
          '<input type="text" data-field="jobTitle" placeholder="Product Manager" ' +
            'class="w-full bg-wine border border-hairline rounded-lg px-3 py-2 text-sm text-parchment glow-border outline-none" />' +
        '</div>' +
        '<div>' +
          '<label class="block text-xs text-parchment/60 mb-1">Date Window</label>' +
          '<input type="text" data-field="dateWindow" placeholder="2022 - 2025 or 03/2022 - Present" ' +
            'class="w-full bg-wine border border-hairline rounded-lg px-3 py-2 text-sm text-parchment glow-border outline-none" />' +
        '</div>' +
      '</div>';

    card.querySelector('.remove-company-btn').addEventListener('click', () => {
      card.remove();
    });

    companiesContainer.appendChild(card);
  }

  addCompanyBtn.addEventListener('click', addCompanyCard);

  function clearFieldErrors() {
    form.querySelectorAll('.field-error').forEach((el) => el.classList.remove('field-error'));
  }

  function markFieldError(el) {
    el.classList.add('field-error');
  }

  function validateForm() {
    clearFieldErrors();
    let valid = true;

    form.querySelectorAll('[required]').forEach((el) => {
      if (!el.value || !el.value.trim()) {
        valid = false;
        markFieldError(el);
      }
    });

    const companies = [];
    companiesContainer.querySelectorAll('.company-card').forEach((card) => {
      const companyName = card.querySelector('[data-field="companyName"]');
      const jobTitle = card.querySelector('[data-field="jobTitle"]');
      const dateWindow = card.querySelector('[data-field="dateWindow"]');

      const vals = {
        companyName: companyName.value.trim(),
        jobTitle: jobTitle.value.trim(),
        dateWindow: dateWindow.value.trim(),
      };

      const anyFilled = vals.companyName || vals.jobTitle || vals.dateWindow;
      const allFilled = vals.companyName && vals.jobTitle && vals.dateWindow;

      if (anyFilled && !allFilled) {
        valid = false;
        if (!vals.companyName) markFieldError(companyName);
        if (!vals.jobTitle) markFieldError(jobTitle);
        if (!vals.dateWindow) markFieldError(dateWindow);
      }

      if (allFilled) {
        companies.push(vals);
      }
    });

    return { valid, companies };
  }

  function resetButton() {
    btn.disabled = false;
    btnLabel.textContent = 'Generate My Résumé';
  }

  async function downloadResume(fields) {
    const res = await fetch('/api/generate-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Something went wrong.' }));
      throw new Error(err.error || 'Something went wrong.');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    const a = document.createElement('a');
    a.href = url;
    a.download = (fields.fullName || 'resume').replace(/\\s+/g, '_') + '_Resume.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();

    btnLabel.textContent = 'Downloaded ✓ — Generate Another';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');

    const { valid, companies } = validateForm();
    if (!valid) {
      errorMsg.textContent = 'Please fill in all required (★) fields — and make sure any company you add has all three of its fields filled in.';
      errorMsg.classList.remove('hidden');
      return;
    }

    const formData = new FormData(form);
    const fields = {
      fullName: formData.get('fullName'),
      targetRole: formData.get('targetRole'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      linkedin: formData.get('linkedin'),
      degree: formData.get('degree'),
      companies: companies,
      rawExperience: formData.get('rawExperience'),
      extracurricular: formData.get('extracurricular'),
    };

    btn.disabled = true;
    btnLabel.innerHTML = '<span class="spinner"></span> Generating your résumé...';

    try {
      await downloadResume(fields);
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    } finally {
      resetButton();
    }
  });
</script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.type('html').send(HTML_PAGE);
});

const SYSTEM_PROMPT = `You are an elite executive résumé writer, trained in Oxford-level formal English, and an ATS (Applicant Tracking System) optimization specialist.

You will be given a candidate's raw, plain-English notes about their work experience, along with their target role. Transform this into a polished, ATS-friendly résumé written in sophisticated, formal register — the kind of prose a top-tier executive search consultancy would produce.

STRICT RULES:
1. VOCABULARY: Use precise, elevated, distinct action verbs and descriptors throughout — the register of formal British/Oxford English, not casual American business jargon. For example:
   - "managed" -> "orchestrated", "superintended", "administered" (vary constantly; never reuse)
   - "helped" -> "facilitated", "championed", "enabled"
   - "good at" / "skilled at" -> "possesses marked proficiency in", "demonstrates considerable acumen in"
   - "worked on" -> "engineered", "architected", "undertook"
   - "in charge of" -> "presided over", "was entrusted with", "administered"
2. ZERO REPETITION: No word of substance (verb, adjective, or noun descriptor) may be reused anywhere else in the document. Every bullet point must begin with a different verb and employ different sentence architecture from every other bullet. Treat repetition as a failure.
3. MAXIMISE THE GIVEN MATERIAL: The candidate's raw notes may be sparse. Extract every plausible implication from what is provided and render it in its most impressive, precise, and fully realised form — without inventing facts that were not stated or reasonably implied.
4. NO INVENTED METRICS, NO PLACEHOLDER BRACKETS: Never insert bracketed placeholders such as "[X]%", "[X]+ team members", "[X]K users", or "$[X]K", and never invent a number as though it were factual. If the raw input does not supply a real figure, describe the achievement qualitatively instead (e.g. "materially improved", "substantially reduced") rather than gesturing at a missing statistic.
5. ATS FORMATTING: Use standard, machine-parseable section names: SUMMARY, EXPERIENCE, SKILLS, EDUCATION, ACHIEVEMENTS. Keep bullet points concise (generally under 24 words), front-loaded with the governing verb, despite the elevated vocabulary.
6. TONE: Formal, commanding, wholly free of cliché ("team player", "hard worker", "go-getter" are forbidden even when reframed) and free of first-person pronouns. Every sentence should read as though drafted for a board-level dossier.
7. NEVER USE PLACEHOLDER TEXT: Do not fabricate job titles, companies, or dates that were not provided. If a field such as company name or dates is genuinely missing from the input, return it as an EMPTY STRING ("") rather than a bracketed placeholder like "[Company Name]" or "[Dates]" — an empty string will simply be left off the finished résumé, which is the desired behaviour. The candidate's raw input below may include a list of actual companies with job titles and date windows, supplied directly by the user — use those verbatim (do not alter names/dates/titles) as the basis for the "experience" array, using rawExperience to help write the bullets under each.
8. EXTRACURRICULAR / ACHIEVEMENTS: If extracurricular activities or honors are supplied, produce a short "achievements" array of polished bullet points in the same elevated register. If none are supplied, return an empty array.

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown fences, no commentary, no leading/trailing text) matching exactly this shape:

{
  "name": "string",
  "targetRole": "string",
  "contact": { "email": "string", "phone": "string", "location": "string", "linkedin": "string" },
  "summary": "2-3 sentence executive summary in formal register, string",
  "experience": [
    {
      "title": "string (role title, from the supplied company list if present, else inferred from raw input or target role)",
      "org": "string (company/organization if provided, else an empty string \\"\\")",
      "dates": "string (employment date window if provided, else an empty string \\"\\")",
      "bullets": ["string", "string", "..."]
    }
  ],
  "skills": ["string", "string", "..."],
  "education": [
    { "degree": "string", "institution": "string", "dates": "string" }
  ],
  "achievements": ["string", "string", "..."]
}

If the raw input gives no clear structure to split into multiple jobs/roles, and no company list was supplied, produce a single experience entry that best represents the candidate's described work. If no companies were supplied at all, "experience" may contain a single entry with empty "org"/"dates" built purely from rawExperience. If education is not mentioned at all, return an empty array for "education". Every array must contain at least one meaningful, non-empty entry where data exists.`;

function buildUserPrompt(data) {
  const companiesBlock = Array.isArray(data.companies) && data.companies.length > 0
    ? data.companies
        .map((c, i) => `  ${i + 1}. Company: ${c.companyName} | Title: ${c.jobTitle} | Dates: ${c.dateWindow}`)
        .join('\n')
    : '  (none supplied)';

  return `Candidate raw input:

Full Name: ${data.fullName}
Target Role: ${data.targetRole}
Email: ${data.email}
Phone: ${data.phone || 'N/A'}
Location: ${data.location || 'N/A'}
LinkedIn: ${data.linkedin || 'N/A'}
Highest Qualification / Degree: ${data.degree || 'Not provided'}

Companies (structured, use verbatim for org/title/dates):
${companiesBlock}

Raw Work Experience, Achievements & Plain Keywords:
"""
${data.rawExperience}
"""

Extracurricular Achievements & Honors (raw, optional):
"""
${data.extracurricular || 'Not provided'}
"""

Transform this into the strict JSON résumé format described in your instructions. Return ONLY the JSON object.`;
}

function safeJSONParse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const jsonSlice = firstBrace !== -1 && lastBrace !== -1
    ? cleaned.slice(firstBrace, lastBrace + 1)
    : cleaned;

  return JSON.parse(jsonSlice);
}

async function generateResumeContent(formData) {
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: buildUserPrompt(formData) }] },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 6000,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('AI returned no usable content.');
  }

  return safeJSONParse(text);
}

/* ============================================================================
 * PDF RENDERING — PDFKit, two-panel layout (sidebar + main), drawn directly.
 * No headless browser, no external binary downloads, nothing to break on
 * Render's build servers.
 * ============================================================================
 */

const MM = 2.8346456693; // points per millimetre (A4 = 210mm x 297mm = 595.28 x 841.89 pt)

function mm(v) {
  return v * MM;
}

function drawSectionTitle(doc, text, x, y, width, opts) {
  const titleColor = opts.titleColor || '#A5824F';
  const lineColor = opts.lineColor || '#C9A876';
  const fontSize = opts.fontSize || 11;

  doc.font('Times-Bold').fontSize(fontSize).fillColor(titleColor);
  const upper = text.toUpperCase();
  const textOpts = { width, characterSpacing: 1.2 };
  doc.text(upper, x, y, textOpts);
  const h = doc.heightOfString(upper, textOpts);
  const lineY = y + h + mm(1);
  doc.moveTo(x, lineY).lineTo(x + width, lineY).lineWidth(1).strokeColor(lineColor).stroke();
  return lineY + mm(3.5);
}

function drawBullets(doc, items, x, y, width, opts) {
  const size = opts.size || 9.6;
  const color = opts.color || '#3A3226';
  const bulletGap = mm(3.5);
  const indent = mm(3.5);
  let cursorY = y;

  doc.font('Times-Roman').fontSize(size).fillColor(color);

  items.forEach((item) => {
    if (!item) return;
    const textOpts = { width: width - indent, lineGap: 1.2 };
    doc.text('•', x, cursorY, { width: indent });
    doc.text(item, x + indent, cursorY, textOpts);
    const h = doc.heightOfString(item, textOpts);
    cursorY += h + mm(1.2);
  });

  return cursorY + (bulletGap - mm(1.2));
}

function drawSkillChips(doc, skills, x, y, maxWidth) {
  const size = 8.3;
  const paddingX = mm(2.1);
  const chipHeight = mm(5.5);
  const gap = mm(1.5);

  doc.font('Times-Roman').fontSize(size);

  let cursorX = x;
  let cursorY = y;

  skills.forEach((skill) => {
    if (!skill) return;
    const textWidth = doc.widthOfString(skill);
    const chipWidth = textWidth + paddingX * 2;

    if (cursorX !== x && cursorX + chipWidth > x + maxWidth) {
      cursorX = x;
      cursorY += chipHeight + gap;
    }

    doc.roundedRect(cursorX, cursorY, chipWidth, chipHeight, chipHeight / 2).fill('#E8D9BC');
    doc.fillColor('#3A3226').text(skill, cursorX + paddingX, cursorY + chipHeight / 2 - size / 2 - 1, {
      lineBreak: false,
      width: textWidth + 2,
    });

    cursorX += chipWidth + gap;
  });

  return cursorY + chipHeight;
}

function drawResumePdf(doc, resume) {
  const PAGE_W = doc.page.width;
  const PAGE_H = doc.page.height;
  const SIDEBAR_W = PAGE_W * 0.34;
  const MAIN_X = SIDEBAR_W;
  const MAIN_W = PAGE_W - SIDEBAR_W;

  // Backgrounds — main page, sidebar block, hairline divider
  doc.rect(0, 0, PAGE_W, PAGE_H).fill('#FDFBF7');
  doc.rect(0, 0, SIDEBAR_W, PAGE_H).fill('#F1E7D6');
  doc.moveTo(SIDEBAR_W, 0).lineTo(SIDEBAR_W, PAGE_H).lineWidth(1).strokeColor('#D9C6A3').stroke();

  const sbX = mm(10);
  const sbW = SIDEBAR_W - mm(10) - mm(8);
  const mnX = MAIN_X + mm(10);
  const mnW = MAIN_W - mm(10) - mm(12);

  let sbY = mm(16);
  let mnY = mm(16);

  // ---- SIDEBAR ----
  doc.font('Times-Bold').fontSize(20).fillColor('#2A2018');
  const name = resume.name || '';
  doc.text(name, sbX, sbY, { width: sbW });
  sbY += doc.heightOfString(name, { width: sbW }) + mm(1);

  doc.font('Times-Italic').fontSize(11.5).fillColor('#A5824F');
  const targetRole = resume.targetRole || '';
  doc.text(targetRole, sbX, sbY, { width: sbW });
  sbY += doc.heightOfString(targetRole, { width: sbW }) + mm(8);

  const contactLines = [
    resume.contact?.email,
    resume.contact?.phone,
    resume.contact?.location,
    resume.contact?.linkedin,
  ].filter(Boolean);

  if (contactLines.length) {
    sbY = drawSectionTitle(doc, 'Contact', sbX, sbY, sbW, {});
    doc.font('Times-Roman').fontSize(8.8).fillColor('#4A4030');
    contactLines.forEach((line) => {
      doc.text(line, sbX, sbY, { width: sbW });
      sbY += doc.heightOfString(line, { width: sbW }) + mm(0.6);
    });
    sbY += mm(6);
  }

  if (resume.education && resume.education.length) {
    sbY = drawSectionTitle(doc, 'Education', sbX, sbY, sbW, {});
    resume.education.forEach((edu) => {
      doc.font('Times-Bold').fontSize(9.5).fillColor('#2A2018');
      doc.text(edu.degree || '', sbX, sbY, { width: sbW });
      sbY += doc.heightOfString(edu.degree || '', { width: sbW }) + mm(0.5);

      const meta = [edu.institution, edu.dates].filter(Boolean).join('  •  ');
      if (meta) {
        doc.font('Times-Roman').fontSize(8.3).fillColor('#6B5F4F');
        doc.text(meta, sbX, sbY, { width: sbW });
        sbY += doc.heightOfString(meta, { width: sbW }) + mm(0.5);
      }
      sbY += mm(1.2);
    });
    sbY += mm(4);
  }

  if (resume.skills && resume.skills.length) {
    sbY = drawSectionTitle(doc, 'Skills', sbX, sbY, sbW, {});
    sbY = drawSkillChips(doc, resume.skills, sbX, sbY, sbW) + mm(4);
  }

  // ---- MAIN ----
  if (resume.summary) {
    mnY = drawSectionTitle(doc, 'Summary', mnX, mnY, mnW, { fontSize: 11.5 });
    doc.font('Times-Roman').fontSize(10).fillColor('#3A3226');
    doc.text(resume.summary, mnX, mnY, { width: mnW, lineGap: 2 });
    mnY += doc.heightOfString(resume.summary, { width: mnW, lineGap: 2 }) + mm(7);
  }

  if (resume.experience && resume.experience.length) {
    mnY = drawSectionTitle(doc, 'Experience', mnX, mnY, mnW, { fontSize: 11.5 });
    resume.experience.forEach((job) => {
      doc.font('Times-Bold').fontSize(10.8).fillColor('#2A2018');
      const title = job.title || 'Role';
      doc.text(title, mnX, mnY, { width: mnW });
      mnY += doc.heightOfString(title, { width: mnW }) + mm(0.6);

      const orgLine = [job.org, job.dates].filter(Boolean).join('   |   ');
      if (orgLine) {
        doc.font('Times-Roman').fontSize(9).fillColor('#6B5F4F');
        doc.text(orgLine, mnX, mnY, { width: mnW });
        mnY += doc.heightOfString(orgLine, { width: mnW }) + mm(1.2);
      }

      if (job.bullets && job.bullets.length) {
        mnY = drawBullets(doc, job.bullets, mnX, mnY, mnW, {});
      }
      mnY += mm(3.5);
    });
  }

  if (resume.achievements && resume.achievements.length) {
    mnY = drawSectionTitle(doc, 'Achievements', mnX, mnY, mnW, { fontSize: 11.5 });
    drawBullets(doc, resume.achievements, mnX, mnY, mnW, {});
  }
}

function generatePdfBuffer(resume) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true, bufferPages: true });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      drawResumePdf(doc, resume);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

app.post('/api/generate-resume', async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.fullName || !body.targetRole || !body.email || !body.rawExperience || !body.degree) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (Array.isArray(body.companies)) {
      for (const c of body.companies) {
        if (!c || !c.companyName || !c.jobTitle || !c.dateWindow) {
          return res.status(400).json({ error: 'Each company entry must include a company name, job title, and date window.' });
        }
      }
    }

    if (!process.env.AI_API_KEY) {
      return res.status(500).json({ error: 'Server misconfiguration: AI_API_KEY is not set.' });
    }

    const resumeContent = await generateResumeContent(body);

    resumeContent.name = resumeContent.name || body.fullName;
    resumeContent.targetRole = resumeContent.targetRole || body.targetRole;
    resumeContent.contact = resumeContent.contact || {};
    resumeContent.contact.email = resumeContent.contact.email || body.email;
    resumeContent.contact.phone = resumeContent.contact.phone || body.phone;
    resumeContent.contact.location = resumeContent.contact.location || body.location;
    resumeContent.contact.linkedin = resumeContent.contact.linkedin || body.linkedin;

    const pdfBuffer = await generatePdfBuffer(resumeContent);

    const safeFileName = (body.fullName || 'resume').replace(/[^a-z0-9]+/gi, '_');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeFileName}_Resume.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating resume:', err);
    return res.status(500).json({ error: `Failed to generate resume: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`AI Résumé Maker running at http://localhost:${PORT}`);
});
