import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const branchCode = searchParams.get('branchId')
    const moduleId = searchParams.get('moduleId')

    let query = supabase
      .from('uploads')
      .select(`
        id,
        user_id,
        username,
        branch_id,
        module_id,
        scheme_id,
        file_name,
        total_rows,
        success_rows,
        failed_rows,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (branchCode) {
      query = query.eq('branch_id', branchCode)
    }

    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, data: [] })
    }

    // -------------------------------
    // STEP 1: Collect IDs
    // -------------------------------
    const branchCodes = [...new Set((data || []).map(i => i.branch_id))]
    const moduleIds = [...new Set((data || []).map(i => i.module_id))]
    const schemeIds = [...new Set((data || []).map(i => i.scheme_id))]

    // -------------------------------
    // STEP 2: Fetch related tables
    // -------------------------------
    const { data: branches } = await supabase
      .from('branches')
      .select('code,name')
      .in('code', branchCodes)

    const { data: modules } = await supabase
      .from('modules')
      .select('id,name')
      .in('id', moduleIds)

    const { data: schemes } = await supabase
      .from('schemes')
      .select('id,name')
      .in('id', schemeIds)

    // -------------------------------
    // STEP 3: Map for fast lookup
    // -------------------------------
    const branchMap = Object.fromEntries(
      (branches || []).map(b => [b.code, b])
    )

    const moduleMap = Object.fromEntries(
      (modules || []).map(m => [m.id, m])
    )

    const schemeMap = Object.fromEntries(
      (schemes || []).map(s => [s.id, s])
    )

    // -------------------------------
    // STEP 4: ENRICH DATA
    // -------------------------------
    const enriched = (data || []).map(item => ({
      ...item,
      branches: branchMap[item.branch_id] || null,
      modules: moduleMap[item.module_id] || null,
      schemes: schemeMap[item.scheme_id] || null,
    }))

    return NextResponse.json({
      success: true,
      data: enriched,
    })

  } catch (err) {
    return NextResponse.json({
      success: false,
      data: [],
    })
  }
}
