<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    public function index()
    {
        return response()->json(Employee::with('user')->latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'employeeId' => 'required|string|unique:employees',
            'email' => 'required|email|unique:employees',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $employee = Employee::create($request->all());
        return response()->json($employee, 201);
    }

    public function show($id)
    {
        $employee = Employee::with(['user', 'attendances'])->find($id);
        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }
        return response()->json($employee);
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $employee->update($request->all());
        return response()->json($employee);
    }

    public function destroy($id)
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $employee->delete();
        return response()->json(['message' => 'Employee deleted']);
    }
}
