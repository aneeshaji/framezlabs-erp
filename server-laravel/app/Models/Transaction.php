<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'totalAmount',
        'tax',
        'discount',
        'profit',
        'paymentMethod',
        'customerName',
        'customerPhone',
        'notes',
        'createdBy',
        'shipping_amount',
    ];

    protected $casts = [
        'totalAmount' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'profit' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}
