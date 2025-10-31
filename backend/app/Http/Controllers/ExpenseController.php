<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $r)
    {
        $r->validate([
            'from' => 'date|nullable',
            'to' => 'date|nullable',
            'category_id' => 'integer|exists:categories,id|nullable',
            'sort' => 'in:date,amount,name,created_at|nullable',
            'order' => 'in:ASC,DESC|nullable',
            'per_page' => 'integer|nullable'
        ]);

        $q = Expense::where('user_id', $r->user()->id);

        if ($r->filled('from') || $r->filled('to')) {
            $from = $r->input('from', '1900-01-01');
            $to = $r->input('to', '2099-12-31');
            $q->whereBetween('date', [$from, $to]);
        }
        if ($r->category_id)
            $q->where('category_id', $r->category_id);

        $sort = $r->get('sort', 'date');
        $order = $r->get('order', 'DESC');
        $q->orderBy($sort, $order);

        return $q->with(['category:id,name,color,budget'])
            ->paginate($r->get('per_page', 10));
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'date' => 'required|date',
            'category_id' => 'nullable|exists:categories,id',
            'notes' => 'nullable|string'
        ]);
        $data['user_id'] = $r->user()->id;
        $expense = Expense::create($data);
        return response()->json($expense->load(['category:id,name,color,budget']), 201);

    }

    /**
     * Display the specified resource.
     */

    public function show(Expense $expense)
    {
        $this->authorize('view', $expense);
        return $expense->load(['category:id,name,color,budget']);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $r, Expense $expense)
    {
        $this->authorize('update', $expense);
        $data = $r->validate([
            'name' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric',
            'date' => 'sometimes|date',
            'category_id' => 'nullable|exists:categories,id',
            'notes' => 'nullable|string'
        ]);
        $expense->update($data);
        return $expense->load(['category:id,name,color,budget']);

    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense);
        $expense->delete();
        return response()->noContent();
    }
}
