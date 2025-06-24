<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'category',
        'description',
        'amount',
        'frequency',
        'next_due_date',
        'is_recurring',
    ];

    protected $casts = [
        'date' => 'date',
        'next_due_date' => 'date',
        'amount' => 'decimal:2',
        'is_recurring' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
     public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category', 'name');
    }
}