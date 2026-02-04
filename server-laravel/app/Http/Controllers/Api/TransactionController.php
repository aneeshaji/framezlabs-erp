<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index()
    {
        return response()->json(Transaction::with('items')->latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.productId' => 'required',
            'items.*.quantity' => 'required|integer|min:1',
            'totalAmount' => 'required|numeric',
            'paymentMethod' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        return DB::transaction(function () use ($request) {
            $transaction = Transaction::create([
                'totalAmount' => $request->totalAmount,
                'tax' => $request->tax ?? 0,
                'discount' => $request->discount ?? 0,
                'profit' => $request->profit ?? 0,
                'paymentMethod' => $request->paymentMethod,
                'customerName' => $request->customerName,
                'customerPhone' => $request->customerPhone,
                'notes' => $request->notes,
                'createdBy' => $request->user()->id,
            ]);

            foreach ($request->items as $itemData) {
                // Create Transaction Item
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $itemData['productId'] ?? null,
                    'name' => $itemData['name'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'subtotal' => $itemData['subtotal'],
                ]);

                // Update Stock
                if (isset($itemData['productId'])) {
                    $product = Product::find($itemData['productId']);
                    if ($product) {
                        $product->stockLevel -= $itemData['quantity'];
                        $product->save();
                    }
                }
            }

            return response()->json($transaction->load('items'), 201);
        });
    }

    public function show($id)
    {
        $transaction = Transaction::with('items')->find($id);
        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }
        return response()->json($transaction);
    }
}
