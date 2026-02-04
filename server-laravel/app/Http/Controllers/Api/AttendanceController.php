<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    public function index()
    {
        return response()->json(Attendance::with('employee')->latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'status' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $attendance = Attendance::create($request->all());
        return response()->json($attendance, 201);
    }

    public function getByEmployee($employeeId)
    {
        $attendance = Attendance::where('employee_id', $employeeId)->latest()->get();
        return response()->json($attendance);
    }
}
