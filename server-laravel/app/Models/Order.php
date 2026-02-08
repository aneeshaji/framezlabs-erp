<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customerName',
        'customerPhone',
        'customerEmail',
        'totalAmount',
        'status',
        'orderType',
        'dueDate',
        'notes',
        'paymentMethod',
        'isPaid',
        'shipping_amount',
    ];

    protected $casts = [
        'dueDate' => 'datetime',
        'isPaid' => 'boolean',
        'totalAmount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
