<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px 20px;
        }
        .order-info {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
        }
        .order-info p {
            margin: 5px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-pending { background-color: #ffc107; color: #000; }
        .status-in_production { background-color: #17a2b8; color: #fff; }
        .status-ready_for_pickup { background-color: #28a745; color: #fff; }
        .status-delivered { background-color: #28a745; color: #fff; }
        .status-cancelled { background-color: #dc3545; color: #fff; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        .total-row {
            font-weight: bold;
            font-size: 18px;
            background-color: #f8f9fa;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✓ Order Confirmed!</h1>
            <p>Thank you for your order</p>
        </div>
        
        <div class="content">
            <p>Hi {{ $order->customerName }},</p>
            <p>Your order has been successfully placed and is being processed.</p>
            
            <div class="order-info">
                <p><strong>Order ID:</strong> #{{ $order->id }}</p>
                <p><strong>Order Date:</strong> {{ \Carbon\Carbon::parse($order->created_at)->format('d M Y, h:i A') }}</p>
                <p><strong>Status:</strong> <span class="status-badge status-{{ strtolower($order->status) }}">{{ $order->status }}</span></p>
                <p><strong>Payment Method:</strong> {{ $order->paymentMethod }}</p>
                @if($order->dueDate)
                <p><strong>Due Date:</strong> {{ \Carbon\Carbon::parse($order->dueDate)->format('d M Y') }}</p>
                @endif
            </div>

            <h3>Order Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>{{ $item->name }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>₹{{ number_format($item->price, 2) }}</td>
                        <td>₹{{ number_format($item->subtotal, 2) }}</td>
                    </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right;">Total Amount:</td>
                        <td>₹{{ number_format($order->totalAmount, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            @if($order->notes)
            <div class="order-info">
                <p><strong>Notes:</strong></p>
                <p>{{ $order->notes }}</p>
            </div>
            @endif

            <p>We'll send you another email when your order status changes.</p>
        </div>
        
        <div class="footer">
            <p><strong>FramezLabs ERP</strong></p>
            <p>Need help? Contact us at support@framezlabs.com</p>
            <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
