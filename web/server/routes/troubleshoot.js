import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import auth from "../middleware/auth.js";
import { callClaude } from "../utils/claudeClient.js";
import { TROUBLESHOOT_SYSTEM_PROMPT } from "../prompts/troubleshoot.js";

const router = Router();

const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: "pipepal" } }
);

router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      equipment_type,
      equipment_brand,
      system_type,
      symptom,
      environment,
      already_tried = [],
      follow_up,
      session_id,
    } = req.body;

    // SUBSCRIPTION GATE — only counts NEW sessions; follow-ups are free
    if (!session_id && req.profile.subscription_tier === "free") {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count } = await supabaseService
        .from("troubleshoot_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfMonth);
      if (count >= 2) {
        return res.status(403).json({
          error: "Monthly limit reached",
          message: "Free tier allows 2 troubleshoot sessions per month. Upgrade to Pro for unlimited.",
        });
      }
    }

    // Load existing session for follow-up
    let existingSession = null;
    let existingHistory = [];
    if (session_id) {
      const { data, error: fetchError } = await supabaseService
        .from("troubleshoot_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", userId)
        .single();
      if (fetchError || !data) {
        return res.status(404).json({ error: "Session not found" });
      }
      existingSession = data;
      existingHistory = data.conversation_json || [];
    }

    if (!session_id && (!symptom || typeof symptom !== "string" || !symptom.trim())) {
      return res.status(400).json({ error: "A symptom description is required" });
    }

    const userMessage = session_id && follow_up
      ? `${follow_up}\n\nRespond with a JSON object exactly matching the schema in your instructions. No prose before or after, no markdown code fences.`
      : buildTroubleshootMessage(req.body);

    const messages = existingHistory.length > 0
      ? [...existingHistory, { role: "user", content: userMessage }]
      : [{ role: "user", content: userMessage }];

    // CLAUDE API CALL: PipePal troubleshoot diagnosis
    // Model routing: simple symptoms → Haiku, complex → Sonnet
    // Complexity signals passed via context — see utils/modelRouter.js
    const troubleshootContext = {
      // Prior conversation turns — multi-turn escalates to Sonnet
      conversationHistory: existingHistory,

      // Primary symptom for safety keyword detection
      symptom: req.body.symptom || req.body.symptomDescription || '',

      // Gas system = highest safety stakes = always Sonnet
      isGasSystem: (req.body.system_type || '').toLowerCase().includes('gas') ||
        (req.body.problem_category || '').toLowerCase().includes('gas'),

      // Code jurisdiction selected = citation accuracy needed = Sonnet
      requiresCodeCompliance: !!(req.body.code_jurisdiction &&
        req.body.code_jurisdiction !== 'Unknown'),

      // Pressure reading provided = quantitative diagnosis = Sonnet
      hasPressureReading: !!(
        req.body.measured_pressure && String(req.body.measured_pressure).trim()
      ),

      // Specialty pipe materials requiring material-specific knowledge
      isSpecialtyMaterial: ['csst', 'cast iron', 'galvanized', 'steam',
        'medical gas', 'hydronic'].some(
        m => (req.body.pipe_material || req.body.system_type || '')
          .toLowerCase().includes(m)
      ),

      // Commercial or industrial = larger systems, code compliance = Sonnet
      isCommercialOrIndustrial: ['commercial', 'industrial', 'institutional'].some(
        t => (req.body.installation_type || '').toLowerCase().includes(t)
      ),

      // 2+ already-tried steps = beyond basic remediation = Sonnet
      alreadyTriedMultiple: (req.body.already_tried?.length || 0) >= 2,
    };

    const aiResult = await callClaude({
      feature: 'troubleshoot',
      context: troubleshootContext,
      systemPrompt: TROUBLESHOOT_SYSTEM_PROMPT,
      messages,
    });
    var rawText = aiResult.content;
    let result;
    try {
      const stripped = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      try {
        result = JSON.parse(stripped);
      } catch {
        const start = stripped.indexOf("{");
        if (start === -1) throw new Error("No JSON found");
        let depth = 0;
        let end = -1;
        for (let i = start; i < stripped.length; i++) {
          if (stripped[i] === "{") depth++;
          else if (stripped[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end === -1) throw new Error("Unbalanced JSON");
        result = JSON.parse(stripped.slice(start, end + 1));
      }
    } catch (parseErr) {
      console.error("Parse error:", parseErr.message, rawText);
      return res.status(500).json({ error: "Failed to parse troubleshoot result", raw: rawText });
    }

    const updatedHistory = [...messages, { role: "assistant", content: rawText }];

    const sessionPayload = {
      user_id: userId,
      equipment_type: equipment_type || existingSession?.equipment_type,
      equipment_brand: equipment_brand || existingSession?.equipment_brand,
      system_type: system_type || existingSession?.system_type,
      symptom: symptom || existingSession?.symptom,
      environment: environment || existingSession?.environment,
      conversation_json: updatedHistory,
      resolved: existingSession?.resolved ?? false,
    };

    let savedSession;
    if (session_id && existingSession) {
      const { data, error: updateError } = await supabaseService
        .from("troubleshoot_sessions")
        .update(sessionPayload)
        .eq("id", session_id)
        .select()
        .single();
      if (updateError) {
        console.error("Session update error:", updateError);
        return res.json({ result, session_id, saved: false, model: aiResult.model });
      }
      savedSession = data;
    } else {
      const { data, error: insertError } = await supabaseService
        .from("troubleshoot_sessions")
        .insert(sessionPayload)
        .select()
        .single();
      if (insertError) {
        console.error("Session insert error:", insertError);
        return res.json({ result, saved: false, model: aiResult.model });
      }
      savedSession = data;
    }

    return res.json({ result, session_id: savedSession.id, model: aiResult.model });
  } catch (err) {
    console.error("Troubleshoot error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Builds the user message from form fields.
// Supports current PipePal fields (equipment_type, equipment_brand,
// system_type, symptom, environment, already_tried) plus additional
// spec fields (problem_category, installation_type, pipe_material,
// code_jurisdiction, measured_pressure, water_temperature) if the
// frontend is extended later to send them.
function buildTroubleshootMessage(body) {
  const lines = [];

  if (body.problem_category) {
    const categoryLabels = {
      supply_leak: 'Water supply leak',
      drain_issue: 'Drain / DWV issue',
      gas_piping: 'Gas piping issue',
      water_heater: 'Water heater problem',
      low_pressure: 'Low water pressure',
      no_hot_water: 'No hot water',
      fixture: 'Fixture problem',
      hydronic: 'Hydronic / boiler system',
      pressure_test: 'Pressure test failure',
      other: 'Other',
    };
    lines.push(`Problem type: ${categoryLabels[body.problem_category] || body.problem_category}`);
  }
  if (body.equipment_type) lines.push(`Equipment type: ${body.equipment_type}`);
  if (body.installation_type) lines.push(`Installation type: ${body.installation_type}`);
  if (body.system_type && body.system_type !== 'Unknown') {
    lines.push(`System type: ${body.system_type}`);
  }
  if (body.pipe_material && body.pipe_material !== 'Unknown') {
    lines.push(`Pipe material: ${body.pipe_material}`);
  }
  if (body.code_jurisdiction && body.code_jurisdiction !== 'Unknown') {
    lines.push(`Code jurisdiction: ${body.code_jurisdiction}`);
  }
  if (body.equipment_brand && String(body.equipment_brand).trim()) {
    lines.push(`Equipment brand: ${String(body.equipment_brand).trim()}`);
  }
  if (body.environment) lines.push(`Environment: ${body.environment}`);
  if (body.measured_pressure && String(body.measured_pressure).trim()) {
    lines.push(`Measured pressure: ${String(body.measured_pressure).trim()} PSI`);
  }
  if (body.water_temperature && String(body.water_temperature).trim()) {
    lines.push(`Water temperature: ${String(body.water_temperature).trim()}`);
  }
  if (body.already_tried && body.already_tried.length > 0) {
    lines.push(`Already tried: ${body.already_tried.join(', ')}`);
  }
  if (body.symptom && String(body.symptom).trim()) {
    lines.push(`Plumber description: ${String(body.symptom).trim()}`);
  }

  const contextBlock = lines.length > 0
    ? lines.join('\n')
    : 'No additional context provided.';

  return `${contextBlock}\n\nDiagnose this plumbing problem and return your complete assessment as a JSON object exactly matching the schema in your instructions. Determine if service should be left off first.`;
}

export default router;
