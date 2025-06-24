<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'color',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'category', 'name');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}