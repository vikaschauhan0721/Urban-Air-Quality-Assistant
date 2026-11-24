import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAirQualityReport } from "@/lib/open-meteo";
import { PRESET_LOCATIONS } from "@/lib/fixtures";
import { AirQualityReportSchema } from "@/lib/types";

const AirQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).default(PRESET_LOCATIONS[0]!.latitude),
  lon: z.coerce.number().min(-180).max(180).default(PRESET_LOCATIONS[0]!.longitude),
  city: z.string().min(1).max(120).default(PRESET_LOCATIONS[0]!.name),
  region: z.string().max(120).default(PRESET_LOCATIONS[0]!.region),
  country: z.string().max(80).default(PRESET_LOCATIONS[0]!.country),
  simulate: z.enum(["true", "false", "1", "0", "smog"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const parsed = AirQuerySchema.safeParse({
      lat: sp.get("lat") ?? undefined,
      lon: sp.get("lon") ?? undefined,
      city: sp.get("city") ?? undefined,
      region: sp.get("region") ?? undefined,
      country: sp.get("country") ?? undefined,
      simulate: sp.get("simulate") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid air quality query parameters", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { lat, lon, city, region, country, simulate } = parsed.data;
    const isSimulated = simulate === "true" || simulate === "1" || simulate === "smog";

    const report = await getAirQualityReport(
      {
        name: city,
        region,
        country,
        latitude: lat,
        longitude: lon,
      },
      { simulate: isSimulated }
    );

    const validated = AirQualityReportSchema.parse(report);
    return NextResponse.json(validated);
  } catch {
    return NextResponse.json(
      { error: "Unable to load air quality data right now" },
      { status: 500 }
    );
  }
}
