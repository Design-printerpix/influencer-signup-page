import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InfluencerFormData {
  instagramUsername: string;
  followerCount: number;
  trafficRange: string;
  email: string;
  productsToPromote: string[];
  countryOfResidence: string;
  followersLocation: string;
  consent: boolean;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: InfluencerFormData = await req.json();
    
    console.log("Received influencer form submission:", formData);

    // Validate required fields
    if (!formData.instagramUsername || !formData.email || !formData.consent) {
      throw new Error("Missing required fields");
    }

    // Get Google Sheets API key from environment
    const googleSheetsApiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    const spreadsheetId = Deno.env.get("GOOGLE_SHEETS_SPREADSHEET_ID");
    
    if (!googleSheetsApiKey || !spreadsheetId) {
      console.error("Missing Google Sheets configuration");
      throw new Error("Server configuration error");
    }

    // Prepare data for Google Sheets
    const rowData = [
      formData.timestamp,
      formData.instagramUsername,
      formData.followerCount,
      formData.trafficRange,
      formData.email,
      formData.productsToPromote.join(", "),
      formData.countryOfResidence,
      formData.followersLocation,
      formData.consent ? "Yes" : "No"
    ];

    // Google Sheets API call
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:append?valueInputOption=RAW&key=${googleSheetsApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );

    if (!sheetsResponse.ok) {
      const errorText = await sheetsResponse.text();
      console.error("Google Sheets API error:", errorText);
      throw new Error("Failed to save to Google Sheets");
    }

    const sheetsResult = await sheetsResponse.json();
    console.log("Successfully saved to Google Sheets:", sheetsResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Form submitted successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in submit-influencer-form function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);