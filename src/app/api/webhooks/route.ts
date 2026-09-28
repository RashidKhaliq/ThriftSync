import { NextRequest, NextResponse } from 'next/server';
import { WebhookEngine } from '@/lib/webhook-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const externalEventId = req.headers.get('x-shopify-webhook-id') || req.headers.get('x-event-id') || `evt_${Date.now()}`;
    const storeId = req.headers.get('x-store-id') || body.storeId || 'store-2';
    const eventType = (req.headers.get('x-shopify-topic') || body.eventType || 'orders/create') as any;

    const result = WebhookEngine.processWebhook({
      externalEventId,
      storeId,
      eventType,
      payload: body
    });

    if (result.status === 'DUPLICATE') {
      return NextResponse.json({ success: true, message: result.message, status: 'DUPLICATE' }, { status: 200 });
    }

    if (result.status === 'FAILED') {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.resultData
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Invalid webhook payload' }, { status: 500 });
  }
}
