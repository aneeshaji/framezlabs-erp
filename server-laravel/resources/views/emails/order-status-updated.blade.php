<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Updated</title>
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
        .status-update {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 5px;
        }
        .status-pending { background-color: #ffc107; color: #000; }
        .status-in_production { background-color: #17a2b8; color: #fff; }
        .status-ready_for_pickup { background-color: #28a745; color: #fff; }
        .status-delivered { background-color: #28a745; color: #fff; }
        .status-cancelled { background-color: #dc3545; color: #fff; }
        .arrow {
            font-size: 24px;
            color: #667eea;
            margin: 0 10px;
        }
        .order-info {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .order-info p {
            margin: 8px 0;
        }
        .next-steps {
            background-color: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📦 Order Status Updated</h1>
            <p>Your order has been updated</p>
        </div>
        
        <div class="content">
            <p>Hi {{ $order->customerName }},</p>
            <p>Great news! Your order status has been updated.</p>
            
            @if($previousStatus)
            <div class="status-update">
                <p><strong>Status Change:</strong></p>
                <span class="status-badge status-{{ strtolower($previousStatus) }}">{{ $previousStatus }}</span>
                <span class="arrow">→</span>
                <span class="status-badge status-{{ strtolower($order->status) }}">{{ $order->status }}</span>
            </div>
            @else
            <div class="status-update">
                <p><strong>Current Status:</strong></p>
                <span class="status-badge status-{{ strtolower($order->status) }}">{{ $order->status }}</span>
            </div>
            @endif

            <div class="order-info">
                <p><strong>Order ID:</strong> #{{ $order->id }}</p>
                <p><strong>Order Date:</strong> {{ \Carbon\Carbon::parse($order->created_at)->format('d M Y, h:i A') }}</p>
                <p><strong>Total Amount:</strong> ₹{{ number_format($order->totalAmount, 2) }}</p>
                @if($order->dueDate)
                <p><strong>Due Date:</strong> {{ \Carbon\Carbon::parse($order->dueDate)->format('d M Y') }}</p>
                @endif
            </div>

            @if($order->status === 'PENDING')
            <div class="next-steps">
                <p><strong>What's Next?</strong></p>
                <p>Your order is being reviewed and will move to production soon.</p>
            </div>
            @elseif($order->status === 'IN_PRODUCTION')
            <div class="next-steps">
                <p><strong>What's Next?</strong></p>
                <p>Your order is currently being prepared. We'll notify you when it's ready for pickup.</p>
            </div>
            @elseif($order->status === 'READY_FOR_PICKUP')
            <div class="next-steps">
                <p><strong>What's Next?</strong></p>
                <p>🎉 Your order is ready! Please visit our store to collect your order.</p>
            </div>
            @elseif($order->status === 'DELIVERED')
            <div class="next-steps">
                <p><strong>Thank You!</strong></p>
                <p>Your order has been delivered. We hope you enjoy your purchase!</p>
                <p>Please let us know if you have any feedback.</p>
            </div>
            @elseif($order->status === 'CANCELLED')
            <div class="next-steps">
                <p><strong>Order Cancelled</strong></p>
                <p>Your order has been cancelled. If you have any questions, please contact us.</p>
            </div>
            @endif

            <p>If you have any questions about your order, feel free to contact us.</p>
        </div>
        
        <div class="footer">
            <p><strong>FramezLabs ERP</strong></p>
            <p>Need help? Contact us at support@framezlabs.com</p>
            <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
