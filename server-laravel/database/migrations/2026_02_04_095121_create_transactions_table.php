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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->decimal('totalAmount', 15, 2);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('profit', 15, 2)->default(0);
            $table->string('paymentMethod');
            $table->string('customerName')->nullable();
            $table->string('customerPhone')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('createdBy')->nullable(); // Foreign key to users
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
