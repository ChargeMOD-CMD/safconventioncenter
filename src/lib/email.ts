import emailjs from "@emailjs/browser";

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";

export const sendBookingEmail = async (
  toEmail: string,
  firstName: string,
  status: "approved" | "declined",
  eventDate: string,
) => {
  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS credentials are not set. Check your .env file. Simulating email...");
    console.log(
      `[EMAIL MOCK] To: ${toEmail}, Name: ${firstName}, Status: ${status}, Date: ${eventDate}`,
    );
    return true; // Return true as a mock success
  }

  const templateParams = {
    to_email: toEmail,
    to_name: firstName,
    booking_status: status.toUpperCase(),
    event_date: eventDate,
    message:
      status === "approved"
        ? "Great news! Your booking at SAF Convention Centre has been approved. A concierge will reach out with the next steps."
        : "We regret to inform you that the requested date is no longer available at SAF Convention Centre. Please contact us to find an alternative date.",
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log("Email sent successfully!", response.status, response.text);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
};
