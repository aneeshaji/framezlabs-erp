<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            $table->string('category');
            $table->string('supplier')->nullable();
            $table->decimal('price', 15, 2);
            $table->decimal('costPrice', 15, 2)->default(0);
            $table->integer('stockLevel')->default(0);
            $table->integer('minStockLevel')->default(5);
            $table->enum('status', ['Active', 'Out of Stock', 'Discontinued'])->default('Active');
            $table->json('images')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
