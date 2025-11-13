import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("pix_payments")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json(data || []);
}