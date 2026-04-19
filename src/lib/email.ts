import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPodcastReadyEmail(
  email: string,
  podcastTitle: string,
  podcastId: string,
  frequency: string
) {
  if (!resend) {
    console.log(`[email] Would send to ${email}: "${podcastTitle}" ready (${frequency})`);
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}` || "https://podcraft.vercel.app";
  const podcastUrl = `${baseUrl}/podcast/${podcastId}`;
  const label = frequency === "daily" ? "daily" : "weekly";

  await resend.emails.send({
    from: "PodCraft <noreply@podcraft.app>",
    to: email,
    subject: `Your ${label} podcast is ready: ${podcastTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0a1628; color: #e5e7eb; border-radius: 12px;">
        <h2 style="color: #3370f6; margin-top: 0;">Your ${label} podcast is ready</h2>
        <p style="font-size: 18px; font-weight: bold; color: white;">${podcastTitle}</p>
        <a href="${podcastUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #2563eb, #3b82f6); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 16px 0;">
          Listen now
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          You're receiving this because you subscribed to ${label} podcast updates on PodCraft.
          <br/>To stop these emails, update your notification preferences in the app.
        </p>
      </div>
    `,
  });
}
