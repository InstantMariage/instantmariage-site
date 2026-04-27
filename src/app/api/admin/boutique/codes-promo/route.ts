export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return false;
  const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
  return data?.role === "admin";
}

// GET — liste les codes promo actifs
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const list = await stripe.promotionCodes.list({ active: true, limit: 100, expand: ["data.coupon"] });
    return NextResponse.json({ data: list.data });
  } catch (err) {
    console.error("[admin/boutique/codes-promo GET]", err);
    const msg = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST — crée un coupon Stripe + promotion code
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { code, reduction, type, expiresAt } = await req.json();

    if (!code || !reduction || !type) {
      return NextResponse.json({ error: "code, reduction et type requis" }, { status: 400 });
    }

    const couponParams: Stripe.CouponCreateParams = {
      name: code,
      duration: "once",
    };
    if (type === "percent") {
      couponParams.percent_off = Number(reduction);
    } else {
      couponParams.amount_off = Math.round(Number(reduction) * 100); // centimes
      couponParams.currency = "eur";
    }

    const coupon = await stripe.coupons.create(couponParams);

    const promoParams: Stripe.PromotionCodeCreateParams = {
      promotion: { type: "coupon", coupon: coupon.id },
      code: String(code).toUpperCase(),
    };
    if (expiresAt) {
      promoParams.expires_at = Math.floor(new Date(expiresAt).getTime() / 1000);
    }

    const promoCode = await stripe.promotionCodes.create(promoParams);
    return NextResponse.json({ ok: true, data: promoCode });
  } catch (err) {
    console.error("[admin/boutique/codes-promo POST]", err);
    const msg = err instanceof Stripe.errors.StripeError ? err.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — désactive un code promo
export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const updated = await stripe.promotionCodes.update(id, { active: false });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error("[admin/boutique/codes-promo PATCH]", err);
    const msg = err instanceof Stripe.errors.StripeError ? err.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
