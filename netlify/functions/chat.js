// DeanWay Travels — Gemma concierge (Groq proxy, V2 function syntax for Blobs not needed here)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "openai/gpt-oss-120b";

const GEMMA_TRAVELS_SYSTEM = `You are Gemma, the AI assistant for DeanWay Travels (deanwaytravel.com), the travel agency of Jon Dean — independent travel agent with Cruise Brothers.

About the business:
- DeanWay Travels plans cruises, all-inclusive resorts, land vacations, and theme park adventures (including Universal Orlando).
- Slogan: "Your Journey, your memories, your way."
- Jon is an independent agent backed by Cruise Brothers — family-owned, trusted since 1972, nearly a million travelers served, proud affiliate of the $21B Travel Leaders Network, top producer with all major cruise lines.
- Phone: 812-746-7175. Online booking: https://deanwaytravel.cruisebrothers.com
- Jon is launching his first hosted group cruise, "Sail with Jon": Royal Caribbean Star of the Seas, 7-night Eastern Caribbean, sailing June 13, 2027 from Port Canaveral. Details and rates are still being finalized — invite people to ask Jon directly or join the interest list via the Plan My Trip form.

Your job:
- Answer visitor questions about travel: destinations, cruise lines, resorts, theme parks, best times to go, what to expect.
- Help them think through their trip: who is traveling, when, budget range, what matters most.
- When someone is ready, point them to the "Plan My Trip" form on the page or the phone number. If they share their name and contact info plus trip details, acknowledge it warmly and tell them Jon will reach out personally, usually within a day.
- Be warm, direct, and concise. No fluff, no corporate speak.

Hard rules:
- Never invent specific prices, cabin rates, or sailing itineraries you have not been given. If asked for exact pricing, say Jon will quote it personally — that's what a real agent does.
- Never claim to book anything yourself. Bookings happen through Jon or the online booking link.
- If you do not know something, say so and offer to have Jon follow up.
- Keep replies short (a few sentences) unless the visitor asks for detail.`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }
  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Bad JSON" }), { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: GEMMA_TRAVELS_SYSTEM }, ...messages],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      return new Response(JSON.stringify({ error: "AI error" }), { status: 502 });
    }
    const reply = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content.trim()
      : "";
    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "AI unreachable" }), { status: 502 });
  }
};
