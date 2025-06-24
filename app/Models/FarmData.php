<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmData extends Model
{
    use HasFactory;

    protected $table = 'farm_data';

    protected $fillable = [
        'user_id',
        'total_chickens',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}