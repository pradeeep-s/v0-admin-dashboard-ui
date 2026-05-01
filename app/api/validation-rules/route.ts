import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('validation_rules')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    })
  }

  return NextResponse.json({
  success: true,
  data: data.map((r) => ({
    id: r.id,
    schemeId: r.scheme_id,
    columnName: r.column_name,
    ruleType: r.rule_type,
    ruleValue: r.rule_value,
    errorMessage: r.error_message,
  })),
})
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const body = await request.json()

  const {
    schemeId,
    columnName,
    ruleType,
    ruleValue,
    errorMessage,
  } = body

  const { data, error } = await supabase
    .from('validation_rules')
    .insert([
      {
        scheme_id: schemeId,
        column_name: columnName,
        rule_type: ruleType,
        rule_value: ruleValue,
        error_message: errorMessage,
      },
    ])
    .select()

  if (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    })
  }

  return NextResponse.json({
  success: true,
  data: data.map((r) => ({
    id: r.id,
    schemeId: r.scheme_id,
    columnName: r.column_name,
    ruleType: r.rule_type,
    ruleValue: r.rule_value,
    errorMessage: r.error_message,
  })),
})
}