import { NextRequest, NextResponse } from 'next/server';
import { storeData } from '@/lib/store-data';

export async function GET() {
  const stores = storeData.getStores();
  return NextResponse.json({ success: true, stores });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.supplierCode) {
      return NextResponse.json({ success: false, error: 'Name and supplierCode are required' }, { status: 400 });
    }

    const store = storeData.addStore({
      name: body.name,
      domain: body.domain || `${body.name.toLowerCase().replace(/\s+/g, '-')}.myshopify.com`,
      supplierCode: body.supplierCode.startsWith('Store_') ? body.supplierCode : `Store_${body.supplierCode}`,
      status: 'CONNECTED'
    });

    return NextResponse.json({ success: true, store }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
