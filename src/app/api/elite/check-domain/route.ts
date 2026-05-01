import { NextRequest, NextResponse } from "next/server";

function getRdapUrl(domain: string): string {
  if (domain.endsWith(".fr")) return `https://rdap.nic.fr/domain/${domain}`;
  if (domain.endsWith(".com")) return `https://rdap.verisign.com/com/v1/domain/${domain}`;
  if (domain.endsWith(".net")) return `https://rdap.arin.net/registry/domain/${domain}`;
  if (domain.endsWith(".org")) return `https://rdap.publicinterestregistry.org/rdap/domain/${domain}`;
  return `https://rdap.org/domain/${domain}`;
}

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain")?.trim().toLowerCase();
  if (!domain) {
    return NextResponse.json({ available: null, error: "Paramètre domain manquant" }, { status: 400 });
  }

  const url = getRdapUrl(domain);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.status === 200) return NextResponse.json({ available: false });
    if (res.status === 404) return NextResponse.json({ available: true });
    return NextResponse.json({ available: null, error: "Impossible de vérifier" });
  } catch {
    return NextResponse.json({ available: null, error: "Impossible de vérifier" });
  }
}
