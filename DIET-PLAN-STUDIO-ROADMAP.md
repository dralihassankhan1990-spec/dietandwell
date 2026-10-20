# Diet Plan Studio: implementation and launch plan

Implemented within DietAndWell only. Shop and Diet Plan Studio are primary navigation items. About Us and Subscriptions stay in More. At widths below 1120px, the mobile menu avoids overcrowding the expanded navigation.

## Available now

Public coming-soon page at /diet-plan-studio, proposed pricing, seven separate country previews (Pakistan, India, Bangladesh, Saudi Arabia, UAE, Canada, USA), daily/weekly examples, three document styles and four illustrative category labels. No personalised nutrition decisions are made. No new health information is collected. No Studio purchases are enabled. Sample meals are illustrative, not a verified catalogue. Existing authentication, products, subscriptions and database tables are unchanged.

Admin-only AI preview is implemented at POST /api/diet-plan-studio/explain-preview with body {"region":"pk"}. It uses a real Gemini generateContent request with a fixed sample pantry and restricted educational instructions. JWT and admin authorization are required. No user prompt, medical history or customer identity is sent. Provider key absent means a clear 503; failures do not fabricate AI output. The button appears only for signed-in admins. This is an integration preview, not a production meal generator. Enable privately with GEMINI_API_KEY and optionally STUDIO_AI_MODEL=gemini-2.5-flash-lite in backend/.env, then restart. No key is embedded in frontend code. A live provider response cannot be verified without configured credentials. Before public launch add distributed rate limits, per-user and account spend budgets, retries, output validation and monitored model evaluation.

## Membership recommendation

Verification update: a provider credential was already configured locally. A synthetic live provider call succeeded. After restarting only DietAndWell with network access, the full admin-authenticated explain-preview endpoint returned educational-preview, personalised=false and real provider text. Anonymous access returned 401 and invalid region returned 400. Frontend and backend builds passed; 21 existing regression tests and three new mocked provider-adapter tests passed. Existing blog/products/services/contact APIs returned 200. Browser checks confirmed the new navigation and UAE weekly/table preview with seven days and no console errors. No new database schema or catalogue import was performed.

Keep Free / PKR 1500 / PKR 3000 as proposed introductory prices, not confirmed launch contracts. Starter: two lifetime plans. Guided: 30 per billing month. Complete: unlimited personal planning subject to a published fair-use policy. One generated daily plan or one generated seven-day plan counts as one plan; edits to an existing plan should not consume another credit. Quotas must be enforced atomically on the server, never just hidden in the UI.

Human consultation is the main cost risk. Recommended launch policy to approve before accepting money: Guided includes one asynchronous review per month; Complete includes two reviews per month, with additional appointments priced separately. The public page currently leaves consultation scheduling and fair-use terms pending rather than committing to unlimited appointments. Separate individual memberships from future practitioner/multi-client licensing.

## Nutrition source strategy

USDA FoodData Central provides public-domain/CC0 records, downloadable data and an API with a default limit of 1000 requests/hour/IP. Use it for appropriate ingredient composition records, not as proof of Pakistani recipe composition or local market availability. Store original source IDs, versions and retrieval dates. Link: https://fdc.nal.usda.gov/api-guide/ and https://fdc.nal.usda.gov/download-datasets/.

FAO/INFOODS lists regional tables including Pakistan, India and Bangladesh: https://www.fao.org/infoods/infoods/tables-and-databases/asia/en/. Check each underlying publisher's redistribution and commercial-use terms before import. Do not treat the directory as a licence for all tables. Regional recipes need reviewed ingredient weights, cooking yields and retention factors. A dish name alone is insufficient for reliable calories. Saudi/UAE and Canada/USA require separately curated recipe and market mappings.

Availability is a separate dataset from nutrient composition. Maintain country, city/market, season, budget band, household names and substitutions. Permit only reviewed regional foods in generation. Revalidate every swap. If availability is uncertain, show the uncertainty and ask the user; do not invent certainty that an item is in stock everywhere.

## Proposed database (design, not migrated or populated)

- food_sources: publisher, source URL, licence, version, retrieval date and checksum.
- foods: canonical ID, source ID, English/local names, raw/cooked state, edible portion and review status.
- food_nutrients: food ID, nutrient ID, amount per 100g, units, confidence and analytical/source method. Unknown is null, never zero.
- food_portions: household measure, gram weight and evidence source.
- food_region_availability: food, country, city/market, season, availability status, reviewer and reviewed date.
- recipes and recipe_ingredients: gram weights, oil/salt, water, preparation, yield and retention factors, servings and review version.
- food_allergens and substitutions: explicit allergens, cross-contact notes, regional alternatives, review status. Text matching is not sufficient allergy protection.
- studio_profiles: explicit consent, structured preferences and clinician-set targets, access controls, retention and deletion policy.
- plan_templates: versioned layout settings and sample fixture references, separate from nutrition content.
- diet_plans, plan_days, plan_meals, plan_items: food/recipe IDs, weighed portions and immutable nutrient/source snapshots.
- studio_entitlements and usage_ledger: plan limits, billing windows, idempotent credit reservations and audit events.
- consultations, exports and review_audit: assignments/statuses, signed expiring download links, object ownership and change history.

Do not mark any dataset verified until licensing, unit checks, food matching and dietitian review are complete. Use held-out region/allergen tests before launch. Never silently replace foods with unavailable imports. Published plans must retain source and calculation versions even when the catalogue changes.

## Generation architecture

Existing account → consent/profile → eligibility/clinical triage → clinician-approved energy target → filter by region/allergens/preferences → deterministic portion/nutrient solver → optional AI explanation and variety suggestions → validate all IDs, quantities, nutrient ranges, exclusions and availability → user/dietitian review → save immutable plan → render Word/PDF from the same saved data.

The model must select only allowed catalogue IDs. It must not invent calorie values. Calculate ingredient kcal = source kcal per 100g × edible grams / 100, then sum meal/day totals with unrounded values and round only display totals. Explain raw versus cooked weights and practical uncertainty. Offer balanced everyday, vegetarian/plant-forward, budget, athletic, maintenance and clinician-directed plans. Disease-specific, paediatric, pregnancy and complex-allergy paths require appropriate professional workflows rather than unsupervised generic generation.

Daily and weekly plans share the same calculation engine. Weekly plans also check repetition, ingredient reuse, storage, food preparation and a consolidated shopping list. Editable .docx and PDF should render the same immutable plan version; exports require authentication and plan ownership. Proposed backend libraries: docx and a controlled HTML-to-PDF renderer, with embedded fonts, tested RTL for Urdu/Arabic, page breaks and source notes. Export functionality is not active yet.

## AI recommendations and costs

Use real AI for approved-catalogue food substitutions, plain-language explanations, multilingual plan instructions, and turning a validated weekly plan into preparation steps. AI food-photo recognition could be a later logged-food estimate with user confirmation of ingredients/grams; do not advertise exact calories from a photograph. A clinician assistant could summarise client questions and draft responses for approval, never impersonate a professional or autonomously send advice.

Testing: Gemini has a free tier for selected models. Use synthetic/non-sensitive data only; the free tier can use submitted content to improve products. For production, choose a paid tier with appropriate terms and retention controls. As checked 20 October 2026, Gemini 2.5 Flash-Lite lists USD $0.10/million input tokens and $0.40/million output tokens. Example: 4000 input + 3000 output tokens ≈ $0.0016 per call, or $16 per 10,000 calls. This is an estimate for model tokens only, excludes retries, additional calls, grounding, taxes, storage, hosting, payments and human consultation, and is not a service quote. Pricing/model lifecycle must be rechecked before launch. Source: https://ai.google.dev/gemini-api/docs/pricing.

Production recommendation: PostgreSQL as the local versioned nutrition source of truth, background licensed data imports, deterministic calculations, optional replaceable AI provider, cached non-personal reference data and no health data in logs. No external free tier should be assumed permanent or sufficient for production availability. Monitor real usage and clinician time before confirming paid-tier margins.
