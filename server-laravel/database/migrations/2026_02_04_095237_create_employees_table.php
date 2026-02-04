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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employeeId')->unique();
            $table->unsignedBigInteger('user_id')->nullable()->unique();
            $table->string('firstName');
            $table->string('lastName');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('designation');
            $table->string('department');
            $table->date('dateOfJoining');
            $table->date('dateOfBirth')->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED'])->default('ACTIVE');
            $table->decimal('baseSalary', 15, 2);
            $table->decimal('allowances', 15, 2)->default(0);
            $table->string('currency')->default('INR');
            $table->json('documents')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
