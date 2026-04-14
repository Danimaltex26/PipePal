import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: "pipepal" } }
);

const CERT_LEVELS = [
  { key: "APPRENTICE",  name: "Apprentice",  fullTitle: "Plumbing Apprentice",               questionCount: 50,  timeMinutes: 75,  passPercent: 70 },
  { key: "JOURNEYMAN",  name: "Journeyman",  fullTitle: "Journeyman Plumber",                questionCount: 80,  timeMinutes: 120, passPercent: 70 },
  { key: "MASTER",      name: "Master",      fullTitle: "Master Plumber",                    questionCount: 100, timeMinutes: 150, passPercent: 75 },
  { key: "MEDICAL_GAS", name: "Medical Gas", fullTitle: "Medical Gas Installer (ASSE 6010)", questionCount: 60,  timeMinutes: 90,  passPercent: 75 },
];

// GET /path — Returns the certification ladder with user progress
router.get("/path", async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all modules (for counts and estimated hours)
    const { data: modules, error: modErr } = await supabase
      .from("training_modules")
      .select("cert_level, estimated_minutes")
      .eq("is_published", true);

    if (modErr) throw modErr;

    // Fetch user readiness for all cert levels
    const { data: readinessRows, error: readErr } = await supabase
      .from("training_readiness")
      .select("cert_level, overall_readiness_percent")
      .eq("user_id", userId);

    if (readErr) throw readErr;

    // Build lookup maps
    const moduleCounts = {};
    const estimatedHours = {};
    for (const m of modules || []) {
      moduleCounts[m.cert_level] = (moduleCounts[m.cert_level] || 0) + 1;
      estimatedHours[m.cert_level] = (estimatedHours[m.cert_level] || 0) + m.estimated_minutes;
    }

    const readinessMap = {};
    for (const r of readinessRows || []) {
      readinessMap[r.cert_level] = Number(r.overall_readiness_percent) || 0;
    }

    // Determine locked status — linear ladder with MEDICAL_GAS standalone
    const apprenticeReady = readinessMap["APPRENTICE"] || 0;
    const journeymanReady = readinessMap["JOURNEYMAN"] || 0;

    function isUnlocked(key) {
      if (key === "APPRENTICE") return true;
      if (key === "JOURNEYMAN") return apprenticeReady >= 80;
      if (key === "MASTER") return journeymanReady >= 80;
      if (key === "MEDICAL_GAS") return journeymanReady >= 80; // requires Journeyman readiness
      return false;
    }

    const path = CERT_LEVELS.map((level) => ({
      key: level.key,
      name: level.name,
      fullTitle: level.fullTitle,
      questionCount: level.questionCount,
      timeMinutes: level.timeMinutes,
      passPercent: level.passPercent,
      moduleCount: moduleCounts[level.key] || 0,
      estimatedHours: Math.round(((estimatedHours[level.key] || 0) / 60) * 10) / 10,
      readiness: readinessMap[level.key] || 0,
      locked: !isUnlocked(level.key),
    }));

    res.json({ path });
  } catch (err) {
    console.error("GET /path error:", err);
    res.status(500).json({ error: "Failed to load certification path" });
  }
});

export default router;
