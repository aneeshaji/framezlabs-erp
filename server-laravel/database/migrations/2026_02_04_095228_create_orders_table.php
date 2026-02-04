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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('customerName');
            $table->string('customerPhone');
            $table->decimal('totalAmount', 15, 2);
            $table->enum('status', ['PENDING', 'IN_PRODUCTION', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'])->default('PENDING');
            $table->enum('orderType', ['RETAIL', 'CUSTOM'])->default('RETAIL');
            $table->timestamp('dueDate')->nullable();
            $table->text('notes')->nullable();
            $table->string('paymentMethod');
            $table->boolean('isPaid')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
