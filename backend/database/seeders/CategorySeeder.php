<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            ['name' => 'Food', 'color' => '#f59e0b'],
            ['name' => 'Transport', 'color' => '#3b82f6'],
            ['name' => 'Rent', 'color' => '#ef4444'],
            ['name' => 'Utilities', 'color' => '#10b981'],
            ['name' => 'Entertainment', 'color' => '#8b5cf6'],
            ['name' => 'Health', 'color' => '#ef4444'],
            ['name' => 'Shopping', 'color' => '#ec4899'],
            ['name' => 'Education', 'color' => '#22c55e'],
            ['name' => 'Travel', 'color' => '#06b6d4'],
            ['name' => 'Other', 'color' => '#6b7280'],
        ];
        foreach ($items as $i) {
            \App\Models\Category::firstOrCreate(['name' => $i['name']], $i);
        }
    }

}
