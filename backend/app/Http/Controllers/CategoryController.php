<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\Category::orderBy('name')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:100|unique:categories,name',
            'color' => 'nullable|string|max:20',
            'budget' => 'nullable|numeric|min:0',
        ]);
        return \App\Models\Category::create($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $r, \App\Models\Category $category)
    {
        $data = $r->validate([
            'name' => 'sometimes|string|max:100|unique:categories,name,' . $category->id,
            'color' => 'nullable|string|max:20',
            'budget' => 'nullable|numeric|min:0',
        ]);
        $category->update($data);
        return $category;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Category $category)
    {
        $category->delete();
        return response()->noContent();
    }
}
