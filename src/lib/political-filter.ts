// ---------------------------------------------------------------------------
//  Political content filter for WhatUPB anonymous messages.
//
//  Blocks targeted political messaging — slogans, calls to action, partisan
//  rhetoric, and geopolitical conflict statements.  Casual mentions of news
//  or current events are NOT blocked.
//
//  Runs BEFORE the Perspective API to save quota.  Uses the same
//  blocked_messages logging as the pre-moderation content filter.
//
//  Privacy: NO raw message content is logged.  Only the reject reason
//  and hashed IP are written to the blocked_messages table.
// ---------------------------------------------------------------------------

export interface PoliticalFilterResult {
  blocked: boolean;
  reason?: string;
}

// ── Text normalisation ──────────────────────────────────────────────────────

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`]/g, "'")          // smart quotes → straight
    .replace(/[^\w\s'#]/g, " ")      // strip punctuation except apostrophes & #
    .replace(/(.)\1{2,}/g, "$1$1")   // collapse repeated chars: "freeee" → "free"
    .replace(/\s+/g, " ")            // collapse whitespace
    .trim();
}

// ── Pattern categories ──────────────────────────────────────────────────────
//
//  Each array contains regexes tested against the NORMALISED text.
//  Word boundaries (\b) prevent false positives on substrings.
//  Patterns are intentionally broad on slogans but narrow on single words
//  to avoid blocking casual conversation.

// Political slogans, chants, and rallying cries (all sides)
const SLOGAN_PATTERNS: RegExp[] = [
  // US — right-leaning
  /\bmake\s+america\s+great\b/,
  /\bmaga\b/,
  /\bbuild\s+the\s+wall\b/,
  /\block\s+(h(er|im)|them)\s+up\b/,
  /\bdrain\s+the\s+swamp\b/,
  /\bstop\s+the\s+steal\b/,
  /\bamerica\s+first\b/,
  /\blet'?s\s+go\s+brandon\b/,
  /\bsave\s+america\b/,
  /\btake\s+(our|back)\s+(country|america)\b/,
  /\bwhere\s+we\s+go\s+one\b/,

  // US — left-leaning
  /\bdefund\s+the\s+police\b/,
  /\babolish\s+(the\s+)?(police|ice|prisons?)\b/,
  /\bfeel\s+the\s+bern\b/,
  /\byes\s+we\s+can\b/,
  /\bno\s+justice\s+no\s+peace\b/,
  /\bsay\s+(his|her|their)\s+name\b/,
  /\bhands\s+up\s+don'?t\s+shoot\b/,
  /\bno\s+human\s+is\s+illegal\b/,
  /\bmy\s+body\s+my\s+choice\b/,
  /\bban\s+assault\s+weapons?\b/,
  /\beat\s+the\s+rich\b/,
  /\btax\s+the\s+rich\b/,
  /\bseize\s+the\s+means\b/,

  // Identity / social movement slogans
  /\bblack\s+lives\s+matter\b/,
  /\bblue\s+lives\s+matter\b/,
  /\ball\s+lives\s+matter\b/,
  /\bwhite\s+lives\s+matter\b/,
  /\bthin\s+blue\s+line\b/,
  /\bacab\b/,

  // Geopolitical slogans
  /\bfrom\s+the\s+river\s+to\s+the\s+sea\b/,
  /\bfree\s+palestine\b/,
  /\bstand\s+with\s+israel\b/,
  /\bglory\s+to\s+(ukraine|russia)\b/,
  /\bslava\s+ukrain/,
  /\bintifada\b/,
  /\bfree\s+(hong\s+kong|tibet|uyghurs?)\b/,

  // Generic protest chants
  /\bno\s+more\s+war\b/,
  /\bwhat\s+do\s+we\s+want\b.*\bwhen\s+do\s+we\s+want\b/,
  /\bthe\s+people\s+united\b/,
  /\bsi\s+se\s+puede\b/,
  /\bpower\s+to\s+the\s+people\b/,
  /\brise\s+up\b.*\b(fight|resist|revolt)\b/,
  /\b(fight|resist|revolt)\b.*\brise\s+up\b/,
];

// Call-to-action phrases with political context
const CALL_TO_ACTION_PATTERNS: RegExp[] = [
  /\bvote\s+(for|against|out)\s+/,
  /\bimpeach\s+\w+/,
  /\brecall\s+(the\s+)?(governor|mayor|senator|president|rep)/,
  /\bjoin\s+the\s+(march|rally|protest|movement|revolution)/,
  /\btake\s+to\s+the\s+streets\b/,
  /\bboycott\s+(israel|china|russia|america|usa)\b/,
  /\bregime\s+change\b/,
  /\boverth?row\s+(the\s+)?govern?ment\b/,
  /\bdown\s+with\s+(the\s+)?(government|regime|system|capitalism|communism)\b/,
  /\bgeneral\s+strike\b/,
  /\barm\s+yoursel(f|ves)\b/,
  /\bsecond\s+amendment\s+(now|forever|rights)\b/,
  /\bshall\s+not\s+be\s+infringed\b/,
  /\bcome\s+and\s+take\s+(it|them)\b/,
];

// Partisan slurs, coded language, and election rhetoric
const PARTISAN_PATTERNS: RegExp[] = [
  // Partisan insults
  /\b(libt(ard|urd)|demorat|repugnican|trumptard|snowflake\s+lib|conservat(ard|urd)|magat)\b/,
  /\b(communist|fascist|nazi)\s+(party|scum|filth|pig)/,
  /\b(left|right)\s*-?\s*wing\s+(nut|extremis|radical|mob|agenda)/,

  // Election-specific rhetoric
  /\b(rigged|stolen|stole)\s+(the\s+)?election\b/,
  /\belection\s+(fraud|steal|was\s+rigged|was\s+stolen)\b/,
  /\bred\s+wave\b/,
  /\bblue\s+wave\b/,
  /\bflip\s+(the\s+)?(senate|house|congress|state)\b/,
  /\bvote\s+(red|blue)\b/,
  /\b(democrat|republican|gop|dnc|rnc)\s+(destroy|ruin|hate|evil)\b/,
  /\b(destroy|ruin|hate|evil)\s+(democrat|republican|gop|dnc|rnc)\b/,

  // Propaganda hashtags (normalised — # survives normalisation)
  /\b#(maga|resist|blm|acab|impeach\w*|voteblue|votered|trump\d{4}|biden\w*)\b/,
  /\b#(freepalestine|standwithisrael|standwithukraine)\b/,
];

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Check whether a message contains targeted political content.
 * Call this BEFORE moderateMessage() and the Perspective API.
 * Returns immediately on first match.
 */
export function checkPoliticalFilter(text: string): PoliticalFilterResult {
  const norm = normalise(text);

  for (const pattern of SLOGAN_PATTERNS) {
    if (pattern.test(norm)) {
      return { blocked: true, reason: "political" };
    }
  }

  for (const pattern of CALL_TO_ACTION_PATTERNS) {
    if (pattern.test(norm)) {
      return { blocked: true, reason: "political" };
    }
  }

  for (const pattern of PARTISAN_PATTERNS) {
    if (pattern.test(norm)) {
      return { blocked: true, reason: "political" };
    }
  }

  return { blocked: false };
}
