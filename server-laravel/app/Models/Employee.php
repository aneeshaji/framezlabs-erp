<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'employeeId',
        'user_id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'designation',
        'department',
        'dateOfJoining',
        'dateOfBirth',
        'address',
        'status',
        'baseSalary',
        'allowances',
        'currency',
        'documents',
    ];

    protected $casts = [
        'dateOfJoining' => 'date',
        'dateOfBirth' => 'date',
        'documents' => 'array',
        'baseSalary' => 'decimal:2',
        'allowances' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
