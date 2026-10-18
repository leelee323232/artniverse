<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckoutOrder extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = ['id'];
    protected $hidden = ['contact', 'request_hash', 'idempotency_key'];

    protected function casts(): array
    {
        return ['items' => 'array', 'contact' => 'encrypted:array', 'expires_at' => 'datetime',
            'subtotal' => 'integer', 'shipping' => 'integer', 'total' => 'integer'];
    }
}
