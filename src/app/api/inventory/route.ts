import { NextRequest, NextResponse } from 'next/server';
import { storeData } from '@/lib/store-data';

export async function GET() {
  const items = storeData.getPhysicalItems();
  return NextResponse.json({ success: true, items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.sku || !body.supplier || !body.title) {
      return NextResponse.json({ success: false, error: 'sku, supplier, and title are required' }, { status: 400 });
    }

    const item = storeData.createPhysicalItem({
      title: body.title,
      sku: body.sku,
      supplier: body.supplier,
      originalStoreId: body.originalStoreId || 'store-1',
      originalStoreName: body.originalStoreName || 'Store A (Boutique Thrift)',
      price: parseFloat(body.price) || 100,
      availableQuantity: 1,
      reservedQuantity: 0,
      status: 'AVAILABLE',
      sharingStatus: 'SHARED',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=80'
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
