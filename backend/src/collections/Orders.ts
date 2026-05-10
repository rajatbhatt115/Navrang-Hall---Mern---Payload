import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderId',
    defaultColumns: ['orderId', 'customerName', 'totalAmount', 'status'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'orderId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'razorpayOrderId',
      type: 'text',
    },
    {
      name: 'customerName',
      type: 'text',
    },
    {
      name: 'customerEmail',
      type: 'text',
    },
    {
      name: 'customerContact',
      type: 'text',
    },
    {
      name: 'totalAmount',
      type: 'number',
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'INR',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'price', type: 'number' },
        { name: 'quantity', type: 'number' },
        { name: 'size', type: 'text' },
        { name: 'color', type: 'text' },
      ],
    },
    {
      name: 'paymentId',
      type: 'text',
    },
    {
      name: 'signature',
      type: 'text',
    },
  ],
  endpoints: [
    {
      path: '/create-order',
      method: 'post',
      handler: async (req) => {
        const body = req.json ? await req.json() : {}
        const { amount, currency = 'INR', items, customer } = (body || {}) as any;

        try {
          const Razorpay = (await import('razorpay')).default;
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
          });

          const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`,
          };

          const razorpayOrder = await razorpay.orders.create(options);

          // Create order record in Payload
          await req.payload.create({
            collection: 'orders' as any,
            data: {
              orderId: razorpayOrder.id,
              razorpayOrderId: razorpayOrder.id,
              customerName: customer?.name,
              customerEmail: customer?.email,
              customerContact: customer?.contact,
              totalAmount: amount,
              currency,
              status: 'pending',
              items,
            } as any,
          });

          return Response.json(razorpayOrder);
        } catch (error: any) {
          return Response.json({ error: error.message }, { status: 500 });
        }
      },
    },
    {
      path: '/verify-payment',
      method: 'post',
      handler: async (req) => {
        const body = req.json ? await req.json() : {}
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = (body || {}) as any;

        try {
          const crypto = await import('crypto');
          const secret = process.env.RAZORPAY_KEY_SECRET || '';
          const hmac = crypto.createHmac('sha256', secret);
          hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
          const generated_signature = hmac.digest('hex');

          if (generated_signature === razorpay_signature) {
            // Update order status in Payload
            const orders = await req.payload.find({
              collection: 'orders',
              where: { razorpayOrderId: { equals: razorpay_order_id } },
            });

            if (orders.docs.length > 0) {
              await req.payload.update({
                collection: 'orders' as any,
                id: orders.docs[0].id,
                data: {
                  status: 'paid',
                  paymentId: razorpay_payment_id,
                  signature: razorpay_signature,
                } as any,
              });
            }

            return Response.json({ status: 'ok' });
          } else {
            return Response.json({ status: 'verification_failed' }, { status: 400 });
          }
        } catch (error: any) {
          return Response.json({ error: error.message }, { status: 500 });
        }
      },
    },
  ],
}
