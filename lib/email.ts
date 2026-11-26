import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const from = process.env.EMAIL_FROM || "Nuvora <onboarding@resend.dev>";

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY belum diatur, skip kirim:", input.subject, "->", input.to);
    return { skipped: true as const };
  }
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
  if (error) {
    console.error("[email] gagal kirim:", error);
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}
