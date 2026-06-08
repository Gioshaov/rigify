import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get business for this user
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (businessError || !business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  // Parse request body
  const body = await request.json();
  const {
    name,
    description,
    category,
    duration_minutes,
    price_min,
    price_max,
    is_active,
  } = body;

  // Validate required fields
  if (!name || !duration_minutes || price_min === undefined || price_max === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate service belongs to this business
  const { data: existingService } = await supabase
    .from('services')
    .select('business_id')
    .eq('id', params.id)
    .single();

  if (!existingService || existingService.business_id !== business.id) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Update service
  const { data: service, error: updateError } = await supabase
    .from('services')
    .update({
      name,
      description,
      category,
      duration_minutes,
      price_min,
      price_max,
      is_active,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, service }, { status: 200 });
}
