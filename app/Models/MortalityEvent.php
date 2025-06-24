<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MortalityEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'cause',
        'count',
        'description',
        'estimated_loss',
    ];

    protected $casts = [
        'date' => 'date',
        'count' => 'integer',
        'estimated_loss' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}