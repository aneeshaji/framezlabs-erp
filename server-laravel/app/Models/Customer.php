<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'totalSpent',
        'orderCount',
        'notes',
        'lastPurchaseDate',
    ];

    protected $casts = [
        'lastPurchaseDate' => 'datetime',
        'totalSpent' => 'decimal:2',
    ];
}
