<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnquiryController extends Controller
{
    public function index()
    {
        return response()->json(Enquiry::latest()->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'phone' => 'required|string',
            'message' => 'required|string',
            'category' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $enquiry = Enquiry::create($request->all());
        return response()->json($enquiry, 201);
    }

    public function show($id)
    {
        $enquiry = Enquiry::find($id);
        if (!$enquiry) {
            return response()->json(['message' => 'Enquiry not found'], 404);
        }
        return response()->json($enquiry);
    }

    public function update(Request $request, $id)
    {
        $enquiry = Enquiry::find($id);
        if (!$enquiry) {
            return response()->json(['message' => 'Enquiry not found'], 404);
        }

        $enquiry->update($request->all());
        return response()->json($enquiry);
    }

    public function destroy($id)
    {
        $enquiry = Enquiry::find($id);
        if (!$enquiry) {
            return response()->json(['message' => 'Enquiry not found'], 404);
        }

        $enquiry->delete();
        return response()->json(['message' => 'Enquiry deleted']);
    }
}
