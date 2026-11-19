"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { cancellationState } from "../../lib/bookings";
import { nowInSeattle } from "../../lib/dates";
import { prisma } from "../../lib/prisma";

export async function cancelBooking(formData: FormData) {
  const reference = String(formData.get("reference") ?? "").toUpperCase();

  // The session is checked here because the browser can never be trusted.
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId < 1) {
    redirect(`/login?next=${encodeURIComponent("/bookings")}`);
  }

  // Only the owner's bookings can be found, so nobody can cancel someone else's.
  const booking = await prisma.booking.findFirst({
    where: { reference, userId },
  });
  if (!booking) redirect("/bookings?error=not-found");

  const state = cancellationState(booking, nowInSeattle());
  if (state !== "ok") {
    redirect(
      `/bookings?error=${state === "too-late" ? "too-late" : "not-allowed"}`,
    );
  }

  // Only a still-confirmed booking is changed, so a double click can't misfire.
  const result = await prisma.booking.updateMany({
    where: { id: booking.id, userId, status: "CONFIRMED" },
    data: { status: "CANCELLED" },
  });
  if (result.count !== 1) redirect("/bookings?error=failed");

  revalidatePath("/bookings");
  redirect(
    `/bookings?notice=cancelled&ref=${encodeURIComponent(booking.reference)}`,
  );
}