<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Expense;

class StatsController extends Controller
{
    public function summary(Request $r)
    {
        $userId = $r->user()->id;
        $month = (int) $r->get('month', now()->month);
        $year = (int) $r->get('year', now()->year);

        $byCategory = Expense::select('category_id', DB::raw('SUM(amount) as total'))
            ->where('user_id', $userId)
            ->whereMonth('date', $month)->whereYear('date', $year)
            ->groupBy('category_id')->with('category')->get();

        return [
            'total' => $byCategory->sum('total'),
            'byCategory' => $byCategory,
        ];
    }
}
