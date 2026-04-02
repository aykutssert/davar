import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { CITY_COORDS } from "@/lib/city-coords";

export async function GET() {
  try {

    // Son 7 günün onaylanmış raporlarını al
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: reports, error } = await supabase
      .from("reports")
      .select("city, district")
      .eq("status", "approved")
      .gte("created_at", weekAgo);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Şehir bazlı sayım
    const cityCounts: Record<string, number> = {};
    const districtCounts: Record<string, Record<string, number>> = {};

    reports?.forEach((r) => {
      const city = r.city;
      const district = r.district;

      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + 1;

        if (!districtCounts[city]) {
          districtCounts[city] = {};
        }
        if (district) {
          districtCounts[city][district] = (districtCounts[city][district] || 0) + 1;
        }
      }
    });

    // API formatına dönüştür
    const cities = Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count,
      lat: CITY_COORDS[city]?.[0] || 39.0,
      lng: CITY_COORDS[city]?.[1] || 35.0,
    }));

    const districts = Object.entries(districtCounts).flatMap(([city, dMap]) =>
      Object.entries(dMap).map(([district, count]) => ({
        city,
        district,
        count,
      }))
    );

    return NextResponse.json({ cities, districts });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
