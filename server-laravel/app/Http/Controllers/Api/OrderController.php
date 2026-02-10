<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderCreated;
use App\Mail\OrderStatusUpdated;

class OrderController extends Controller
{
    public function index()
    {
        return response()->json(Order::with('items')->latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customerName' => 'required|string',
            'customerPhone' => 'required|string',
            'customerEmail' => 'nullable|email',
            'items' => 'required|array',
            'totalAmount' => 'required|numeric',
            'paymentMethod' => 'required|string',
            'shippingAmount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        return DB::transaction(function () use ($request) {
            $order = Order::create([
                'customerName' => $request->customerName,
                'customerPhone' => $request->customerPhone,
                'customerEmail' => $request->customerEmail,
                'totalAmount' => $request->totalAmount,
                'status' => $request->status ?? 'PENDING',
                'orderType' => $request->orderType ?? 'RETAIL',
                'dueDate' => $request->dueDate,
                'notes' => $request->notes,
                'paymentMethod' => $request->paymentMethod,
                'isPaid' => $request->isPaid ?? false,
                'shipping_amount' => $request->shippingAmount ?? 0,
            ]);

            foreach ($request->items as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['productId'],
                    'name' => $itemData['name'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'customNotes' => $itemData['customNotes'] ?? null,
                    'subtotal' => $itemData['subtotal'],
                ]);
            }

            // Send order confirmation email
            if ($order->customerEmail) {
                try {
                    Mail::to($order->customerEmail)->send(new OrderCreated($order->load('items')));
                } catch (\Exception $e) {
                    \Log::error('Failed to send order confirmation email: ' . $e->getMessage());
                }
            }

            return response()->json($order->load('items'), 201);
        });
    }

    public function show($id)
    {
        $order = Order::with('items')->find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $previousStatus = $order->status;
        $order->status = $request->status;
        $order->save();

        // Send status update email
        if ($order->customerEmail) {
            try {
                Mail::to($order->customerEmail)->send(new OrderStatusUpdated($order->load('items'), $previousStatus));
            } catch (\Exception $e) {
                \Log::error('Failed to send order status update email: ' . $e->getMessage());
            }
        }

        return response()->json($order);
    }
}
