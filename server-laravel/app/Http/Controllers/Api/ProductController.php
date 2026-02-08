<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;



class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'sku' => 'required|string|unique:products',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $product = Product::create($request->all());
        return response()->json($product, 201);
    }

    public function show($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    public function updateStock(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $quantity = $request->input('quantity', 0);
        $product->stockLevel += $quantity;
        $product->save();

        // Note: Low stock notifications could be handled here or via an Observer
        
        return response()->json($product);
    }


    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt|max:5120', // Max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $data = array_map('str_getcsv', file($path));
        $header = array_shift($data); // Remove header row
        
        // Normalize headers to lowercase
        $header = array_map('strtolower', $header);

        // Map CSV headers to database columns
        $columnMap = [
            'product name' => 'name',
            'product' => 'name',
            'selling price' => 'price',
            'cost price' => 'costprice',
            'stock level' => 'stocklevel',
            'qty' => 'stocklevel',
            'quantity' => 'stocklevel',
            'stock' => 'stocklevel',
            'low stock alert level' => 'minstocklevel',
            'min stock' => 'minstocklevel',
            'alert level' => 'minstocklevel',
        ];

        $header = array_map(function($col) use ($columnMap) {
            return $columnMap[$col] ?? $col;
        }, $header);

        // Required columns
        $requiredColumns = ['name', 'sku', 'category', 'price', 'stocklevel'];
        $missingColumns = array_diff($requiredColumns, $header);
        
        if (!empty($missingColumns)) {
             return response()->json(['message' => 'Missing required columns: ' . implode(', ', $missingColumns) . '. Found: ' . implode(', ', $header)], 422);
        }

        $successCount = 0;
        $errors = [];
        $rowNumber = 2; // Start from row 2 (after header)

        foreach ($data as $row) {
            // Skip empty rows
            if (empty($row) || (count($row) === 1 && empty($row[0]))) {
                $rowNumber++;
                continue;
            }

            // Combine header with row data
            if (count($header) !== count($row)) {
                $errors[] = [
                    'row' => $rowNumber,
                    'errors' => ['Column count mismatch']
                ];
                $rowNumber++;
                continue;
            }

            $rowData = array_combine($header, $row);

            // Validation for row data
            $rowValidator = Validator::make($rowData, [
                'name' => 'required|string|max:255',
                'sku' => 'required|string|max:100',
                'category' => 'required|string',
                'price' => 'required|numeric|min:0',
                'stocklevel' => 'required|integer|min:0',
            ]);

            if ($rowValidator->fails()) {
                $errors[] = [
                    'row' => $rowNumber,
                    'errors' => $rowValidator->errors()->all(),
                    'values' => $rowData
                ];
                $rowNumber++;
                continue;
            }

            // Check duplicate SKU
            if (Product::where('sku', $rowData['sku'])->exists()) {
                 // Skip duplicate
                 $rowNumber++;
                 continue;
            }

            try {
                Product::create([
                    'name'          => $rowData['name'],
                    'sku'           => $rowData['sku'],
                    'category'      => $rowData['category'],
                    'supplier'      => $rowData['supplier'] ?? null,
                    'description'   => $rowData['description'] ?? null,
                    'costPrice'     => $rowData['costprice'] ?? 0,
                    'price'         => $rowData['price'],
                    'stockLevel'    => $rowData['stocklevel'],
                    'minStockLevel' => $rowData['minstocklevel'] ?? 5,
                    'status'        => $rowData['status'] ?? 'active',
                ]);
                $successCount++;
            } catch (\Exception $e) {
                $errors[] = [
                    'row' => $rowNumber,
                    'errors' => ['Database error: ' . $e->getMessage()]
                ];
            }

            $rowNumber++;
        }

        if (count($errors) > 0) {
             return response()->json([
                 'message' => "Imported $successCount products with " . count($errors) . " errors.",
                 'errors' => $errors
             ], 422);
        }

        return response()->json(['message' => "Successfully imported $successCount products."], 200);
    }
}
