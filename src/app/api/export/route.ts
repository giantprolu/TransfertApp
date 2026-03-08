import { NextRequest, NextResponse } from "next/server";
import { exportCSV, exportJSON, exportText } from "@/services/exportService";
import { TrackWithLink } from "@/services/appleSearchService";

// POST /api/export — Export tracks in a given format
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tracks, format } = body as {
      tracks: TrackWithLink[];
      format: "csv" | "json" | "text";
    };

    if (!tracks || !format) {
      return NextResponse.json(
        { error: "Missing tracks or format" },
        { status: 400 }
      );
    }

    let content: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "csv":
        content = exportCSV(tracks);
        contentType = "text/csv";
        filename = "spotify-tracks.csv";
        break;
      case "json":
        content = exportJSON(tracks);
        contentType = "application/json";
        filename = "spotify-tracks.json";
        break;
      case "text":
        content = exportText(tracks);
        contentType = "text/plain";
        filename = "spotify-tracks.txt";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid format. Use csv, json, or text." },
          { status: 400 }
        );
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}
