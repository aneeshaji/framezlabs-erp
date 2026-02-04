<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'sku',
        'description',
        'category',
        'supplier',
        'price',
        'costPrice',
        'stockLevel',
        'minStockLevel',
        'status',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'costPrice' => 'decimal:2',
    ];
}
