/**
 * Guard Rails — input validation before sending to the LLM.
 *
 * Detects prompt injection attempts and suspicious inputs.
 * Runs server-side so it can't be bypassed by the client.
 */

// Patterns that indicate prompt injection attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /forget\s+(all\s+)?(previous|prior|your)\s+(instructions|rules)/i,
  /you\s+are\s+now\s+(a|an|my)/i,
  /new\s+instructions?\s*:/i,
  /system\s*prompt\s*:/i,
  /\bact\s+as\s+(a|an|if)\b/i,
  /pretend\s+(you|to\s+be)/i,
  /reveal\s+(your|the)\s+(system|instructions|prompt|rules)/i,
  /what\s+(are|is)\s+your\s+(system|instructions|prompt|rules)/i,
  /output\s+(your|the)\s+(system|initial)\s+prompt/i,
  /repeat\s+(the|your)\s+(system|above|initial)\s+(prompt|instructions|message)/i,
];

export interface GuardRailResult {
  allowed: boolean;
  reason?: string;
}

function normalizeInput(input: string): string {
  // Strip zero-width characters that can be used to bypass regex patterns
  return input
    .replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g, "")
    .normalize("NFKC");
}

export function checkInput(message: string): GuardRailResult {
  // Length check
  if (message.length > 500) {
    return { allowed: false, reason: "Message too long. Maximum 500 characters." };
  }

  // Empty check
  if (!message.trim()) {
    return { allowed: false, reason: "Message cannot be empty." };
  }

  // Normalize to catch Unicode bypass attempts
  const normalized = normalizeInput(message);

  // Prompt injection detection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        allowed: false,
        reason:
          "I can only answer questions about Fran's professional background, skills, and experience. How can I help you learn about him?",
      };
    }
  }

  return { allowed: true };
}
