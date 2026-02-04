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
    ];

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}
