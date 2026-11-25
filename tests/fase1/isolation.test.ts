import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

const SUPABASE_URL = process.env.SUPABASE_TEST_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY);

const describeIf = hasEnv ? describe : describe.skip;

describeIf("Fase 1 - isolasi data dan anti-bentrok", () => {
  const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anon = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let businessA: string;
  let businessB: string;
  let serviceA: string;
  // serviceB disiapkan untuk skenario test tambahan.
  let userA: string;
  let userB: string;

  beforeAll(async () => {
    // Buat dua user pemilik bisnis untuk simulasi tenant A dan B.
    const emailA = `owner-a+${Date.now()}@example.com`;
    const emailB = `owner-b+${Date.now()}@example.com`;
    const password = "Password123!";

    const { data: ua, error: uaErr } = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    expect(uaErr).toBeNull();
    userA = ua.user!.id;

    const { data: ub, error: ubErr } = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });
    expect(ubErr).toBeNull();
    userB = ub.user!.id;

    const { data: bA, error: bAErr } = await admin
      .from("businesses")
      .insert({ owner_id: userA, name: "Bisnis A", slug: `bisnis-a-${Date.now()}` })
      .select("id")
      .single();
    expect(bAErr).toBeNull();
    businessA = bA!.id;

    const { data: bB, error: bBErr } = await admin
      .from("businesses")
      .insert({ owner_id: userB, name: "Bisnis B", slug: `bisnis-b-${Date.now()}` })
      .select("id")
      .single();
    expect(bBErr).toBeNull();
    businessB = bB!.id;

    const { data: sA, error: sAErr } = await admin
      .from("services")
      .insert({ business_id: businessA, name: "Potong", duration_minutes: 30, price: 50000 })
      .select("id")
      .single();
    expect(sAErr).toBeNull();
    serviceA = sA!.id;

    const { error: sBErr } = await admin
      .from("services")
      .insert({ business_id: businessB, name: "Cukur", duration_minutes: 30, price: 40000 })
      .select("id")
      .single();
    expect(sBErr).toBeNull();
  });

  it("pemilik bisnis A tidak boleh membaca data bisnis B", async () => {
    const clientA = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: loginErr } = await clientA.auth.signInWithPassword({
      email: (await admin.auth.admin.getUserById(userA)).data.user!.email!,
      password: "Password123!",
    });
    expect(loginErr).toBeNull();

    const { data, error } = await clientA.from("services").select("id").eq("business_id", businessB);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("anon tidak boleh membaca booking siapa pun", async () => {
    const start = new Date(Date.now() + 3600_000).toISOString();
    const end = new Date(Date.now() + 5400_000).toISOString();

    const { error: insertErr } = await admin.from("bookings").insert({
      business_id: businessA,
      service_id: serviceA,
      customer_name: "Tes",
      customer_email: "tes@example.com",
      starts_at: start,
      ends_at: end,
      status: "booked",
    });
    expect(insertErr).toBeNull();

    const { data, error } = await anon.from("bookings").select("id");
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("dua booking aktif di slot yang sama tidak boleh sama-sama berhasil", async () => {
    const start = new Date(Date.now() + 86_400_000).toISOString();
    const end = new Date(Date.now() + 86_400_000 + 1_800_000).toISOString();

    const first = await admin.from("bookings").insert({
      business_id: businessA,
      service_id: serviceA,
      customer_name: "Pelanggan 1",
      customer_email: "p1@example.com",
      starts_at: start,
      ends_at: end,
      status: "booked",
    });
    expect(first.error).toBeNull();

    const second = await admin.from("bookings").insert({
      business_id: businessA,
      service_id: serviceA,
      customer_name: "Pelanggan 2",
      customer_email: "p2@example.com",
      starts_at: start,
      ends_at: end,
      status: "booked",
    });
    expect(second.error).not.toBeNull();
  });
});
