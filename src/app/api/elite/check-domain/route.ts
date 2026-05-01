import { NextRequest, NextResponse } from "next/server";

function getRdapUrl(domain: string): string {
  if (domain.endsWith(".fr"))  return `https://rdap.nic.fr/domain/${domain}`;
  if (domain.endsWith(".com")) return `https://rdap.verisign.com/com/v1/domain/${domain}`;
  if (domain.endsWith(".net")) return `https://rdap.arin.net/registry/domain/${domain}`;
  if (domain.endsWith(".org")) return `https://rdap.publicinterestregistry.org/rdap/domain/${domain}`;
  return `https://rdap.org/domain/${domain}`;
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain")?.toLowerCase().trim();

  if (!domain || domain.length < 4) {
    return NextResponse.json({ error: "Domaine invalide" }, { status: 400 });
  }

  try {
    const res = await fetch(getRdapUrl(domain), {
      signal: AbortSignal.timeout(6000),
    });
    // 200 = domaine enregistré (pris), 404 = disponible
    return NextResponse.json({ available: res.status === 404 });
  } catch {
    return NextResponse.json({ available: null, error: "Impossible de vérifier" });
  }
}
