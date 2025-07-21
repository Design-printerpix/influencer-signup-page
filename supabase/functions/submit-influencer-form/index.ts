import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InfluencerFormData {
  instagramUsername: string;
  followerCount: number;
  trafficRange: string;
  email: string;
  productsToPromote: string;
  countryOfResidence: string;
  followersLocation: string;
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
    if (!formData.instagramUsername || !formData.email) {
      throw new Error("Missing required fields");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert data into Supabase table
    const { data, error } = await supabase
      .from('influencer_applications')
      .insert({
        instagram_username: formData.instagramUsername,
        follower_count: formData.followerCount,
        traffic_range: formData.trafficRange,
        email: formData.email,
        products_to_promote: formData.productsToPromote,
        country_of_residence: formData.countryOfResidence,
        followers_location: formData.followersLocation,
        consent: true, // Default to true since we inform users they will be contacted
      });

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error(`Failed to save application: ${error.message}`);
    }

    console.log("Successfully saved to Supabase:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Application submitted successfully" 
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